import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import {useRealm} from '../../models/VideoData';
import {useDropdownContext} from '../../components/videoSetProvider';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import * as Styles from '../../assets/util/styles';
import {
  getSentimentFromChatGPT,
  sendToChatGPT,
  sendVideoSetToChatGPT,
} from '../../components/chatgpt_api';
import {Button, Icon} from '@rneui/themed';
import {Dropdown} from 'react-native-element-dropdown';
import {useNetwork} from '../../components/networkProvider';
import {useLoader} from '../../components/loaderProvider';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const sections = [{title: 'Individual videos in video set'}];

const neutral = require('../../assets/images/emojis/neutral.png');
const sad = require('../../assets/images/emojis/sad.png');
const smile = require('../../assets/images/emojis/smile.png');
const worried = require('../../assets/images/emojis/worried.png');
const happy = require('../../assets/images/emojis/happy.png');

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
  const [sentimentSort, setSentimentSort] = useState(null);
  const realm = useRealm();
  const {showLoader, hideLoader} = useLoader();
  const [refreshSummary, setRefreshSummary] = useState(false);
  const previousVideoSetVideoIDsRef = useRef<Set<string>>(
    new Set(videoSetVideoIDs),
  );
  const [sentimentCounts, setSentimentCounts] = useState({
    veryNegative: 0,
    negative: 0,
    neutral: 0,
    positive: 0,
    veryPositive: 0,
  });

  const [openSections, setOpenSections] = React.useState<string[]>([]);

  const sortData = [
    {label: 'All', value: 'all'},
    {label: 'Very Negative', value: 'Very Negative'},
    {label: 'Negative', value: 'Negative'},
    {label: 'Neutral', value: 'Neutral'},
    {label: 'Positive', value: 'Positive'},
    {label: 'Very Positive', value: 'Very Positive'},
  ];

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections(prevOpenSections =>
      prevOpenSections.includes(section)
        ? prevOpenSections.filter(s => s !== section)
        : [...prevOpenSections, section],
    );
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

  const getFilteredVideos = () => {
    if (!sentimentSort || sentimentSort === 'all') {
      return videos;
    }
    return videos.filter(video => video.sentiment === sentimentSort);
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

  useEffect(() => {
    const updateVideoSetSummary = async () => {
      if (online && currentVideoSet) {
        const previousVideoSetVideoIDs = previousVideoSetVideoIDsRef.current;
        const newVideosAdded = videoSetVideoIDs.some(
          videoID => !previousVideoSetVideoIDs.has(videoID),
        );

        if (
          currentVideoSet.isSummaryGenerated === false ||
          newVideosAdded ||
          refreshSummary
        ) {
          showLoader('Generating video set summary...');
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
            if (videoSetToUpdate) {
              videoSetToUpdate.summaryAnalysisSentence = summary[0];
              videoSetToUpdate.summaryAnalysisBullet = summary[1];
            }
          });

          if (reportFormat === 'bullet') {
            setVideoSetSummary(summary[1]);
            console.log('videoSetSummary Bullet:', summary[1]);
          } else {
            setVideoSetSummary(summary[0]);
            console.log('videoSetSummary Sentence:', summary[0]);
          }

          hideLoader();
        }
        previousVideoSetVideoIDsRef.current = new Set(videoSetVideoIDs);
        setRefreshSummary(false);
      }
    };

    updateVideoSetSummary();
  }, [
    currentVideoSet,
    videoSetVideoIDs,
    realm,
    reportFormat,
    online,
    refreshSummary,
  ]);

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

      // Sort videos by datetimeRecorded (earliest to latest)
      const sortedVideos = filtered.sort(
        (a, b) => a.datetimeRecorded.getTime() - b.datetimeRecorded.getTime(),
      );

      setVideos(sortedVideos);

      // Update sentiment counts
      const counts = sortedVideos.reduce(
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
      data={videosVisible ? getFilteredVideos().filter(Boolean) : []}
      keyExtractor={item => item._id}
      initialNumToRender={10}
      ListEmptyComponent={
        videosVisible && (
          <View style={{padding: 20, alignItems: 'center'}}>
            <Text style={{fontSize: 20, color: 'black'}}>
              {sentimentSort && sentimentSort !== 'all'
                ? `No ${sentimentSort.toLowerCase()} videos found.`
                : 'No videos found.'}
            </Text>
          </View>
        )
      }
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
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.sentimentCount}>
                  Very Negative: {sentimentCounts.veryNegative}
                </Text>
                <Image
                  source={getEmojiForSentiment('Very Negative')}
                  style={styles.emoji}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.sentimentCount}>
                  Negative: {sentimentCounts.negative}
                </Text>
                <Image
                  source={getEmojiForSentiment('Negative')}
                  style={styles.emoji}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.sentimentCount}>
                  Neutral: {sentimentCounts.neutral}
                </Text>
                <Image
                  source={getEmojiForSentiment('Neutral')}
                  style={styles.emoji}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.sentimentCount}>
                  Positive: {sentimentCounts.positive}
                </Text>
                <Image
                  source={getEmojiForSentiment('Positive')}
                  style={styles.emoji}
                />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.sentimentCount}>
                  Very Positive: {sentimentCounts.veryPositive}
                </Text>
                <Image
                  source={getEmojiForSentiment('Very Positive')}
                  style={styles.emoji}
                />
              </View>
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
              <Text style={[styles.title]}>Individual videos in video set</Text>
              <TouchableOpacity
                style={{flexDirection: 'row', alignSelf: 'center'}}
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  );
                  setVideosVisible(!videosVisible);
                }}>
                <Text>{videosVisible ? 'Hide' : 'Show'}</Text>
                <Icon
                  name={
                    videosVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                  }
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderBottomColor: 'black',
                borderBottomWidth: StyleSheet.hairlineWidth,
                flexDirection: 'row',
                width: '100%',
                // marginVertical: 5,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  width: '25%',
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: 'black',
                }}>
                Filter by feeling:
              </Text>
              <Dropdown
                data={sortData}
                maxHeight={300}
                style={{
                  width: '75%',
                  backgroundColor: '#DBDBDB',
                  borderRadius: 22,
                  paddingHorizontal: 20,
                }}
                dropdownPosition="top"
                placeholderStyle={{fontSize: 20}}
                selectedTextStyle={{fontSize: 20}}
                itemTextStyle={{textAlign: 'center'}}
                labelField="label"
                valueField="value"
                value={sentimentSort}
                placeholder="All"
                onChange={item => {
                  setSentimentSort(item.value);
                }}
              />
            </View>
          </View>
        </View>
      }
      renderItem={({item: video}) => (
        <View key={video._id} style={styles.container}>
          <View style={{paddingBottom: 10, paddingHorizontal: 10}}>
            <Text style={[styles.title, {fontSize: 28}]}>{video.title}</Text>
            <Text style={{fontSize: 20}}>
              {video.datetimeRecorded.toLocaleString()}
            </Text>

            <View>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  );
                  toggleTranscript(video._id);
                }}>
                <Text style={styles.transcriptLabel}>Video transcript:</Text>

                <Icon
                  name={
                    showTranscript[video._id]
                      ? 'keyboard-arrow-up'
                      : 'keyboard-arrow-down'
                  }
                  size={30}
                />
              </TouchableOpacity>
            </View>

            {showTranscript[video._id] && (
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.transcript}>{video.transcript}</Text>
              </View>
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
              <Text> </Text>
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
  date: {
    fontSize: 16, // Smaller font size for the date
    color: 'gray', // Less bold color
    marginTop: 5, // Add some spacing between title and date
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
    paddingHorizontal: 10,
    paddingTop: 2,
    paddingBottom: 5,
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
    color: 'black',
  },
  dropdown: {
    height: 35,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 8,
    marginBottom: 5,
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
