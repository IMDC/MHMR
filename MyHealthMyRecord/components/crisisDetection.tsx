// Crisis detection utility for identifying harmful content in transcripts

export interface CrisisDetectionResult {
  flagged: boolean;
  detectedPhrases: string[];
  severity: 'low' | 'medium' | 'high';
}

// Comprehensive list of harmful keywords and phrases
const HARMFUL_KEYWORDS = [
  // Self-harm and suicide
  'kill myself',
  'end myself',
  'take my life',
  'end my life',
  'commit suicide',
  'kill myself',
  'want to die',
  'better off dead',
  'no reason to live',
  "can't go on",
  'give up',
  'end it all',
  'hurt myself',
  'cut myself',
  'self harm',
  'self-harm',
  'harm myself',
  'hurt myself',
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
  'overdose',
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
  'cutting',
  'bleeding',
  'blood',
];

// Crisis resources
export const CRISIS_RESOURCES = {
  national_suicide_prevention: {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: '24/7 free and confidential support for people in distress',
  },
  crisis_text_line: {
    name: 'Crisis Text Line',
    text: 'HOME to 741741',
    description: 'Text HOME to 741741 to connect with a Crisis Counselor',
  },
  emergency: {
    name: 'Emergency Services',
    phone: '911',
    description: 'Call 911 for immediate emergency assistance',
  },
  samhsa: {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-HELP (4357)',
    description:
      'Treatment referral and information service for individuals facing mental health or substance use disorders',
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
      severity: 'low',
    };
  }

  const lowerTranscript = transcript.toLowerCase();
  const detectedPhrases: string[] = [];
  let severityScore = 0;

  // Check for harmful keywords
  HARMFUL_KEYWORDS.forEach(keyword => {
    if (lowerTranscript.includes(keyword.toLowerCase())) {
      detectedPhrases.push(keyword);

      // Assign severity scores based on keyword categories
      if (
        keyword.includes('kill') ||
        keyword.includes('suicide') ||
        keyword.includes('end my life')
      ) {
        severityScore += 3; // High severity
      } else if (
        keyword.includes('hurt') ||
        keyword.includes('harm') ||
        keyword.includes('cut')
      ) {
        severityScore += 2; // Medium severity
      } else {
        severityScore += 1; // Low severity
      }
    }
  });

  // Determine overall severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (severityScore >= 5) {
    severity = 'high';
  } else if (severityScore >= 2) {
    severity = 'medium';
  }

  return {
    flagged: detectedPhrases.length > 0,
    detectedPhrases: [...new Set(detectedPhrases)], // Remove duplicates
    severity,
  };
};

/**
 * Generates appropriate crisis warning message based on detection result
 * @param result - Crisis detection result
 * @returns Warning message string
 */
export const generateCrisisWarning = (
  result: CrisisDetectionResult,
): string => {
  if (!result.flagged) {
    return '';
  }

  const baseMessage =
    '⚠️ CRISIS WARNING: This recording contains content that may indicate self-harm or harm to others.';

  switch (result.severity) {
    case 'high':
      return `${baseMessage}\n\nThis content has been flagged as HIGH RISK. Please consider reaching out to crisis resources immediately.`;
    case 'medium':
      return `${baseMessage}\n\nThis content has been flagged as MODERATE RISK. Please consider speaking with a mental health professional.`;
    case 'low':
      return `${baseMessage}\n\nThis content has been flagged as LOW RISK. Please consider speaking with a trusted person or professional.`;
    default:
      return baseMessage;
  }
};

/**
 * Formats crisis resources for display
 * @returns Formatted crisis resources text
 */
export const getCrisisResourcesText = (): string => {
  return `🆘 CRISIS RESOURCES:

📞 National Suicide Prevention Lifeline: 988
💬 Crisis Text Line: Text HOME to 741741
🚨 Emergency Services: 911
🏥 SAMHSA National Helpline: 1-800-662-HELP (4357)

These resources are available 24/7 and are free and confidential.`;
};
