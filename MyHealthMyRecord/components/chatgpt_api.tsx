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
        messages: [
          {
            role: 'developer',
            content:
              'You are summarizing transcripts of video data. Use second person pronouns.',
          },
          {role: 'user', content: inputText},
        ],
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null; // Handle null in calling function
  }
}

export const sendToChatGPT = async (
  textFileName,
  transcript,
  keywords,
  locations,
  realm,
  _id,
  reportFormat,
) => {
  if (!transcript) {
    console.log('No transcript found. Saving empty transcript.');
    realm.write(() => {
      const objectId = new Realm.BSON.ObjectId(_id);
      const video = realm.objectForPrimaryKey('VideoData', objectId);
      if (video) {
        video.isConverted = true;
        video.transcript = '';
      }
    });
    return [];
  }

  const inputTexts = [
    `Provide bullet points of the main topics discussed in this video transcript: "${transcript}". Format this in bullet points using \u2022`,
    `Summarize and overview the main topics covered in this video transcript: "${transcript}". Format this summary in sentences.`,
    `Analyze the sentiment of this video transcript and return only one of the following labels: Very Negative, Negative, Neutral, Positive, or Very Positive. Avoid using neutral unless the entire transcript is neutral. Transcript: "${transcript}"`,
  ];

  const results = await Promise.all(
    inputTexts.map(text => connectToChatGPT(text)),
  );

  const updates = results.map((result, index) => {
    if (result && result.choices && result.choices.length > 0) {
      const content = result.choices[0].message.content;
      return {index, content: content.trim()};
    }
    return {index, content: null};
  });

  realm.write(() => {
    const objectId = new Realm.BSON.ObjectId(_id);
    const video = realm.objectForPrimaryKey('VideoData', objectId);
    if (video) {
      updates.forEach(update => {
        if (update.content !== null) {
          if (update.index === 0) video.tsOutputBullet = update.content;
          if (update.index === 1) video.tsOutputSentence = update.content;
          if (update.index === 2) video.sentiment = update.content;
        }
      });
      video.isConverted = true;
    }
  });

  return updates.filter(u => u.content !== null).map(u => u.content);
};

export const getSentimentFromChatGPT = async (transcript, realm, videoId) => {
  const inputText = `Analyze the sentiment of this video transcript and return only one of the following labels: Very Negative, Negative, Neutral, Positive, or Very Positive. Avoid using neutral unless the entire transcript is neutral. Transcript: "${transcript}"`;
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
    console.log('Video Transcripts in Set:', videoTranscripts);
    const combinedTranscripts = videoTranscripts.join(' ');
    const transcriptWordCount = combinedTranscripts.split(' ').length;
    const maxSummaryWords = Math.ceil(transcriptWordCount * 0.2);
    // console.log('combinedTranscripts:', combinedTranscripts);

    try {
      // let inputTextBullet = `Summarize the selected video transcripts in this video set: ${videoTranscripts}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in bullet points using \u2022`;
      // let inputTextSentence = `Summarize the selected video transcripts in this video set: ${videoTranscripts}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in sentence(s).`;
      let inputTextBullet = `Summarize the following user's selected video transcripts into a concise summary: ${videoTranscripts}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in bullet points using \u2022`;
      let inputTextSentence = `Summarize the following user's selected video transcripts into a concise summary: ${videoTranscripts}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in sentence(s).`;
      const dataSentence = await connectToChatGPT(inputTextSentence);
      if (dataSentence.choices && dataSentence.choices.length > 0) {
        const outputText = dataSentence.choices[0].message.content;

        realm.write(() => {
          selectedVideoSet.summaryAnalysisSentence = outputText;
          selectedVideoSet.isSummaryGenerated = true;
          returnOutput.push(outputText);
        });

        console.log(
          'Set summary analysis in sentence form:',
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
          'Set summary analysis in bullet form:',
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

export const generateVideoSummary = async (transcript: string) => {
  const transcriptWordCount = transcript.split(' ').length;
  const maxSummaryWords = Math.ceil(transcriptWordCount * 0.2); // 20% of original length

  const inputTextBullet = `Summarize the following transcript into a concise summary: ${transcript}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in bullet points using \u2022`;
  const inputTextSentence = `Summarize the following transcript into a concise summary: ${transcript}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in sentence(s).`;

  try {
    const [bulletResponse, sentenceResponse] = await Promise.all([
      connectToChatGPT(inputTextBullet),
      connectToChatGPT(inputTextSentence),
    ]);

    return {
      bullet: bulletResponse.choices[0].message.content,
      sentence: sentenceResponse.choices[0].message.content,
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      bullet: `• ${transcript}`,
      sentence: transcript,
    };
  }
};
