export function extractNGrams(
  text: string,
  trackedWords: string[],
  windowSize = 3,
): string[] {
  const inputText = text.toLowerCase().split(/\s+/);
  const ngrams = [];

  for (let i = 0; i < inputText.length; i++) {
    if (trackedWords.includes(inputText[i])) {
      const start = Math.max(0, i - windowSize + 1);
      const phrase = inputText.slice(start, i + 1).join(' ');
      ngrams.push(phrase);
    }
  }

  return ngrams;
}
