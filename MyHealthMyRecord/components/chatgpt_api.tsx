import { useState } from 'react';
import { Alert } from 'react-native';
import Config from 'react-native-config';
import RNFS from 'react-native-fs';
import {VideoData, useQuery, useRealm} from '../models/VideoData';

const [inputText, setInputText] = useState('');
const videoData: any = useQuery('VideoData');
const [videos, setVideos] = useState<any | null>(null);

 const getTranscriptByFilename = filename => {
   const video = videos.find(video => video.filename === filename);
   if (video) {
     return video.transcript; 
   }
   return []; 
 };
 
const getCheckedKeywords = filename => {
  const video = videos.find(video => video.filename === filename);
  if (video) {
    const checkedKeywords = video.keywords
      .map(key => JSON.parse(key))
      .filter(obj => obj.checked)
      .map(obj => obj.title);
    return checkedKeywords;
  }
  return [];
};

const getCheckedLocations = filename => {
  const video = videos.find(video => video.filename === filename);
  if (video) {
    const checkedLocations = video.locations
      .map(key => JSON.parse(key))
      .filter(obj => obj.checked)
      .map(obj => obj.title);
    return checkedLocations;
  }
  return [];
};

 export const sendToChatGPT = async (textFileName, _id) => {
    try {
      // Create directories if they don't exist
      const directoryPath = `${RNFS.DocumentDirectoryPath}/MHMR/transcripts`;
        await RNFS.mkdir(directoryPath, { recursive: true });
        setInputText(
          'Summarize this video transcript (' +
            `${getTranscriptByFilename(textFileName)}` +
            ') and include the summary of the keywords (' +
            `${getCheckedKeywords(textFileName)}` +
            ') and locations (' +
            `${getCheckedLocations(textFileName)}` +
            ') tagged.',
        );

      // Send the input text to ChatGPT API
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Config.API_OPENAI_CHATGPT}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{role: 'user', content: inputText}],
            max_tokens: 100,
          }),
        },
      );

      const data = await response.json();
      console.log('Response from ChatGPT API:', data); // Log the response

      // Check if data.choices is defined and contains at least one item
      if (data.choices && data.choices.length > 0) {
        const outputText = data.choices[0].message.content;
        const filePath = `${directoryPath}/${textFileName}`;
        await RNFS.writeFile(filePath, outputText, 'utf8');
        Alert.alert('Success', 'Output saved to file: ' + filePath);
      } else {
        throw new Error('Invalid response from ChatGPT API');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to process input.');
    }
};
  

videoFilenamesSet.forEach(async filename => {
  try {
    // Read the content of the video file (assuming it's text) - Replace this with your own logic to read video content
    const videoContent = 'Sample video content for ' + filename;

    // Call the sendToChatGPT function with the filename, unique identifier (_id), and input text (video content)
    await sendToChatGPT(filename, _id, videoContent);

    // Log success message for each filename
    console.log(`Successfully processed ${filename}`);
  } catch (error) {
    // Log error message if any error occurs during processing
    console.error(`Error processing ${filename}:`, error);
  }
});
