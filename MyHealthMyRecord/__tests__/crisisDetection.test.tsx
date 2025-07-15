import {
  detectCrisisContent,
  generateCrisisWarning,
  getCrisisResourcesText,
  CrisisDetectionResult,
} from '../components/crisisDetection';

describe('Crisis Detection Tests', () => {
  describe('detectCrisisContent', () => {
    test('should return false for empty transcript', () => {
      const result = detectCrisisContent('');
      expect(result).toEqual({
        flagged: false,
        detectedPhrases: [],
      });
    });

    test('should return false for whitespace-only transcript', () => {
      const result = detectCrisisContent('   \n\t  ');
      expect(result).toEqual({
        flagged: false,
        detectedPhrases: [],
      });
    });

    test('should return false for normal content', () => {
      const result = detectCrisisContent(
        'I had a great day today and went for a walk.',
      );
      expect(result).toEqual({
        flagged: false,
        detectedPhrases: [],
      });
    });

    describe('Detection', () => {
      test('should detect suicide-related phrases', () => {
        const result = detectCrisisContent('I want to kill myself');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('kill myself');
      });

      test('should detect multiple phrases', () => {
        const result = detectCrisisContent(
          'I want to kill myself and end my life',
        );
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('kill myself');
        expect(result.detectedPhrases).toContain('end my life');
      });

      test('should detect case-insensitive phrases', () => {
        const result = detectCrisisContent('I WANT TO KILL MYSELF');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('kill myself');
      });

      test('should detect phrases within longer text', () => {
        const result = detectCrisisContent(
          'I had a bad day and I want to kill myself because everything is terrible',
        );
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('kill myself');
      });

      test('should detect harm-related phrases', () => {
        const result = detectCrisisContent('I want to hurt myself');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('hurt myself');
      });

      test('should detect cutting-related phrases', () => {
        const result = detectCrisisContent('I feel like cutting myself');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('cutting myself');
      });

      test('should detect harm to others', () => {
        const result = detectCrisisContent('I want to hurt someone');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('hurt someone');
      });

      test('should detect despair-related phrases', () => {
        const result = detectCrisisContent('I feel hopeless');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('hopeless');
      });

      test('should detect loneliness phrases', () => {
        const result = detectCrisisContent('I feel so alone');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('alone');
      });

      test('should detect worthlessness phrases', () => {
        const result = detectCrisisContent('I feel worthless');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('worthless');
      });

      test('should detect multiple phrases and remove duplicates', () => {
        const result = detectCrisisContent(
          'I feel hopeless and want to hurt myself and hurt myself',
        );
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('hopeless');
        expect(result.detectedPhrases).toContain('hurt myself');
        expect(
          result.detectedPhrases.filter((v, i, a) => a.indexOf(v) === i).length,
        ).toBe(result.detectedPhrases.length);
      });

      test('should handle partial word matches correctly', () => {
        const result = detectCrisisContent('I am killing time'); // Should not match "kill myself"
        expect(result.flagged).toBe(false);
      });

      test('should handle punctuation and spacing', () => {
        const result = detectCrisisContent('I want to kill myself!');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('kill myself');
      });

      test('should handle newlines and special characters', () => {
        const result = detectCrisisContent(
          'I want to\nkill myself\nbecause I am sad',
        );
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('kill myself');
      });

      test('should detect overdose-related phrases', () => {
        const result = detectCrisisContent('I want to overdose on pills');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('overdose');
        expect(result.detectedPhrases).toContain('pills');
      });

      test('should detect hanging-related phrases', () => {
        const result = detectCrisisContent('I want to hang myself');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('hang myself');
      });

      test('should detect jumping-related phrases', () => {
        const result = detectCrisisContent('I want to jump off a bridge');
        expect(result.flagged).toBe(true);
        expect(result.detectedPhrases).toContain('jump off');
        expect(result.detectedPhrases).toContain('bridge');
      });
    });
  });

  describe('generateCrisisWarning', () => {
    test('should return empty string for non-flagged content', () => {
      const result: CrisisDetectionResult = {
        flagged: false,
        detectedPhrases: [],
      };
      const warning = generateCrisisWarning(result);
      expect(warning).toBe('');
    });

    test('should generate the same warning for any flagged content', () => {
      const result: CrisisDetectionResult = {
        flagged: true,
        detectedPhrases: ['kill myself'],
      };
      const warning = generateCrisisWarning(result);
      expect(warning).toContain('⚠️ CRISIS WARNING');
      expect(warning).toContain(
        'Please consider reaching out to crisis resources immediately',
      );
    });
  });

  describe('getCrisisResourcesText', () => {
    test('should return formatted crisis resources', () => {
      const resources = getCrisisResourcesText();
      expect(resources).toContain('🆘 CRISIS RESOURCES');
      expect(resources).toContain('Crisis Services Canada');
      expect(resources).toContain('1-833-456-4566');
      expect(resources).toContain('Kids Help Phone');
      expect(resources).toContain('1-800-668-6868');
      expect(resources).toContain('911');
      expect(resources).toContain('24/7');
    });
  });

  describe('Integration Tests', () => {
    test('should handle real-world transcript scenarios', () => {
      const transcript =
        'I have been feeling really down lately. I feel hopeless and sometimes I think about hurting myself. I just want to end it all.';
      const result = detectCrisisContent(transcript);
      expect(result.flagged).toBe(true);
      expect(result.detectedPhrases).toContain('hopeless');
      expect(result.detectedPhrases).toContain('end it all');
    });

    test('should handle medical context that might contain similar words', () => {
      const transcript =
        'I went to the doctor for my knee pain. The medication they gave me helps with the shooting pain.';
      const result = detectCrisisContent(transcript);
      expect(result.flagged).toBe(false);
    });

    test('should handle false positives gracefully', () => {
      const transcript =
        'I am killing it at work today! This is the best day ever.';
      const result = detectCrisisContent(transcript);
      expect(result.flagged).toBe(false);
    });
  });
});
