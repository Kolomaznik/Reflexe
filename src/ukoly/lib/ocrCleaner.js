export function cleanOcrLine(line) {
  return line
    .replace(/^\s*[\-\*•◦·–—■□●○▸▹▪▫�]+\s*/, '')
    .replace(/^\s*\d+[\.\)]\s*/, '')
    .replace(/^\s*\[\s*[xX\s]?\s*\]\s*/, '')
    .replace(/^\s*[☐☑☒□■✓✔✗]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ocrLinesFromText(text) {
  return text
    .split(/\r?\n/)
    .map(cleanOcrLine)
    .filter((l) => l && l.length >= 2 && /[\p{L}\p{N}]/u.test(l));
}
