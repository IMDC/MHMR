import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Button } from 'react-native';
import { useRealm, useQuery } from '../models/VideoData';
import RNFS from 'react-native-fs';
import * as Styles from '../assets/util/styles';
import Sentiment from 'sentiment';

const DataAnalysisTextSummary = () => {
  const [videos, setVideos] = useState([]);
  const [editingID, setEditingID] = useState(null);
  const [draftTranscript, setDraftTranscript] = useState('');

  const realm = useRealm();
  const videoData = useQuery('VideoData');
  const videosByIsSelected = videoData.filtered('isSelected == true').snapshot();
  const sentiment = new Sentiment();

  useEffect(() => {
    const loadTranscripts = async () => {
      const videoTranscripts = await Promise.all(
        videosByIsSelected.map(async video => {
          const filePath = `${RNFS.DocumentDirectoryPath}/MHMR/transcripts/${video.filename.replace('.mp4', '.txt')}`;
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

          const result = sentiment.analyze(fileContent);
          const sentimentScore = result.score;
          let sentimentLabel = 'Neutral';
          if (sentimentScore > 0) sentimentLabel = 'Positive';
          else if (sentimentScore < 0) sentimentLabel = 'Negative';

          return {
            ...video.toJSON(), // Convert Realm object to plain JS object
            transcriptFileContent: fileContent,
            checkedTitles,
            checkedLocations,
            sentiment: sentimentLabel,
            sentimentScore: result.score,
            sentimentComparative: result.comparative
          };
        }),
      );

      setVideos(videoTranscripts);
    };

    loadTranscripts();
  }, []);

  const handleEdit = (video) => {
    setEditingID(video._id);
    setDraftTranscript(video.transcript[0]);
  };

  const handleSave = () => {
    const updatedVideos = videos.map(video => {
      if (video._id === editingID) {
        return { ...video, transcript: [draftTranscript] };
      }
      return video;
    });

    realm.write(() => {
      const videoToUpdate = realm.objectForPrimaryKey('VideoData', editingID);
      videoToUpdate.transcript = [draftTranscript];
    });

    setVideos(updatedVideos);
    setEditingID(null);
  };

  const handleCancel = () => {
    setEditingID(null);
    setDraftTranscript('');
  };

  return (
    <ScrollView>
      {videos.map(video => (
        <View key={video._id} style={styles.container}>
          <View style={{ padding: 10 }}>
            <Text style={styles.title}>{video.title}</Text>
            {editingID === video._id ? (
              <>
                <TextInput
                  style={styles.textInput}
                  onChangeText={setDraftTranscript}
                  value={draftTranscript}
                  multiline
                />
                <View style={styles.buttonContainer}>
                  <View style={styles.buttonWrapper}>
                    <Button title="Save" onPress={handleSave} color={Styles.MHMRBlue} />
                  </View>
                  <View style={styles.buttonWrapper}>
                    <Button title="Cancel" onPress={handleCancel} color={Styles.MHMRBlue} />
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.transcript}>
                  <Text style={styles.boldText}>Video Transcript: </Text>
                  {video.transcript[0]}
                </Text>
                <Button title="Edit" onPress={() => handleEdit(video)} color={Styles.MHMRBlue} />
              </>
            )}
            <Text style={styles.output}>
              <Text style={styles.boldText}>Output: </Text>
              {video.transcriptFileContent}
            </Text>
            <Text style={styles.sentiment}>
              <Text style={styles.boldText}>Sentiment: </Text>
              {video.sentiment} (Score: {video.sentimentScore})
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'black',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 32,
    color: 'black',
    marginBottom: 10,
  },
  textInput: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  transcript: {
    fontSize: 20,
    color: 'black',
    marginBottom: 10,
  },
  output: {
    fontSize: 20,
    color: 'black',
    marginTop: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  sentiment: {
    fontSize: 20,
    color: 'green',
    marginTop: 10,
  },
});

export default DataAnalysisTextSummary;