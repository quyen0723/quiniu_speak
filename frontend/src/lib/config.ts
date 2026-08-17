// Public base URL of the Vercel TTS function. Safe to bake into the bundle (it is
// not a secret). The Bearer token is NEVER read from here — see token.ts.
export const TTS_API_BASE = (import.meta.env.VITE_TTS_API_BASE ?? '').replace(/\/+$/, '');