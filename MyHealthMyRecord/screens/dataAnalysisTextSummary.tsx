import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import {useRealm} from '../models/VideoData';
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
import {useNetwork} from '../components/networkProvider';
import {useLoader} from '../components/loaderProvider';
import {transcribeWithWhisper} from '../components/stt_api';

const neutral = require('../assets/images/emojis/neutral.png');
const sad = require('../assets/images/emojis/sad.png');
const smile = require('../assets/images/emojis/smile.png');
const worried = require('../assets/images/emojis/worried.png');
const happy = require('../assets/images/emojis/happy.png');

const DataAnalysisTextSummary = () => {
  const {online} = useNetwork();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [videos, setVideos] = useState([]);
  const [editingID, setEditingID] = useState(null);
  const [draftTranscript, setDraftTranscript] = useState('');
  const {videoSetVideoIDs, currentVideoSet} = useDropdownContext();
  const [reportFormat, setReportFormat] = useState('bullet');
  const [videoSetSummary, setVideoSetSummary] = useState('');
  const [videosVisible, setVideosVisible] = useState(true);
  const [showTranscript, setShowTranscript] = useState({});
  const realm = useRealm();
  const {showLoader, hideLoader} = useLoader();

  const [sentimentCounts, setSentimentCounts] = useState({
    veryPositive: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    veryNegative: 0,
  });

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

  const toggleTranscript = videoId => {
    setShowTranscript(prev => ({...prev, [videoId]: !prev[videoId]}));
  };

  const handleEdit = video => {
    setEditingID(video._id);
    setDraftTranscript(video.transcript || '');
  };

  const handleSave = async () => {
    showLoader('Saving transcript...');
    const objectId = new Realm.BSON.ObjectId(editingID);
    const videoToUpdate = realm.objectForPrimaryKey('VideoData', objectId);
    const sentimentLabel = await getSentimentFromChatGPT(
      draftTranscript,
      realm,
      editingID,
    );
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
      draftTranscript,
      keywords,
      locations,
      realm,
      editingID,
      reportFormat,
    );
    realm.write(() => {
      videoToUpdate.transcript = draftTranscript;
      videoToUpdate.sentiment = sentimentLabel;
      videoToUpdate.tsOutputSentence = summary?.[0];
      videoToUpdate.tsOutputBullet = summary?.[1];
    });
    setVideos(prev =>
      prev.map(v =>
        v._id === editingID
          ? {...v, transcript: draftTranscript, sentiment: sentimentLabel}
          : v,
      ),
    );
    setEditingID(null);
    setDraftTranscript('');
    hideLoader();
  };

  const renderHeader = () => (
    <View>
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
          onChange={item => setReportFormat(item.value)}
          selectedTextStyle={styles.dropdownItem}
        />
      </View>

      <Text style={[styles.title, {textAlign: 'center'}]}>
        {currentVideoSet?.name || 'Video set summary'}
      </Text>
      <View style={{padding: 10}}>
        <Text style={styles.output}>{videoSetSummary}</Text>
      </View>

      <View style={styles.sentimentCountsContainer}>
        <Text style={styles.sentimentCountsTitle}>Emotional distribution</Text>
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
  );

  const renderItem = ({item: video}) => (
    <View key={video._id} style={styles.container}>
      <Text style={[styles.title, {fontSize: 28}]}>{video.title}</Text>

      {editingID === video._id ? (
        <View>
          <Text style={styles.transcriptLabel}>Video transcript:</Text>
          <TextInput
            style={styles.textInput}
            onChangeText={setDraftTranscript}
            value={draftTranscript}
            multiline
          />
          <View style={styles.buttonContainer}>
            <Button title="Save" onPress={handleSave} color={Styles.MHMRBlue} />
            <Button
              title="Cancel"
              onPress={() => setEditingID(null)}
              color={Styles.MHMRBlue}
            />
          </View>
        </View>
      ) : (
        <>
          <TouchableOpacity onPress={() => toggleTranscript(video._id)}>
            <Text style={styles.transcriptLabel}>Video transcript</Text>
            <Icon
              name={
                showTranscript[video._id]
                  ? 'keyboard-arrow-up'
                  : 'keyboard-arrow-down'
              }
              size={30}
            />
          </TouchableOpacity>
          {showTranscript[video._id] && (
            <Text style={styles.transcript}>{video.transcript}</Text>
          )}
          {online && (
            <Button
              title="Edit transcript"
              onPress={() => handleEdit(video)}
              color={Styles.MHMRBlue}
            />
          )}
        </>
      )}

      <Text style={styles.output}>
        <Text style={{fontWeight: 'bold'}}>Output:</Text>{' '}
        {reportFormat === 'sentence'
          ? video.tsOutputSentence
          : video.tsOutputBullet}
      </Text>

      <Text style={styles.sentiment}>
        Overall feeling: {video.sentiment}
        <Image
          source={getEmojiForSentiment(video.sentiment)}
          style={styles.emoji}
        />
      </Text>
    </View>
  );

  useEffect(() => {
    const getVideoData = async () => {
      const videoData = await Promise.all(
        videoSetVideoIDs.map(async id => {
          const objectId = new Realm.BSON.ObjectId(id);
          const video = realm.objectForPrimaryKey('VideoData', objectId);
          return video?.transcript !== undefined ? video : null;
        }),
      );
      const filtered = videoData.filter(Boolean);
      setVideos(filtered);

      // Update sentiment counts
      const counts = filtered.reduce(
        (acc, video) => {
          switch (video.sentiment) {
            case 'Very Positive':
              acc.veryPositive++;
              break;
            case 'Positive':
              acc.positive++;
              break;
            case 'Neutral':
              acc.neutral++;
              break;
            case 'Negative':
              acc.negative++;
              break;
            case 'Very Negative':
              acc.veryNegative++;
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
    };

    if (isFocused && currentVideoSet && videoSetVideoIDs.length) {
      getVideoData();
    }
  }, [isFocused, currentVideoSet, videoSetVideoIDs, realm]);

  return (
    <FlatList
      data={videosVisible ? videos.filter(Boolean) : []}
      keyExtractor={item => item._id}
      initialNumToRender={10}
      ListHeaderComponent={
        <View>
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
            {online && (
              <TouchableOpacity
                onPress={() => setRefreshSummary(!refreshSummary)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  opacity: 0.5,
                }}>
                <Text style={{color: 'black', fontSize: 16}}>
                  Refresh video set summary
                </Text>
                <Icon name="refresh-outline" type="ionicon" size={24} />
              </TouchableOpacity>
            )}
            <Text style={[styles.title, {textAlign: 'center'}]}>
              {currentVideoSet?.name
                ? `${currentVideoSet?.name} - Video set summary`
                : 'Video set summary'}
            </Text>
            <View style={{padding: 10}}>
              <Text style={styles.output}>
                {currentVideoSet?.summaryAnalysisBullet === '' ||
                currentVideoSet?.summaryAnalysisSentence === ''
                  ? 'Summary has not been generated yet.'
                  : reportFormat === 'bullet'
                  ? currentVideoSet?.summaryAnalysisBullet
                  : currentVideoSet?.summaryAnalysisSentence}
                <Text style={{fontWeight: 'bold'}}>
                  {!online && !currentVideoSet?.isSummaryGenerated
                    ? ' Your device is currently offline. Summary cannot be generated.'
                    : ''}
                </Text>
              </Text>
            </View>

            <View style={styles.sentimentCountsContainer}>
              <Text style={styles.sentimentCountsTitle}>
                Emotional distribution of video set
              </Text>
              {Object.entries(sentimentCounts).map(([label, count]) => (
                <Text key={label} style={styles.sentimentCount}>
                  {label.replace(/([A-Z])/g, ' $1')}: {count}
                </Text>
              ))}
            </View>

            <View
              style={{
                padding: 10,
                borderBottomColor: 'black',
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderTopColor: 'black',
                borderTopWidth: StyleSheet.hairlineWidth,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={[styles.title, {paddingHorizontal: 10}]}>
                Individual videos in video set
              </Text>
              <TouchableOpacity
                style={{flexDirection: 'row', alignSelf: 'center'}}
                onPress={() => setVideosVisible(!videosVisible)}>
                <Text>{videosVisible ? 'Hide' : 'Show'}</Text>
                <Icon
                  name={
                    videosVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
      renderItem={({item: video}) => (
        <View key={video._id} style={styles.container}>
          <View style={{paddingBottom: 10, paddingHorizontal: 10}}>
            <Text style={[styles.title, {fontSize: 28}]}>{video.title}</Text>

            {editingID === video._id ? (
              <>
                <Text style={styles.transcriptLabel}>Video transcript:</Text>
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
                  <TouchableOpacity onPress={() => toggleTranscript(video._id)}>
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
                  <View style={{flexDirection: 'row'}}>
                    <Text style={styles.transcript}>{video.transcript}</Text>
                    {online && (
                      <View
                        style={[
                          styles.buttonContainer,
                          {justifyContent: 'center'},
                        ]}>
                        <View style={styles.buttonWrapper}>
                          <Button
                            buttonStyle={{width: 150}}
                            radius={50}
                            title="Edit transcript"
                            onPress={() => handleEdit(video)}
                            color={Styles.MHMRBlue}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            <View style={{flexDirection: 'column'}}>
              <Text style={[styles.output, {fontWeight: 'bold'}]}>
                Video output:
              </Text>
              <Text style={styles.output}>
                {video.transcript === ''
                  ? 'Transcript has not been generated.'
                  : video.tsOutputSentence === '' || video.tsOutputBullet === ''
                  ? 'Output has not been generated.'
                  : reportFormat === 'sentence'
                  ? video.tsOutputSentence
                  : video.tsOutputBullet}
              </Text>
            </View>

            <Text style={styles.sentiment}>
              <Text style={{fontWeight: 'bold'}}>Overall feeling: </Text>
              {video.transcript === '' &&
              video.tsOutputBullet === '' &&
              video.tsOutputSentence === ''
                ? 'Neutral '
                : video.sentiment}
              <Image
                source={getEmojiForSentiment(video.sentiment)}
                style={styles.emoji}
              />
            </Text>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderTopColor: 'black',
    // borderTopWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 32,
    color: 'black',
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
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  transcriptLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  transcript: {
    fontSize: 20,
    color: 'black',
    marginBottom: 10,
    width: Dimensions.get('window').width - 200,
  },
  output: {
    fontSize: 20,
    color: 'black',
    marginTop: 5,
    flexDirection: 'column',
    marginBottom: 5,
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
