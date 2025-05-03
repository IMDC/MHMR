import {getTranscript, processMultipleTranscripts} from './stt_api';
import {sendToChatGPT} from './chatgpt_api';
import Realm from 'realm';
import {VideoData} from '../models/VideoData';
import { stopWords } from '../assets/util/words';

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

    const selectedVideos = currentSet.videoIDs
      .map(id =>
        realm.objects('VideoData').find(video => video._id.toString() === id),
      )
    //commented out for HCP-VIEW:
    //  .filter(video => video?.isConverted);
    console.log(selectedVideos);
    console.log(`Found ${selectedVideos.length} videos to process.`);
    showLoader(`Processing ${selectedVideos.length} videos...`);

    await processMultipleTranscripts(selectedVideos, realm);
    console.log('All transcriptions complete.');
    showLoader('Analyzing videos...');

    const updatedVideos = realm
      .objects<VideoData>('VideoData')
      .filtered('isConverted == true AND isSelected == true');


    const analysisPromises = selectedVideos.map(video =>
      handleYesAnalysis(video, videos, realm, isBatchSetAnalysis),
    );

    await Promise.all(analysisPromises);
    console.log('All analyses complete.');

    // generate and store combined frequency map
    const freqMaps = [];

    for (const video of selectedVideos) {
      console.log(`Transcript for ${video.filename}:`, video.transcript);
      if (video.transcript) {
        const map = getFreqMap(video.transcript);
        freqMaps.push(map);
      }
    }

    const combinedMap = combineFreqMaps(freqMaps);

    // Filter out words with count < 3 and stop words
    const filteredMap = Array.from(combinedMap.entries())
      .filter(
        ([word, count]) =>
          count >= 3 && !stopWords.includes(word.toLowerCase()),
      );

    const freqDataAsStringList = filteredMap.map(
      ([word, count]) => `${word}:${count}`,
    );

    // store in current VideoSet
    realm.write(() => {
      const currentSet = realm
        .objects('VideoSet')
        .filtered('isCurrent == true')[0];
      if (currentSet) {
        currentSet.frequencyData = freqDataAsStringList;
        currentSet.isAnalyzed = true;
        console.log(
          `Stored ${freqDataAsStringList.length} frequency entries in set "${currentSet.name}"`,
        );
      }
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
          console.log(
            `Video set ${videoSet._id.toHexString()} marked as analyzed.`,
          );
        });
      });
    }
  } catch (error) {
    console.error(`Failed to process video ${video._id.toHexString()}:`, error);
  }
};

// utility to generate frequency map for one transcript
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

// utility to combine multiple frequency maps
function combineFreqMaps(maps: Map<string, number>[]): Map<string, number> {
  const combined = new Map<string, number>();

  for (const map of maps) {
    for (const [word, count] of map) {
      combined.set(word, (combined.get(word) || 0) + count);
    }
  }

  return combined;
}
