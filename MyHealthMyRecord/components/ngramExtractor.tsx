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

    // Determine intensity from modifiers
    let intensity: 'high' | 'moderate' | 'low' | undefined;
    for (const modifier of foundModifiers) {
      const category = getIntensityCategory(modifier);
      if (category) {
        intensity = category;
        break;
      }
    }

    phrases.push({
      phrase,
      start,
      end,
      symptom: symptomWord,
      modifiers: foundModifiers,
      intensity,
    });
  }

  return phrases;
}
