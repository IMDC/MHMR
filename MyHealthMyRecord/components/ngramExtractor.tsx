export function extractNGrams(
  text: string,
  trackedWords: string[],
  windowSize = 4,
): string[] {
  const inputText = text.toLowerCase().split(/\s+/);
  const ngrams = [];

  for (let i = 0; i < inputText.length; i++) {
    if (trackedWords.includes(inputText[i])) {
      // Half window before and half window after tracked word
      // Split windowSize roughly evenly before and after
      const halfWindow = Math.floor((windowSize - 1) / 2);

      const start = Math.max(0, i - halfWindow);
      const end = Math.min(inputText.length, i + halfWindow + 1);

      const phrase = inputText.slice(start, end).join(' ');
      ngrams.push(phrase);
    }
  }

  return ngrams;
}
