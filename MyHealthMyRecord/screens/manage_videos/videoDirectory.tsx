import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import {ReturnCode} from 'ffmpeg-kit-react-native';

import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  LogBox,
  ScrollView,
  StyleSheet,
  Touchable,
} from 'react-native';
import {View, TouchableOpacity, Text, useWindowDimensions} from 'react-native';
import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type {PropsWithChildren} from 'react';
import Video from 'react-native-video';
import Realm from 'realm';
import {VideoData, useQuery, useRealm} from '../../models/VideoData';
import RNFS from 'react-native-fs';
import {Button, Icon, Dialog} from '@rneui/themed';
import {Chip, Tooltip} from 'react-native-paper';
import {Dropdown, MultiSelect} from 'react-native-element-dropdown';
import {CheckBox} from '@rneui/themed';
import useAddToFile from '../../components/addToFile';
import {base64} from 'rfc4648';
const worried = require('../../assets/images/emojis/worried.png');
import Config from 'react-native-config';
import NetInfo from '@react-native-community/netinfo';
import {useNetwork} from '../../components/networkProvider';
import {getAuth, getTranscript} from '../../components/stt_api';
import {sendToChatGPT} from '../../components/chatgpt_api';
import {useDropdownContext} from '../../components/videoSetProvider';
import {useLoader} from '../../components/loaderProvider';
import {processVideos} from '../../components/processVideos';
import {windowWidth, MHMRBlue} from '../../assets/util/styles';
import {
  detectCrisisContent,
  generateCrisisWarning,
  getCrisisResourcesText,
  CrisisDetectionResult,
} from '../../components/crisisDetection';

const ViewRecordings = ({selected, setSelected}) => {
  const {showLoader, hideLoader} = useLoader();
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [videoSelectedFilename, setvideoSelectedFilename] = useState('');
  const [videoSelectedData, setVideoSelectedData] = useState<any | VideoData>(
    '',
  );
  const [doesVideoNeedAnalysis, setDoesVideoNeedAnalysis] = useState(false);
  // 1 = send to current video set, 2 = send to new video set

  const [visible, setVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [crisisWarningVisible, setCrisisWarningVisible] = useState(false);
  const [crisisDetectionResult, setCrisisDetectionResult] =
    useState<CrisisDetectionResult | null>(null);

  const handleProcessVideos = async () => {
    await processVideos(realm, videos, showLoader, hideLoader, false);
  };

  const {
    handleChange,
    videoSetValue,
    setVideoSetValue,
    sendToVideoSet,
    setSendToVideoSet,
    videoSetVideoIDs,
    isVideoSetSaved,
  } = useDropdownContext();

  async function handleDeleteVideo(
    videoSelectedData: VideoData,
    videoSelectedFilename: string,
  ) {
    const videoSetNames = isVideoInAnySet(videoSelectedData);
    if (videoSetNames.length !== 0) {
      Alert.alert(
        'Video already in set(s)',
        'Please remove the videos from video sets first. This video is already in the following video set(s):\n\n' +
          videoSetNames.join('\n'),
      );
    } else {
      Alert.alert(
        'Are you sure you want to delete this video?',
        "These videos will be deleted immediately. You can't undo this action.",
        [
          {
            text: 'YES',
            onPress: () => {
              deleteVideo(videoSelectedData, videoSelectedFilename);
            },
          },
          {text: 'NO', onPress: () => console.log('NO Pressed')},
        ],
      );
      Alert.alert(
        'Are you sure you want to delete this video?',
        "These videos will be deleted immediately. You can't undo this action.",
        [
          {
            text: 'YES',
            onPress: () => {
              deleteVideo(videoSelectedData, videoSelectedFilename);
            },
          },
          {text: 'NO', onPress: () => console.log('NO Pressed')},
        ],
      );
    }
  }

  async function handleSendToDashboard(selectedVideos: Set<string>) {
    const state = await NetInfo.fetch();

    let doesVideoNeedAnalysis = false;

    // Iterate through selected video IDs and check if any video needs analysis
    for (const id of selectedVideos) {
      const video = realm
        .objects<VideoData>('VideoData')
        .find(video => video._id.toHexString() === id);

      if (video && !video.isConverted) {
        doesVideoNeedAnalysis = true;
        break; // Stop iteration as soon as an unconverted video is found
      }
    }

    if (state.isConnected && doesVideoNeedAnalysis) {
      toggleDialog2();
    } else if (
      !state.isConnected ||
      (state.isConnected && !doesVideoNeedAnalysis)
    ) {
      navigation.navigate('Dashboard', {
        screen: 'Video Set Dashboard',
        params: {selectedVideos},
      });
      Alert.alert(
        'Added to Video Set',
        'Your videos have been added to the video set!',
      );
      handleSend('NO');
    }
  }

  const [inputText, setInputText] = useState('');

  //handleSend just adds videos to video set
  async function handleSend(answer) {
    const state = await NetInfo.fetch();
    setSelectedVideos(selected);

    setSelected(true);
    setSelectedVideos(new Set());
    setCheckedVideos(new Set());

    if (state.isConnected && answer === 'YES') {
      console.log('Online and connected');
    } else if (state.isConnected && answer === 'NO') {
      console.log('Online and connected, NO clicked');
    } else {
      console.log('Offline and disconnected');
    }
  }
  // useAddToFile(selectedVideos);

  const toggleDialog = () => {
    setVisible(!visible);
  };

  const toggleDialog1 = () => {
    setVisible1(!visible1);
  };

  const toggleDialog2 = () => {
    setVisible2(!visible2);
    console.log('visible2:', visible2);
  };

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [videos, setVideos] = useState<any | null>(null);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const scrollRef: any = useRef();

  let onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const viewData = [
    {label: 'List', value: 1},
    {label: 'Grid', value: 2},
  ];

  const sortData = [
    {label: 'Date', value: 1},
    {label: 'Name', value: 2},
    {label: 'Keyword', value: 3},
    {label: 'Location', value: 4},
    {label: 'Emotion', value: 5},
  ];

  const oldestNewestData = [
    {label: 'Newest to oldest', value: 1},
    {label: 'Oldest to newest', value: 2},
  ];

  const weekdayData = [
    {label: 'Sunday', value: 'Sun'},
    {label: 'Monday', value: 'Mon'},
    {label: 'Tuesday', value: 'Tue'},
    {label: 'Wednesday', value: 'Wed'},
    {label: 'Thursday', value: 'Thu'},
    {label: 'Friday', value: 'Fri'},
    {label: 'Saturday', value: 'Sat'},
  ];

  const keywordData = [
    {label: 'None', value: 1},
    {label: 'Chronic', value: 2},
    {label: 'Weak', value: 3},
    {label: 'Depression', value: 4},
    {label: 'Pain', value: 5},
    {label: 'Fever', value: 6},
    {label: 'Wellness', value: 7},
  ];

  const nameData = [
    {label: 'A-Z', value: 1},
    {label: 'Z-A', value: 2},
  ];

  const locationData = [
    {label: 'Home', value: 1},
    {label: 'Work', value: 2},
    {label: 'School', value: 3},
    {label: 'Park', value: 4},
    {label: 'Indoors', value: 5},
    {label: 'Outdoors', value: 6},
  ];

  const emotionData = [
    {label: 'Smile', value: 1},
    {label: 'Neutral', value: 2},
    {label: 'Worried', value: 3},
    {label: 'Sad', value: 4},
    {label: 'Angry', value: 5},
  ];

  const sentimentImages = {
    smile: require('../../assets/images/emojis/smile.png'),
    neutral: require('../../assets/images/emojis/neutral.png'),
    worried: require('../../assets/images/emojis/worried.png'),
    sad: require('../../assets/images/emojis/sad.png'),
    angry: require('../../assets/images/emojis/angry.png'),
  };

  const [sortValue, setSortValue] = useState(null);
  const [oldestNewestValue, setOldestNewestValue] = useState(null);
  const [weekdayValue, setWeekdayValue] = useState([]);
  const [keywordValue, setKeywordValue] = useState<any[]>([]);
  const [locationValue, setLocationValue] = useState([]);
  const [emotionValue, setEmotionValue] = useState([]);
  const [nameValue, setNameValue] = useState(null);
  const [viewValue, setViewValue] = useState(1);

  const [showDropDown, setShowDropDown] = useState(false);

  const realm = useRealm();
  const videoData: any = useQuery('VideoData');
  const videosByDate = videoData.sorted('datetimeRecorded', true);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const isVideoInSet = (video: VideoData) => {
    const video_id = video._id.toHexString(); // Convert the video ID to a string
    return videoSetVideoIDs.indexOf(video_id) !== -1; // Check if the video ID is in the video set
  };

  //checks if video is in a set at all, and list the name of the sets
  const isVideoInAnySet = (video: VideoData) => {
    const video_id = video._id.toHexString(); // Convert the video ID to a string
    const videoSets = realm.objects('VideoSet');
    let videoSetNames = [];
    videoSets.forEach((videoSet: any) => {
      if (videoSet.videoIDs.indexOf(video_id) !== -1) {
        videoSetNames.push(videoSet.name);
      }
    });
    return videoSetNames;
  };

  const deleteAllVideoDataObjects = async () => {
    //delete videos from storage
    const MHMRfiles = RNFS.readDir(MHMRfolderPath);
    (await MHMRfiles).map(f => {
      console.log(
        f.name,
        f.size,
        f.path,
        f.isFile(),
        f.isDirectory(),
        f.ctime,
        f.mtime,
      );
      if (f.isFile()) {
        var path = MHMRfolderPath + '/' + f.name;
        return (
          RNFS.unlink(path)
            .then(() => {
              console.log('FILE DELETED FROM STORAGE');
            })
            // `unlink` will throw an error, if the item to unlink does not exist
            .catch(err => {
              console.log(err.message);
            })
        );
      }
    });

    //delete from db
    realm.write(() => {
      realm.delete(videoData);
      console.log('FILES DELETED FROM DB');
    });
  };

  const deleteVideo = (deleteableVideo: VideoData, filename: string) => {
    var path = MHMRfolderPath + '/' + filename;
    var audioFileName = filename.replace('.mp4', '.wav');
    var audioPath = MHMRfolderPath + '/audio/' + audioFileName;
    //delete from storage
    return (
      RNFS.unlink(path)
        .then(() => {
          console.log('FILE DELETED FROM STORAGE');
          RNFS.unlink(audioPath)
            .then(() => {
              console.log('AUDIO FILE DELETED FROM STORAGE');
            })
            .catch(err => {
              console.log(err.message);
            });
          realm.write(() => {
            realm.delete(deleteableVideo);
            console.log('FILE DELETED FROM DB');
          });
        })

        // `unlink` will throw an error, if the item to unlink does not exist
        .catch(err => {
          console.log(err.message);
        })
    );
  };

  const [checkedVideos, setCheckedVideos] = React.useState(new Set());

  const toggleVideoChecked = (videoId: any) => {
    const updatedCheckedVideos = new Set(checkedVideos);

    if (updatedCheckedVideos.has(videoId)) {
      updatedCheckedVideos.delete(videoId);
    } else {
      updatedCheckedVideos.add(videoId);
    }

    setCheckedVideos(updatedCheckedVideos);
  };

  useEffect(() => {
    LogBox.ignoreLogs([
      'Warning: Each child in a list should have a unique "key" prop.',
    ]);
  }, []);

  //when selected = true, setSelectedVideos to be an empty set and uncheck all boxes

  //create a useeffect that when selected = true, log teh status of selected in console
  useEffect(() => {
    setSelectedVideos(new Set());
    setCheckedVideos(new Set());
  }, [selected]);

  useEffect(() => {
    {
      setVideos(videosByDate);
      // console.log(videoData
      // useAddToFile(selectedVideos);
      // console.log('selectedVideos:', selectedVideos);
    }
  }, []);

  onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const renderSelectedItem = (
    item: {
      label:
        | string
        | number
        | boolean
        | React.ReactElement<any, string | React.JSXElementConstructor<any>>
        | React.ReactFragment
        | React.ReactPortal
        | null
        | undefined;
    },
    unSelect: (arg0: any) => any,
  ) => {
    return (
      <View>
        <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
          <View
            style={{
              paddingHorizontal: 5,
              paddingBottom: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Chip textStyle={{fontSize: 20}} icon={'close'} mode="outlined">
              {item.label}
            </Chip>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      {selected ? (
        <View></View>
      ) : (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: 'center',
            marginBottom: 10,
            zIndex: 100,
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <Button
              disabled={
                videoSetVideoIDs === undefined ||
                isVideoSetSaved === false ||
                (videoSetVideoIDs.length === 0 &&
                  (videoSetValue == null || videoSetValue.length === 0))
              }
              style={{
                backgroundColor: MHMRBlue,
                padding: 20,
                borderRadius: 5,
                paddingHorizontal: 10,
              }}
              radius={50}
              buttonStyle={[styles.btnStyle]}
              // onPress={handleSend}>
              onPress={() => {
                setSendToVideoSet(1);
                handleSendToDashboard(selectedVideos);
              }}>
              <Text style={{color: 'white', fontSize: 18}}>
                Add {selectedVideos.size} video(s) to current video set
              </Text>
            </Button>
            <View style={{width: 10}}></View>
            <Button
              style={{backgroundColor: MHMRBlue, padding: 20, borderRadius: 5}}
              radius={50}
              buttonStyle={[styles.btnStyle, {}]}
              // onPress={handleSend}>
              onPress={async () => {
                // 2 means send to new video set
                setSendToVideoSet(2);
                handleSendToDashboard(selectedVideos);
              }}>
              <Text style={{color: 'white', fontSize: 18}}>
                Create new video set
              </Text>
            </Button>
          </View>
        </View>
      )}
      <View>
        <Dialog isVisible={visible2} onBackdropPress={toggleDialog2}>
          <Dialog.Title title="You are about to send your videos to the video set." />
          <Text style={{fontSize: 18}}>
            Would you like to analyze these videos? If you click NO you will
            still have the option to analyze it later.
          </Text>
          <View style={{paddingHorizontal: 20}}>
            <Dialog.Actions>
              <Dialog.Button
                title="NO"
                onPress={async () => {
                  console.log('NO clicked!');
                  await handleSend('NO');
                  toggleDialog2();
                  navigation.navigate('Dashboard', {
                    screen: 'Video Set Dashboard',
                    params: {selectedVideos},
                  });
                  Alert.alert(
                    'Video transcripts generated',
                    'Your transcripts have been generated, and your videos have been added to the video set!',
                  );
                  setDoesVideoNeedAnalysis(false);
                }}
              />
              <Dialog.Button
                title="YES"
                onPress={async () => {
                  console.log('YES clicked!');
                  toggleDialog2();
                  navigation.navigate('Dashboard', {
                    screen: 'Video Set Dashboard',
                    params: {selectedVideos},
                  });

                  await handleSend('YES');
                  await handleProcessVideos();

                  Alert.alert(
                    'Video transcripts generated and analyzed',
                    'Your transcripts have been generated and analyzed, and your videos have been added to the video set!',
                  );
                  setDoesVideoNeedAnalysis(false);
                }}
              />
            </Dialog.Actions>
          </View>
        </Dialog>
        <Dialog isVisible={visible} onBackdropPress={toggleDialog}>
          <Dialog.Title title="Are you sure you want to delete all videos?" />
          <Text style={{fontSize: 20}}>
            These videos will be deleted immediately. You can't undo this
            action.
          </Text>
          <Dialog.Actions>
            <Dialog.Button
              title="Delete"
              onPress={() => {
                deleteAllVideoDataObjects();
                console.log('delete all videos');
              }}
            />
            <Dialog.Button title="Cancel" onPress={() => toggleDialog()} />
          </Dialog.Actions>
        </Dialog>
        <Dialog isVisible={visible} onBackdropPress={toggleDialog}>
          <Dialog.Title title="Are you sure you want to delete all videos?" />
          <Text style={{fontSize: 20}}>
            These videos will be deleted immediately. You can't undo this
            action.
          </Text>
          <Dialog.Actions>
            <Dialog.Button
              title="Delete"
              onPress={() => {
                deleteAllVideoDataObjects();
              }}
            />
            <Dialog.Button title="Cancel" onPress={() => toggleDialog()} />
          </Dialog.Actions>
        </Dialog>

        <Dialog isVisible={visible1} onBackdropPress={toggleDialog1}>
          <Dialog.Title title="Are you sure you want to delete this video?" />
          <Text style={{fontSize: 20}}>
            This item will be deleted immediately. You can't undo this action.
          </Text>
          <Dialog.Actions>
            <Dialog.Button
              title="Delete"
              onPress={() => {
                handleDeleteVideo(videoSelectedData, videoSelectedFilename);
              }}
            />
            <Dialog.Button title="Cancel" onPress={() => toggleDialog1()} />
          </Dialog.Actions>
        </Dialog>

        <Dialog
          isVisible={crisisWarningVisible}
          onBackdropPress={() => setCrisisWarningVisible(false)}>
          <Dialog.Title title="⚠️ Crisis Warning" />
          <Text style={styles.crisisWarningText}>
            {crisisDetectionResult &&
              generateCrisisWarning(crisisDetectionResult)}
          </Text>
          <Text style={styles.crisisResourcesText}>
            {getCrisisResourcesText()}
          </Text>
          <Dialog.Actions>
            <Dialog.Button
              title="I UNDERSTAND"
              onPress={() => setCrisisWarningVisible(false)}
            />
          </Dialog.Actions>
        </Dialog>

        <ScrollView style={{marginTop: 5}} ref={scrollRef}>
          <TouchableOpacity
            style={{alignItems: 'center'}}
            onPress={toggleDialog}></TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
            }}>
            <View style={{flexDirection: 'row', width: '50%'}}>
              <Text
                style={{
                  textAlign: 'center',
                  width: '35%',
                  paddingTop: 5,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                View as:
              </Text>

              <Dropdown
                data={viewData}
                maxHeight={300}
                style={{
                  width: '65%',
                }}
                placeholderStyle={styles.dropdownText}
                selectedTextStyle={styles.dropdownText}
                itemTextStyle={{textAlign: 'center'}}
                labelField="label"
                valueField="value"
                value={viewValue}
                onChange={item => {
                  setViewValue(item.value);
                  console.log(item.value);
                }}
              />
            </View>
            <View style={{flexDirection: 'row', width: '50%'}}>
              <Text
                style={{
                  textAlign: 'center',
                  width: '35%',
                  paddingTop: 5,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                Sort by:
              </Text>
              <Dropdown
                data={sortData}
                maxHeight={300}
                style={{width: '65%'}}
                placeholderStyle={styles.dropdownText}
                selectedTextStyle={styles.dropdownText}
                itemTextStyle={{textAlign: 'center'}}
                labelField="label"
                valueField="value"
                value={sortValue}
                onChange={item => {
                  setSortValue(item.value);
                  console.log(item.value);
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}>
              {sortValue !== null && (
                <>
                  <View style={{flexDirection: 'row', width: '100%'}}>
                    {/* Sorts by date */}
                    <View
                      style={{
                        flexDirection: 'column',
                        alignContent: 'space-between',
                        width: '17.5%',
                      }}>
                      <Text
                        style={{
                          textAlign: 'center',
                          width: '100%',
                          paddingTop: 5,
                          fontSize: 18,
                          paddingRight: 10,
                          fontWeight: 'bold',
                        }}>
                        Filter by:
                      </Text>
                      <Text
                        style={{
                          textAlign: 'center',
                          width: '100%',
                          paddingTop: 5,
                          fontSize: 18,
                          fontWeight: 'bold',
                        }}>
                        Filters:
                      </Text>
                    </View>
                    <View style={{flexDirection: 'column', width: '100%'}}>
                      {sortValue == 1 && (
                        <MultiSelect
                          data={weekdayData}
                          maxHeight={300}
                          style={styles.sortValueStyle}
                          placeholder="Select weekday(s)"
                          placeholderStyle={styles.dropdownText}
                          selectedTextStyle={styles.dropdownText}
                          itemTextStyle={{textAlign: 'center'}}
                          labelField="label"
                          valueField="value"
                          value={weekdayValue}
                          onChange={selectedItems => {
                            console.log('selectedItems', selectedItems);
                            setWeekdayValue(selectedItems);

                            if (selectedItems.length === 0) {
                              setVideos(videosByDate);
                            } else {
                              // Map selected item label
                              const selectedWeekdayLabels = selectedItems.map(
                                item => {
                                  const selectedWeekday = weekdayData.find(
                                    item => item.value === selectedItems[0],
                                  );
                                  return selectedWeekday
                                    ? selectedWeekday.value
                                    : '';
                                },
                              );
                              console.log(
                                'Selected Weekday Labels:',
                                selectedWeekdayLabels,
                              );

                              // Filter videos based on selected weekday values
                              const filteredVideos = videoData.filter(
                                (video: {weekday: string}) => {
                                  return selectedWeekdayLabels.includes(
                                    video.weekday,
                                  );
                                },
                              );

                              console.log('Filtered Videos:', filteredVideos);
                              setVideos(filteredVideos);
                            }
                          }}
                          renderSelectedItem={renderSelectedItem}
                        />
                      )}
                      {sortValue == 2 && (
                        <Dropdown
                          data={nameData}
                          maxHeight={1000}
                          style={styles.sortValueStyle}
                          placeholder="Select order"
                          placeholderStyle={styles.dropdownText}
                          selectedTextStyle={styles.dropdownText}
                          itemTextStyle={{textAlign: 'center'}}
                          labelField="label"
                          valueField="value"
                          value={nameValue}
                          onChange={item => {
                            setNameValue(item.value);
                            if (item.value === 1) {
                              setVideos(videoData.sorted('title', false));
                            } else {
                              setVideos(videoData.sorted('title', true));
                            }
                          }}
                        />
                      )}

                      {sortValue == 3 && (
                        <MultiSelect
                          data={keywordData}
                          maxHeight={1000}
                          placeholder="Select keyword(s)"
                          style={styles.sortValueStyle}
                          placeholderStyle={styles.dropdownText}
                          selectedTextStyle={styles.dropdownText}
                          itemTextStyle={{textAlign: 'center'}}
                          labelField="label"
                          valueField="value"
                          value={keywordValue}
                          onChange={selectedItems => {
                            console.log('selectedItems', selectedItems);
                            setKeywordValue(selectedItems);

                            if (selectedItems.length === 0) {
                              setVideos(videosByDate);
                            } else if (
                              selectedItems.length === 1 &&
                              selectedItems[0] == 1
                            ) {
                              console.log('None selected');

                              // Filter videos that have at least one keyword annotated
                              const filteredVideos = videoData.filter(
                                (video: {keywords: any[]}) => {
                                  return !video.keywords.some((key: string) => {
                                    return JSON.parse(key).checked;
                                  });
                                },
                              );

                              setVideos(filteredVideos);
                            } else {
                              // Create an array of selected keyword values
                              const selectedKeywordValues = selectedItems.map(
                                item => item,
                              );
                              console.log(
                                'Selected Keyword Values:',
                                selectedKeywordValues,
                              );

                              // Filter videos based on selected keyword values and labels
                              const filteredVideos = videoData.filter(
                                (video: {keywords: any[]}) => {
                                  // Check if any of the selected keyword values match the video's keyword values
                                  return selectedKeywordValues.some(value => {
                                    return video.keywords.some(
                                      (keyword: string) => {
                                        const parsedKeyword =
                                          JSON.parse(keyword);
                                        return (
                                          parsedKeyword.value === value &&
                                          parsedKeyword.checked === true
                                        );
                                      },
                                    );
                                  });
                                },
                              );

                              console.log('Filtered Videos:', filteredVideos);

                              setVideos(filteredVideos);
                            }
                          }}
                          renderSelectedItem={renderSelectedItem}
                        />
                      )}
                      {sortValue == 4 && (
                        <MultiSelect
                          data={locationData}
                          maxHeight={1000}
                          placeholder="Select location(s)"
                          style={styles.sortValueStyle}
                          placeholderStyle={styles.dropdownText}
                          selectedTextStyle={styles.dropdownText}
                          itemTextStyle={{textAlign: 'center'}}
                          labelField="label"
                          valueField="value"
                          value={locationValue}
                          onChange={selectedItems => {
                            console.log('selectedItems', selectedItems);
                            setLocationValue(selectedItems);

                            if (selectedItems.length === 0) {
                              setVideos(videosByDate);
                            } else {
                              const selectedLocationValues = selectedItems.map(
                                item => item,
                              );
                              console.log(
                                'Selected Location Values:',
                                selectedLocationValues,
                              );

                              const filteredVideos = videoData.filter(
                                (video: {locations: any[]}) => {
                                  return selectedLocationValues.some(value => {
                                    return video.locations.some(
                                      (location: string) => {
                                        const parsedLocation =
                                          JSON.parse(location);
                                        return (
                                          parsedLocation.value === value &&
                                          parsedLocation.checked === true
                                        );
                                      },
                                    );
                                  });
                                },
                              );
                              setVideos(filteredVideos);
                            }
                          }}
                          renderSelectedItem={renderSelectedItem}
                        />
                      )}
                      {sortValue == 5 && (
                        <MultiSelect
                          data={emotionData}
                          palceholder="Select emotion(s)"
                          maxHeight={1000}
                          style={styles.sortValueStyle}
                          placeholderStyle={styles.dropdownText}
                          selectedTextStyle={styles.dropdownText}
                          itemTextStyle={{textAlign: 'center'}}
                          labelField="label"
                          valueField="value"
                          value={emotionValue}
                          onChange={selectedItems => {
                            console.log('selectedItems', selectedItems);
                            setEmotionValue(selectedItems);

                            if (selectedItems.length === 0) {
                              setVideos(videosByDate);
                            } else {
                              // Map selected item values to labels
                              const selectedEmotionLabels = selectedItems.map(
                                value => {
                                  const selectedEmotion = emotionData.find(
                                    item => item.value === value,
                                  );
                                  return selectedEmotion
                                    ? selectedEmotion.label
                                    : '';
                                },
                              );
                              console.log(
                                'Selected Emotion Labels:',
                                selectedEmotionLabels,
                              );

                              const filteredVideos = videoData.filter(
                                (video: {emotionStickers: any[]}) => {
                                  return selectedEmotionLabels.some(label => {
                                    return video.emotionStickers.some(
                                      (emotion: string) => {
                                        const parsedEmotion =
                                          JSON.parse(emotion);
                                        console.log(
                                          'test:',
                                          parsedEmotion.sentiment === label,
                                        );
                                        return (
                                          parsedEmotion.sentiment.toLowerCase() ===
                                          label.toLowerCase()
                                        );
                                      },
                                    );
                                  });
                                },
                              );
                              setVideos(filteredVideos);
                            }
                          }}
                          alwaysRenderSelectedItem={renderSelectedItem}
                        />
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={[viewValue == 1 ? null : styles.gridContainer]}>
            {videos !== null
              ? videos.map((video: VideoData) => {
                  const displayedSentiments = new Set(); // Create a Set to keep track of displayed sentiments
                  const sentimentCounts = {}; // Create an object to keep track of sentiment counts
                  const isChecked = checkedVideos.has(video._id.toString());
                  video.emotionStickers.forEach((key: string) => {
                    const sentiment = JSON.parse(key).sentiment;

                    if (!sentimentCounts[sentiment]) {
                      sentimentCounts[sentiment] = 1; // Initialize the count if not found
                    } else {
                      sentimentCounts[sentiment]++; // Increment the count
                    }
                  });

                  const isTranscriptEmpty = (video: VideoData) => {
                    return (
                      video.transcript === undefined || video.transcript === ''
                    );
                  };

                  const transcriptIsEmpty = isTranscriptEmpty(video);

                  return (
                    <View
                      style={[viewValue == 1 ? null : styles.gridItem]}
                      key={video._id.toString()}>
                      <View
                        style={[
                          viewValue == 1
                            ? styles.container
                            : {justifyContent: 'flex-end'},
                        ]}>
                        <View
                          style={[
                            viewValue == 1
                              ? styles.thumbnail
                              : styles.gridThumbnail,
                          ]}>
                          <ImageBackground
                            style={{
                              height: '100%',
                              width: '100%',
                              justifyContent: 'center',
                              alignItems: 'center',
                              overflow: 'hidden',
                            }}
                            source={{
                              uri:
                                'file://' +
                                MHMRfolderPath +
                                '/' +
                                video.filename,
                            }}>
                            {selected ? (
                              <View></View>
                            ) : (
                              <View
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  justifyContent: 'flex-start',
                                  alignItems: 'flex-start',
                                }}>
                                {isVideoInSet(video) ? ( // Check if video is in the video set
                                  <View
                                    style={{
                                      backgroundColor: 'rgba(52, 52, 52, 0.4)',
                                      borderRadius: 15,
                                      marginLeft: 6,
                                    }}>
                                    <Text
                                      style={{
                                        color: 'white',
                                        fontSize: 18,
                                        padding: 2,
                                        paddingHorizontal: 5,
                                      }}>
                                      Video already in set.
                                    </Text>
                                  </View>
                                ) : (
                                  <CheckBox
                                    uncheckedColor="white"
                                    checked={isChecked}
                                    size={25}
                                    onPress={() => {
                                      const updatedSelectedVideos = new Set(
                                        selectedVideos,
                                      );
                                      if (!isChecked) {
                                        toggleVideoChecked(
                                          video._id.toString(),
                                        );
                                        updatedSelectedVideos.add(
                                          video._id.toHexString(),
                                        );
                                        setSelectedVideos(
                                          updatedSelectedVideos,
                                        );

                                        realm.write(() => {
                                          video.isSelected = true;
                                        });

                                        console.log(
                                          'checked',
                                          video.isSelected,
                                        );
                                        console.log(
                                          'converted status',
                                          video.filename,
                                          video.isConverted,
                                        );
                                      } else {
                                        toggleVideoChecked(
                                          video._id.toString(),
                                        );
                                        updatedSelectedVideos.delete(
                                          video._id.toHexString(),
                                        );
                                        setSelectedVideos(
                                          updatedSelectedVideos,
                                        );
                                        realm.write(() => {
                                          video.isSelected = false;
                                        });
                                      }
                                    }}
                                    wrapperStyle={{
                                      backgroundColor: 'transparent',
                                    }}
                                    containerStyle={{
                                      backgroundColor: 'rgba(52, 52, 52, 0.4)',
                                      // opacity: 1,
                                      borderRadius: 15,
                                      marginLeft: 6,
                                    }}
                                  />
                                )}
                              </View>
                            )}
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate('Fullscreen Video', {
                                  id: video._id,
                                })
                              }>
                              <Icon
                                reverse
                                name="play-sharp"
                                type="ionicon"
                                color={MHMRBlue}
                                size={20}
                              />
                            </TouchableOpacity>
                          </ImageBackground>
                        </View>
                        <View
                          style={[
                            {flex: 1, flexDirection: 'column'},
                            viewValue == 1
                              ? styles.rightContainer
                              : styles.bottomContainer,
                            {justifyContent: 'space-between'},
                          ]}>
                          <View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  fontSize: 24,
                                  color: 'black',
                                  fontWeight: 'bold',
                                }}>
                                {video.title}
                              </Text>

                              {video.textComments.length !== 0 ? (
                                <Icon
                                  name="chatbox-ellipses"
                                  type="ionicon"
                                  color="black"
                                  size={22}
                                  style={{
                                    alignSelf: 'flex-start',
                                    paddingLeft: 5,
                                  }}
                                />
                              ) : null}

                              {video.flagged_for_harm ? (
                                <TouchableOpacity
                                  onPress={() => {
                                    if (video.transcript) {
                                      const crisisResult = detectCrisisContent(
                                        video.transcript,
                                      );
                                      setCrisisDetectionResult(crisisResult);
                                      setCrisisWarningVisible(true);
                                    }
                                  }}
                                  style={{marginLeft: 5}}>
                                  <Icon
                                    name="information-circle"
                                    type="ionicon"
                                    color="red"
                                    size={24}
                                  />
                                </TouchableOpacity>
                              ) : null}
                            </View>
                            <Text style={{fontSize: 20}}>
                              {video.datetimeRecorded?.toLocaleString()}
                            </Text>
                          </View>
                          <View>
                            <ScrollView
                              horizontal={true}
                              style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                              }}>
                              {video.keywords.map((key: string) => {
                                if (JSON.parse(key).checked) {
                                  return (
                                    <Chip
                                      key={JSON.parse(key).title}
                                      style={{
                                        margin: 2,
                                        backgroundColor: '#E1BE6A',
                                      }}
                                      textStyle={{fontSize: 16}}
                                      mode="outlined"
                                      compact={true}
                                      icon={'tag'}>
                                      {JSON.parse(key).title}
                                    </Chip>
                                  );
                                }
                              })}
                              {video.locations.map((key: string) => {
                                if (JSON.parse(key).checked) {
                                  return (
                                    <Chip
                                      key={JSON.parse(key).title}
                                      textStyle={{fontSize: 16}}
                                      style={{
                                        margin: 2,
                                        backgroundColor: '#40B0A6',
                                      }}
                                      mode="outlined"
                                      compact={true}
                                      icon={'map-marker'}>
                                      {JSON.parse(key).title}
                                    </Chip>
                                  );
                                }
                              })}
                            </ScrollView>
                          </View>
                          <ScrollView
                            horizontal={true}
                            style={{
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                            }}>
                            {video.emotionStickers.map(key => {
                              const sentiment = JSON.parse(key).sentiment;
                              const imageSource = sentimentImages[sentiment]; // Get the image source based on sentiment

                              if (!displayedSentiments.has(sentiment)) {
                                displayedSentiments.add(sentiment);
                                return (
                                  <View style={{flexDirection: 'row'}}>
                                    <Tooltip
                                      title={`${sentiment} (${sentimentCounts[sentiment]})`}>
                                      {imageSource && (
                                        <Image
                                          style={{height: 60, width: 60}}
                                          source={imageSource}
                                        />
                                      )}
                                    </Tooltip>
                                    <Text style={{fontWeight: 'bold'}}>
                                      {sentimentCounts[sentiment]}
                                    </Text>
                                  </View>
                                );
                              }
                              return null; // If sentiment has already been displayed, return null
                            })}
                          </ScrollView>

                          {video.numericScale !== 'null' && (
                            <Text style={{color: 'black', fontSize: 16}}>
                              Numeric pain rating:{' '}
                              {video.numericScale.toFixed(1)}
                            </Text>
                          )}

                          {selected && viewValue == 1 ? (
                            <View style={styles.buttonContainerList}>
                              <Button
                                buttonStyle={styles.btnStyle}
                                titleStyle={{color: 'black'}}
                                title="Review"
                                radius={50}
                                onPress={() =>
                                  navigation.navigate('Review Video Markups', {
                                    id: video._id,
                                  })
                                }
                              />
                              <View />
                              <Button
                                buttonStyle={styles.btnStyle}
                                radius={50}
                                titleStyle={{color: 'black'}}
                                title={
                                  windowWidth > 768
                                    ? 'Add or edit markups'
                                    : 'Edit markups'
                                }
                                onPress={() => {
                                  navigation.navigate('Add or Edit Markups', {
                                    id: video._id,
                                  });
                                  console.log('video id:', video._id);
                                }}
                              />
                              <View />
                              <Button
                                buttonStyle={styles.btnStyle}
                                radius={50}
                                titleStyle={{color: 'black'}}
                                title="Delete video"
                                onPress={() =>
                                  handleDeleteVideo(video, video.filename)
                                }
                              />
                            </View>
                          ) : (
                            <View></View>
                          )}
                        </View>
                      </View>
                      {selected && viewValue == 2 ? (
                        <View style={styles.buttonContainerGrid}>
                          <Button
                            buttonStyle={styles.btnStyle}
                            titleStyle={{color: 'black'}}
                            title="Review"
                            radius={50}
                            onPress={() =>
                              navigation.navigate('Review Video Markups', {
                                id: video._id,
                              })
                            }
                          />
                          <View />
                          <Button
                            buttonStyle={styles.btnStyle}
                            radius={50}
                            titleStyle={{color: 'black'}}
                            title={
                              windowWidth > 768
                                ? 'Add or edit markups'
                                : 'Edit markups'
                            }
                            onPress={() =>
                              navigation.navigate('Add or Edit Markups', {
                                id: video._id,
                              })
                            }
                          />
                          <View />
                          <Button
                            buttonStyle={styles.btnStyle}
                            radius={50}
                            titleStyle={{color: 'black'}}
                            title={
                              windowWidth > 768 ? 'Delete video' : 'Del. video'
                            }
                            onPress={() =>
                              handleDeleteVideo(video, video.filename)
                            }
                          />
                        </View>
                      ) : (
                        <View></View>
                      )}
                    </View>
                  );
                })
              : null}
          </View>
          {videoData.length > 0 ? (
            <TouchableOpacity
              style={{alignItems: 'center'}}
              onPress={onPressTouch}>
              <Text style={{padding: 5, fontSize: 16, color: 'black'}}>
                Scroll to top
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: windowHeight * 0.8,
              }}>
              <Text style={{padding: 5, fontSize: 20}}>
                No videos created yet.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownText: {
    fontSize: 20,
    textAlign: 'center',
  },

  selectedStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'white',
    shadowColor: '#000',
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },

  dropdown: {
    margin: 16,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },

  btnStyle: {
    backgroundColor: '#E8E8E8', // Light gray background
    borderWidth: 1,
    borderColor: '#CCCCCC', // Add a subtle border
    margin: windowWidth > 768 ? 0 : 1,
  },

  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'black',
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  gridItem: {
    padding: 1,
    width: '50%',
    borderColor: 'black',
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-evenly',
  },
  gridThumbnail: {
    height: 240,
    padding: 4,
  },
  cardLeft: {
    marginVertical: 8,
    width: '100%',
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 5,
  },
  bottomContainer: {
    flex: 1,
    padding: 5,
    justifyContent: 'space-between',
  },
  buttonContainerList: {
    flexDirection: 'row',
    justifyContent: windowWidth > 768 ? 'space-between' : 'space-around',
    flexWrap: windowWidth > 768 ? 'nowrap' : 'wrap',
    paddingTop: 5,
  },
  buttonContainerGrid: {
    flex: 1,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: windowWidth > 768 ? 'space-evenly' : 'space-evenly',
    flexWrap: windowWidth > 768 ? 'nowrap' : 'nowrap',
    alignItems: 'flex-end',
  },
  thumbnail: {
    height: 240,
    width: '40%',
    padding: 4,
  },
  space: {},

  sortValueStyle: {
    width: '82.5%',
    flexWrap: 'wrap',
  },
  crisisWarningText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  crisisResourcesText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ViewRecordings;
