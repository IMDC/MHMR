import {
  getAllSymptoms,
  getAllModifiers,
  intensityModifiers,
} from '../assets/util/medicalTerms';

export interface ExtractedPhrase {
  phrase: string;
  start: number;
  end: number;
  symptom?: string;
  modifiers: string[];
  intensity?: 'high' | 'moderate' | 'low';
}

// Helper function to determine intensity category of a modifier
function getIntensityCategory(
  modifier: string,
): 'high' | 'moderate' | 'low' | null {
  if (intensityModifiers.high.includes(modifier)) return 'high';
  if (intensityModifiers.moderate.includes(modifier)) return 'moderate';
  if (intensityModifiers.low.includes(modifier)) return 'low';
  return null;
}

// Helper function to normalize phrases
function normalizePhrase(phrase: ExtractedPhrase): string {
  if (!phrase.symptom || phrase.modifiers.length === 0) return phrase.phrase;

  const intensity = phrase.intensity || 'moderate';
  return `${intensity}_intensity_${phrase.symptom}`;
}

export function extractMedicalPhrases(text: string): ExtractedPhrase[] {
  const words = text.toLowerCase().split(/\s+/);
  const symptoms = getAllSymptoms();
  const modifiers = getAllModifiers();
  const phrases: ExtractedPhrase[] = [];

  for (let i = 0; i < words.length; i++) {
    // First find if there's a symptom word
    const symptomWord = symptoms.find(s => words[i].includes(s));
    if (!symptomWord) continue;

    // Look for modifiers before the symptom (up to 5 words before)
    const start = Math.max(0, i - 5);
    const precedingWords = words.slice(start, i);
    const foundModifiers = modifiers.filter(mod => {
      const modWords = mod.split(' ');
      for (let j = 0; j <= precedingWords.length - modWords.length; j++) {
        if (modWords.every((word, k) => precedingWords[j + k] === word)) {
          return true;
        }
      }
      return false;
    });

    // Look for additional context after the symptom (up to 3 words after)
    const end = Math.min(words.length, i + 4);
    const followingWords = words.slice(i + 1, end);

    // Build the complete phrase
    const phrase = [...precedingWords, words[i], ...followingWords].join(' ');

    phrases.push({
      phrase,
      start,
      end,
      symptom: symptomWord,
      modifiers: foundModifiers,
    });
  }

  return phrases;
}

// Original function kept for backward compatibility
export function extractNGrams(
  text: string,
  trackedWords: string[],
  windowSize: number,
): string[] {
  const phrases = extractMedicalPhrases(text);
  return phrases.map(p => p.phrase);
}

// Demonstration function to show how phrases are grouped
export function demonstrateGroupedPhrases(text: string) {
  const phrases = extractMedicalPhrases(text);

  // Group phrases by their normalized form
  const groupedPhrases = phrases.reduce((acc, phrase) => {
    const normalizedKey = normalizePhrase(phrase);
    if (!acc[normalizedKey]) {
      acc[normalizedKey] = {
        variations: [],
        symptom: phrase.symptom,
        intensity: phrase.intensity,
      };
    }
    acc[normalizedKey].variations.push(phrase.phrase);
    return acc;
  }, {} as Record<string, {variations: string[]; symptom: string | undefined; intensity: string | undefined}>);

  // Display the grouped phrases
  console.log('Grouped phrases by intensity and symptom:');
  Object.entries(groupedPhrases).forEach(([key, group]) => {
    console.log(
      `\n${group.intensity || 'unspecified'} ${group.symptom || 'symptom'}:`,
    );
    console.log('Variations found:', group.variations.join(', '));
  });
}

// Example usage:
const sampleText = `
  I am really tired today and so tired tonight. 
  I have a lot of pain and very intense pain.
  Feeling a bit achy and slightly achy.
  Pretty stiff this morning and somewhat stiff now.
`;

// Uncomment to see example output:
// demonstrateGroupedPhrases(sampleText);
