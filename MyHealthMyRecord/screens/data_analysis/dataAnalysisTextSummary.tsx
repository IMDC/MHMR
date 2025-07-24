import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
  FlatList,
} from 'react-native';
import {useRealm} from '../../models/VideoData';
import {useDropdownContext} from '../../providers/videoSetProvider';
import {
  useIsFocused,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import * as Styles from '../../assets/util/styles';
import {
  getSentimentFromChatGPT,
  sendToChatGPT,
  sendVideoSetToChatGPT,
} from '../../services/chatgpt_api';
import {Button, Icon} from '@rneui/themed';
import {Dropdown} from 'react-native-element-dropdown';
import {useNetwork} from '../../providers/networkProvider';
import {useLoader} from '../../providers/loaderProvider';
import {BSON} from 'realm';
import {PieChart} from 'react-native-gifted-charts';

// Define types for video and context
interface Video {
  _id: string;
  title: string;
  datetimeRecorded: Date;
  transcript: string;
  tsOutputSentence: string;
  tsOutputBullet: string;
  sentiment: string;
  keywords: string[];
  locations: string[];
  filename: string;
}

interface VideoSet {
  _id: string;
  name: string;
  summaryAnalysisSentence: string;
  summaryAnalysisBullet: string;
  isSummaryGenerated: boolean;
  reportFormat?: string;
}

interface DropdownContext {
  videoSetVideoIDs: string[];
  currentVideoSet: VideoSet | null;
}

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
  const route =
    useRoute<RouteProp<Record<string, {filterVideoId?: string}>, string>>();
  const filterVideoId = (route.params as {filterVideoId?: string} | undefined)
    ?.filterVideoId;
  const isFocused = useIsFocused();
  const [videos, setVideos] = useState<Video[]>([]);
  const [editingID, setEditingID] = useState<string | null>(null);
  const [draftTranscript, setDraftTranscript] = useState('');
  const {videoSetVideoIDs, currentVideoSet} =
    useDropdownContext() as DropdownContext;
  const [reportFormat, setReportFormat] = useState<'bullet' | 'sentence'>(
    'bullet',
  );
  const [videoSetSummary, setVideoSetSummary] = useState('');
  const [videosVisible, setVideosVisible] = useState(true);
  const [showTranscript, setShowTranscript] = useState<{
    [key: string]: boolean;
  }>({});
  const [sentimentSort, setSentimentSort] = useState<string | null>(null);
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
  const [selectedSliceIndex, setSelectedSliceIndex] = useState<number | null>(
    null,
  );

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

  const getEmojiForSentiment = (sentiment: string) => {
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

  const toggleTranscript = (videoId: string) => {
    setShowTranscript(prev => ({...prev, [videoId]: !prev[videoId]}));
  };

  const handleEdit = (video: Video) => {
    setEditingID(video._id);
    setDraftTranscript(video.transcript || '');
  };

  const handleSave = async () => {
    if (!editingID) return;
    showLoader('Saving transcript...');
    const objectId = new BSON.ObjectId(editingID);
    const videoToUpdate = realm.objectForPrimaryKey(
      'VideoData',
      objectId,
    ) as Video;
    const sentimentLabel = await getSentimentFromChatGPT(
      draftTranscript,
      realm,
      editingID,
    );
    const keywords = videoToUpdate.keywords
      .map((key: string) => JSON.parse(key))
      .map((obj: {title: string}) => obj.title)
      .join(', ');
    const locations = videoToUpdate.locations
      .map((loc: string) => JSON.parse(loc))
      .map((obj: {title: string}) => obj.title)
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
    let filtered = videos;

    // Filter by specific video ID if provided
    if (filterVideoId) {
      filtered = filtered.filter(
        (video: Video) => video._id.toString() === filterVideoId,
      );
    }

    // Filter by sentiment if selected
    if (sentimentSort && sentimentSort !== 'all') {
      filtered = filtered.filter(
        (video: Video) => video.sentiment === sentimentSort,
      );
    }

    return filtered;
  };
  useEffect(() => {
    const updateVideoSetSummary = async () => {
      if (online && currentVideoSet) {
        const previousVideoSetVideoIDs = previousVideoSetVideoIDsRef.current;
        const newVideosAdded = videoSetVideoIDs.some(
          (videoID: string) => !previousVideoSetVideoIDs.has(videoID),
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
            ) as VideoSet;
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
        videoSetVideoIDs.map(async (id: string) => {
          const objectId = new BSON.ObjectId(id);
          const video = realm.objectForPrimaryKey(
            'VideoData',
            objectId,
          ) as Video | null;
          return video?.transcript !== undefined ? video : null;
        }),
      );
      const filtered = videoData.filter(Boolean) as Video[];

      // Sort videos by datetimeRecorded (earliest to latest)
      const sortedVideos = filtered.sort(
        (a: Video, b: Video) =>
          b.datetimeRecorded.getTime() - a.datetimeRecorded.getTime(),
      );

      setVideos(sortedVideos);

      // Update sentiment counts
      const counts = sortedVideos.reduce(
        (acc: typeof sentimentCounts, video: Video) => {
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

  useEffect(() => {
    if (filterVideoId && isFocused) {
      setTimeout(() => {
        // @ts-ignore - FlatList is not defined in this scope
        // This line was removed from the new_code, so it's commented out.
        // If FlatList is meant to be used, it needs to be imported or defined.
        // For now, removing it as per the new_code.
      }, 300); // wait for render
    }
  }, [filterVideoId, isFocused, videos]);

  const pieData = [
    {
      value: sentimentCounts.veryNegative,
      color: '#c44601',
      text: 'Very Negative',
    },
    {value: sentimentCounts.negative, color: '#f57600', text: 'Negative'},
    {value: sentimentCounts.neutral, color: '#9e9e9e', text: 'Neutral'},
    {value: sentimentCounts.positive, color: '#5ba300', text: 'Positive'},
    {
      value: sentimentCounts.veryPositive,
      color: '#054fb9',
      text: 'Very Positive',
    },
  ];
  const total = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <ScrollView>
      {/* Report format dropdown and summary section */}
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
            setReportFormat(item.value as 'bullet' | 'sentence');
            if (currentVideoSet) {
              realm.write(() => {
                const videoSetToUpdate = realm.objectForPrimaryKey(
                  'VideoSet',
                  currentVideoSet._id,
                ) as VideoSet;
                videoSetToUpdate.reportFormat = item.value;
              });
            }
          }}
          selectedTextStyle={styles.dropdownItem}
        />
      </View>

      <View style={styles.raisedContainer}>
        <Text style={[styles.title, {textAlign: 'left'}]}>
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
              ? (() => {
                  const summary = currentVideoSet?.summaryAnalysisBullet;
                  if (!summary) return null;
                  // Split into bullet points (by newlines or bullet chars)
                  const bullets = summary
                    .split(/\n|•/)
                    .filter(b => b.trim() !== '');
                  return (
                    <Text>
                      {bullets.map((bullet, idx) => {
                        // Remove leading/trailing whitespace and bullet char
                        const cleanBullet = bullet
                          .trim()
                          .replace(/^[-*•\d.\s]+/, '');
                        // Find first comma or period, whichever comes first
                        const commaIdx = cleanBullet.indexOf(',');
                        const periodIdx = cleanBullet.indexOf('.');
                        let splitIdx = -1;
                        if (commaIdx === -1 && periodIdx === -1) {
                          splitIdx = -1;
                        } else if (commaIdx === -1) {
                          splitIdx = periodIdx;
                        } else if (periodIdx === -1) {
                          splitIdx = commaIdx;
                        } else {
                          splitIdx = Math.min(commaIdx, periodIdx);
                        }
                        return (
                          <Text key={idx}>
                            {'\u2022 '} {/* bullet character */}
                            {splitIdx !== -1 ? (
                              <>
                                <Text style={{fontWeight: 'bold'}}>
                                  {cleanBullet.slice(0, splitIdx + 1)}
                                </Text>
                                {cleanBullet.slice(splitIdx + 1)}
                              </>
                            ) : (
                              <Text style={{fontWeight: 'bold'}}>
                                {cleanBullet}
                              </Text>
                            )}
                            {idx < bullets.length - 1 ? '\n\n' : ''}
                          </Text>
                        );
                      })}
                    </Text>
                  );
                })()
              : currentVideoSet?.summaryAnalysisSentence}
            <Text style={{fontWeight: 'bold'}}>
              {!online && !currentVideoSet?.isSummaryGenerated
                ? ' Your device is currently offline. Summary cannot be generated.'
                : ''}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.raisedContainer}>
        <Text style={styles.sentimentCountsTitle}>
          Emotional distribution of video set
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {/* Labels and counts */}
          <View style={{flex: 0.7}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: '#c44601',
                  marginRight: 8,
                }}
              />
              <Text style={styles.sentimentCount}>
                Very Negative: {sentimentCounts.veryNegative}
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: '#f57600',
                  marginRight: 8,
                }}
              />
              <Text style={styles.sentimentCount}>
                Negative: {sentimentCounts.negative}
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: '#9e9e9e',
                  marginRight: 8,
                }}
              />
              <Text style={styles.sentimentCount}>
                Neutral: {sentimentCounts.neutral}
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: '#5ba300',
                  marginRight: 8,
                }}
              />
              <Text style={styles.sentimentCount}>
                Positive: {sentimentCounts.positive}
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: '#054fb9',
                  marginRight: 8,
                }}
              />
              <Text style={styles.sentimentCount}>
                Very Positive: {sentimentCounts.veryPositive}
              </Text>
            </View>
          </View>
          {/* Pie chart */}
          <View style={{flex: 1.3, alignItems: 'flex-end'}}>
            <PieChart
              data={pieData}
              textSize={12}
              radius={95}
              innerRadius={48}
              focusOnPress={true}
              // showValuesAsLabels
              // labelsPosition="outward"
              showTextBackground
              textBackgroundRadius={18}
              textBackgroundColor="#00000055"
              onPress={(item: any, index: number) =>
                setSelectedSliceIndex(index)
              }
              centerLabelComponent={() => {
                if (
                  selectedSliceIndex !== null &&
                  pieData[selectedSliceIndex] &&
                  total > 0
                ) {
                  const percent = (
                    (pieData[selectedSliceIndex].value / total) *
                    100
                  ).toFixed(1);
                  const emotion = pieData[selectedSliceIndex].text;
                  return (
                    <View style={{alignItems: 'center'}}>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: pieData[selectedSliceIndex].color,
                        }}>
                        {percent}%
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: 'bold',
                          color: pieData[selectedSliceIndex].color,
                        }}>
                        {emotion}
                      </Text>
                    </View>
                  );
                }
                return (
                  <Text style={{fontSize: 13, fontWeight: 'bold'}}>
                    Emotions
                  </Text>
                );
              }}
            />
          </View>
        </View>
      </View>

      {/* Individual videos in video set section - all in one container */}
      <View style={styles.raisedContainer}>
        <View
          style={{
            padding: 10,
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
              name={videosVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            />
          </TouchableOpacity>
        </View>
        {/* Only show filter dropdown and video list if videosVisible is true */}
        {videosVisible ? (
          <>
            <View
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderTopColor: 'black',
                borderTopWidth: StyleSheet.hairlineWidth,
                borderBottomColor: 'black',
                borderBottomWidth: StyleSheet.hairlineWidth,
                flexDirection: 'row',
                width: '100%',
                // alignItems: 'center',
              }}>
              <Text
                style={{
                  textAlign: 'left',
                  justifyContent: 'center',
                  alignSelf: 'center',

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
                value={sentimentSort || 'all'}
                placeholder="All"
                onChange={item => {
                  setSentimentSort(item.value as string | null);
                }}
              />
            </View>
            {getFilteredVideos().length > 0 ? (
              getFilteredVideos().map(video => (
                <View key={video._id} style={styles.container}>
                  <View style={{paddingBottom: 10}}>
                    <Text style={[styles.title, {fontSize: 26}]}>
                      {video.title}
                    </Text>
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
                        <Text style={styles.transcriptLabel}>
                          Video transcript:
                        </Text>
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
                        <Text style={styles.transcript}>
                          {video.transcript}
                        </Text>
                      </View>
                    )}
                    <View style={{flexDirection: 'column'}}>
                      <Text style={[styles.output, {fontWeight: 'bold'}]}>
                        Video output:
                      </Text>
                      <Text style={styles.output}>
                        {video.transcript === ''
                          ? 'Transcript has not been generated.'
                          : video.tsOutputSentence === '' ||
                            video.tsOutputBullet === ''
                          ? 'Output has not been generated.'
                          : reportFormat === 'sentence'
                          ? video.tsOutputSentence
                          : video.tsOutputBullet}
                      </Text>
                    </View>
                    <Text style={styles.sentiment}>
                      <Text style={{fontWeight: 'bold'}}>
                        Overall feeling:{' '}
                      </Text>
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
              ))
            ) : (
              <View style={{padding: 20, alignItems: 'center'}}>
                <Text style={{fontSize: 20, color: 'black'}}>
                  {sentimentSort && sentimentSort !== 'all'
                    ? `No ${sentimentSort.toLowerCase()} videos found.`
                    : 'No videos found.'}
                </Text>
              </View>
            )}
          </>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  raisedContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
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
    fontSize: 16,
    color: 'gray',
    marginTop: 5,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
    marginBottom: 10,
  },
  sentimentCount: {
    fontSize: 18,
    color: 'black',
    marginTop: 5,
  },
});

export default DataAnalysisTextSummary;
