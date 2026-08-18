import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TextInput from './components/TextInput';
import Toolbar from './components/Toolbar';
import AudioPlayer from './components/AudioPlayer';
import MusicPlayer, { type MusicTrack } from './components/MusicPlayer';
import TokenPrompt from './components/TokenPrompt';
import HistorySidebar from './components/HistorySidebar';
import { splitIntoChunks } from './lib/chunker';
import {
  createHistoryItem,
  deleteHistoryItem,
  getHistoryItem,
  listHistory,
  renameHistoryItem,
  updateHistoryItemText,
  type HistoryItem,
} from './lib/history';
import { cacheKey, getCache, setCache } from './lib/cache';
import { fetchTTSAudio, TTSError } from './lib/ttsClient';
import { getToken, hasToken } from './lib/token';
import { AudioQueueManager, type QueueState } from './lib/audioQueue';
import { mixer } from './lib/mixer';
import { voicesFor, type Language } from './types';

// Background music tracks. mp3s live in frontend/public/music/ (served at
// `${BASE_URL}music/...`). Converted from the source mp4s at 128kbps stereo.
// Each track loops via the native `el.loop = true` in the music effect below —
// when a long text outlasts a track (~4-5 min), the track auto-replays so the
// background keeps playing while the voice is still reading.
const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'asphyxia', label: 'Asphyxia — 逆時針向', src: `${import.meta.env.BASE_URL}music/asphyxia.mp3` },
  { id: 'else-paris', label: 'Else — Paris', src: `${import.meta.env.BASE_URL}music/else-paris.mp3` },
  { id: 'late-night-melancholy', label: 'Late Night Melancholy', src: `${import.meta.env.BASE_URL}music/late-night-melancholy.mp3` },
  { id: 'shirfine-illusionary-daytime', label: 'Shirfine — Illusionary Daytime', src: `${import.meta.env.BASE_URL}music/shirfine-illusionary-daytime.mp3` },
  { id: 'star-sky-remix', label: 'Star Sky Remix', src: `${import.meta.env.BASE_URL}music/star-sky-remix.mp3` },
  { id: 'take-me-hand', label: 'Take Me Hand', src: `${import.meta.env.BASE_URL}music/take-me-hand.mp3` },
];

const INITIAL_QUEUE: QueueState = {
  isPlaying: false,
  currentIndex: -1,
  total: 0,
  currentTime: 0,
  duration: 0,
  chunkDurations: [],
};

export default function App() {
  // --- input / config ---
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<Language>('vi');
  const [voice, setVoice] = useState(voicesFor('vi')[0].id);
  const [speed, setSpeed] = useState(1.0);

  // --- generation / playback ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueState, setQueueState] = useState<QueueState>(INITIAL_QUEUE);

  // --- audio levels / music ---
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicTrackId, setMusicTrackId] = useState<string>(MUSIC_TRACKS[0]?.id ?? '');
  const [musicVolume, setMusicVolume] = useState(0.4);

  // --- token gate ---
  const [showToken, setShowToken] = useState(false);
  const [tokenPresent, setTokenPresent] = useState(hasToken());

  // --- text history (ChatGPT-style saved documents) ---
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- refs ---
  const voiceElRef = useRef<HTMLAudioElement>(null);
  const musicElRef = useRef<HTMLAudioElement>(null);
  const queueRef = useRef<AudioQueueManager | null>(null);
  const genIdRef = useRef(0); // bumps on each Generate to cancel stale loops

  const musicTrack = useMemo<MusicTrack | null>(
    () => MUSIC_TRACKS.find((t) => t.id === musicTrackId) ?? MUSIC_TRACKS[0] ?? null,
    [musicTrackId],
  );

  // Create the queue manager once the voice element exists.
  useEffect(() => {
    if (!voiceElRef.current) return;
    const q = new AudioQueueManager(voiceElRef.current);
    queueRef.current = q;
    const unsub = q.subscribe(setQueueState);
    return () => {
      unsub();
      q.destroy(); // detach element listeners + revoke URLs (StrictMode safe)
      queueRef.current = null;
    };
  }, []);

  // Push voice volume into the mixer gain node.
  useEffect(() => {
    mixer.setVoiceVolume(voiceVolume);
  }, [voiceVolume]);

  // Music element control: attach to mixer, set src, play/pause on enable/track
  // change. Deliberately split from the volume effect below so that dragging the
  // music volume slider does NOT re-set el.src (which would restart the track
  // from the beginning — the M1 bug).
  useEffect(() => {
    const el = musicElRef.current;
    if (!el) return;
    if (musicEnabled && musicTrack) {
      mixer.attachMusic(el);
      el.src = musicTrack.src;
      el.loop = true;
      void el.play().catch(() => {
        /* file may be missing — fail silently */
      });
    } else {
      el.pause();
    }
  }, [musicEnabled, musicTrack]);

  // Music volume — applied live without touching src or playback position.
  useEffect(() => {
    if (musicEnabled) mixer.setMusicVolume(musicVolume);
  }, [musicVolume, musicEnabled]);

  // Load saved text history on mount (IndexedDB, local-first).
  useEffect(() => {
    void listHistory().then(setHistory);
  }, []);

  // Best-effort persist of the current text as a history record. Creates a new
  // record if none is active, otherwise updates the active record's text +
  // updatedAt. Used by both the "💾 Lưu" button and auto-save on Generate.
  const persistCurrent = useCallback(async (): Promise<void> => {
    if (!text.trim()) return;
    try {
      if (activeHistoryId) {
        const updated = await updateHistoryItemText(activeHistoryId, text);
        if (updated) {
          setHistory((h) =>
            h.map((it) => (it.id === updated.id ? updated : it)).sort((a, b) => b.updatedAt - a.updatedAt),
          );
        }
        return;
      }
      const created = await createHistoryItem(text);
      setActiveHistoryId(created.id);
      setHistory((h) => [created, ...h]);
    } catch {
      /* IndexedDB quota exceeded — best-effort, don't block */
    }
  }, [text, activeHistoryId]);

  const saveCurrent = useCallback(() => {
    void persistCurrent();
  }, [persistCurrent]);

  const loadHistoryItem = useCallback(async (id: string) => {
    const item = await getHistoryItem(id);
    if (!item) return;
    setText(item.text);
    setActiveHistoryId(item.id);
    setSidebarOpen(false); // close overlay on mobile
  }, []);

  const newDocument = useCallback(() => {
    setText('');
    setActiveHistoryId(null);
    setSidebarOpen(false);
  }, []);

  const handleRename = useCallback(async (id: string, name: string) => {
    const updated = await renameHistoryItem(id, name);
    if (updated) setHistory((h) => h.map((it) => (it.id === id ? updated : it)));
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deleteHistoryItem(id);
    setHistory((h) => h.filter((it) => it.id !== id));
    setActiveHistoryId((cur) => (cur === id ? null : cur));
  }, []);

  // --- handlers ---
  const onLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setVoice(voicesFor(lang)[0].id);
  };

  const fetchCached = useCallback(
    async (chunk: string): Promise<Blob> => {
      const key = await cacheKey(chunk, voice, speed);
      const cached = await getCache(key);
      if (cached) return cached;
      const blob = await fetchTTSAudio(chunk, voice, speed);
      try {
        await setCache(key, blob);
      } catch {
        /* IndexedDB quota exceeded — cache is best-effort, don't abort generation */
      }
      return blob;
    },
    [voice, speed],
  );

  const onGenerate = useCallback(async () => {
    if (!text.trim()) return;
    if (!hasToken()) {
      setShowToken(true);
      return;
    }
    // Auto-save the current text as a history record (ChatGPT-style) before
    // generating. Best-effort — a failure must not block playback.
    void persistCurrent();
    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) return;

    const myGen = ++genIdRef.current;
    setError(null);
    setIsGenerating(true);
    const q = queueRef.current;
    if (q) q.clear();

    try {
      // Fetch chunk 0 first so playback starts ASAP, then stream the rest in.
      const b0 = await fetchCached(chunks[0]);
      if (myGen !== genIdRef.current) return; // superseded
      if (q) {
        q.setQueue([b0]);
        mixer.attachVoice(voiceElRef.current!);
        mixer.setVoiceVolume(voiceVolume);
        void q.playFrom(0, 0);
      }
      for (let i = 1; i < chunks.length; i++) {
        const b = await fetchCached(chunks[i]);
        if (myGen !== genIdRef.current) return; // superseded
        q?.append(b);
      }
    } catch (e) {
      if (myGen !== genIdRef.current) return;
      if (e instanceof TTSError) {
        if (e.status === 401) {
          setTokenPresent(false);
          setShowToken(true);
        }
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : 'Lỗi không xác định.');
      }
    } finally {
      if (myGen === genIdRef.current) setIsGenerating(false);
    }
  }, [text, fetchCached, voiceVolume, persistCurrent]);

  const onPlay = useCallback(() => {
    mixer.attachVoice(voiceElRef.current!);
    queueRef.current?.play();
  }, []);
  const onPause = useCallback(() => queueRef.current?.pause(), []);
  const onStop = useCallback(() => queueRef.current?.stop(), []);
  const onSeek = useCallback((ratio: number) => void queueRef.current?.seek(ratio), []);

  const onTokenSaved = (present: boolean) => {
    setTokenPresent(present);
    if (present) setError(null);
  };

  const canGenerate = text.trim().length > 0;

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Mobile backdrop behind the sidebar overlay. */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 sm:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <HistorySidebar
        open={sidebarOpen}
        items={history}
        activeId={activeHistoryId}
        onClose={() => setSidebarOpen(false)}
        onSelect={(id) => void loadHistoryItem(id)}
        onNew={newDocument}
        onRename={(id, name) => void handleRename(id, name)}
        onDelete={(id) => void handleDelete(id)}
      />

      <main className="flex-1 min-w-0">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
          <header className="flex items-center gap-2 pb-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="rounded-lg px-2 py-1 text-lg text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Lịch sử"
            >
              ☰
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold tracking-tight">quiniu_speak</h1>
              <p className="text-sm text-neutral-500">
                Đọc văn bản song ngữ Việt / Anh + nhạc nền.
              </p>
            </div>
            <button
              type="button"
              onClick={saveCurrent}
              disabled={!canGenerate}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-indigo-950"
              title="Lưu văn bản vào lịch sử"
            >
              💾 Lưu
            </button>
          </header>

        {/* Input Zone */}
        <TextInput value={text} onChange={setText} />

        {/* Action Zone */}
        <Toolbar
          language={language}
          voice={voice}
          speed={speed}
          isGenerating={isGenerating}
          hasToken={tokenPresent}
          onLanguageChange={onLanguageChange}
          onVoiceChange={setVoice}
          onSpeedChange={setSpeed}
          onGenerate={onGenerate}
          onOpenToken={() => setShowToken(true)}
        />

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {!canGenerate && queueState.total === 0 && !error && (
          <p className="text-center text-sm text-neutral-400">
            Dán văn bản rồi nhấn Generate Speech.
          </p>
        )}

        {/* Playback Zone */}
        <AudioPlayer
          state={queueState}
          voiceVolume={voiceVolume}
          onPlay={onPlay}
          onPause={onPause}
          onStop={onStop}
          onSeek={onSeek}
          onVoiceVolumeChange={setVoiceVolume}
        />

        <MusicPlayer
          tracks={MUSIC_TRACKS}
          enabled={musicEnabled}
          trackId={musicTrackId}
          volume={musicVolume}
          onEnabledChange={setMusicEnabled}
          onTrackChange={setMusicTrackId}
          onVolumeChange={setMusicVolume}
        />
        </div>
      </main>

      {/* Hidden audio elements driven by the queue / mixer. */}
      <audio ref={voiceElRef} hidden preload="auto" />
      <audio ref={musicElRef} hidden preload="auto" />

      <TokenPrompt
        open={showToken}
        initialToken={getToken()}
        onClose={() => setShowToken(false)}
        onSaved={onTokenSaved}
      />
    </div>
  );
}