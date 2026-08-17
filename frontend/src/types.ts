// Shared types + static option tables for the TTS reader.

export type Language = 'vi' | 'en';

export interface VoiceOption {
  id: string;
  label: string;
  lang: Language;
}

// Keep in sync with the VOICE_ALLOWLIST in api/speech.ts.
export const VOICES: VoiceOption[] = [
  { id: 'vi-VN-HoaiMyNeural', label: 'Hoài My — nữ', lang: 'vi' },
  { id: 'vi-VN-NamMinhNeural', label: 'Nam Minh — nam', lang: 'vi' },
  { id: 'en-US-AriaNeural', label: 'Aria — nữ (US)', lang: 'en' },
  { id: 'en-US-GuyNeural', label: 'Guy — nam (US)', lang: 'en' },
  { id: 'en-GB-SoniaNeural', label: 'Sonia — nữ (UK)', lang: 'en' },
  { id: 'en-GB-RyanNeural', label: 'Ryan — nam (UK)', lang: 'en' },
  { id: 'en-AU-NatashaNeural', label: 'Natasha — nữ (AU)', lang: 'en' },
];

export const SPEEDS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;

export function voicesFor(lang: Language): VoiceOption[] {
  return VOICES.filter((v) => v.lang === lang);
}