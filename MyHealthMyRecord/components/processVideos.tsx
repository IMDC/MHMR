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

const stopWordsSet = new Set(stopWords.map(w => w.toLowerCase()));

const processTranscript = (transcript: string): FrequencyMap => {
  const frequencyMap: FrequencyMap = {};

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
    // Store the complete phrase
    frequencyMap[extracted.phrase] = (frequencyMap[extracted.phrase] || 0) + 1;

    // Store the symptom if found
    if (extracted.symptom) {
      frequencyMap[extracted.symptom] =
        (frequencyMap[extracted.symptom] || 0) + 1;

      // Store each modifier with the symptom in a natural phrase
      extracted.modifiers.forEach(modifier => {
        // Create natural phrases like "severe pain" or "constant headache"
        const modifierPhrase = `${modifier} ${extracted.symptom}`;
        frequencyMap[modifierPhrase] = (frequencyMap[modifierPhrase] || 0) + 1;
      });
    }
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
    console.log('Multi-word phrases found (frequency > 1):');
    Array.from(combinedMap.entries())
      .filter(([word, count]) => word.includes(' ') && count > 1)
      .sort((a, b) => b[1] - a[1])
      .forEach(([phrase, count]) => {
        console.log(`"${phrase}" (frequency: ${count})`);
      });

    // Filter words: Keep single words with freq >= 1, multi-word phrases only if freq > 1
    const allowedWords = new Set(
      Array.from(combinedMap.entries())
        .filter(
          ([word, count]) =>
            !stopWordsSet.has(word) &&
            ((!word.includes(' ') && count >= 1) ||
              (word.includes(' ') && count > 1)),
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
