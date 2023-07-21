import * as React from 'react';
import { Text } from 'react-native-paper';
import RNFS from 'react-native-fs';
//import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1';
//import IamAuthenticator from 'ibm-watson/auth';

function Dashboard() {

 /*  const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
  const { IamAuthenticator } = require('ibm-watson/auth');

  const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: 'JZXwZX--nYZAZW_0p0O2XTUGd_jb0f7_KpkTlbqojOYr',
    }),
    serviceUrl: 'https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/08735c5f-70ad-44a9-8cae-dc286520aa53',
  });

  //const RNFS = require('react-native-fs');
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';

  const params = {
    objectMode: true,
    contentType: 'audio/flac',
    model: 'en-US_BroadbandModel',
    keywords: ['colorado', 'tornado', 'tornadoes'],
    keywordsThreshold: 0.5,
    maxAlternatives: 3,
  };
   */
  // Create the stream.
  //const recognizeStream = speechToText.recognizeUsingWebSocket(params);
  
  // Pipe in the audio.
  //RNFS.readFile('audio-file.flac').pipe(recognizeStream);
  //console.log(RNFS.read('audio-file.flac'));
  
  /*
   * Uncomment the following two lines of code ONLY if `objectMode` is `false`.
   *
   * WHEN USED TOGETHER, the two lines pipe the final transcript to the named
   * file and produce it on the console.
   *
   * WHEN USED ALONE, the following line pipes just the final transcript to
   * the named file but produces numeric values rather than strings on the
   * console.
   */
  // recognizeStream.pipe(fs.createWriteStream('transcription.txt'));
  
  /*
   * WHEN USED ALONE, the following line produces just the final transcript
   * on the console.
   */
  // recognizeStream.setEncoding('utf8');
  
  // Listen for events.
  /* recognizeStream.on('data', function(event) { onEvent('Data:', event); });
  recognizeStream.on('error', function(event) { onEvent('Error:', event); });
  recognizeStream.on('close', function(event) { onEvent('Close:', event); });
  
  // Display events on the console.
  function onEvent(name, event) {
      console.log(name, JSON.stringify(event, null, 2));
  }; */

  return (
    <Text>This is the Dashboard</Text>
  );
}

export default Dashboard;