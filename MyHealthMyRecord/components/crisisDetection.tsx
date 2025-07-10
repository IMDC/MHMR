// Crisis detection utility for identifying harmful content in transcripts

export interface CrisisDetectionResult {
  flagged: boolean;
  detectedPhrases: string[];
}

// Comprehensive list of harmful keywords and phrases
const HARMFUL_KEYWORDS = [
  // Self-harm and suicide
  'kill myself',
  'end myself',
  'take my life',
  'end my life',
  'commit suicide',
  'want to die',
  'better off dead',
  'no reason to live',
  "can't go on",
  'give up',
  'end it all',
  'hurt myself',
  'hurting myself',
  'cut myself',
  'cutting myself',
  'self harm',
  'self-harm',
  'harm myself',
  'poison myself',
  'overdose',
  'over dose',
  'take pills',
  'swallow pills',

  // Harm to others
  'kill someone',
  'hurt someone',
  'harm someone',
  'cut someone',
  'attack someone',
  'hurt them',
  'kill them',
  'harm them',
  'poison someone',
  'hurt people',
  'kill people',
  'harm people',

  // Violence
  'shoot',
  'gun',
  'knife',
  'weapon',
  'attack',
  'assault',
  'fight',
  'violence',
  'violent',
  'rage',
  'angry enough to',
  'want to hurt',
  'want to kill',

  // Despair and hopelessness
  'hopeless',
  'helpless',
  'worthless',
  'useless',
  'no point',
  'pointless',
  'meaningless',
  'empty',
  'numb',
  "can't feel",
  "don't care",
  "don't matter",
  'no one cares',
  'alone',
  'lonely',
  'isolated',
  'trapped',
  'stuck',
  'no way out',
  'no escape',

  // Specific methods
  'hanging',
  'hang myself',
  'jump',
  'jump off',
  'bridge',
  'building',
  'high place',
  'fall',
  'crash',
  'car accident',
  'drive into',
  'run into',
  'pills',
  'medication',
  'drugs',
  'alcohol',
  'poison',
  'bleach',
  'chemicals',
  'fire',
  'burn',
  'drown',
  'water',
  'electricity',
  'electrocute',
  'gunshot',
  'bullet',
  'knife',
  'blade',
  'razor',
  'bleeding',
  'blood',
];

// Crisis resources
export const CRISIS_RESOURCES = {
  crisis_services_canada: {
    name: 'Crisis Services Canada',
    phone: '1-833-456-4566',
    text: '45645',
    description: '24/7 free and confidential support for people in distress',
  },
  kids_help_phone: {
    name: 'Kids Help Phone',
    phone: '1-800-668-6868',
    text: '686868',
    description: '24/7 support for young people under 20',
  },
  emergency: {
    name: 'Emergency Services',
    phone: '911',
    description: 'Call 911 for immediate emergency assistance',
  },
  wellness_together_canada: {
    name: 'Wellness Together Canada',
    phone: '1-866-585-0445',
    description: 'Free mental health and substance use support',
  },
  hope_for_wellness: {
    name: 'Hope for Wellness Helpline',
    phone: '1-855-242-3310',
    description: '24/7 support for Indigenous peoples',
  },
};

/**
 * Detects harmful content in a transcript
 * @param transcript - The transcript text to analyze
 * @returns CrisisDetectionResult with detection details
 */
export const detectCrisisContent = (
  transcript: string,
): CrisisDetectionResult => {
  if (!transcript || transcript.trim() === '') {
    return {
      flagged: false,
      detectedPhrases: [],
    };
  }

  const lowerTranscript = transcript.toLowerCase();
  const detectedPhrases: string[] = [];

  // Check for harmful keywords
  HARMFUL_KEYWORDS.forEach(keyword => {
    if (lowerTranscript.includes(keyword.toLowerCase())) {
      detectedPhrases.push(keyword);
    }
  });

  return {
    flagged: detectedPhrases.length > 0,
    detectedPhrases: [...new Set(detectedPhrases)], // Remove duplicates
  };
};

/**
 * Generates a generic crisis warning message based on detection result
 * @param result - Crisis detection result
 * @returns Warning message string
 */
export const generateCrisisWarning = (
  result: CrisisDetectionResult,
): string => {
  if (!result.flagged) {
    return '';
  }

  return (
    '⚠️ CRISIS WARNING: This recording contains content that may indicate self-harm or harm to others. ' +
    'Please consider reaching out to crisis resources immediately. See below for support resources.'
  );
};

/**
 * Formats crisis resources for display
 * @returns Formatted crisis resources text
 */
export const getCrisisResourcesText = (): string => {
  return `🆘 CRISIS RESOURCES:

📞 Crisis Services Canada: 1-833-456-4566
💬 Text: 45645
📱 Kids Help Phone: 1-800-668-6868
💬 Text: 686868
🚨 Emergency Services: 911
🏥 Wellness Together Canada: 1-866-585-0445
🌿 Hope for Wellness (Indigenous): 1-855-242-3310

These resources are available 24/7 and are free and confidential.`;
};
