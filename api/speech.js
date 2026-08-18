// Vercel serverless function — OpenAI-compatible TTS proxy backed by Microsoft Edge TTS.
//
// Plain JavaScript (not TypeScript) so Vercel deploys the Node function directly
// without invoking the TypeScript compiler — avoids @vercel/node x TS version
// incompatibilities. Runtime: Node serverless (Node 20 satisfies edge-tts-universal's
// Node 18.17+ requirement).
//
// Env vars (set in Vercel project settings, never committed):
//   TTS_BEARER_TOKEN    — 64-hex secret (openssl rand -hex 32). Client sends as `Authorization: Bearer <token>`.
//   TTS_ALLOWED_ORIGIN  — comma-separated list of allowed origins (GitHub Pages URL + dev origins).
//
// Endpoint shape mirrors OpenAI POST /v1/audio/speech so the frontend can swap to real
// OpenAI or Kokoro-FastAPI later without code changes (the "strategic chess move", design doc line 188).

import crypto from 'node:crypto';

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
};

// Voice allowlist — prevent arbitrary voice IDs being passed through (minor hardening).
const VOICE_ALLOWLIST = new Set([
  // Vietnamese
  'vi-VN-HoaiMyNeural',
  'vi-VN-NamMinhNeural',
  // English
  'en-US-AriaNeural',
  'en-US-GuyNeural',
  'en-US-JennyNeural',
  'en-US-ChristopherNeural',
  'en-GB-SoniaNeural',
  'en-GB-RyanNeural',
  'en-AU-NatashaNeural',
  'en-AU-WilliamNeural',
]);

// Keep each Vercel invocation well under the 10s Node Hobby cap. Empirically
// synthesis is ~1s fixed + ~30 chars/s; 250 chars ≈ ~8s cold — safe ceiling. The
// client chunker targets 200 chars; this is the server-side hard cap (defense in depth).
const MAX_INPUT_CHARS = 250;

function allowedOrigins() {
  const raw = process.env.TTS_ALLOWED_ORIGIN || '';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function setCors(res, origin) {
  const list = allowedOrigins();
  // Echo the requesting origin only if it is in the allowlist; otherwise emit an
  // empty ACAO so the browser blocks the read. Never fall back to an allowlist
  // entry — that would echo a different origin and leak an allowed origin to a
  // stranger's page.
  const value = origin && list.includes(origin) ? origin : '';
  res.setHeader('Access-Control-Allow-Origin', value);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Max-Age', '86400'); // cache successful preflight 24h
}

function jsonError(res, status, message, type = 'invalid_request_error') {
  return res.status(status).json({ error: { message, type } });
}

function checkBearer(req) {
  const expected = process.env.TTS_BEARER_TOKEN;
  if (!expected) return false; // if the env var is unset, deny everything (fail closed)
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return false;
  const a = Buffer.from(token, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  // constant-time compare to avoid timing side-channel
  return crypto.timingSafeEqual(a, b);
}

// Map OpenAI `speed` float (0.25x–4.0x) to edge-tts percentage string.
// 1.0 -> '0%', 1.5 -> '+50%', 0.5 -> '-50%'.
function speedToRate(speed) {
  const pct = Math.round((speed - 1) * 100);
  // Edge-TTS requires a signed percentage string (e.g. '+0%', '+50%', '-50%');
  // a bare '0%' is rejected by the service as "Invalid rate".
  return (pct >= 0 ? '+' : '') + pct + '%';
}

export default async function handler(req, res) {
  // 1. CORS + preflight
  setCors(res, req.headers.origin);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return jsonError(res, 405, 'Method not allowed. Use POST.');
  }

  // 2. Auth
  if (!checkBearer(req)) {
    return jsonError(res, 401, 'Invalid or missing bearer token.', 'unauthorized');
  }

  // 3. Parse + validate
  const body = req.body || {};
  const input = typeof body.input === 'string' ? body.input : '';
  if (!input.trim()) {
    return jsonError(res, 400, '`input` is required and must be a non-empty string.');
  }
  if (input.length > MAX_INPUT_CHARS) {
    return jsonError(
      res,
      413,
      `Input too long (${input.length} chars). Split into chunks of at most ${MAX_INPUT_CHARS} chars on the client.`,
    );
  }

  const voice = (body.voice || 'vi-VN-HoaiMyNeural').trim();
  if (!VOICE_ALLOWLIST.has(voice)) {
    return jsonError(res, 400, `Voice '${voice}' is not allowed.`, 'invalid_request_error');
  }

  const speed = Number(body.speed ?? 1.0);
  if (!Number.isFinite(speed) || speed < 0.25 || speed > 4.0) {
    return jsonError(res, 400, '`speed` must be a number between 0.25 and 4.0.');
  }

  // `model` is accepted for OpenAI compatibility but ignored (both tts-1 / tts-1-hd map to Edge).
  const response_format = (body.response_format || 'mp3').toLowerCase();
  if (response_format !== 'mp3') {
    return jsonError(res, 400, "Only 'mp3' response_format is supported.");
  }

  // 4. Synthesize via edge-tts-universal
  try {
    const { EdgeTTS } = await import('edge-tts-universal');
    const tts = new EdgeTTS(input, voice, {
      rate: speedToRate(speed),
      volume: '+0%',
    });
    const result = await tts.synthesize();
    const buf = Buffer.from(await result.audio.arrayBuffer());

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).end(buf);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TTS synthesis failed.';
    // Never log the input text (privacy).
    console.error('[speech] synthesis error:', message);
    return jsonError(res, 502, `TTS provider error: ${message}`, 'tts_error');
  }
}