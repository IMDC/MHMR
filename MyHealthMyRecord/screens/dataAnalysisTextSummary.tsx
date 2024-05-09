import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRealm, useQuery} from '../models/VideoData';
import RNFS from 'react-native-fs';

const DataAnalysisTextSummary = () => {

  const [videos, setVideos] = useState([]);
  let counter = 0;
  const realm = useRealm();
  const videoData = useQuery('VideoData');
  const videosByIsSelected = videoData
    .filtered('isSelected == true')
    .snapshot();

  useEffect(() => {
    const loadTranscripts = async () => {
      const videoTranscripts = await Promise.all(
        videosByIsSelected.map(async video => {
          const filePath = `${
            RNFS.DocumentDirectoryPath
          }/MHMR/transcripts/${video.filename.replace('.mp4', '.txt')}`;
          const fileContent = await RNFS.readFile(filePath, 'utf8');

          // Process keywords and locations
          const checkedTitles = video.keywords
            .map(key => JSON.parse(key))
            .filter(obj => obj.checked)
            .map(obj => obj.title)
            .join(', ');

          const checkedLocations = video.locations
            .map(loc => JSON.parse(loc))
            .filter(obj => obj.checked)
            .map(obj => obj.title)
            .join(', ');

          return {
            ...video.toJSON(), // Convert Realm object to plain JS object
            transcriptFileContent: fileContent,
            checkedTitles,
            checkedLocations,
          };
        }),
      );

      setVideos(videoTranscripts);
    };

    loadTranscripts();
  }, []);

  return (
    <ScrollView>
      {videos !== null
        ? videos.map(video => (
            <View key={video._id} style={styles.container}>
              <View style={{padding: 5}}>
                <Text
                  style={{fontWeight: 'bold', fontSize: 32, color: 'black'}}>
                  {video.title}
                </Text>
                <Text style={{fontSize: 20, color: 'black'}}>
                  <Text style={{fontWeight: 'bold'}}>Video Transcript: </Text>
                  {video.transcript[0]}
                </Text>
                <Text style={{fontSize: 20, color: 'black'}}>
                  <Text style={{fontWeight: 'bold'}}>Output: </Text>
                  {video.transcriptFileContent}
                </Text>
              </View>
            </View>
          ))
        : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
    padding: 8,
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'black',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default DataAnalysisTextSummary;
