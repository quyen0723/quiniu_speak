import { useMemo, useRef, useState } from 'react';
import { loadTextFile } from '../lib/fileLoader';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

function count(text: string): { chars: number; words: number } {
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { chars, words };
}

// Input Zone — large textarea + live char/word counter + file upload (.txt/.md) + Clear.
export default function TextInput({ value, onChange }: Props) {
  const { chars, words } = useMemo(() => count(value), [value]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    e.target.value = '';
    if (!file) return;
    try {
      const loaded = await loadTextFile(file);
      onChange(loaded.text);
      setUploadError(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Không đọc được file.');
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".txt,.md,.markdown,text/plain,text/markdown"
        ref={fileInputRef}
        onChange={handleFile}
        className="hidden"
      />

      <div className="mb-1 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          title="Tải file .txt hoặc .md"
        >
          📁 Tải file
        </button>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Xoá
          </button>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (uploadError) setUploadError(null);
        }}
        placeholder="Dán văn bản hoặc tải file .txt/.md vào đây…"
        spellCheck={false}
        className="h-56 w-full resize-y rounded-xl border border-neutral-300 bg-white p-4 text-base leading-relaxed text-neutral-900 outline-none transition focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 sm:h-64"
      />
      <div className="pointer-events-none absolute bottom-2 right-3 select-none text-xs tabular-nums text-neutral-400">
        {words} từ · {chars} ký tự
      </div>

      {uploadError && (
        <p className="mt-1 px-1 text-xs text-red-600 dark:text-red-400">{uploadError}</p>
      )}
    </div>
  );
}