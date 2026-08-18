// Zero-dependency Markdown → plain-text stripper for TTS reading.
// Removes syntax markers (#, *, links, code fences, HTML, list markers) so the
// text reads naturally aloud. Whitespace normalization is left to chunker.clean()
// downstream — this function only strips syntax, it does not collapse whitespace.
//
// Scope: covers the common Markdown subset used in notes/articles (CommonMark +
// a bit of GFM). Nested/edge constructs (reference link defs, deep tables) are
// best-effort. Not a spec-complete parser — good enough for reading aloud.

export function stripMarkdown(md: string): string {
  let s = md;

  // 1. YAML frontmatter (---\n...\n--- at file start) -> drop
  s = s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');

  // 2. Fenced code blocks (```lang\n...\n``` or ~~~) -> drop (code reads poorly aloud)
  s = s.replace(/```[\s\S]*?```/g, '');
  s = s.replace(/~~~[\s\S]*?~~~/g, '');

  // 3. Images ![alt](url) -> alt text (empty alt -> drop)
  s = s.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // 4. Links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 5. HTML tags -> drop (keep inner text)
  s = s.replace(/<[^>]+>/g, '');

  // 6. Headings (#..###### ) -> drop marker
  s = s.replace(/^#{1,6}\s+/gm, '');

  // 7. Blockquote (> ) -> drop marker
  s = s.replace(/^\s*>\s?/gm, '');

  // 8. List markers (- * + 1. ) -> drop marker
  s = s.replace(/^\s*[-*+]\s+/gm, '');
  s = s.replace(/^\s*\d+\.\s+/gm, '');

  // 9. Horizontal rules (--- *** ___ on own line) -> drop
  s = s.replace(/^\s*(---|\*\*\*|___)\s*$/gm, '');

  // 10. Emphasis/strong/strikethrough -> unwrap
  s = s.replace(/\*\*(.+?)\*\*/g, '$1');
  s = s.replace(/__(.+?)__/g, '$1');
  s = s.replace(/\*(.+?)\*/g, '$1');
  s = s.replace(/_(.+?)_/g, '$1');
  s = s.replace(/~~(.+?)~~/g, '$1');

  // 11. Inline code `code` -> unwrap
  s = s.replace(/`([^`]+)`/g, '$1');

  // 12. Unescape common HTML entities
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/&#39;/g, "'");
  s = s.replace(/&nbsp;/g, ' ');

  return s;
}