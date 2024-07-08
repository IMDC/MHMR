import React, {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
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
import {Button, Icon} from '@rneui/themed';
import {Dropdown} from 'react-native-element-dropdown';
import NetInfo from '@react-native-community/netinfo';

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
  const [generatedOutput, setGeneratedOutput] = useState('');
  const realm = useRealm();
  const [videoSet, setVideoSet] = useState(null);
  const [videoSetSummary, setVideoSetSummary] = useState('');
  const [transcriptsLoaded, setTranscriptsLoaded] = useState(false);
  const [transcriptEdited, setTranscriptEdited] = useState(false);
  const [reportFormat, setReportFormat] = useState('bullet');
  const [sentimentsGenerated, setSentimentsGenerated] = useState(false);
  const state = NetInfo.fetch();

  // useEffect to retrieve the video data of the selected video set
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
        setVideoSetSummary(currentVideoSet.summaryAnalysisBullet || '');
        setReportFormat(currentVideoSet.reportFormat || 'bullet');
      }
    }
  }, [isFocused, videoSetVideoIDs, realm, currentVideoSet]);

  useEffect(() => {
    const loadTranscripts = async () => {
      const videoTranscripts = await Promise.all(
        videos.map(async video => {
          // console.log('video.transcript', video.transcript);
          if (!video) {
            return null;
          }

          let sentimentLabel = video.sentiment;

          if (!sentimentLabel || sentimentLabel === 'Neutral') {
            sentimentLabel = await getSentimentFromChatGPT(
              video.transcript,
              realm,
              video._id.toString(),
            );
          }

          return {
            _id: video._id.toString(),
            title: video.title,
            filename: video.filename,
            keywords: video.keywords,
            locations: video.locations,
            transcript: video.transcript,
            tsOutputBullet: video.tsOutputBullet,
            tsOutputSentence: video.tsOutputSentence,
            sentiment: sentimentLabel,
          };
        }),
      );

      setVideos(videoTranscripts.filter(Boolean));
      setTranscriptsLoaded(true);
    };
    if (videos.length && !transcriptsLoaded) {
      loadTranscripts();
    }
  }, [videos, transcriptsLoaded]);

  // useEffect for when reportFormat is changed

  useEffect(() => {
    const updateVideoSetSummary = async () => {
      if (
        currentVideoSet &&
        transcriptsLoaded &&
        (transcriptEdited || videoSetSummary === '')
      ) {
        const summary = await sendVideoSetToChatGPT(
          realm,
          videoSetVideoIDs,
          currentVideoSet,
          reportFormat,
        );

        realm.write(() => {
          const videoSetToUpdate = realm.objectForPrimaryKey(
            'VideoSet',
            currentVideoSet._id,
          );
          videoSetToUpdate.summaryAnalysisSentence = summary[0];
          videoSetToUpdate.summaryAnalysisBullet = summary[1];
        });

        if (reportFormat === 'bullet') {
          setVideoSetSummary(summary[1]);
          console.log('videoSetSummary Bullet:', videoSetSummary);
        } else {
          setVideoSetSummary(summary[0]);
          console.log('videoSetSummary Sentence:', videoSetSummary);
        }
        setTranscriptEdited(false);
      }
    };

    updateVideoSetSummary();
  }, [
    transcriptsLoaded,
    transcriptEdited,
    videoSetSummary,
    currentVideoSet,
    videoSetVideoIDs,
    realm,
    reportFormat,
  ]);

  //useEffect for updating transcript
  // useEffect(() => {
  //   videos.map(async video => {
  //     if (!video) {
  //       return null;
  //     }
  //     const updatedTranscript = video.transcript[0] || '';
  //     // return {
  //     //   ...video,
  //   });
  // }, []);

  // useEffect(() => {
  //   const regenerateSummaries = async () => {
  //     if (currentVideoSet && transcriptsLoaded && !sentimentsGenerated) {
  //       const summary = await sendVideoSetToChatGPT(
  //         realm,
  //         videoSetVideoIDs,
  //         currentVideoSet,
  //         reportFormat,
  //       );

  //       realm.write(() => {
  //         const videoSetToUpdate = realm.objectForPrimaryKey(
  //           'VideoSet',
  //           currentVideoSet._id,
  //         );
  //         videoSetToUpdate.summaryAnalysis = summary;
  //       });

  //       setVideoSetSummary(summary);

  //       const updatedVideos = await Promise.all(
  //         videos.map(async video => {
  //           if (!video) {
  //             return null;
  //           }
  //           const updatedTranscript = video.transcript[0] || '';
  //           const keywords = video.keywords
  //             .map(key => JSON.parse(key))
  //             .map(obj => obj.title)
  //             .join(', ');
  //           const locations = video.locations
  //             .map(loc => JSON.parse(loc))
  //             .map(obj => obj.title)
  //             .join(', ');

  //           const summary = await sendToChatGPT(
  //             video.filename,
  //             updatedTranscript,
  //             keywords,
  //             locations,
  //             realm,
  //             video._id.toString(),
  //             reportFormat
  //           );

  //           return {
  //             ...video,
  //             gptTranscriptOutput: video.gptTranscriptOutput,
  //             sentiment: await getSentimentFromChatGPT(
  //               updatedTranscript,
  //               realm,
  //               video._id.toString(),
  //             ),
  //           };
  //         }),
  //       );

  //       setVideos(updatedVideos.filter(Boolean));
  //       setSentimentsGenerated(true);
  //     }
  //   };

  //   regenerateSummaries();
  // }, [reportFormat, sentimentsGenerated]);

  const handleEdit = video => {
    setEditingID(video._id);
    setDraftTranscript(video.transcript || '');
  };

  const handleSave = async () => {
    const updatedTranscript = draftTranscript;
    const sentimentLabel = await getSentimentFromChatGPT(
      updatedTranscript,
      realm,
      editingID,
    );

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
      reportFormat,
    );

    realm.write(() => {
      videoToUpdate.transcript = updatedTranscript;
      videoToUpdate.sentiment = sentimentLabel;
      videoToUpdate.tsOutputSentence = summary[0];
      videoToUpdate.tsOutputBullet = summary[1];
    });

    const updatedVideos = videos.map(video => {
      if (video._id === editingID) {
        return {
          ...video,
          transcript: updatedTranscript,
          sentiment: sentimentLabel,
          tsOutputBullet: summary[1],
          tsOutputSentence: summary[0],
        };
      }
      return video;
    });

    setVideos(updatedVideos);

    setEditingID(null);
    setDraftTranscript('');
    setTranscriptEdited(true);
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

  const [showTranscript, setShowTranscript] = useState({});

  const toggleTranscript = videoId => {
    setShowTranscript(prevState => ({
      ...prevState,
      [videoId]: !prevState[videoId],
    }));
  };

  // useEffect(() => {
  //   console.log('Video Set:', videoSet);
  //   console.log('Videos:', videos);
  // }, [videoSet, videos]);

  const [sentimentCounts, setSentimentCounts] = useState({
    veryPositive: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    veryNegative: 0,
  });

  // useEffecct for video set summary dentiment counter
  useEffect(() => {
    const counts = videos.reduce(
      (acc, video) => {
        if (!video) {
          return acc;
        }
        switch (video.sentiment) {
          case 'Very Positive':
            acc.veryPositive += 1;
            break;
          case 'Positive':
            acc.positive += 1;
            break;
          case 'Neutral':
            acc.neutral += 1;
            break;
          case 'Negative':
            acc.negative += 1;
            break;
          case 'Very Negative':
            acc.veryNegative += 1;
            break;
          default:
            break;
        }
        return acc;
      },
      {
        veryPositive: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        veryNegative: 0,
      },
    );

    setSentimentCounts(counts);
  }, [videos]);

  return (
    <ScrollView>
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select report format:</Text>
        <Dropdown
          style={styles.dropdown}
          data={[
            {label: 'Bullet points', value: 'bullet'},
            {label: 'Full sentences', value: 'sentence'},
          ]}
          labelField="label"
          valueField="value"
          placeholder="Select format"
          value={reportFormat}
          onChange={item => {
            setReportFormat(item.value);
            console.log('reportFormat:', item.value);
            if (currentVideoSet) {
              realm.write(() => {
                const videoSetToUpdate = realm.objectForPrimaryKey(
                  'VideoSet',
                  currentVideoSet._id,
                );
                videoSetToUpdate.reportFormat = item.value;
              });
            }
          }}
          selectedTextStyle={styles.dropdownItem}
        />
      </View>
      <View style={{padding: 10}}>
        <Text style={[styles.title, {textAlign: 'center'}]}>
          {videoSet?.name} - Video set summary
        </Text>
        <View
          style={{
            padding: 10,
          }}>
          <Text style={styles.output}>
            {reportFormat === 'bullet'
              ? currentVideoSet.summaryAnalysisBullet
              : currentVideoSet.summaryAnalysisSentence}
          </Text>
        </View>

        <View style={styles.sentimentCountsContainer}>
          <Text style={styles.sentimentCountsTitle}>
            Emotional distribution
          </Text>
          <Text style={styles.sentimentCount}>
            Very negative: {sentimentCounts.veryNegative}
          </Text>
          <Text style={styles.sentimentCount}>
            Negative: {sentimentCounts.negative}
          </Text>
          <Text style={styles.sentimentCount}>
            Neutral: {sentimentCounts.neutral}
          </Text>
          <Text style={styles.sentimentCount}>
            Positive: {sentimentCounts.positive}
          </Text>
          <Text style={styles.sentimentCount}>
            Very positive: {sentimentCounts.veryPositive}
          </Text>
        </View>
      </View>
      {videos.map(video => {
        if (!video) {
          return null;
        }
        return (
          <View key={video._id} style={styles.container}>
            <View style={{paddingBottom: 10, paddingHorizontal: 10}}>
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
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity
                      onPress={() => toggleTranscript(video._id)}>
                      <Text style={styles.transcriptLabel}>
                        Video transcript:
                      </Text>
                    </TouchableOpacity>
                    <Icon
                      name={
                        showTranscript[video._id]
                          ? 'keyboard-arrow-up'
                          : 'keyboard-arrow-down'
                      }
                      size={30}
                      onPress={() => toggleTranscript(video._id)}
                    />
                  </View>
                  {showTranscript[video._id] && (
                    <>
                      <Text style={styles.transcript}>{video.transcript}</Text>
                      <View style={{alignSelf: 'flex-end'}}>
                        <Button
                          radius={50}
                          title="Edit transcript"
                          onPress={() => handleEdit(video)}
                          color={Styles.MHMRBlue}
                        />
                      </View>
                    </>
                  )}
                </>
              )}
              <Text style={styles.output}>
                <Text style={styles.boldText}>Output: </Text>
                {/* if transcript is not generated yet, display Output not generated yet, else display transcript */}
                {video.tsOutputBullet === '' || video.tsOutputSentence === ''
                  ? 'Output has not been generated.'
                  : reportFormat === 'bullet'
                  ? video.tsOutputBullet
                  : video.tsOutputSentence}
              </Text>
              <Text style={styles.sentiment}>
                <Text style={styles.boldText}>Overall feeling: </Text>
                {video.sentiment}
                <Image
                  source={getEmojiForSentiment(video.sentiment)}
                  style={styles.emoji}
                />
              </Text>
            </View>
          </View>
        );
      })}
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
  transcriptLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
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
  dropdownContainer: {
    padding: 10,
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: 'black',
  },
  dropdown: {
    height: 40,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 8,
    marginBottom: 10,
    width: '100%',
    alignSelf: 'center',
  },
  dropdownItem: {
    textAlign: 'center',
    color: 'black',
  },
  sentimentCountsContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 20,
  },
  sentimentCountsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
  sentimentCount: {
    fontSize: 18,
    color: 'black',
    marginTop: 5,
  },
});

export default DataAnalysisTextSummary;
