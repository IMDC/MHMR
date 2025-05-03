import {getTranscript, processMultipleTranscripts} from './stt_api';
import {sendToChatGPT} from './chatgpt_api';
import Realm from 'realm';
import {VideoData} from '../models/VideoData';
import {stopWords} from '../assets/util/words';

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
        const rawMap = getFreqMap(video.transcript);

        freqMaps.push({
          map: Object.fromEntries(rawMap), // raw, not filtered yet
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

// Create raw word frequency map from transcript
function getFreqMap(transcript: string): Map<string, number> {
  const cleanText = transcript.replace(/[^a-zA-Z\s']/g, '').toLowerCase();
  const words = cleanText.split(/\s+/);
  const map = new Map<string, number>();

  for (const word of words) {
    if (
      word &&
      word !== '' &&
      word !== 'hesitation' &&
      word !== '%hesitation'
    ) {
      map.set(word, (map.get(word) || 0) + 1);
    }
  }

  return map;
}

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
