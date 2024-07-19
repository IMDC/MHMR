import {getAuth, getTranscript, processMultipleTranscripts} from './stt_api'; // Import transcription-related functions
import {sendToChatGPT} from './chatgpt_api'; // Import chatGPT-related functions
import Realm from 'realm';
import {useLoader} from './loaderProvider'; // Assuming this provides showLoader and hideLoader
import {VideoData} from '../models/VideoData'; // Assuming this sets up the Realm schema

export const processVideos = async (realm, videos, showLoader, hideLoader) => {
  showLoader('Processing videos...');
  try {
    const auth = await getAuth();
    const selectedVideos = realm
      .objects<VideoData>('VideoData')
      .filtered('isConverted == false AND isSelected == true');

    console.log(`Found ${selectedVideos.length} videos to process.`);
    showLoader(`Processing ${selectedVideos.length} videos...`);

    // Handle all transcriptions in a batch
    await processMultipleTranscripts(selectedVideos, realm, auth);
    console.log('All transcriptions complete.');
    showLoader('Analyzing videos...');

    // Proceed with further processing if necessary
    const analysisPromises = selectedVideos.map(video =>
      handleYesAnalysis(video, videos, realm),
    );

    await Promise.all(analysisPromises);
    console.log('All analyses complete.');
    showLoader('Videos processed successfully.');
  } catch (error) {
    console.error('Failed during video processing:', error);
  } finally {
    hideLoader();
  }
};


const handleYesAnalysis = async (video, videos, realm) => {
  // Example of handling post-transcription analysis
  const transcript = video.transcript; // Directly use the property if it's available
  const keywords = video.keywords.join(', '); // Assuming keywords is an array
  const locations = video.locations.join(', '); // Assuming locations is an array

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
  } catch (error) {
    console.error(`Failed to process video ${video._id.toHexString()}:`, error);
  }
};
