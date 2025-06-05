export const intensityModifiers = {
  high: [
    // Extreme intensity
    [
      'severe',
      'extreme',
      'intense',
      'horrible',
      'terrible',
      'unbearable',
      'excruciating',
    ],

    // Large quantity
    [
      'a lot of',
      'lots of',
      'significant',
      'substantial',
      'considerable',
      'excessive',
    ],

    // Strong emphasis
    ['really', 'very', 'so', 'super', 'totally', 'absolutely'],

    // Descriptive high intensity
    ['overwhelming', 'quite a bit', 'pretty bad', 'in so much'],
  ].flat(),

  moderate: [
    // Medium intensity
    ['moderate', 'noticeable'],

    // Medium quantity
    ['fair amount of'],

    // Medium emphasis
    ['pretty', 'quite', 'fairly', 'rather'],

    // Casual medium intensity
    ['kind of', 'kinda', 'somewhat'],
  ].flat(),

  low: [
    // Small quantity
    ['a little', 'a bit', 'small amount of', 'barely any', 'hardly any'],

    // Mild intensity
    ['slight', 'mild', 'minor', 'minimal'],

    // Light touch
    ['touch of'],

    // Comparative low intensity
    ['not too bad', 'not too much', 'not horrible', 'not as bad'],
  ].flat(),
};

export const frequencyModifiers = [
  'constant',
  'persistent',
  'continuous',
  'frequent',
  'recurring',
  'regular',
  'ongoing',
  'intermittent',
  'occasional',
  'sporadic',
  'rare',
  'infrequent',
  'still',
  'keeps',
  'all the time',
  'on and off',
];

export const temporalModifiers = [
  'chronic',
  'acute',
  'sudden',
  'gradual',
  'temporary',
  'persistent',
  'long-lasting',
  'short-term',
  'long-term',
  'getting worse',
  'improving',
  'starting to',
  'beginning to',
  'today',
  'tonight',
  'this morning',
  'this afternoon',
  'right now',
  'at the moment',
];

export const symptoms = {
  pain: [
    'pain',
    'ache',
    'aching',
    'hurt',
    'hurting',
    'hurts',
    'discomfort',
    'soreness',
    'sore',
    'tender',
    'tenderness',
    'throbbing',
    'sharp',
    'stabbing',
    'shooting',
    'burning',
    'achy',
  ],
  fatigue: [
    'tired',
    'exhausted',
    'drained',
    'worn out',
    'weary',
    'lethargic',
    'fatigue',
    'no energy',
    'low energy',
    'beat',
    'wiped out',
    'worn down',
    'drowsy',
    'drowsiness',
    'sleepy',
  ],
  mental: [
    'anxiety',
    'depression',
    'stress',
    'stressed',
    'worry',
    'worried',
    'panic',
    'fear',
    'scared',
    'nervous',
    'overwhelmed',
    'frustrated',
    'upset',
    'down',
    'mood',
    'brain fog',
    'confused',
    'confusion',
    'cant focus',
    'memory issues',
    'forgetful',
    'cant concentrate',
    'disoriented',
    'distracted',
  ],
  sleep: [
    'insomnia',
    'cant sleep',
    'trouble sleeping',
    'sleepless',
    'sleeplessness',
    'restless',
    'restlessness',
    'up all night',
    'tossing and turning',
    'waking up',
    'cant fall asleep',
    'cant stay asleep',
    'poor sleep',
    'bad sleep',
    'disturbed sleep',
  ],
  musculoskeletal: [
    'stiff',
    'stiffness',
    'tight',
    'tightness',
    'tension',
    'spasm',
    'cramp',
    'cramping',
    'weak',
    'weakness',
    'creaky',
    'out of place',
    'pulled',
    'strain',
    'sprain',
    'limited mobility',
    'restricted movement',
    'difficulty moving',
  ],
  specific_areas: [
    'back pain',
    'neck pain',
    'shoulder pain',
    'knee pain',
    'hip pain',
    'ankle pain',
    'foot pain',
    'leg pain',
    'arm pain',
    'wrist pain',
    'joint pain',
    'muscle pain',
    'headache',
    'migraine',
    'sciatic pain',
    'nerve pain',
    'lower back pain',
    'upper back pain',
    'side pain',
    'chest pain',
  ],
  digestive: [
    'nausea',
    'nauseous',
    'sick to stomach',
    'vomiting',
    'throwing up',
    'diarrhea',
    'constipation',
    'constipated',
    'bloating',
    'bloated',
    'indigestion',
    'heartburn',
    'stomach pain',
    'stomach issues',
    'gastrointestinal',
    'digestive issues',
    'upset stomach',
  ],
  neurological: [
    'dizzy',
    'dizziness',
    'vertigo',
    'lightheaded',
    'woozy',
    'numbness',
    'numb',
    'tingling',
    'pins and needles',
    'double vision',
    'blurry vision',
    'disoriented',
    'balance issues',
    'coordination problems',
  ],
};

// Helper function to flatten the symptoms object into an array
export const getAllSymptoms = () => {
  return Object.values(symptoms).flat();
};

// Helper function to get all modifiers
export const getAllModifiers = () => {
  return [
    ...Object.values(intensityModifiers).flat(),
    ...frequencyModifiers,
    ...temporalModifiers,
  ];
};
