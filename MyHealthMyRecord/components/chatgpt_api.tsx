import {useState} from 'react';
import Config from 'react-native-config';
import RNFS from 'react-native-fs';
import Realm from 'realm';

// Keep your existing connectToChatGPT function
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
            role: 'system',
            content: `You are summarizing transcripts of video data. 
                      Do not use any personal pronouns or identifiers (e.g., "I", "you", "he", "she", etc.). 
                      Focus solely on the information presented in the transcript without attributing it to specific individuals or using personal language.`
          },
          {role: 'user', content: inputText},
        ],
        max_tokens: 400,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null; // Handle null in calling function
  }
}

// Define sentiment weights
type SentimentType = 'Very Negative' | 'Negative' | 'Neutral' | 'Positive' | 'Very Positive';
const SENTIMENT_WEIGHTS = {
  'Very Negative': -2,
  'Negative': -1,
  'Neutral': 0,
  'Positive': 1,
  'Very Positive': 2,
};

// Function to convert numerical score back to sentiment label
const scoreToSentiment = (score) => {
  if (score <= -1.0) return 'Very Negative';
  if (score <= -0.25) return 'Negative';
  if (score < 0.25) return 'Neutral';
  if (score < 1.0) return 'Positive';
  return 'Very Positive';
};

// Function to normalize bullet points to use '•' 
function normalizeBulletPoints(text) {
  return text
    .split('\n')
    .map(line => {
      const trimmedLine = line.trim();
      // Match lines starting with '-', '•', or '-•'
      const bulletRegex = /^[-•]\s*(.*)/;
      const match = trimmedLine.match(bulletRegex);
      if (match) {
        return `• ${match[1]}`;
      }
      return trimmedLine;
    })
    .join('\n');
}

// New function to get sentiment for a single bullet point
export const getSentimentForBulletPoint = async (bulletPoint) => {
  const inputText = `Analyze the sentiment of this point and return only one of the following labels: Very Negative, Negative, Neutral, Positive, or Very Positive. Point: "${bulletPoint}"`;
  const data = await connectToChatGPT(inputText);
  
  if (data?.choices && data.choices.length > 0) {
    return data.choices[0].message.content.trim();
  }
  return 'Neutral' as SentimentType; // Default fallback
};

interface SentimentResult {
  point: string;
  sentiment: SentimentType;
  weight: number;
}

// New function to analyze bullet points and calculate weighted sentiment
export const getWeightedSentiment = async (bulletPoints) => {
  // Split the bullet points if they're in a single string
  const bulletPointArray = Array.isArray(bulletPoints) 
    ? bulletPoints 
    : bulletPoints.split(/•|\*/).filter(point => point.trim().length > 0);
  
  // Return default if no bullet points
  if (bulletPointArray.length === 0) {
    return {
      overallSentiment: 'Neutral',
      bulletSentiments: [],
      averageScore: 0,
      formattedBulletsWithSentiment: '',
    };
  }
  
  // Get sentiment for each bullet point
  const sentimentPromises = bulletPointArray.map(async (point): Promise<SentimentResult> => {
    const sentiment = await getSentimentForBulletPoint(point.trim());
    return {
        point: point.trim(),
        sentiment,
        weight: SENTIMENT_WEIGHTS[sentiment]
    };
  });
  
  const bulletSentiments = await Promise.all(sentimentPromises);
  
  // Calculate weighted average
  const totalWeight = bulletSentiments.reduce((sum, item) => sum + item.weight, 0);
  const averageScore = totalWeight / bulletSentiments.length;
  
  // Convert score back to sentiment label
  const overallSentiment = scoreToSentiment(averageScore);
  
  const formattedBulletsWithSentiment = bulletSentiments
    .map(item => `• ${item.point} [${item.sentiment}, ${item.weight}]`)
    .join('\n');

  // new AS
  const formattedOutput = `${formattedBulletsWithSentiment}\n\nOverall feeling: ${overallSentiment} [${averageScore.toFixed(2)}]`;  
  return {
    overallSentiment,
    bulletSentiments,
    averageScore,
    formattedBulletsWithSentiment: formattedOutput,
  };
};

// New Function to produce appropriate amount of bullet points
function getOptimalBulletPoints(wordCount) {
  const min = 3;
  const max = 7;
  return Math.min(max, Math.max(min, Math.floor(wordCount / 60)));
}
// Updated sendToChatGPT function with improved bullet point generation
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

  
  
  // Calculate optimal number of bullet points based on transcript length
  const transcriptWordCount = transcript.split(' ').length;
  const optimalBulletPoints = getOptimalBulletPoints(transcriptWordCount);
  
  const inputTexts = [
    `Provide exactly ${optimalBulletPoints} bullet points of the main topics discussed in this video transcript: "${transcript}". 
    ONLY use the • character (Unicode U+2022) to begin each bullet point. Do not use hyphens (-), asterisks (*), or any other symbols.`,
    `Summarize and overview the main topics covered in this video transcript: "${transcript}". Format this summary in sentences.`,
    `Analyze the sentiment of this video transcript and return only one of the following labels:
     Very Negative, Negative, Neutral, Positive, or Very Positive. Avoid using neutral unless the entire transcript is neutral. 
     Use Neutral **only** when the content is purely factual, objective, and emotionally uncharged. Avoid using Neutral if the statement
     reflects any degree of emotional weight, opinion, or implication. 
     Transcript: "${transcript}"`,
  ];

  try {
    // Get all ChatGPT responses
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

    // Get the bullet points for weighted sentiment analysis
    const bulletPoints = updates.find(u => u.index === 0)?.content;
    
    // Create an initial database write with available information
    realm.write(() => {
      const objectId = new Realm.BSON.ObjectId(_id);
      const video = realm.objectForPrimaryKey('VideoData', objectId);
      if (video) {
        updates.forEach(update => {
          if (update.content !== null) {
            if (update.index === 0) video.tsOutputBullet = update.content;
            if (update.index === 1) video.tsOutputSentence = update.content;
            if (update.index === 2) video.sentiment = update.content; // Initial sentiment as fallback
          }
        });
        video.isConverted = true;
      }
    });

    // Process weighted sentiment synchronously to ensure it completes before function returns
    if (bulletPoints) {
      try {
        const normalizedBullets = normalizeBulletPoints(bulletPoints);
        const weightedSentimentResult = await getWeightedSentiment(normalizedBullets);
        
        // Update with weighted sentiment in a separate transaction
        realm.write(() => {
          const objectId = new Realm.BSON.ObjectId(_id);
          const video = realm.objectForPrimaryKey('VideoData', objectId);
          if (video) {
            // Replace the original sentiment with the weighted sentiment
            video.sentiment = weightedSentimentResult.overallSentiment;
            // Store additional sentiment data if needed
            video.sentimentScore = weightedSentimentResult.averageScore;
            video.bulletSentiments = JSON.stringify(weightedSentimentResult.bulletSentiments);
            video.tsOutputBullet = weightedSentimentResult.formattedBulletsWithSentiment;
          }
        });
      } catch (error) {
        console.error('Error calculating weighted sentiment:', error);
        // Weighted sentiment failed, but basic analysis succeeded, so we can still return data
      }
    }

    // Return the filtered results
    return updates.filter(u => u.content !== null).map(u => u.content);
  } catch (error) {
    console.error('Error in sendToChatGPT:', error);
    return [];
  }
};

// Updated getSentimentFromChatGPT function with better error handling
export const getSentimentFromChatGPT = async (transcript, realm, videoId) => {
  try {
    const inputText = `Analyze the sentiment of this video transcript and return only one of the following labels: Very Negative, Negative, Neutral, Positive, or Very Positive. Avoid using neutral unless the entire transcript is neutral. Transcript: "${transcript}"`;
    const data = await connectToChatGPT(inputText);
    
    if (data?.choices && data.choices.length > 0) {
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
  } catch (error) {
    console.error('Error in getSentimentFromChatGPT:', error);
    return 'Neutral';
  }
};

// Updated sendVideoSetToChatGPT function with improved bullet point quality
export const sendVideoSetToChatGPT = async (
  realm,
  videoSetVideoIDs,
  selectedVideoSet,
  reportFormat,
) => {
  try {
    let returnOutput = [];
    const videoTranscripts = videoSetVideoIDs.map(videoID => {
      const objectId = new Realm.BSON.ObjectId(videoID);
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

      const optimalBulletPoints = getOptimalBulletPoints(transcriptWordCount);

      let inputTextBullet = `Summarize the following user's selected video transcripts into exactly ${optimalBulletPoints} high-impact bullet points: ${videoTranscripts}. 
      Make the total word count of the summary ${maxSummaryWords} words or less. 
      Focus ONLY on the most significant information and key insights.
      ONLY use the • character (Unicode U+2022) to begin each bullet point. 
      Do not use hyphens (-), asterisks (*), or any other symbols.
      Each bullet point should be concise but informative.
      Avoid redundant or less important information.`;
      
      let inputTextSentence = `Summarize the following user's selected video transcripts into a concise summary: ${videoTranscripts}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in sentence(s).`;
      
      // Get both summaries in parallel
      const [dataSentence, dataBullet] = await Promise.all([
        connectToChatGPT(inputTextSentence),
        connectToChatGPT(inputTextBullet)
      ]);
      
      let sentenceSummary = '';
      let bulletSummary = '';
      
      // Process sentence summary
      if (dataSentence?.choices && dataSentence.choices.length > 0) {
        sentenceSummary = dataSentence.choices[0].message.content;
        returnOutput.push(sentenceSummary);
      } else {
        console.error('Invalid response from ChatGPT API for sentence summary');
        returnOutput.push('');
      }
      
      // Process bullet point summary
      if (dataBullet?.choices && dataBullet.choices.length > 0) {
        bulletSummary = dataBullet.choices[0].message.content;
        returnOutput.push(bulletSummary);
      } else {
        console.error('Invalid response from ChatGPT API for bullet summary');
        returnOutput.push('');
      }
      
      // Process weighted sentiment synchronously before returning
      let weightedSentimentResult = null;
      if (bulletSummary) {
        try {
          weightedSentimentResult = await getWeightedSentiment(bulletSummary);
        } catch (error) {
          console.error('Error calculating weighted sentiment for video set:', error);
          // Continue with basic summaries even if sentiment analysis fails
        }
      }
      
      // Use a single write transaction for all updates to improve database performance
      realm.write(() => {
        selectedVideoSet.summaryAnalysisSentence = sentenceSummary;
        selectedVideoSet.summaryAnalysisBullet = bulletSummary;
        selectedVideoSet.isSummaryGenerated = true;
        
        // Add sentiment data if available
        if (weightedSentimentResult) {
          selectedVideoSet.sentiment = weightedSentimentResult.overallSentiment;
          selectedVideoSet.sentimentScore = weightedSentimentResult.averageScore;
          selectedVideoSet.bulletSentiments = JSON.stringify(weightedSentimentResult.bulletSentiments);
        }
      });
      
      console.log('Video Set returnOutput:', returnOutput);
      return returnOutput;
    }
  } catch (error) {
    console.error('Error in sendVideoSetToChatGPT:', error);
    return ['', ''];
  }
};

// Updated function to get more focused bullet points
export const generateVideoSummary = async (transcript) => {
  try {
    const transcriptWordCount = transcript.split(' ').length;
    const maxSummaryWords = Math.ceil(transcriptWordCount * 0.2); // 20% of original length
    
    // Calculate optimal number of bullet points based on transcript length
    // For short transcripts: fewer points, for longer ones: more points but still limited
    const minBulletPoints = 3;
    const maxBulletPoints = 7;
    const optimalBulletPoints = Math.min(maxBulletPoints, 
      Math.max(minBulletPoints, Math.floor(transcriptWordCount / 100))
    );

    const inputTextBullet = `Summarize the following transcript into exactly ${optimalBulletPoints} high-quality bullet points: ${transcript}. 
    Make the total word count of the summary ${maxSummaryWords} words or less. 
    Each bullet point should be concise but informative.
    Use the • character (Unicode U+2022) for bullet points.
    Avoid redundant information.`;
    
    const inputTextSentence = `Summarize the following transcript into a concise summary: ${transcript}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in sentence(s).`;

    // Get both summaries in parallel
    const [bulletResponse, sentenceResponse] = await Promise.all([
      connectToChatGPT(inputTextBullet),
      connectToChatGPT(inputTextSentence),
    ]);

    // Extract content safely with error checking
    const bulletContent = bulletResponse?.choices?.[0]?.message?.content || `• ${transcript}`;
    const sentenceContent = sentenceResponse?.choices?.[0]?.message?.content || transcript;
    
    // Process weighted sentiment before returning
    let weightedSentiment = null;
    try {
      weightedSentiment = await getWeightedSentiment(bulletContent);
      console.log('Generated weighted sentiment:', weightedSentiment.overallSentiment);
    } catch (error) {
      console.error('Error calculating weighted sentiment:', error);
      // Continue with basic summaries even if sentiment analysis fails
    }
    
    // Return the complete result including sentiment data
    return {
      bullet: bulletContent,
      sentence: sentenceContent,
      sentiment: weightedSentiment?.overallSentiment || 'Neutral',
      sentimentScore: weightedSentiment?.averageScore || 0,
      bulletSentiments: weightedSentiment?.bulletSentiments || [],
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      bullet: `• ${transcript}`,
      sentence: transcript,
      sentiment: 'Neutral',
      sentimentScore: 0,
      bulletSentiments: [],
    };
  }
};