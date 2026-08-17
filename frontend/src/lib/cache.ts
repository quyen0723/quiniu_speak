// IndexedDB-backed audio cache via localForage. Avoids redundant TTS calls for the
// same (text|voice|speed|format) tuple.
import localforage from 'localforage';

const store = localforage.createInstance({
  name: 'quiniu_speak',
  storeName: 'tts_cache',
  description: 'Cached TTS audio blobs keyed by SHA-256 of inputs.',
});

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function cacheKey(text: string, voice: string, speed: number): Promise<string> {
  return sha256(`${text}|${voice}|${speed}|mp3`);
}

export async function getCache(key: string): Promise<Blob | null> {
  return store.getItem<Blob>(key);
}

export async function setCache(key: string, blob: Blob): Promise<void> {
  await store.setItem(key, blob);
}