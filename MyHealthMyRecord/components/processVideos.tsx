import {processMultipleTranscripts} from './stt_api';
import {sendToChatGPT} from './chatgpt_api';
import {stopWords} from '../assets/util/words';
import {extractMedicalPhrases, ExtractedPhrase} from './ngramExtractor';

// Types
interface VideoData {
  _id: {
    toString: () => string;
    toHexString: () => string;
  };
  transcript?: string;
  filename: string;
  keywords: string[];
  locations: string[];
  datetimeRecorded?: Date;
}

interface VideoSet {
  name: string;
  videoIDs: string[];
  frequencyData: string[];
  isAnalyzed: boolean;
  isCurrent: boolean;
}

interface RealmResults<T> {
  filtered(query: string): T[];
  find(predicate: (item: T) => boolean): T | undefined;
  forEach(callback: (item: T) => void): void;
  [index: number]: T;
}

interface Realm {
  write: (callback: () => void) => void;
  objects: (name: string) => RealmResults<any>;
}

interface FrequencyMap {
  [key: string]: number;
}

interface FrequencyData {
  map: FrequencyMap;
  datetime: string;
  videoID: string;
}

interface GroupedPhrases {
  [key: string]: {
    variations: string[];
    symptom?: string;
    intensity?: string;
    totalFrequency: number;
  };
}

const stopWordsSet = new Set(stopWords.map(w => w.toLowerCase()));

const processTranscript = (transcript: string): FrequencyMap => {
  const frequencyMap: FrequencyMap = {};
  const groupedPhrases: GroupedPhrases = {};

  // Clean text = Remove all punctuation except apostrophes
  const cleanText = transcript.replace(/[^a-zA-Z\s']/g, '').toLowerCase();

  // Plain words = Split entire transcript into words
  const plainWords = cleanText.split(/\s+/);

  // Count individual words
  plainWords.forEach(word => {
    if (word && !stopWordsSet.has(word)) {
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }
  });

  // Extract and count medical phrases
  const medicalPhrases = extractMedicalPhrases(cleanText);
  medicalPhrases.forEach((extracted: ExtractedPhrase) => {
    // Skip phrases without intensity
    if (!extracted.intensity) return;

    // Create a normalized key for grouping
    const normalizedKey = `${extracted.intensity}_${extracted.symptom}`;

    // Initialize or update the grouped phrases
    if (!groupedPhrases[normalizedKey]) {
      groupedPhrases[normalizedKey] = {
        variations: [],
        symptom: extracted.symptom,
        intensity: extracted.intensity,
        totalFrequency: 0,
      };
    }

    // Add this variation if it's not already included
    if (!groupedPhrases[normalizedKey].variations.includes(extracted.phrase)) {
      groupedPhrases[normalizedKey].variations.push(extracted.phrase);
    }
    groupedPhrases[normalizedKey].totalFrequency += 1;

    // Store the complete phrase in the frequency map as well
    frequencyMap[extracted.phrase] = (frequencyMap[extracted.phrase] || 0) + 1;

    // Store the symptom if found
    if (extracted.symptom) {
      frequencyMap[extracted.symptom] =
        (frequencyMap[extracted.symptom] || 0) + 1;
    }
  });

  // Add the grouped phrases to the frequency map with their normalized keys
  Object.entries(groupedPhrases).forEach(([key, group]) => {
    frequencyMap[key] = group.totalFrequency;
  });

  return frequencyMap;
};

export const processVideos = async (
  realm: Realm,
  videos: VideoData[],
  showLoader: (message: string) => void,
  hideLoader: () => void,
  isBatchSetAnalysis: boolean,
) => {
  showLoader('Processing videos...');

  try {
    const currentSet = realm
      .objects('VideoSet')
      .filtered('isCurrent == true')[0] as VideoSet;

    if (!currentSet) {
      console.error('No current video set found.');
      return;
    }

    const selectedVideos = currentSet.videoIDs.map(id =>
      realm.objects('VideoData').find(video => video._id.toString() === id),
    ) as VideoData[];

    console.log(`Found ${selectedVideos.length} videos to process.`);
    showLoader(`Processing ${selectedVideos.length} videos...`);

    await processMultipleTranscripts(selectedVideos, realm);
    console.log('All transcriptions complete.');
    showLoader('Analyzing videos...');

    const analysisPromises = selectedVideos.map(video =>
      handleYesAnalysis(video, videos, realm, isBatchSetAnalysis),
    );
    await Promise.all(analysisPromises);
    console.log('All analyses complete.');

    // Generate and store combined frequency map
    const freqMaps: FrequencyData[] = [];

    for (const video of selectedVideos) {
      if (video.transcript) {
        const rawMap = processTranscript(video.transcript);

        freqMaps.push({
          map: rawMap,
          datetime:
            video.datetimeRecorded?.toISOString() ?? new Date().toISOString(),
          videoID: video._id.toString(),
        });
      }
    }

    // Combine all maps and determine valid entries
    const combinedMap = combineFreqMaps(freqMaps);

    // Log multi-word phrases with frequency > 1
    console.log('Grouped medical phrases by intensity and symptom:');
    const groupedResults = new Map<
      string,
      {variations: string[]; frequency: number}
    >();

    Array.from(combinedMap.entries())
      .filter(([word, count]) => {
        // Only include entries with intensity (exclude unspecified)
        const [intensity] = word.split('_');
        return word.includes('_') && count > 1 && intensity !== 'unspecified';
      })
      .forEach(([key, count]) => {
        const [intensity, ...symptomParts] = key.split('_');
        const symptom = symptomParts.join('_');

        // Find all related variations from the individual frequency maps
        const variations = new Set<string>();
        freqMaps.forEach(f => {
          Object.keys(f.map).forEach(phrase => {
            if (phrase.includes(' ') && f.map[phrase] > 0) {
              // Check if this phrase contains the symptom and matches the intensity
              const extracted = extractMedicalPhrases(phrase)[0];
              if (
                extracted &&
                extracted.symptom === symptom &&
                extracted.intensity === intensity
              ) {
                variations.add(phrase);
              }
            }
          });
        });

        if (variations.size > 0) {
          groupedResults.set(key, {
            variations: Array.from(variations),
            frequency: count,
          });
        }
      });

    // Display grouped results
    Array.from(groupedResults.entries())
      .sort(([, a], [, b]) => b.frequency - a.frequency)
      .forEach(([key, {variations, frequency}]) => {
        const [intensity, ...symptomParts] = key.split('_');
        // Join symptom parts with spaces instead of underscores
        const symptomDisplay = symptomParts.join(' ');
        console.log(
          `\n${intensity} ${symptomDisplay} (total frequency: ${frequency}):`,
        );
        console.log('Variations found:', variations.join(', '));
      });

    // Filter words: Keep single words with freq >= 1, multi-word phrases only if freq > 1
    const allowedWords = new Set(
      Array.from(combinedMap.entries())
        .filter(
          ([word, count]) =>
            !stopWordsSet.has(word) &&
            ((!word.includes(' ') && count >= 1) ||
              (word.includes(' ') && count >= 1)),
        )
        .map(([word]) => word),
    );

    // Filter each map using allowed words
    const filteredFreqMaps = freqMaps.map(f => {
      const filteredMap: FrequencyMap = {};
      for (const word in f.map) {
        if (allowedWords.has(word)) {
          filteredMap[word] = f.map[word];
        }
      }

      return {
        ...f,
        map: filteredMap,
      };
    });

    // Save final filtered data
    realm.write(() => {
      currentSet.frequencyData = filteredFreqMaps.map(f =>
        JSON.stringify({
          map: f.map,
          datetime: f.datetime,
          videoID: f.videoID,
        }),
      );
      currentSet.isAnalyzed = true;
      console.log(
        `Stored ${filteredFreqMaps.length} frequency maps in set "${currentSet.name}"`,
      );
    });

    showLoader('Videos processed successfully.');
  } catch (error) {
    console.error('Failed during video processing:', error);
  } finally {
    hideLoader();
  }
};

const handleYesAnalysis = async (
  video: VideoData,
  videos: VideoData[],
  realm: Realm,
  isBatchSetAnalysis: boolean,
) => {
  const transcript = video.transcript;
  const keywords = video.keywords.join(', ');
  const locations = video.locations.join(', ');

  try {
    await sendToChatGPT(
      video.filename,
      transcript || '',
      keywords,
      locations,
      realm,
      video._id.toHexString(),
      'bullet',
    );

    console.log(`Analysis successful for video ${video._id.toHexString()}`);

    if (isBatchSetAnalysis) {
      realm.write(() => {
        realm.objects('VideoSet').forEach((videoSet: VideoSet) => {
          videoSet.isAnalyzed = true;
        });
      });
    }
  } catch (error) {
    console.error(`Failed to process video ${video._id.toHexString()}:`, error);
  }
};

// Merge all maps together into one total frequency map
function combineFreqMaps(freqMaps: FrequencyData[]): Map<string, number> {
  const combined = new Map<string, number>();

  for (const item of freqMaps) {
    const map = item.map;
    if (!map) continue;

    for (const word in map) {
      const count = map[word];
      combined.set(word, (combined.get(word) || 0) + count);
    }
  }

  return combined;
}
