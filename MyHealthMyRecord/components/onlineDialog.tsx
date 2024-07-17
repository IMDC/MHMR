import React, {useState, useEffect} from 'react';
import {View, Text, Alert} from 'react-native';
import {Dialog} from '@rneui/themed';
import {useRealm} from '../models/VideoData';
import {getAuth, getTranscript} from './stt_api';
import {sendToChatGPT} from './chatgpt_api';
import {VideoData} from '../models/VideoData';
import { useLoader } from './loaderProvider';
import { processVideos } from './processVideos';

const OnlineDialog = ({onlineDialogVisible, toggleOnlineDialog}) => {
  const {showLoader, hideLoader} = useLoader();
  const realm = useRealm();
  const [selectedVideoCount, setSelectedVideoCount] = useState(0);
  const [inputText, setInputText] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
   const handleProcessVideos = async () => {
     await processVideos(realm, videos, showLoader, hideLoader);
   };


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
            videos ready to be analyzed. Would you like to analyze video set
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
                await handleProcessVideos();
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
