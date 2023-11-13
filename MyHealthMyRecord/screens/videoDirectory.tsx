import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import VideoPlayer from 'react-native-media-console';
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Touchable,
} from 'react-native';
import {View, TouchableOpacity, Text} from 'react-native';
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
import {VideoData, useQuery, useRealm} from '../models/VideoData';
import RNFS from 'react-native-fs';
import {Button, Dialog, Icon} from '@rneui/themed';
import {Chip,Tooltip} from 'react-native-paper';
import {Dropdown, MultiSelect} from 'react-native-element-dropdown';

const worried = require('../assets/images/emojis/worried.png');

const ViewRecordings = () => {
  const [visible, setVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [checked, setChecked] = useState(1);

  const [videoSelectedFilename, setvideoSelectedFilename] = useState('');
  const [videoSelectedData, setVideoSelectedData] = useState<any | VideoData>(
    '',
  );

  const toggleDialog = () => {
    setVisible(!visible);
  };

  const toggleDialog1 = () => {
    setVisible1(!visible1);
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
  const sortData = [
    {label: 'Date', value: 1},
    {label: 'Name', value: 2},
    {label: 'Keyword', value: 3},
    {label: 'Location', value: 4},
    {label: 'Emotion', value: 5},
  ];

  const oldestNewestData = [
    {label: 'Newest to Oldest', value: 1},
    {label: 'Oldest to Newest', value: 2},
  ];

  const keywordData = [
    {label: 'None', value: 1},
    {label: 'Chronic', value: 2},
    {label: 'Weak', value: 3},
    {label: 'Depression', value: 4},
    {label: 'Pain', value: 5},
    {label: 'Fever', value: 6},
    {label: 'Wellness', value: 7},
    {label: 'Other', value: 8},
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
    {label: 'Other', value: 7},
  ];

  const emotionData = [
    {label: 'Smile', value: 1},
    {label: 'Neutral', value: 2},
    {label: 'Worried', value: 3},
    {label: 'Sad', value: 4},
    {label: 'Angry', value: 5},
  ];

  const sentimentImages = {
    smile: require('../assets/images/emojis/smile.png'),
    neutral: require('../assets/images/emojis/neutral.png'),
    worried: require('../assets/images/emojis/worried.png'),
    sad: require('../assets/images/emojis/sad.png'),
    angry: require('../assets/images/emojis/angry.png'),
  };

  const [sortValue, setSortValue] = useState(null);
  const [oldestNewestValue, setOldestNewestValue] = useState(null);
  const [keywordValue, setKeywordValue] = useState<any[]>([]);
  const [locationValue, setLocationValue] = useState([]);
  const [emotionValue, setEmotionValue] = useState([]);
  const [nameValue, setNameValue] = useState(null);

  const [showDropDown, setShowDropDown] = useState(false);

  const realm = useRealm();
  const videoData: any = useQuery('VideoData');
  const videosByDate = videoData.sorted('datetimeRecorded', true);
  //console.log(videosByDate);

  // delete after figuring out why this page re-renders when annotating on other pages
  /* videoData.map((video: any) =>
    console.log('test', video._id.toString(), video.title),
  ); */

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

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
    //delete from storage
    return (
      RNFS.unlink(path)
        .then(() => {
          console.log('FILE DELETED FROM STORAGE');
          //delete from db
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

  useEffect(() => {
    {
      setVideos(videosByDate);
      console.log(videoData)
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
    <View>
      <ScrollView style={{marginTop: 5}} ref={scrollRef}>
        <TouchableOpacity style={{alignItems: 'center'}} onPress={toggleDialog}>
          <Text
            style={{
              fontSize: 16,
              // paddingRight: 20,
              color: 'black',
            }}>
            Delete All Videos
          </Text>
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          <Dropdown
            data={sortData}
            maxHeight={300}
            style={{width: windowWidth / 2}}
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
          {/* Sorts by date */}
          {sortValue == 1 && (
            <Dropdown
              data={oldestNewestData}
              maxHeight={300}
              style={{width: windowWidth / 2}}
              placeholderStyle={styles.dropdownText}
              selectedTextStyle={styles.dropdownText}
              itemTextStyle={{textAlign: 'center'}}
              labelField="label"
              valueField="value"
              value={oldestNewestValue}
              onChange={item => {
                setOldestNewestValue(item.value);
                if (item.value === 1) {
                  setVideos(videosByDate);
                  console.log('if', item.value);
                } else {
                  setVideos(videosByDate.sorted('datetimeRecorded', false));
                  console.log('else', item.value);
                }
              }}
            />
          )}
          {sortValue == 2 && (
            <Dropdown
              data={nameData}
              maxHeight={1000}
              style={{width: windowWidth / 2}}
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
          {}
          {sortValue == 3 && (
            <MultiSelect
              data={keywordData}
              maxHeight={1000}
              style={{width: windowWidth / 2}}
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
                  const filteredVideos = videoData.filter(video => {
                    return !video.keywords.some(key => {
                      return JSON.parse(key).checked;
                    });
                  });

                  setVideos(filteredVideos);
                } else {
                  // Create an array of selected keyword values
                  const selectedKeywordValues = selectedItems.map(item => item);
                  console.log(
                    'Selected Keyword Values:',
                    selectedKeywordValues,
                  );

                  // Filter videos based on selected keyword values and labels
                  const filteredVideos = videoData.filter(video => {
                    // Check if any of the selected keyword values match the video's keyword values
                    return selectedKeywordValues.some(value => {
                      return video.keywords.some(keyword => {
                        const parsedKeyword = JSON.parse(keyword);
                        return (
                          parsedKeyword.value === value &&
                          parsedKeyword.checked === true
                        );
                      });
                    });
                  });

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
              style={{width: windowWidth / 2}}
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

                  const filteredVideos = videoData.filter(video => {
                    return selectedLocationValues.some(value => {
                      return video.locations.some(location => {
                        const parsedLocation = JSON.parse(location);
                        return (
                          parsedLocation.value === value &&
                          parsedLocation.checked === true
                        );
                      });
                    });
                  });
                  setVideos(filteredVideos);
                }
              }}
              renderSelectedItem={renderSelectedItem}
            />
          )}
          {sortValue == 5 && (
            <MultiSelect
              data={emotionData}
              maxHeight={1000}
              style={{width: windowWidth / 2}}
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
                  const selectedEmotionLabels = selectedItems.map(value => {
                    const selectedEmotion = emotionData.find(
                      item => item.value === value,
                    );
                    return selectedEmotion ? selectedEmotion.label : '';
                  });
                  console.log(
                    'Selected Emotion Labels:',
                    selectedEmotionLabels,
                  );

                  const filteredVideos = videoData.filter(video => {
                    return selectedEmotionLabels.some(label => {
                      return video.emotionStickers.some(emotion => {
                        const parsedEmotion = JSON.parse(emotion);
                        console.log("test:", parsedEmotion.sentiment === label);
                        return (
                          parsedEmotion.sentiment.toLowerCase() ===
                          label.toLowerCase()
                        );
                        
                      });
                    });
                  });
                  setVideos(filteredVideos);
                }
              }}
              renderSelectedItem={renderSelectedItem}
            />
          )}
        </View>
        {videos !== null
          ? videos.map((video: VideoData) => {
            const displayedSentiments = new Set(); // Create a Set to keep track of displayed sentiments
            const sentimentCounts = {}; // Create an object to keep track of sentiment counts

            video.emotionStickers.forEach(key => {
              const sentiment = JSON.parse(key).sentiment;

              if (!sentimentCounts[sentiment]) {
                sentimentCounts[sentiment] = 1; // Initialize the count if not found
              } else {
                sentimentCounts[sentiment]++; // Increment the count
              }
            });
            // const videoURI = require(MHMRfolderPath + '/' + video.filename);
            return (
              <View style={styles.container} key={video._id.toString()}>
                <View style={styles.thumbnail}>
                  {/* <VideoPlayer
                      style={{}}
                      source={{
                        uri: MHMRfolderPath + '/' + video.filename,
                      }}
                      paused={true}
                      disableBack={true}
                      // toggleResizeModeOnFullscreen={true}
                      showOnStart={true}
                      disableSeekButtons={true}
                      isFullscreen={false}
                      onEnterFullscreen={() =>
                        navigation.navigate('Fullscreen Video', {
                          id: video._id,
                        })
                      }
                    /> */}

                  <ImageBackground
                    style={{height: '100%', width: '100%'}}
                    source={{
                      uri: 'file://' + MHMRfolderPath + '/' + video.filename,
                    }}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('Fullscreen Video', {
                          id: video._id,
                        })
                      }>
                      <Icon
                        style={{height: 240, justifyContent: 'center'}}
                        name="play-sharp"
                        type="ionicon"
                        color="black"
                        size={40}
                      />
                    </TouchableOpacity>
                  </ImageBackground>

                  {/* <VideoPlayer
                      style={{}}
                      source={{
                        uri: MHMRfolderPath + '/' + video.filename,
                      }}
                      paused={true}
                      disableBack={true}
                      // toggleResizeModeOnFullscreen={true}
                      showOnStart={true}
                      disableSeekButtons={true}
                      isFullscreen={false}
                      onEnterFullscreen={() =>
                        navigation.navigate('Fullscreen Video', {
                          id: video._id,
                        })
                      }
                    /> */}
                </View>

                <View style={styles.rightContainer}>
                  <View>
                    <Text
                      style={{
                        fontSize: 24,
                        color: 'black',
                        fontWeight: 'bold',
                      }}>
                      {video.title}
                      {video.textComments.length !== 0 ? (
                        <Icon
                          name="chatbox-ellipses"
                          type="ionicon"
                          color="black"
                          size={22}
                          style={{alignSelf: 'flex-start', paddingLeft: 5}}
                        />
                      ) : null}
                    </Text>
                    <Text style={{fontSize: 20}}>
                      {video.datetimeRecorded?.toLocaleString()}
                    </Text>

                    {/* map temparray and display the keywords here */}
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                      {video.keywords.map((key: string) => {
                        if (JSON.parse(key).checked) {
                          return (
                            <Chip
                              key={JSON.parse(key).title}
                              style={{margin: 2, backgroundColor: '#E1BE6A'}}
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
                              style={{margin: 2, backgroundColor: '#40B0A6'}}
                              mode="outlined"
                              compact={true}
                              icon={'map-marker'}>
                              {JSON.parse(key).title}
                            </Chip>
                          );
                        }
                      })}
                    </View>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                      {video.emotionStickers.map(key => {
                        const sentiment = JSON.parse(key).sentiment;
                        const imageSource = sentimentImages[sentiment]; // Get the image source based on sentiment

                        if (!displayedSentiments.has(sentiment)) {
                          displayedSentiments.add(sentiment);
                          return (
                            <View>
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
                    </View>
                  </View>
                  {/* if textcomment length is does not equal 0, add an icon */}

                  <View style={styles.buttonContainer}>
                    <Button
                      buttonStyle={styles.btnStyle}
                      title="Review"
                      onPress={() =>
                        navigation.navigate('Review Annotations', {
                          id: video._id,
                        })
                      }
                    />
                    <View style={styles.space} />
                    <Button
                      buttonStyle={styles.btnStyle}
                      title="Add/Edit Markups"
                      onPress={() =>
                        navigation.navigate('Annotation Menu', {
                          id: video._id,
                        })
                      }
                    />
                    <View style={styles.space} />
                    <Button
                      buttonStyle={styles.btnStyle}
                      title="Delete Video"
                      // onPress={() => deleteVideo(video, video.filename)}
                      onPress={() => {
                        setVideoSelectedData(video);
                        setvideoSelectedFilename(video.filename);
                        toggleDialog1();
                      }}
                    />
                  </View>
                </View>
                <Dialog isVisible={visible} onBackdropPress={toggleDialog}>
                  <Dialog.Title title="Are you sure you want to delete all videos?" />
                  <Text style={{fontSize: 20}}>
                    These videos will be deleted immediately. You can't undo
                    this action.
                  </Text>
                  <Dialog.Actions>
                    <Dialog.Button
                      title="Delete"
                      onPress={() => deleteAllVideoDataObjects()}
                    />
                    <Dialog.Button
                      title="Cancel"
                      onPress={() => toggleDialog()}
                    />
                  </Dialog.Actions>
                </Dialog>
                <Dialog isVisible={visible1} onBackdropPress={toggleDialog1}>
                  <Dialog.Title title="Are you sure you want to delete this video?" />
                  <Text style={{fontSize: 20}}>
                    This item will be deleted immediately. You can't undo this
                    action.
                  </Text>
                  <Dialog.Actions>
                    <Dialog.Button
                      title="Delete"
                      onPress={() => {
                        deleteVideo(videoSelectedData, videoSelectedFilename);
                        toggleDialog1();
                      }}
                    />
                    <Dialog.Button
                      title="Cancel"
                      onPress={() => toggleDialog1()}
                    />
                  </Dialog.Actions>
                </Dialog>
              </View>
            );
          })
          : null}
        <TouchableOpacity style={{alignItems: 'center'}} onPress={onPressTouch}>
          <Text style={{padding: 5, fontSize: 16, color: 'black'}}>
            Scroll to Top
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownText: {
    fontSize: 20,
    textAlign: 'center',
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
    backgroundColor: '#1C3EAA',
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
    // paddingLeft: 8,
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardLeft: {
    marginVertical: 8,
    width: '100%',
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  thumbnail: {
    height: 240,
    width: '40%',
    padding: 4,
  },
  space: {
    width: 50,
  },
});

export default ViewRecordings;
