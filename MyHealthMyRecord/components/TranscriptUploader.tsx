import React from 'react';
import {View, Platform, Alert} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {useRealm, VideoSet, VideoData} from '../models/VideoData';
import {Button} from '@rneui/themed';
import * as Styles from '../assets/util/styles';
import Realm from 'realm';
import {
  useDropdownContext,
  DropdownContextType,
} from '../components/videoSetProvider';

interface TranscriptUploaderProps {
  onUploadComplete?: () => void;
}

const getRandomDateWithinLast8Weeks = () => {
  const now = new Date();
  const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000); // 8 weeks in ms
  const randomTime =
    eightWeeksAgo.getTime() +
    Math.random() * (now.getTime() - eightWeeksAgo.getTime());
  return new Date(randomTime);
};

const TranscriptUploader = ({onUploadComplete}: TranscriptUploaderProps) => {
  const realm = useRealm();
  const {currentVideoSet, setCurrentVideos} =
    useDropdownContext() as DropdownContextType;

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

      if (!fileUri) throw new Error('Failed to get file URI');

      const content = await RNFS.readFile(fileUri, 'utf8');

      // Regex to split based on "=== filename ==="
      const transcriptChunks = content.split(/=== (.*?) ===/g).filter(Boolean);

      const videoDataList: VideoData[] = [];

      realm.write(() => {
        for (let i = 0; i < transcriptChunks.length; i += 2) {
          const filename = transcriptChunks[i - 1]?.trim();
          const transcriptText = transcriptChunks[i]?.trim();

          if (!filename || !transcriptText) continue;

          const videoData = realm.create<VideoData>('VideoData', {
            _id: new Realm.BSON.ObjectId(),
            title: filename,
            filename: filename,
            datetimeRecorded: getRandomDateWithinLast8Weeks(),
            duration: 0,
            transcript: transcriptText,
            isConverted: false,
            isSelected: true,
            isTranscribed: true,
            sentiment: 'Neutral',
            tsOutputBullet: '',
            tsOutputSentence: '',
            keywords: [],
            locations: [],
          });

          videoDataList.push(videoData);
        }

        if (videoDataList.length > 0) {
          // Create a new VideoSet that includes all video IDs
          const videoSet = realm.create('VideoSet', {
            _id: new Realm.BSON.ObjectId(),
            name: `Transcript Set: ${result[0].name}`,
            videoIDs: videoDataList.map(video => video._id.toString()),
            dateCreated: new Date(),
            isAnalyzed: false,
            isSummaryGenerated: false,
          });

          setCurrentVideos(videoDataList);
        }
      });

      Alert.alert('Success', 'Transcripts parsed and uploaded successfully.');
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
