export function extractNGrams(
  text: string,
  targetWords: string[],
  windowSize = 3,
): string[] {
  const tokens = text.toLowerCase().split(/\s+/);
  const ngrams = [];

  for (let i = 0; i < tokens.length; i++) {
    if (targetWords.includes(tokens[i])) {
      const start = Math.max(0, i - windowSize + 1);
      const phrase = tokens.slice(start, i + 1).join(' ');
      ngrams.push(phrase);
    }
  }

  return ngrams;
}
