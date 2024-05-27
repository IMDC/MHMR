import React, {useEffect, useState} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useRealm, useQuery} from '../models/VideoData';
import RNFS from 'react-native-fs';
import {useDropdownContext} from '../components/videoSetProvider';
import {useNavigation, useRoute, useIsFocused} from '@react-navigation/native';
import * as Styles from '../assets/util/styles';
import { getSentimentFromChatGPT, sendToChatGPT } from '../components/chatgpt_api';

const DataAnalysisTextSummary = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [videos, setVideos] = useState([]);
  const [editingID, setEditingID] = useState(null);
  const [draftTranscript, setDraftTranscript] = useState('');
  const { videoSetVideoIDs, selectedVideoSet } = useDropdownContext();
  const realm = useRealm();


  useEffect(() => {
    const getVideoData = async () => {
      const videoDataVideos = await Promise.all(
        videoSetVideoIDs.map(async (videoID) => {
          const objectId = new Realm.BSON.ObjectId(videoID);
          const video = realm.objectForPrimaryKey('VideoData', objectId);
          return video;
        }),
      );
      setVideos(videoDataVideos);
    };
    if (isFocused) {
      getVideoData();
    }
  }, [isFocused, videoSetVideoIDs, realm]);

  useEffect(() => {
    const loadTranscripts = async () => {
      const videoTranscripts = await Promise.all(
        videos.map(async (video) => {
          const filePath = `${RNFS.DocumentDirectoryPath}/MHMR/transcripts/${video.filename.replace('.mp4', '.txt')}`;
          const fileExists = await RNFS.exists(filePath);

          let fileContent = '';
          if (fileExists) {
            fileContent = await RNFS.readFile(filePath, 'utf8');
          } else {
            fileContent = 'Transcript not available';
          }

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

          const sentimentLabel = await getSentimentFromChatGPT(fileContent);

          return {
            ...video.toJSON(), // Convert Realm object to plain JS object
            transcriptFileContent: fileContent,
            checkedTitles,
            checkedLocations,
            sentiment: sentimentLabel,
          };
        }),
      );

      setVideos(videoTranscripts);
    };

    if (videos.length) {
      loadTranscripts();
    }
  }, [videos]);

  const handleEdit = (video) => {
    setEditingID(video._id);
    setDraftTranscript(video.transcript[0] || '');
  };

  const handleSave = async () => {
    const updatedTranscript = draftTranscript;
    const sentimentLabel = await getSentimentFromChatGPT(updatedTranscript);

    const videoToUpdate = realm.objectForPrimaryKey('VideoData', editingID);
    const keywords = videoToUpdate.keywords.map(key => JSON.parse(key)).map(obj => obj.title).join(', ');
    const locations = videoToUpdate.locations.map(loc => JSON.parse(loc)).map(obj => obj.title).join(', ');

    const summary = await sendToChatGPT(videoToUpdate.filename, updatedTranscript, keywords, locations, realm, editingID);

    realm.write(() => {
      videoToUpdate.transcript = [updatedTranscript];
      videoToUpdate.sentiment = sentimentLabel;
      videoToUpdate.transcriptFileContent = summary;
    });

    const updatedVideos = videos.map((video) => {
      if (video._id === editingID) {
        return {
          ...video,
          transcript: [updatedTranscript],
          sentiment: sentimentLabel,
          transcriptFileContent: summary,
        };
      }
      return video;
    });

    setVideos(updatedVideos);
    setEditingID(null);
    setDraftTranscript('');
  };

  const handleCancel = () => {
    setEditingID(null);
    setDraftTranscript('');
  };

  return (
    <ScrollView>
      <View style={{ padding: 10 }}>
        <Text style={[styles.title, { textAlign: 'center' }]}>{selectedVideoSet.name} - Video Set Summary</Text>
        <Text style={styles.output}>{selectedVideoSet.summaryAnalysis}</Text>
      </View>
      {videos.map((video) => (
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
              <Text style={styles.boldText}>Overall Feeling: </Text>
              {video.sentiment}
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
    color: 'black',
    marginTop: 10,
  },
});

export default DataAnalysisTextSummary;