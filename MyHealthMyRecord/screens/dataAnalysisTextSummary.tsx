import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRealm, useQuery} from '../models/VideoData';
import RNFS from 'react-native-fs';

const DataAnalysisTextSummary = () => {
  const outputSummary = [
    "The student recounts an incident from yesterday's class where the professor was explaining something at the beginning. Despite raising their hand to contribute, the professor dismissed it, claiming there was nothing to discuss. When the student asked the professor to speak louder, the professor said it was not possible. The professor then suggested the student move to the front, which the student couldn't do. This left the student shocked, and despite expressing their inability to comply, the professor indicated they were stuck and couldn't do much about it.",
    "The participant is expressing frustration with the malfunctioning automatic doors at University X. They highlight the doors' weight, making it difficult to push, and criticizes others for not offering assistance despite witnessing their struggle. This lack of assistance is seen as inconsiderate and rude by the participant, who feels they are left to deal with the problem on their own.", "The participant is discussing their experience in an evening class focused on the wheelchair manufacturer industry. They express discomfort with their professor repeatedly singling them out during discussions, specifically asking them personal questions like 'What does PX feel like?' The participant feels being in a wheelchair shouldn't warrant such spotlighting. They intend to address the issue with the professor via email."
  ];

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
      {videos.map(video => (
        <View key={video._id} style={styles.container}>
          <View style={{padding: 5}}>
            <Text style={{fontWeight: 'bold', fontSize: 32, color: 'black'}}>
              {video.title}
            </Text>
            {/* <Text style={{fontSize: 20, color: 'black'}}>
              <Text style={{fontWeight: 'bold'}}>Input:</Text>
              {` "Summarize this video transcript (${video.transcript}) and include the summary of the keywords (${video.checkedTitles}) and locations (${video.checkedLocations}) tagged."`}
            </Text> */}
            <Text style={{fontSize: 20, color: 'black'}}>
              <Text style={{fontWeight: 'bold'}}>Output:</Text>
              {` ${outputSummary[counter++]}`}
              {/* {` ${video.transcriptFileContent}`} */}
            </Text>
          </View>
        </View>
      ))}
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
