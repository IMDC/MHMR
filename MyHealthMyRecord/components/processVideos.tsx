import {useRealm} from '../models/VideoData';
import {getAuth, getTranscript} from './stt_api';
import {sendToChatGPT} from './chatgpt_api';
import {VideoData} from '../models/VideoData';
import {useLoader} from './loaderProvider';

export const processVideos = async (realm, videos, showLoader, hideLoader) => {
  await processSelectedVideos(realm, showLoader);
  await handleYesAnalysis(realm, videos, showLoader, hideLoader);
  console.log('Processing complete.');
};

const processSelectedVideos = async (realm, showLoader) => {
  showLoader('Processing videos...');
  const auth = await getAuth();
  const selectedVideos = realm
    .objects<VideoData>('VideoData')
    .filtered('isConverted == false AND isSelected == true');

  console.log(`Found ${selectedVideos.length} videos to process.`);

  for (const video of selectedVideos) {
    const audioFileName = video.filename.replace('.mp4', '.wav');
    console.log('audioFileName:', audioFileName);
    console.log(
      `Processing video ${video._id.toHexString()}: ${audioFileName}`,
    );

    try {
      await getTranscript(audioFileName, video._id.toHexString(), auth, realm);
      console.log(
        `Transcription successful for video ${video._id.toHexString()}`,
      );
    } catch (error) {
      console.error(
        `Failed to process video ${video._id.toHexString()}:`,
        error,
      );
    }
  }
};

const handleYesAnalysis = async (realm, videos, showLoader, hideLoader) => {
  const selectedVideos = realm
    .objects<VideoData>('VideoData')
    .filtered('isConverted == false AND isSelected == true');

  for (const video of selectedVideos) {
    const getTranscriptByFilename = filename => {
      const videoData = videos.find(video => video.filename === filename);
      return videoData ? videoData.transcript : '';
    };

    const getCheckedKeywords = filename => {
      const videoData = videos.find(video => video.filename === filename);
      if (videoData) {
        const checkedKeywords = videoData.keywords
          .map(key => JSON.parse(key))
          .filter(obj => obj.checked)
          .map(obj => obj.title);
        return checkedKeywords;
      }
      return [];
    };

    const getCheckedLocations = filename => {
      const videoData = videos.find(video => video.filename === filename);
      if (videoData) {
        const checkedLocations = videoData.locations
          .map(key => JSON.parse(key))
          .filter(obj => obj.checked)
          .map(obj => obj.title);
        return checkedLocations;
      }
      return [];
    };

    const transcript = getTranscriptByFilename(video.filename);
    const keywords = getCheckedKeywords(video.filename).join(', ');
    const locations = getCheckedLocations(video.filename).join(', ');

    try {
      const outputText = await sendToChatGPT(
        video.filename,
        transcript,
        keywords,
        locations,
        realm,
        video._id.toHexString(),
        'bullet',
      );
      console.log(
        `Transcription successful for video ${video._id.toHexString()}`,
      );
      hideLoader();
    } catch (error) {
      console.error(
        `Failed to process video ${video._id.toHexString()}:`,
        error,
      );
    }
  }
};
