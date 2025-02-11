import React from 'react';
import {View, Platform, Alert} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {useRealm, VideoSet, VideoData} from '../models/VideoData';
import {Button} from '@rneui/themed';
import * as Styles from '../assets/util/styles';
import Realm from 'realm';
import {useDropdownContext, DropdownContextType} from '../components/videoSetProvider';

interface TranscriptUploaderProps {
  onUploadComplete?: () => void;
}

const TranscriptUploader = ({onUploadComplete}: TranscriptUploaderProps) => {
  const realm = useRealm();
  const {currentVideoSet, setCurrentVideos} = useDropdownContext() as DropdownContextType;

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.plainText],
        copyTo: 'cachesDirectory',
      });

      const fileUri = Platform.select({
        ios: decodeURIComponent(result[0].uri),
        android: result[0].fileCopyUri,
      });

      if (!fileUri) {
        throw new Error('Failed to get file URI');
      }

      const content = await RNFS.readFile(fileUri, 'utf8');
      
      realm.write(() => {
        const videoData = realm.create<Realm.Object>('VideoData', {
          _id: new Realm.BSON.ObjectId(),
          title: result[0].name,
          filename: result[0].name,
          datetimeRecorded: new Date(),
          duration: 0,
          transcript: content,
          isConverted: true,
          isTranscribed: true,
          sentiment: 'Neutral',
          tsOutputBullet: '',
          tsOutputSentence: '',
          keywords: [],
          locations: [],
        }) as VideoData;

        const videoSet = realm.create('VideoSet', {
          _id: new Realm.BSON.ObjectId(),
          name: `Transcript: ${result[0].name}`,
          videoIDs: [videoData._id.toString()],
          dateCreated: new Date(),
          isAnalyzed: false,
          isSummaryGenerated: false,
        });

        const updatedVideos = [videoData];
        setCurrentVideos(updatedVideos);
      });

      Alert.alert('Success', 'Transcript uploaded and video set created successfully');
      onUploadComplete?.();

    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to upload transcript');
        console.error(err);
      }
    }
  };

  return (
    <View style={{padding: 20}}>
      <Button
        title="Upload Transcript"
        onPress={pickDocument}
        color={Styles.MHMRBlue}
        radius={50}
      />
    </View>
  );
};

export default TranscriptUploader; 