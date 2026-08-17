import type { Language } from '../types';
import { SPEEDS, voicesFor } from '../types';

interface Props {
  language: Language;
  voice: string;
  speed: number;
  isGenerating: boolean;
  hasToken: boolean;
  onLanguageChange: (lang: Language) => void;
  onVoiceChange: (voice: string) => void;
  onSpeedChange: (speed: number) => void;
  onGenerate: () => void;
  onOpenToken: () => void;
}

// Action Zone — language / voice / speed selects + Generate button + token lock.
export default function Toolbar({
  language,
  voice,
  speed,
  isGenerating,
  hasToken,
  onLanguageChange,
  onVoiceChange,
  onSpeedChange,
  onGenerate,
  onOpenToken,
}: Props) {
  const voices = voicesFor(language);
  const canGenerate = !isGenerating;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-300 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        aria-label="Ngôn ngữ"
      >
        <option value="vi">Tiếng Việt</option>
        <option value="en">English</option>
      </select>

      <select
        value={voice}
        onChange={(e) => onVoiceChange(e.target.value)}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        aria-label="Giọng đọc"
      >
        {voices.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>

      <select
        value={speed}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        aria-label="Tốc độ"
      >
        {SPEEDS.map((s) => (
          <option key={s} value={s}>
            {s}x
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="ml-auto rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? 'Đang tạo…' : 'Generate Speech'}
      </button>

      <button
        type="button"
        onClick={onOpenToken}
        title={hasToken ? 'Token đã lưu — bấm để đổi/xoá' : 'Chưa có token — bấm để nhập'}
        className={`rounded-lg px-2.5 py-2 text-sm font-medium transition ${
          hasToken
            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
            : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950'
        }`}
        aria-label="Quản lý token"
      >
        {hasToken ? '🔒' : '🔓'}
      </button>
    </div>
  );
}