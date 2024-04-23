import Realm from 'realm';
import axios from 'axios';
import RNFS from 'react-native-fs';
import {FFmpegKit, ReturnCode} from 'ffmpeg-kit-react-native';
import Config from 'react-native-config';
import { VideoData, useRealm } from '../models/VideoData';

export const getAuth = async () => {
  try {
    let headersList = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    let bodyContent =
      'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=' +
      Config.API_KEY_SPEECH_TO_TEXT;

    let reqOptions = {
      url: 'https://iam.cloud.ibm.com/identity/token',
      method: 'POST',
      headers: headersList,
      data: bodyContent,
    };

    let response = await axios.request(reqOptions);
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

export const getTranscript = async (
  audioFileName: any,
  _id: any,
  auth: string,
) => {
  try {
    const audioFolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';
    const data = await RNFS.readFile(
      audioFolderPath + '/' + audioFileName,
      'base64',
    );
    console.log(data.substring(0, 5), ', ', data.substring(data.length - 5));
    await transcribeAudio(data, _id, auth);
    console.log('done');
  } catch (error) {
    console.error('Error reading audio file:', error);
    throw error;
  }
};

const transcribeAudio = async (body: any, _id: any, auth: string) => {
  try {
    const response = await axios.post(
      'https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/08735c5f-70ad-44a9-8cae-dc286520aa53/v1/recognize',
      body,
      {
        headers: {
          Authorization: auth,
          'Content-Type': 'audio/wav',
        },
      },
    );
    const transcript =
      response.data.results[0]?.alternatives[0]?.transcript || '';
    const confidence =
      response.data.results[0]?.alternatives[0]?.confidence || 0;
    console.log('Transcript:', transcript);
    console.log('Confidence:', confidence);
    // Realm operations here
  } catch (error) {
    console.log('Error during transcription:', error.message || error);

    if (error.response?.status === 401) {
      console.log('Need to get a new auth token');
      await getAuth();
      // Call transcribeAudio again with the new auth token
    }
    throw error;
  }
};

export const convertToAudio = async (video: VideoData) => {
  
  const audioFolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';
  try {
    console.log('convert to audio');
    const wavFileName =
      audioFolderPath + '/' + video.filename.replace('.mp4', '') + '.wav';
    const mp4FileName = MHMRfolderPath + '/' + video.filename;

    await FFmpegKit.execute(
      '-i ' +
        mp4FileName +
        ' -vn -acodec pcm_s16le -ar 44100 -ac 2 ' +
        wavFileName,
    );

    console.log('Conversion completed');
    realm.write(() => {
      video.isConverted = true;
      console.log('Video converted:', video.isConverted);
    });
  } catch (error) {
    console.error('Error converting video to audio:', error);
  }
};
