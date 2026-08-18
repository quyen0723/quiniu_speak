export interface MusicTrack {
  id: string;
  label: string;
  src: string;
}

interface Props {
  tracks: MusicTrack[];
  enabled: boolean;
  trackId: string;
  volume: number;
  onEnabledChange: (v: boolean) => void;
  onTrackChange: (id: string) => void;
  onVolumeChange: (v: number) => void;
}

// Background music track — enable/loop + track select + independent volume.
export default function MusicPlayer({
  tracks,
  enabled,
  trackId,
  volume,
  onEnabledChange,
  onTrackChange,
  onVolumeChange,
}: Props) {
  const empty = tracks.length === 0;
  return (
    <div className="rounded-xl border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-base">🎵</span>
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nhạc nền</span>
        <label className={`ml-auto inline-flex items-center ${empty ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            disabled={empty}
            className="peer sr-only"
          />
          <span className="h-6 w-11 rounded-full bg-neutral-300 transition peer-checked:bg-indigo-600 dark:bg-neutral-700" />
          <span className="ml-1 text-xs text-neutral-500">{enabled ? 'Bật' : 'Tắt'}</span>
        </label>
      </div>

      {empty ? (
        <p className="mb-3 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs text-neutral-500 dark:border-neutral-700">
          Chưa có bản nhạc. Thêm mp3 vào <code>frontend/public/music/</code> rồi khai báo trong{' '}
          <code>MUSIC_TRACKS</code> (App.tsx).
        </p>
      ) : (
        <select
          value={trackId}
          onChange={(e) => onTrackChange(e.target.value)}
          disabled={!enabled}
          className="mb-3 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none disabled:opacity-50 focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          aria-label="Bản nhạc"
        >
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      )}

      <label className={`flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 ${empty ? 'opacity-50' : ''}`}>
        <span className="w-16">Âm lượng</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          disabled={empty}
          className="flex-1 accent-indigo-600"
          aria-label="Âm lượng nhạc nền"
        />
        <span className="w-10 text-right tabular-nums">{Math.round(volume * 100)}</span>
      </label>
    </div>
  );
}