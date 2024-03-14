import * as React from 'react';
import axios from 'axios';
import {FFmpegKit, ReturnCode} from 'ffmpeg-kit-react-native';
import Config from 'react-native-config';

const getAuth = async () => {
  const [auth, setAuth] = React.useState('');
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
    setAuth(response.data.token_type + ' ' + response.data.access_token);
    console.log('New auth token set:', response.data.access_token);
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
  }
};
