// Thin client for the OpenAI-compatible /v1/audio/speech endpoint (Vercel function).
import { TTS_API_BASE } from './config';
import { getToken } from './token';

export class TTSError extends Error {
  status: number;
  type: string;
  constructor(status: number, message: string, type = 'tts_error') {
    super(message);
    this.status = status;
    this.type = type;
  }
}

export interface SpeechRequest {
  input: string;
  voice: string;
  speed: number;
  response_format?: 'mp3';
  model?: string;
}

// Fetches one audio chunk as a Blob. Throws TTSError on non-2xx.
export async function fetchTTSAudio(input: string, voice: string, speed: number): Promise<Blob> {
  if (!TTS_API_BASE) {
    throw new TTSError(0, 'Chưa cấu hình VITE_TTS_API_BASE.', 'config_error');
  }
  const token = getToken();
  if (!token) {
    throw new TTSError(401, 'Chưa nhập token. Bấm biểu tượng khoá để nhập.', 'unauthorized');
  }

  const res = await fetch(`${TTS_API_BASE}/v1/audio/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: 'tts-1',
      input,
      voice,
      response_format: 'mp3',
      speed,
    } satisfies SpeechRequest),
  });

  if (!res.ok) {
    let message = `Lỗi HTTP ${res.status}`;
    let type = 'tts_error';
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
      type = body?.error?.type ?? type;
    } catch {
      /* non-JSON error body */
    }
    throw new TTSError(res.status, message, type);
  }

  return res.blob();
}