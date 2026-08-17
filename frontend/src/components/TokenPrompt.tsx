import { useEffect, useRef, useState } from 'react';
import { clearToken, setToken } from '../lib/token';

interface Props {
  open: boolean;
  initialToken?: string;
  onClose: () => void;
  onSaved: (present: boolean) => void;
}

// Single-secret gate. The user enters the Vercel Bearer token once; it is stored in
// localStorage (never bundled). There is no username/password — for N=1 this is the
// right altitude (see plan §5).
export default function TokenPrompt({ open, initialToken, onClose, onSaved }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(initialToken ?? '');
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open, initialToken]);

  if (!open) return null;

  const save = () => {
    setToken(value);
    onSaved(value.trim().length > 0);
    onClose();
  };

  const clear = () => {
    clearToken();
    setValue('');
    onSaved(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-neutral-300 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Nhập token truy cập
        </h2>
        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          Token được lưu trong trình duyệt (localStorage), chỉ gửi tới hàm TTS của bạn
          qua HTTPS. Không bao giờ được nhúng vào mã nguồn tĩnh.
        </p>
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="64-hex token (openssl rand -hex 32)"
          className="mb-4 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={clear}
            className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            Xoá token
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}