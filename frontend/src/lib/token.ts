// Bearer-token storage.
//
// Production: token lives ONLY in localStorage (entered once via TokenPrompt).
// Dev convenience: fall back to VITE_TTS_TOKEN from .env.local when running `vite dev`.
// The token is NEVER bundled into the production build — anything in VITE_TTS_TOKEN
// ends up in dist/assets/*.js, publicly inspectable, which defeats the purpose.

const KEY = 'quiniu_speak_token';

export function getToken(): string {
  if (import.meta.env.DEV) {
    const dev = import.meta.env.VITE_TTS_TOKEN as string | undefined;
    if (dev && dev.trim()) return dev.trim();
  }
  return localStorage.getItem(KEY) ?? '';
}

export function setToken(token: string): void {
  const t = token.trim();
  if (t) localStorage.setItem(KEY, t);
  else localStorage.removeItem(KEY);
}

export function clearToken(): void {
  localStorage.removeItem(KEY);
}

export function hasToken(): boolean {
  return getToken().length > 0;
}