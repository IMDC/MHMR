import {processMultipleTranscripts} from './stt_api';
import {sendToChatGPT} from './chatgpt_api';
import {stopWords, trackedWords} from '../assets/util/words';
import {extractNGrams} from './ngramExtractor';

const processTranscript = (transcript: string) => {
  const frequencyMap: Record<string, number> = {};

  // Remove all punctuation except apostrophes
  const cleanText = transcript
    .replace(/[^a-zA-Z\s']/g, '')
    .toLowerCase();

  const plainWords = cleanText.split(/\s+/);

  // Count individual words
  plainWords.forEach(word => {
    if (word) {
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }
  });

  // Extract and count n-grams around tracked words
  const ngrams = extractNGrams(cleanText, trackedWords, 3);
  ngrams.forEach(phrase => {
    frequencyMap[phrase] = (frequencyMap[phrase] || 0) + 1;
  });

  return frequencyMap;
};

export const processVideos = async (
  realm,
  videos,
  showLoader,
  hideLoader,
  isBatchSetAnalysis,
) => {
  showLoader('Processing videos...');

  try {
    const currentSet = realm
      .objects('VideoSet')
      .filtered('isCurrent == true')[0];

    if (!currentSet) {
      console.error('No current video set found.');
      return;
    }

    const selectedVideos = currentSet.videoIDs.map(id =>
      realm.objects('VideoData').find(video => video._id.toString() === id),
    );
    //commented out for HCP-VIEW:
    //  .filter(video => video?.isConverted);
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

    // generate and store combined frequency map
    // Step 1: Create raw frequency maps (unfiltered)
    const freqMaps = [];

    for (const video of selectedVideos) {
      if (video.transcript) {
        const rawMap = processTranscript(video.transcript); // NEW: includes n-grams

        freqMaps.push({
          map: rawMap,
          datetime:
            video.datetimeRecorded?.toISOString() ?? new Date().toISOString(),
          videoID: video._id.toString(),
        });
      }
    }

    // Step 2: Combine all maps and determine valid words (>=3 and not stop word)
    const combinedMap = combineFreqMaps(freqMaps);
    const allowedWords = new Set(
      Array.from(combinedMap.entries())
        .filter(
          ([word, count]) =>
            count >= 3 && !stopWords.includes(word.toLowerCase()),
        )
        .map(([word]) => word),
    );

    // Step 3: Filter each map using allowed words
    const filteredFreqMaps = freqMaps.map(f => {
      const filteredMap = {};
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

    // Step 4: Save final filtered data
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

const handleYesAnalysis = async (video, videos, realm, isBatchSetAnalysis) => {
  const transcript = video.transcript;
  const keywords = video.keywords.join(', ');
  const locations = video.locations.join(', ');

  try {
    await sendToChatGPT(
      video.filename,
      transcript,
      keywords,
      locations,
      realm,
      video._id.toHexString(),
      'bullet',
    );

    console.log(`Analysis successful for video ${video._id.toHexString()}`);

    if (isBatchSetAnalysis) {
      realm.write(() => {
        realm.objects('VideoSet').forEach(videoSet => {
          videoSet.isAnalyzed = true;
        });
      });
    }
  } catch (error) {
    console.error(`Failed to process video ${video._id.toHexString()}:`, error);
  }
};

// Merge all maps together into one total frequency map
function combineFreqMaps(freqMaps: any[]): Map<string, number> {
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
