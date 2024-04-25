import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {Dialog} from '@rneui/themed';
import {useRealm} from '../models/VideoData';

const OnlineDialog = ({onlineDialogVisible, toggleOnlineDialog}) => {
  const realm = useRealm();
  const [selectedVideoCount, setSelectedVideoCount] = useState(0);

  useEffect(() => {
    const selectedVideos = realm
      .objects('VideoData')
      .filtered('isConverted == false AND isSelected == true');
    console.log('Selected Videos:', selectedVideos);
    console.log('Count:', selectedVideos.length);
    setSelectedVideoCount(selectedVideos.length);
  }, [onlineDialogVisible, realm]); // Re-run this effect when the dialog becomes visible or the realm instance changes

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
          <Text>
            You are now connected to the internet! You have {selectedVideoCount}{' '}
            videos ready to be analyzed. Would you like to analyze Video Set
            videos?
          </Text>
        )}

        <View style={{paddingHorizontal: 20}}>
          <Dialog.Actions>
            <Dialog.Button
              title="LATER"
              onPress={() => {
                console.log('LATER clicked!');
                toggleOnlineDialog();
              }}
            />
            <Dialog.Button
              title="NO"
              onPress={() => {
                console.log('NO clicked!');
                toggleOnlineDialog();
              }}
            />
            <Dialog.Button
              title="YES"
              onPress={() => {
                console.log('YES clicked!');
                toggleOnlineDialog();
              }}
            />
          </Dialog.Actions>
        </View>
      </Dialog>
    </View>
  );
};

export default OnlineDialog;
