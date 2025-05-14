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



// Updated sendToChatGPT function to include weighted sentiment analysis
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
    `Provide bullet points of the main topics discussed in this video transcript: "${transcript}". ONLY use the • character (Unicode U+2022) to begin each bullet point. Do not use hyphens (-), asterisks (*), or any other symbols.`,
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

  // Get the bullet points for weighted sentiment analysis in the background
  const bulletPoints = updates.find(u => u.index === 0)?.content;
  
  // Process weighted sentiment asynchronously
  if (bulletPoints) {
    const normalizedBullets = normalizeBulletPoints(bulletPoints);

    getWeightedSentiment(normalizedBullets).then(weightedSentimentResult => {
      if (weightedSentimentResult) {
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
        //console.log(`Updated sentiment to weighted value: ${weightedSentimentResult.overallSentiment}`);
      }
    }).catch(error => {
      console.error('Error calculating weighted sentiment:', error);
    });
  }

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

  // Keep the original return structure
  return updates.filter(u => u.content !== null).map(u => u.content);
};

// Your existing getSentimentFromChatGPT function (unchanged)
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

// Your existing sendVideoSetToChatGPT function with background sentiment analysis
export const sendVideoSetToChatGPT = async (
  realm,
  videoSetVideoIDs,
  selectedVideoSet,
  reportFormat,
) => {
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

    try {
      let inputTextBullet = `Summarize the following user's selected video transcripts into a concise summary: ${videoTranscripts}. Make the total word count of the summary ${maxSummaryWords} words or less. ONLY use the • character (Unicode U+2022) to begin each bullet point. Do not use hyphens (-), asterisks (*), or any other symbols.`;
      let inputTextSentence = `Summarize the following user's selected video transcripts into a concise summary: ${videoTranscripts}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in sentence(s).`;
      
      const [dataSentence, dataBullet] = await Promise.all([
        connectToChatGPT(inputTextSentence),
        connectToChatGPT(inputTextBullet)
      ]);
      
      // Handle sentence summary
      if (dataSentence.choices && dataSentence.choices.length > 0) {
        const outputText = dataSentence.choices[0].message.content;
        
        realm.write(() => {
          selectedVideoSet.summaryAnalysisSentence = outputText;
          selectedVideoSet.isSummaryGenerated = true;
        });
        
        returnOutput.push(outputText);
        console.log('Set summary analysis in sentence form:', selectedVideoSet.summaryAnalysisSentence);
      } else {
        throw new Error('Invalid response from ChatGPT API');
      }
      
      // Handle bullet point summary
      if (dataBullet.choices && dataBullet.choices.length > 0) {
        const outputText = dataBullet.choices[0].message.content;
        
        realm.write(() => {
          selectedVideoSet.summaryAnalysisBullet = outputText;
        });
        
        returnOutput.push(outputText);
        console.log('Set summary analysis in bullet form:', selectedVideoSet.summaryAnalysisBullet);
        
        // Calculate weighted sentiment from bullet points in the background
        getWeightedSentiment(outputText).then(weightedSentimentResult => {
          if (weightedSentimentResult) {
            realm.write(() => {
              // Update the sentiment of the video set with the weighted calculation
              selectedVideoSet.sentiment = weightedSentimentResult.overallSentiment;
              // Store additional data
              selectedVideoSet.sentimentScore = weightedSentimentResult.averageScore;
              selectedVideoSet.bulletSentiments = JSON.stringify(weightedSentimentResult.bulletSentiments);
            });
            
            console.log('Updated video set sentiment to:', weightedSentimentResult.overallSentiment);
          }
        }).catch(error => {
          console.error('Error calculating weighted sentiment for video set:', error);
        });
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

// Updated generateVideoSummary to maintain original return structure but analyze sentiment in background
export const generateVideoSummary = async (transcript) => {
  const transcriptWordCount = transcript.split(' ').length;
  const maxSummaryWords = Math.ceil(transcriptWordCount * 0.2); // 20% of original length

  const inputTextBullet = `Summarize the following transcript into a concise summary: ${transcript}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in bullet points using \u2022`;
  const inputTextSentence = `Summarize the following transcript into a concise summary: ${transcript}. Make the total word count of the summary ${maxSummaryWords} words or less. Format the summary in sentence(s).`;

  try {
    const [bulletResponse, sentenceResponse] = await Promise.all([
      connectToChatGPT(inputTextBullet),
      connectToChatGPT(inputTextSentence),
    ]);

    const bulletContent = bulletResponse.choices[0].message.content;
    const sentenceContent = sentenceResponse.choices[0].message.content;
    
    // Start sentiment analysis in the background
    getWeightedSentiment(bulletContent).then(weightedSentimentResult => {
      console.log('Generated weighted sentiment:', weightedSentimentResult.overallSentiment);
      // This data is available but not added to the return structure
      // You can use it elsewhere if needed
    }).catch(error => {
      console.error('Error calculating weighted sentiment:', error);
    });
    
    // Keep original return structure
    return {
      bullet: bulletContent,
      sentence: sentenceContent,
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      bullet: `• ${transcript}`,
      sentence: transcript,
    };
  }
};