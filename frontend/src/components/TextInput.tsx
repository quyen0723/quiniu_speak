import { useMemo } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

function count(text: string): { chars: number; words: number } {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { chars, words };
}

// Input Zone — large textarea + live char/word counter + Clear.
export default function TextInput({ value, onChange }: Props) {
  const { chars, words } = useMemo(() => count(value), [value]);

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Dán văn bản tiếng Việt hoặc tiếng Anh vào đây…"
        spellCheck={false}
        className="h-56 w-full resize-y rounded-xl border border-neutral-300 bg-white p-4 text-base leading-relaxed text-neutral-900 outline-none transition focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 sm:h-64"
      />
      <div className="pointer-events-none absolute bottom-2 right-3 select-none text-xs tabular-nums text-neutral-400">
        {words} từ · {chars} ký tự
      </div>
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-2 right-2 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Xoá
        </button>
      )}
    </div>
  );
}