// IndexedDB-backed text document history via localForage. Each saved text
// (uploaded or pasted) is a HistoryItem the user can later reopen, rename, or
// delete — a ChatGPT-style document list, local-first (no backend).
//
// Mirrors cache.ts: module-scoped localforage instance in the same DB
// ('quiniu_speak'), separate object store ('text_history'). Flat async
// functions, no classes. IDs via crypto.randomUUID(), timestamps via Date.now().
import localforage from 'localforage';

export interface HistoryItem {
  id: string; // crypto.randomUUID()
  name: string; // user-editable, auto-derived from first non-empty line
  text: string;
  createdAt: number; // Date.now() epoch ms
  updatedAt: number;
}

const store = localforage.createInstance({
  name: 'quiniu_speak',
  storeName: 'text_history',
  description: 'Saved text documents for the TTS reader.',
});

// Cap to avoid unbounded growth. 200 * up-to-500KB = ~100MB worst case, well
// within IndexedDB quotas; oldest (by updatedAt) evicted when exceeded.
const MAX_ITEMS = 200;
const NAME_MAX = 60;

// Derive a human-readable name from the text (first non-empty line, collapsed,
// truncated). Used when a record is created without an explicit name.
export function deriveName(text: string): string {
  const firstLine = text.split('\n').map((l) => l.trim()).find((l) => l.length > 0) ?? '';
  const clean = firstLine.replace(/\s+/g, ' ').trim();
  if (!clean) return 'Văn bản trống';
  return clean.length > NAME_MAX ? clean.slice(0, NAME_MAX) + '…' : clean;
}

// List all records, newest-first by updatedAt.
export async function listHistory(): Promise<HistoryItem[]> {
  const keys = await store.keys();
  const items: HistoryItem[] = [];
  for (const k of keys) {
    const v = await store.getItem<HistoryItem>(k);
    if (v) items.push(v);
  }
  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getHistoryItem(id: string): Promise<HistoryItem | null> {
  return store.getItem<HistoryItem>(id);
}

// Create a new record. Auto-evicts oldest if over the cap.
export async function createHistoryItem(text: string, name?: string): Promise<HistoryItem> {
  const now = Date.now();
  const item: HistoryItem = {
    id: crypto.randomUUID(),
    name: name?.trim() || deriveName(text),
    text,
    createdAt: now,
    updatedAt: now,
  };
  await store.setItem(item.id, item);
  await evictIfOverLimit();
  return item;
}

// Update an existing record's text (bumps updatedAt). Returns null if not found.
export async function updateHistoryItemText(id: string, text: string): Promise<HistoryItem | null> {
  const existing = await store.getItem<HistoryItem>(id);
  if (!existing) return null;
  const updated: HistoryItem = { ...existing, text, updatedAt: Date.now() };
  await store.setItem(id, updated);
  return updated;
}

// Rename a record (bumps updatedAt). Empty name falls back to the existing name.
export async function renameHistoryItem(id: string, name: string): Promise<HistoryItem | null> {
  const existing = await store.getItem<HistoryItem>(id);
  if (!existing) return null;
  const updated: HistoryItem = {
    ...existing,
    name: name.trim() || existing.name,
    updatedAt: Date.now(),
  };
  await store.setItem(id, updated);
  return updated;
}

export async function deleteHistoryItem(id: string): Promise<void> {
  await store.removeItem(id);
}

async function evictIfOverLimit(): Promise<void> {
  const count = await store.length();
  if (count <= MAX_ITEMS) return;
  const sorted = await listHistory(); // desc by updatedAt
  const toEvict = sorted.slice(MAX_ITEMS); // oldest beyond the cap
  await Promise.all(toEvict.map((it) => store.removeItem(it.id)));
}