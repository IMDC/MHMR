import Realm from 'realm';
import axios from 'axios';
import RNFS from 'react-native-fs';
import Config from 'react-native-config';
import {Buffer} from 'buffer';
import {generateVideoSummary} from './chatgpt_api';

// Function to obtain authorization token
export const getAuth = async () => {
  try {
    const headersList = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const bodyContent =
      'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=' +
      Config.API_KEY_SPEECH_TO_TEXT;

    const reqOptions = {
      url: 'https://iam.cloud.ibm.com/identity/token',
      method: 'POST',
      headers: headersList,
      data: bodyContent,
    };

    const response = await axios.request(reqOptions);
    console.log('New auth token set:', response.data.access_token);
    return response.data.token_type + ' ' + response.data.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request details:', error.request);
    } else {
      console.error('Error details:', error.message);
    }
    throw error;
  }
};

const transcribeAudio = async (
  body: any,
  auth: string,
  model = 'en-US_Multimedia',
) => {
  const url = `https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/08735c5f-70ad-44a9-8cae-dc286520aa53/v1/recognize?model=${model}`;
  return axios.post(url, body, {
    headers: {Authorization: auth, 'Content-Type': 'audio/wav'},
    params: {
      continuous: true,
      max_alternatives: 3,
      interim_results: false, // Set to true to see partial results
    },
  });
};

// Function to get transcription for a single audio file
export const getTranscript = async (
  audioFileName: string,
  _id: string,
  auth: string,
  realm: Realm,
  model = 'en-US_Multimedia',
) => {
  try {
    const audioFolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';
    const audioFilePath = `${audioFolderPath}/${audioFileName}`;
    const data = await RNFS.readFile(audioFilePath, 'base64');
    if (!data) {
      console.log('No audio data found for', audioFileName);
      return {_id, transcript: '', confidence: 0};
    }
    const bufferData = Buffer.from(data, 'base64');
    const response = await transcribeAudio(bufferData, auth, model);
    const transcript =
      response.data.results[0]?.alternatives[0]?.transcript || '';
    const confidence =
      response.data.results[0]?.alternatives[0]?.confidence || 0;
    console.log(`Transcript for ${audioFileName}:`, transcript);
    return {_id, transcript, confidence};
  } catch (error) {
    console.error('Error during getTranscript:', error);
    return {_id, error};
  }
};

// Function to process multiple transcripts concurrently
export const processMultipleTranscripts = async (videoFiles, realm) => {
  console.log(`Processing ${videoFiles.length} videos for transcription`);

  const transcriptPromises = videoFiles.map(video =>
    transcribeWithWhisper(
      video.filename.replace('.mp4', '.wav'),
      video._id.toHexString(),
      realm,
    ),
  );

  const results = await Promise.all(transcriptPromises);

  // Process results in Realm
  for (const {_id, transcript, error} of results) {
    if (error) {
      console.error(`Failed to transcribe video ${_id}:`, error);
      continue;
    }

    const objectId = new Realm.BSON.ObjectId(_id);
    const video = realm.objectForPrimaryKey('VideoData', objectId);

    if (video) {
      const summary = await generateVideoSummary(transcript); // run outside write

      realm.write(() => {
        video.transcript = transcript;
        video.isTranscribed = true;
        video.isConverted = true;
        video.tsOutputBullet = summary.bullet;
        video.tsOutputSentence = summary.sentence;
      });

      console.log(`Updated video ${_id} with transcript and summaries`);
    } else {
      console.log(`No video found with ID ${_id}.`);
    }
  }

  console.log('Completed processing all transcripts');
};

export const transcribeWithWhisper = async (
  videoFileName: string,
  _id: string,
  realm: Realm,
) => {
  try {
    const videoFolderPath = RNFS.DocumentDirectoryPath + '/MHMR';
    const videoFilePath = `${videoFolderPath}/${videoFileName}`;

    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: `file://${videoFilePath}`,
      type: 'video/mp4',
      name: videoFileName,
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    // Make request to OpenAI Whisper API using the existing API key
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${Config.API_OPENAI_CHATGPT}`, // Using existing key
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    const transcript = response.data.text || '';
    console.log(`Transcript for ${videoFileName}:`, transcript);

    return {_id, transcript, confidence: 1};
  } catch (error) {
    console.error('Error during transcription:', error);
    return {_id, error};
  }
};
