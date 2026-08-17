// Sentence-bounded chunking. Splits on . ? ! ; so each chunk is a complete sentence
// (preserves intonation within a chunk). Each chunk is capped at ~MAX chars to keep
// every Vercel function invocation well under the 10s Node Hobby budget.

const MAX = 1200;

// Normalize whitespace inside a chunk.
function clean(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

// Hard-split a single over-long sentence by words (avoid breaking mid-word).
function hardSplit(sent: string): string[] {
  const out: string[] = [];
  let rest = sent;
  while (rest.length > MAX) {
    let cut = rest.lastIndexOf(' ', MAX);
    if (cut <= 0) cut = MAX;
    out.push(clean(rest.slice(0, cut)));
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(clean(rest));
  return out;
}

export function splitIntoChunks(text: string): string[] {
  const cleaned = clean(text);
  if (!cleaned) return [];

  // Match sentence-like units, keeping the trailing punctuation.
  const sentences = cleaned.match(/[^.!?;]+[.!?;]*\s*/g) ?? [cleaned];

  const chunks: string[] = [];
  let cur = '';
  for (const raw of sentences) {
    const sent = clean(raw);
    if (!sent) continue;

    const candidate = cur ? `${cur} ${sent}` : sent;

    if (candidate.length > MAX) {
      if (cur) chunks.push(cur);
      if (sent.length > MAX) {
        // very long sentence — split by words
        hardSplit(sent).forEach((c) => chunks.push(c));
        cur = '';
      } else {
        cur = sent;
      }
    } else {
      cur = candidate;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}