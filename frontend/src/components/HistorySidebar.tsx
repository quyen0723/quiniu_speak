import { useMemo, useState } from 'react';
import type { HistoryItem } from '../lib/history';
import Modal from './Modal';

interface Props {
  open: boolean;
  items: HistoryItem[];
  activeId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

// Relative time in Vietnamese, no date library.
function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'vừa xong';
  if (min < 60) return `${min} phút`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày`;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(ts);
}

// ChatGPT-style document list: search + new + per-item rename (inline) / delete
// (confirm modal). Responsive — fixed overlay on mobile, static on desktop.
export default function HistorySidebar({
  open,
  items,
  activeId,
  onClose,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: Props) {
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.name.toLowerCase().includes(q));
  }, [items, query]);

  const startRename = (it: HistoryItem) => {
    setEditingId(it.id);
    setEditValue(it.name);
  };

  const commitRename = () => {
    if (editingId) onRename(editingId, editValue);
    setEditingId(null);
  };

  const confirmItem = confirmId ? items.find((it) => it.id === confirmId) : null;

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white p-3 transition-transform dark:border-neutral-800 dark:bg-neutral-900 sm:static sm:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full sm:hidden'
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Lịch sử</h2>
          <button
            type="button"
            onClick={onNew}
            className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
            title="Văn bản mới"
          >
            ＋ Mới
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-1.5 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 sm:hidden"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên…"
          className="mb-2 w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-1 py-4 text-center text-xs text-neutral-400">
              {items.length === 0 ? 'Chưa có văn bản nào.' : 'Không tìm thấy.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {filtered.map((it) => (
                <li key={it.id}>
                  {editingId === it.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full rounded-md border border-indigo-400 bg-white px-2 py-1.5 text-sm outline-none dark:bg-neutral-800 dark:text-neutral-100"
                      autoFocus
                    />
                  ) : (
                    <div
                      className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition ${
                        it.id === activeId
                          ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(it.id)}
                        className="min-w-0 flex-1 text-left"
                        title={it.name}
                      >
                        <span className="block truncate">{it.name}</span>
                        <span className="block text-xs tabular-nums text-neutral-400">{formatRelative(it.updatedAt)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => startRename(it)}
                        className="shrink-0 rounded px-1 py-0.5 text-xs text-neutral-400 opacity-0 hover:text-neutral-700 group-hover:opacity-100 dark:hover:text-neutral-200"
                        aria-label="Đổi tên"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(it.id)}
                        className="shrink-0 rounded px-1 py-0.5 text-xs text-neutral-400 opacity-0 hover:text-red-600 group-hover:opacity-100"
                        aria-label="Xoá"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <Modal
        open={confirmId !== null}
        title="Xoá văn bản?"
        subtitle={confirmItem ? `“${confirmItem.name}”` : undefined}
        onClose={() => setConfirmId(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmId(null)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirmId) onDelete(confirmId);
                setConfirmId(null);
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              Xoá
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </>
  );
}