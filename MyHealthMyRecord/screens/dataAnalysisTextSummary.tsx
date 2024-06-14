import React, {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useRealm} from '../models/VideoData';
import RNFS from 'react-native-fs';
import {useDropdownContext} from '../components/videoSetProvider';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import * as Styles from '../assets/util/styles';
import {
  getSentimentFromChatGPT,
  sendToChatGPT,
  sendVideoSetToChatGPT,
} from '../components/chatgpt_api';
import {Button, Icon, Dialog} from '@rneui/themed';

const neutral = require('../assets/images/emojis/neutral.png');
const sad = require('../assets/images/emojis/sad.png');
const smile = require('../assets/images/emojis/smile.png');
const worried = require('../assets/images/emojis/worried.png');
const happy = require('../assets/images/emojis/happy.png');

const DataAnalysisTextSummary = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [videos, setVideos] = useState([]);
  const [editingID, setEditingID] = useState(null);
  const [draftTranscript, setDraftTranscript] = useState('');
  const {videoSetVideoIDs, currentVideoSet} = useDropdownContext();
  const realm = useRealm();
  const [videoSet, setVideoSet] = useState(null);
  const [videoSetSummary, setVideoSetSummary] = useState('');
  const [transcriptsLoaded, setTranscriptsLoaded] = useState(false);

  useEffect(() => {}, [currentVideoSet]);

  useEffect(() => {
    const getVideoData = async () => {
      const videoDataVideos = await Promise.all(
        videoSetVideoIDs.map(async videoID => {
          const objectId = new Realm.BSON.ObjectId(videoID);
          const video = realm.objectForPrimaryKey('VideoData', objectId);
          return video;
        }),
      );
      setVideos(videoDataVideos);
    };
    if (isFocused) {
      getVideoData();
      if (currentVideoSet) {
        setVideoSet(currentVideoSet);
      }
    }
  }, [isFocused, videoSetVideoIDs, realm, currentVideoSet]);

  useEffect(() => {
    const loadTranscripts = async () => {
      const videoTranscripts = await Promise.all(
        videos.map(async video => {
          const filePath = `${
            RNFS.DocumentDirectoryPath
          }/MHMR/transcripts/${video.filename.replace('.mp4', '.txt')}`;
          const fileExists = await RNFS.exists(filePath);

          let fileContent = '';
          if (fileExists) {
            fileContent = await RNFS.readFile(filePath, 'utf8');
          } else {
            fileContent = 'Transcript not available';
          }

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
            _id: video._id.toString(),
            title: video.title,
            filename: video.filename,
            keywords: video.keywords,
            locations: video.locations,
            transcript: video.transcript,
            transcriptFileContent: fileContent,
            checkedTitles,
            checkedLocations,
            sentiment: sentimentLabel,
          };
        }),
      );

      setVideos(videoTranscripts);
      setTranscriptsLoaded(true);
    };
    if (videos.length && !transcriptsLoaded) {
      loadTranscripts();
    }
  }, [videos, transcriptsLoaded]);

  useEffect(() => {
    const updateVideoSetSummary = async () => {
      if (transcriptsLoaded) {
        const summary = await sendVideoSetToChatGPT(
          realm,
          videoSetVideoIDs,
          currentVideoSet,
        );
        setVideoSetSummary(summary);
      }
    };

    updateVideoSetSummary();
  }, [transcriptsLoaded]);

  const handleEdit = video => {
    setEditingID(video._id);
    setDraftTranscript(video.transcript[0] || '');
  };

  const handleSave = async () => {
    const updatedTranscript = draftTranscript;
    const sentimentLabel = await getSentimentFromChatGPT(updatedTranscript);

    const objectId = new Realm.BSON.ObjectId(editingID);
    const videoToUpdate = realm.objectForPrimaryKey('VideoData', objectId);
    const keywords = videoToUpdate.keywords
      .map(key => JSON.parse(key))
      .map(obj => obj.title)
      .join(', ');
    const locations = videoToUpdate.locations
      .map(loc => JSON.parse(loc))
      .map(obj => obj.title)
      .join(', ');

    const summary = await sendToChatGPT(
      videoToUpdate.filename,
      updatedTranscript,
      keywords,
      locations,
      realm,
      editingID,
    );

    realm.write(() => {
      videoToUpdate.transcript = [updatedTranscript];
      videoToUpdate.sentiment = sentimentLabel;
      videoToUpdate.transcriptFileContent = summary;
    });

    const updatedVideos = videos.map(video => {
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

    const videoToUpdateAfterSave = updatedVideos.find(
      video => video._id === editingID,
    );
    if (videoToUpdateAfterSave) {
      const outputText = await sendToChatGPT(
        videoToUpdateAfterSave.filename,
        updatedTranscript,
        videoToUpdateAfterSave.checkedTitles,
        videoToUpdateAfterSave.checkedLocations,
        realm,
        editingID,
      );

      const finalUpdatedVideos = updatedVideos.map(video => {
        if (video._id === editingID) {
          return {
            ...video,
            transcriptFileContent: outputText,
          };
        }
        return video;
      });

      setVideos(finalUpdatedVideos);
    }

    setEditingID(null);
    setDraftTranscript('');
  };

  const handleCancel = () => {
    setEditingID(null);
    setDraftTranscript('');
  };

  const getEmojiForSentiment = sentiment => {
    switch (sentiment) {
      case 'Very Negative':
        return sad;
      case 'Negative':
        return worried;
      case 'Neutral':
        return neutral;
      case 'Positive':
        return smile;
      case 'Very Positive':
        return happy;
      default:
        return neutral;
    }
  };

  useEffect(() => {
    console.log('Video Set:', videoSet);
    console.log('Videos:', videos);
  }, [videoSet, videos]);

  return (
    <ScrollView>
      <View style={{padding: 10}}>
        <Text style={[styles.title, {textAlign: 'center'}]}>
          {videoSet?.name} - Video set summary
        </Text>
        <Text style={styles.output}>{videoSetSummary}</Text>
      </View>
      {videos.map(video => (
        <View key={video._id} style={styles.container}>
          <View style={{padding: 10}}>
            <Text style={styles.title}>{video.title}</Text>
            {editingID === video._id ? (
              <>
                <View style={{flexDirection: 'row'}}>
                  <TextInput
                    style={styles.textInput}
                    onChangeText={setDraftTranscript}
                    value={draftTranscript}
                    multiline
                  />
                  <View style={styles.buttonContainer}>
                    <View style={styles.buttonWrapper}>
                      <Button
                        radius={20}
                        title="Save"
                        onPress={handleSave}
                        color={Styles.MHMRBlue}
                      />
                    </View>
                    <View style={styles.buttonWrapper}>
                      <Button
                        radius={20}
                        title="Cancel"
                        onPress={handleCancel}
                        color={Styles.MHMRBlue}
                      />
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={{flexDirection: 'row'}}>
                  <View style={{flex: 1, justifyContent: 'flex-start'}}>
                    <Text style={styles.transcript}>
                      <Text style={styles.boldText}>Video transcript: </Text>
                      {video.transcript[0]}
                    </Text>
                  </View>

                  <View style={{alignSelf: 'flex-end'}}>
                    <Button
                      radius={50}
                      title="Edit transcript"
                      onPress={() => {
                        handleEdit(video), console.log('Edit button pressed');
                      }}
                      color={Styles.MHMRBlue}
                    />
                  </View>
                </View>
              </>
            )}
            <Text style={styles.output}>
              <Text style={styles.boldText}>Output: </Text>
              {video.transcriptFileContent}
            </Text>
            <Text style={styles.sentiment}>
              <Text style={styles.boldText}>Overall feeling: </Text>
              {video.sentiment}{' '}
              <Image
                source={getEmojiForSentiment(video.sentiment)}
                style={styles.emoji}
              />
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
    flex: 1,
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    width: 20,
    height: 20,
    marginLeft: 5,
  },
});

export default DataAnalysisTextSummary;
