import React, {useState, useEffect} from 'react';
import {View, Text, Alert} from 'react-native';
import {Dialog} from '@rneui/themed';
import {useRealm} from '../models/VideoData';
import {getAuth, getTranscript} from './stt_api';
import {sendToChatGPT} from './chatgpt_api';
import {VideoData} from '../models/VideoData';

const OnlineDialog = ({onlineDialogVisible, toggleOnlineDialog}) => {
  const realm = useRealm();
  const [selectedVideoCount, setSelectedVideoCount] = useState(0);
  const [inputText, setInputText] = useState('');
  const [videos, setVideos] = useState<any[]>([]);

  const processSelectedVideos = async () => {
    const auth = await getAuth();
    const selectedVideos: Realm.Results<VideoData> = realm
      .objects<VideoData>('VideoData')
      .filtered('isConverted == false AND isSelected == true');

    console.log(`Found ${selectedVideos.length} videos to process.`);

    for (const video of selectedVideos) {
      const audioFileName = video.filename.replace('.mp4', '.wav');
      console.log('audioFileName:', audioFileName);
      console.log(
        `Processing video ${video._id.toHexString()}: ${audioFileName}`,
      );

      try {
        await getTranscript(
          audioFileName,
          video._id.toHexString(),
          auth,
          realm,
        );
        console.log(
          `Transcription successful for video ${video._id.toHexString()}`,
        );
      } catch (error) {
        console.error(
          `Failed to process video ${video._id.toHexString()}:`,
          error,
        );
      }
    }
  };

  async function handleYesAnalysis() {
    const selectedVideos: Realm.Results<VideoData> = realm
      .objects<VideoData>('VideoData')
      .filtered('isConverted == false AND isSelected == true');

    for (const video of selectedVideos) {
      const getTranscriptByFilename = filename => {
        if (!videos || videos.length === 0) {
          console.log('No videos available.');
          return [];
        }
        const video = videos.find(video => video.filename === filename);
        return video ? video.transcript : [];
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

      const transcript = getTranscriptByFilename(video.filename);
      const keywords = getCheckedKeywords(video.filename).join(', ');
      const locations = getCheckedLocations(video.filename).join(', ');

      try {
        const outputText = await sendToChatGPT(
          video.filename,
          transcript,
          keywords,
          locations,
          realm,
          video._id.toHexString(),
        );
        setInputText(outputText); // State update here
        console.log(
          `Transcription successful for video ${video._id.toHexString()}`,
        );
      } catch (error) {
        console.error(
          `Failed to process video ${video._id.toHexString()}:`,
          error,
        );
      }
    }
  }

  useEffect(() => {
    const selectedVideos = realm
      .objects('VideoData')
      .filtered('isConverted == false AND isSelected == true');
    console.log('Selected Videos:', selectedVideos);
    console.log('Count:', selectedVideos.length);
    setSelectedVideoCount(selectedVideos.length);
  }, [onlineDialogVisible, realm]);

  if (selectedVideoCount === 0) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        marginBottom: 10,
        zIndex: 100,
      }}>
      <Dialog
        isVisible={onlineDialogVisible}
        onBackdropPress={toggleOnlineDialog}>
        <Dialog.Title title="Connected!"></Dialog.Title>
        {selectedVideoCount === 0 ? null : (
          <Text style={{fontSize: 18}}>
            You are now connected to the internet! You have {selectedVideoCount}{' '}
            videos ready to be analyzed. Would you like to analyze Video Set
            videos? If you click NO you will still have the option to analyze it
            later.
          </Text>
        )}

        <View style={{paddingHorizontal: 20}}>
          <Dialog.Actions>
            <Dialog.Button
              title="NO"
              onPress={() => {
                console.log('NO clicked!');
                toggleOnlineDialog();
              }}
            />
            <Dialog.Button
              title="YES"
              onPress={async () => {
                console.log('YES clicked!');
                toggleOnlineDialog();
                await processSelectedVideos();
                await handleYesAnalysis();
                Alert.alert(
                  'Video Transcripts Generated and Analyzed',
                  'Your transcripts have been generated and analyzed, and your videos have been added to the Video Set!',
                );
              }}
            />
          </Dialog.Actions>
        </View>
      </Dialog>
    </View>
  );
};

export default OnlineDialog;
