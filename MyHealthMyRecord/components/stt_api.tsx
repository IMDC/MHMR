import Realm from 'realm';
import axios from 'axios';
import RNFS from 'react-native-fs';
import {FFmpegKit, ReturnCode} from 'ffmpeg-kit-react-native';
import Config from 'react-native-config';
import { VideoData, useRealm } from '../models/VideoData';
import {Buffer} from 'buffer';

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
  audioFileName: string,
  _id: string,
  auth: string,
  realm: Realm,
) => {
  try {
    const audioFolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';
    const audioFilePath = `${audioFolderPath}/${audioFileName}`;
    const data = await RNFS.readFile(audioFilePath, 'base64');
    const bufferData = Buffer.from(data, 'base64'); // Correctly convert base64 to binary
    console.log(data.substring(0, 5), ', ', data.substring(data.length - 5));
    await transcribeAudio(bufferData, _id, auth, realm); // Use bufferData instead of data
    console.log('done');
  } catch (error) {
    console.error('Error during transcription:', error.message);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
    throw error;
  }
};

const transcribeAudio = async (
  body: any,
  _id: any,
  auth: string,
  realm: Realm,
) => {
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
    realm.write(() => {
      const objectId = new Realm.BSON.ObjectId(_id); // Ensure _id is a Realm ObjectId
      const video = realm.objectForPrimaryKey('VideoData', objectId);

      if (video) {
        // Add the new transcript
        video.transcript.push(transcript);
        console.log('Transcript:', video.transcript);
        video.isConverted = true; // Mark the video as converted
        console.log('isConverted:', video.isConverted);
        console.log(
          'Updated video with new transcript and marked as converted.',
        );
      } else {
        console.log('No video found with ID:', _id);
      }
    });


  } catch (error) {
    console.log('Error during transcription:', error.message || error);

    if (error.response?.status === 401) {
      console.log('Authentication error, obtaining new token...');
      const newAuth = await getAuth();
      await transcribeAudio(body, _id, newAuth, realm); // Ensure to use the new token
    }

    throw error;
  }
};
