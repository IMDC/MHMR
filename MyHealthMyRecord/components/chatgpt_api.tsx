import Config from 'react-native-config';
import RNFS from 'react-native-fs';

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
    console.log('Response from ChatGPT API:', data); // Log the response
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

export const sendToChatGPT = async (
  textFileName,
  transcript,
  keywords,
  locations,
  realm,
  _id,
) => {
  try {
    const inputText = `Summarize this video transcript (${transcript}) and include the summary of the keywords (${keywords}) and locations (${locations}) tagged.`;
    // Create directories if they don't exist
    const directoryPath = `${RNFS.DocumentDirectoryPath}/MHMR/transcripts`;
    await RNFS.mkdir(directoryPath, {recursive: true} as RNFS.MkdirOptions);

    // Send the input text to ChatGPT API
    const data = await connectToChatGPT(inputText);

    // Check if data.choices is defined and contains at least one item
    if (data.choices && data.choices.length > 0) {
      const outputText = data.choices[0].message.content;
      const outputFile = `${textFileName.replace('.mp4', '.txt')}`;
      const filePath = `${directoryPath}/${outputFile}`;
      await RNFS.writeFile(filePath, outputText, 'utf8');
      console.log('Output saved to file: ' + filePath);

      realm.write(() => {
        const objectId = new Realm.BSON.ObjectId(_id); // Ensure _id is a Realm ObjectId
        const video = realm.objectForPrimaryKey('VideoData', objectId);

        if (video) {
          video.isConverted = true; // Mark the video as converted
          console.log('isConverted:', video.isConverted);
          console.log('Marked as converted');
        } else {
          console.log('No video found with ID:', _id);
        }
      });

      return outputText;
    } else {
      throw new Error('Invalid response from ChatGPT API');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

export const sendVideoSetToChatGPT = async (
  realm,
  videoSetVideoIDs,
  selectedVideoSet,
) => {
  const videoTranscripts = videoSetVideoIDs.map(videoID => {
    const objectId = new Realm.BSON.ObjectId(videoID); // Ensure _id is a Realm ObjectId
    const video = realm.objectForPrimaryKey('VideoData', objectId);
    return video ? video.transcript.join(' ') : '';
  });
  try {
    const inputText = `Summarize the selected video transcripts in this video set: ${videoTranscripts.join(
      ' ',
    )}`;
    const data = await connectToChatGPT(inputText);
    if (data.choices && data.choices.length > 0) {
      const outputText = data.choices[0].message.content;
      console.log('Output Summary Analysis Text:', outputText);

      realm.write(() => {
        selectedVideoSet.summaryAnalysis = outputText;
        selectedVideoSet.isSummaryGenerated = true;
      });

      console.log(
        selectedVideoSet.summaryAnalysis,
      );
      console.log(
        selectedVideoSet.isSummaryGenerated,
      );

      return outputText;
    } else {
      throw new Error('Invalid response from ChatGPT API');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
