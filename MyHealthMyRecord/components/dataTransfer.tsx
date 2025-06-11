import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useRealm, VideoData, VideoSet} from '../models/VideoData';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import * as Styles from '../assets/util/styles';
import Realm from 'realm';

interface ImportVideoData {
  _id: string;
  title: string;
  filename: string;
  datetimeRecorded: string;
  duration: number;
  textComments: string[];
  locations: string[];
  emotionStickers: string[];
  keywords: string[];
  painScale: string[];
  isConverted: boolean;
  isSelected: boolean;
  isTranscribed: boolean;
  transcript: string;
  weekday: string;
  sentiment: string;
  tsOutputBullet: string;
  tsOutputSentence: string;
}

interface ImportVideoSet {
  _id: string;
  datetime: string;
  name: string;
  videoIDs: string[];
  frequencyData: string[];
  summaryAnalysisSentence: string;
  summaryAnalysisBullet: string;
  isSummaryGenerated: boolean;
  reportFormat: string;
  selectedWords: string[];
  earliestVideoDateTime: string;
  latestVideoDateTime: string;
  isAnalyzed: boolean;
  isCurrent: boolean;
}

interface ImportData {
  videos: ImportVideoData[];
  videoSets: ImportVideoSet[];
}

export const exportDatabase = async (realm: Realm) => {
  try {
    // Get all data from the database
    const videos = Array.from(realm.objects<VideoData>('VideoData'));
    const videoSets = Array.from(realm.objects<VideoSet>('VideoSet'));

    // Convert Realm objects to plain JSON
    const exportData = {
      videos: videos.map(video => ({
        _id: video._id.toString(),
        title: video.title,
        filename: video.filename,
        datetimeRecorded: video.datetimeRecorded.toISOString(),
        duration: video.duration,
        textComments: Array.from(video.textComments),
        locations: Array.from(video.locations),
        emotionStickers: Array.from(video.emotionStickers),
        keywords: Array.from(video.keywords),
        painScale: Array.from(video.painScale),
        isConverted: video.isConverted,
        isSelected: video.isSelected,
        isTranscribed: video.isTranscribed,
        transcript: video.transcript,
        weekday: video.weekday,
        sentiment: video.sentiment,
        tsOutputBullet: video.tsOutputBullet,
        tsOutputSentence: video.tsOutputSentence,
      })),
      videoSets: videoSets.map(set => ({
        _id: set._id.toString(),
        datetime: set.datetime.toISOString(),
        name: set.name,
        videoIDs: Array.from(set.videoIDs),
        frequencyData: Array.from(set.frequencyData),
        summaryAnalysisSentence: set.summaryAnalysisSentence,
        summaryAnalysisBullet: set.summaryAnalysisBullet,
        isSummaryGenerated: set.isSummaryGenerated,
        reportFormat: set.reportFormat,
        selectedWords: Array.from(set.selectedWords),
        earliestVideoDateTime: set.earliestVideoDateTime.toISOString(),
        latestVideoDateTime: set.latestVideoDateTime.toISOString(),
        isAnalyzed: set.isAnalyzed,
        isCurrent: set.isCurrent,
      })),
    };

    // Create a text file in the app's documents directory
    const filePath = `${RNFS.DocumentDirectoryPath}/mhmr_export.txt`;
    await RNFS.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8');

    Alert.alert('Success', `Database exported successfully to: ${filePath}`, [
      {
        text: 'OK',
        onPress: () => console.log('Export complete'),
      },
    ]);
  } catch (error) {
    console.error('Export error:', error);
    Alert.alert('Error', 'Failed to export database');
  }
};

export const importDatabase = async (realm: Realm) => {
  try {
    // Pick the text file
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.plainText],
    });

    // Read the file
    const fileContent = await RNFS.readFile(result[0].uri, 'utf8');
    const importData: ImportData = JSON.parse(fileContent);

    // Import the data
    realm.write(() => {
      // Clear existing data
      realm.deleteAll();

      // Import videos
      importData.videos.forEach((videoData: ImportVideoData) => {
        realm.create('VideoData', {
          ...videoData,
          _id: new Realm.BSON.ObjectId(videoData._id),
          datetimeRecorded: new Date(videoData.datetimeRecorded),
        });
      });

      // Import video sets
      importData.videoSets.forEach((setData: ImportVideoSet) => {
        realm.create('VideoSet', {
          ...setData,
          _id: new Realm.BSON.ObjectId(setData._id),
          datetime: new Date(setData.datetime),
          earliestVideoDateTime: new Date(setData.earliestVideoDateTime),
          latestVideoDateTime: new Date(setData.latestVideoDateTime),
        });
      });
    });

    Alert.alert('Success', 'Database imported successfully!');
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code !== 'E_DOCUMENT_PICKER_CANCELED'
    ) {
      console.error('Import error:', error);
      Alert.alert(
        'Error',
        'Failed to import database. Please make sure the file is in the correct format.',
      );
    }
  }
};

const DataTransfer = () => {
  const realm = useRealm();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => exportDatabase(realm)}>
        <Text style={styles.buttonText}>Export Database to Text File</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => importDatabase(realm)}>
        <Text style={styles.buttonText}>Import Database from Text File</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF', // Using a standard iOS blue color instead of Styles.COLORS.PRIMARY
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DataTransfer;
