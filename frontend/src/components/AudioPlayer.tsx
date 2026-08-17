import type { QueueState } from '../lib/audioQueue';

interface Props {
  state: QueueState;
  voiceVolume: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (ratio: number) => void;
  onVoiceVolumeChange: (v: number) => void;
}

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const EST = 5; // estimated seconds per chunk when real duration unknown

// Voice track — Play/Pause/Stop + seek bar (whole-text ratio) + volume.
export default function AudioPlayer({
  state,
  voiceVolume,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onVoiceVolumeChange,
}: Props) {
  const { isPlaying, currentIndex, total, currentTime, duration, chunkDurations } = state;

  const knownTotal = chunkDurations.reduce((a, b) => a + (b || 0), 0);
  const estTotal = knownTotal || total * EST;
  const playedBefore =
    chunkDurations.slice(0, currentIndex < 0 ? 0 : currentIndex).reduce((a, b) => a + (b || EST), 0);
  const fraction = estTotal > 0 ? Math.min(1, (playedBefore + currentTime) / estTotal) : 0;

  const empty = total === 0;

  return (
    <div className="rounded-xl border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Giọng đọc</span>
        {total > 0 && (
          <span className="text-xs tabular-nums text-neutral-400">
            đoạn {Math.max(0, currentIndex) + 1}/{total}
          </span>
        )}
      </div>

      <div className="mb-3 flex items-center gap-3">
        {isPlaying ? (
          <button
            type="button"
            onClick={onPause}
            disabled={empty}
            className="h-10 w-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
            aria-label="Tạm dừng"
          >
            ⏸
          </button>
        ) : (
          <button
            type="button"
            onClick={onPlay}
            disabled={empty}
            className="h-10 w-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
            aria-label="Phát"
          >
            ▶
          </button>
        )}
        <button
          type="button"
          onClick={onStop}
          disabled={empty}
          className="h-9 w-9 rounded-full border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
          aria-label="Dừng"
        >
          ⏹
        </button>

        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={fraction}
            disabled={empty}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full accent-indigo-600 disabled:opacity-40"
            aria-label="Tiến trình"
          />
          <div className="mt-1 flex justify-between text-xs tabular-nums text-neutral-500">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(Number.isFinite(duration) ? duration : EST)}</span>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <span className="w-16">Âm lượng</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={voiceVolume}
          onChange={(e) => onVoiceVolumeChange(Number(e.target.value))}
          className="flex-1 accent-indigo-600"
          aria-label="Âm lượng giọng đọc"
        />
        <span className="w-10 text-right tabular-nums">{Math.round(voiceVolume * 100)}</span>
      </label>
    </div>
  );
}