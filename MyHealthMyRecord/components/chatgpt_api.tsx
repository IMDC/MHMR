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
    `Analyze the sentiment of this video transcript and return only one of the following labels: Very Negative, Negative, Neutral, Positive, or Very Positive. Transcript: "${transcript}"`,
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

export const sendVideoSetToChatGPT = async (
  realm,
  videoSetVideoIDs,
  selectedVideoSet,
  reportFormat,
) => {
  const videoTranscripts = videoSetVideoIDs
    .map(videoID => {
      const objectId = new Realm.BSON.ObjectId(videoID);
      const video = realm.objectForPrimaryKey('VideoData', objectId);
      return video ? video.transcript : '';
    })
    .filter(transcript => transcript.trim());

  if (!videoTranscripts.length) {
    console.log('No videos selected for summarization');
    realm.write(() => {
      selectedVideoSet.isSummaryGenerated = false;
    });
    return ['', ''];
  }

  const combinedTranscripts = videoTranscripts.join(' ');
  const inputTexts = [
    `Summarize the following user's selected video transcripts into a concise summary: "${combinedTranscripts}". Make the total word count of the summary less. Format the summary in sentence(s).`,
    `Summarize the following user's selected video transcripts into a concise summary: "${combinedTranscripts}". Make the total word count of the summary less. Format the summary in bullet points using \u2022`,
  ];

  const results = await Promise.all(
    inputTexts.map(text => connectToChatGPT(text)),
  );

  realm.write(() => {
    results.forEach((result, index) => {
      if (result && result.choices && result.choices.length > 0) {
        const content = result.choices[0].message.content;
        if (index === 0) {
          selectedVideoSet.summaryAnalysisSentence = content;
        } else {
          selectedVideoSet.summaryAnalysisBullet = content;
        }
        selectedVideoSet.isSummaryGenerated = true;
      }
    });
  });

  return results.map(result => result?.choices[0]?.message.content || '');
};
