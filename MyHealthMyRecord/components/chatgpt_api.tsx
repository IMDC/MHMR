import {useState} from 'react';
import Config from 'react-native-config';
import RNFS from 'react-native-fs';
import Realm from 'realm';

async function connectToChatGPT(inputText) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Config.API_OPENAI_CHATGPT}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{role: 'user', content: inputText}],
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    // console.log('Response from ChatGPT API:', data); // Log the response
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

export const sendToChatGPT = async (
  textFileName: string,
  transcript: string,
  keywords: string,
  locations: string,
  realm: Realm,
  _id: string,
  reportFormat: string,
) => {
  let returnOutput = [];
  if (transcript === '') {
    console.log('No transcript found. Saving empty transcript.');
    realm.write(() => {
      const objectId = new Realm.BSON.ObjectId(_id);
      const video = realm.objectForPrimaryKey('VideoData', objectId);
      if (video) {
        video.isConverted = true;
        video.transcript = '';
      }
    });
    return; // Exit the function early
  } else {
    try {
      const transcriptWordCount = transcript.split(' ').length;
      const maxSummaryWords = Math.ceil(transcriptWordCount * 0.1);

      let inputTextBullet = `Summarize this video transcript (${transcript}). Make the total word count of the summary be ${maxSummaryWords} words or less. Format the summary in bullet points using \u2022`;
      let inputTextSentence = `Summarize this video transcript (${transcript}). Make the total word count of the summary be ${maxSummaryWords} words or less. Format the summary in sentences.`;
      let sentimentInputText = `Analyze the sentiment of this video transcript and return only one of the following labels: Very Negative, Negative, Neutral, Positive, or Very Positive. Transcript: "${transcript}"`;

      const sentimentData = await connectToChatGPT(sentimentInputText);
      if (sentimentData.choices && sentimentData.choices.length > 0) {
        const sentiment = sentimentData.choices[0].message.content.trim();

        realm.write(() => {
          const objectId = new Realm.BSON.ObjectId(_id);
          const video = realm.objectForPrimaryKey('VideoData', objectId);
          if (video) {
            console.log('Sentiment:', sentiment);
            video.sentiment = sentiment;
          }
        });
      }

      const dataSentence = await connectToChatGPT(inputTextSentence);
      if (dataSentence.choices && dataSentence.choices.length > 0) {
        const outputText = dataSentence.choices[0].message.content;

        realm.write(() => {
          const objectId = new Realm.BSON.ObjectId(_id); // Ensure _id is a Realm ObjectId
          const video = realm.objectForPrimaryKey('VideoData', objectId);

          if (video) {
            video.isConverted = true; // Mark the video as converted
            video.tsOutputSentence = outputText;
            console.log('tsOutputSentence:', video.tsOutputSentence);
            returnOutput.push(outputText);
          } else {
            console.log('No video found with ID:', _id);
          }
        });
      } else {
        throw new Error('Invalid response from ChatGPT API');
      }

      const dataBullet = await connectToChatGPT(inputTextBullet);
      if (dataBullet.choices && dataBullet.choices.length > 0) {
        const outputText = dataBullet.choices[0].message.content;

        realm.write(() => {
          const objectId = new Realm.BSON.ObjectId(_id); // Ensure _id is a Realm ObjectId
          const video = realm.objectForPrimaryKey('VideoData', objectId);

          if (video) {
            video.isConverted = true; // Mark the video as converted
            video.tsOutputBullet = outputText;
            console.log('tsOutputBullet:', video.tsOutputBullet);
            returnOutput.push(outputText);
          } else {
            console.log('No video found with ID:', _id);
          }
        });
      } else {
        throw new Error('Invalid response from ChatGPT API');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('error found in sendToChatGPT function');
    }
    console.log('returnOutput:', returnOutput);
    return returnOutput;
  }
};

export const sendVideoSetToChatGPT = async (
  realm,
  videoSetVideoIDs,
  selectedVideoSet,
  reportFormat,
) => {
  let returnOutput: any[] = [];
  const videoTranscripts = videoSetVideoIDs.map(videoID => {
    const objectId = new Realm.BSON.ObjectId(videoID); // Ensure _id is a Realm ObjectId
    const video = realm.objectForPrimaryKey('VideoData', objectId);
    return video ? video.transcript : '';
  });
  const isArrayEmptyOrOnlyEmptyStrings = arr => {
    return arr.length === 0 || arr.every(item => item.trim() === '');
  };
  if (isArrayEmptyOrOnlyEmptyStrings(videoTranscripts)) {
    realm.write(() => {
      selectedVideoSet.isSummaryGenerated = false;
    });
    console.log('No videos selected for summarization');
    return ['', ''];
  } else {
    console.log(
      'Video Transcripts in Set:',
      videoTranscripts,
    );
    const combinedTranscripts = videoTranscripts.join(' ');
    const transcriptWordCount = combinedTranscripts.split(' ').length;
    const maxSummaryWords = Math.ceil(transcriptWordCount * 0.1);
    // console.log('combinedTranscripts:', combinedTranscripts);

    try {
      let inputTextBullet = `Summarize the selected video transcripts in this video set: ${videoTranscripts}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in bullet points using \u2022`;
      let inputTextSentence = `Summarize the selected video transcripts in this video set: ${videoTranscripts}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in sentence(s).`;

      const dataSentence = await connectToChatGPT(inputTextSentence);
      if (dataSentence.choices && dataSentence.choices.length > 0) {
        const outputText = dataSentence.choices[0].message.content;

        realm.write(() => {
          selectedVideoSet.summaryAnalysisSentence = outputText;
          selectedVideoSet.isSummaryGenerated = true;
          returnOutput.push(outputText);
        });

        console.log(
          'Single Video Summary Analysis Sentence:',
          selectedVideoSet.summaryAnalysisSentence,
        );
      } else {
        throw new Error('Invalid response from ChatGPT API');
      }

      const dataBullet = await connectToChatGPT(inputTextBullet);
      if (dataBullet.choices && dataBullet.choices.length > 0) {
        const outputText = dataBullet.choices[0].message.content;

        realm.write(() => {
          selectedVideoSet.summaryAnalysisBullet = outputText;
          returnOutput.push(outputText);
        });

        console.log(
          'Single Video Summary Analysis Bullet:',
          selectedVideoSet.summaryAnalysisBullet,
        );
      } else {
        throw new Error('Invalid response from ChatGPT API');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    console.log('Video Set returnOutput:', returnOutput);
    return returnOutput;
  }
};

export const getSentimentFromChatGPT = async (transcript, realm, videoId) => {
  const inputText = `Analyze the sentiment of this video transcript and return only one of the following labels: Very Negative, Negative, Neutral, Positive, or Very Positive. Transcript: "${transcript}"`;
  const data = await connectToChatGPT(inputText);
  if (data.choices && data.choices.length > 0) {
    const sentiment = data.choices[0].message.content.trim();

    realm.write(() => {
      const objectId = new Realm.BSON.ObjectId(videoId);
      const video = realm.objectForPrimaryKey('VideoData', objectId);
      if (video) {
        video.sentiment = sentiment;
      }
    });

    return sentiment;
  }
  return 'Neutral';
};
