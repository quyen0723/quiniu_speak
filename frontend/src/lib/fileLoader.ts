import { stripMarkdown } from './markdown';

// Max accepted file size. 500KB ≈ 80-150k words ≈ 50+ min of audio — plenty for
// articles/notes. Larger files would explode the chunk count (each chunk = 1
// Vercel function call); users reading whole books should split offline first.
const MAX_FILE_BYTES = 500_000;

export interface LoadedText {
  text: string;
  format: 'txt' | 'md';
}

// Read a .txt or .md file as UTF-8 text. Markdown is stripped to plain text so it
// reads naturally aloud; .txt is returned raw. Throws on oversized files.
export async function loadTextFile(file: File): Promise<LoadedText> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `File quá lớn (${Math.round(file.size / 1024)} KB). Giới hạn ${MAX_FILE_BYTES / 1024} KB — hãy cắt nhỏ file.`,
    );
  }
  const raw = await file.text(); // UTF-8, native modern browser
  const isMd = /\.(md|markdown)$/i.test(file.name) || file.type === 'text/markdown';
  return { text: isMd ? stripMarkdown(raw) : raw, format: isMd ? 'md' : 'txt' };
}