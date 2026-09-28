const DEFAULT_MAX_CHARS = 1200;
const DEFAULT_OVERLAP_CHARS = 200;

export function chunkText(text, options = {}) {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  const overlapChars = options.overlapChars ?? DEFAULT_OVERLAP_CHARS;

  if (!text || !text.trim()) return [];

  const clean = text.replace(/\r\n/g, "\n").trim();
  const paragraphs = clean
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";

  for (const para of paragraphs) {
    const candidate = current ? current + "\n\n" + para : para;

    if (candidate.length > maxChars && current) {
      chunks.push(current.trim());

      const tail = current.slice(-overlapChars);
      current = tail ? tail + "\n\n" + para : para;
    } else {
      current = candidate;
    }
  }

  if (current.trim()) chunks.push(current.trim());

  return chunks;
}