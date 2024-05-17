import {useNavigation, ParamListBase, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import * as React from 'react';
import axios from 'axios';
import {useState, useEffect} from 'react';
import {
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import {Chip, Dialog, Text} from 'react-native-paper';
import {VideoData, useRealm, useQuery, useObject} from '../models/VideoData';
import {Button, Icon, CheckBox, Badge} from '@rneui/themed';
import RNFS from 'react-native-fs';
import {FFmpegKit, ReturnCode} from 'ffmpeg-kit-react-native';
import {base64} from 'rfc4648';
import Config from 'react-native-config';
import {API_OPENAI_CHATGPT} from '@env';
import useAddToFile from '../components/addToFile';
import {Dropdown} from 'react-native-element-dropdown';
import * as Styles from '../assets/util/styles';
import addToIsSelected from '../components/addToIsSelected';
import NetInfo from '@react-native-community/netinfo';
import {sendToChatGPT} from '../components/chatgpt_api';
import Realm from 'realm';

function Dashboard() {
  const route = useRoute();
  const selectedVideos = route.params?.selectedVideos;
  const [inputText, setInputText] = useState('');
  const [selectedVideoSet, setSelectedVideoSet] = useState('');

  async function handleYesAnalysis() {
    const selectedVideos = realm
      .objects<VideoData>('VideoData')
      .filtered('isConverted == false AND isSelected == true');

    for (const video of selectedVideos) {
      const getTranscriptByFilename = filename => {
        const video = videos.find(video => video.filename === filename);
        if (video) {
          return video.transcript;
        }
        return [];
      };

      const getCheckedKeywords = filename => {
        const video = videos.find(video => video.filename === filename);
        if (video) {
          const checkedKeywords = video.keywords
            .map(key => JSON.parse(key))
            .filter(obj => obj.checked)
            .map(obj => obj.title);
          return checkedKeywords;
        }
        return [];
      };

      const getCheckedLocations = filename => {
        const video = videos.find(video => video.filename === filename);
        if (video) {
          const checkedLocations = video.locations
            .map(key => JSON.parse(key))
            .filter(obj => obj.checked)
            .map(obj => obj.title);
          return checkedLocations;
        }
        return [];
      };

      const transcript = getTranscriptByFilename(video.filename);
      const keywords = getCheckedKeywords(video.filename).join(', ');
      const locations = getCheckedLocations(video.filename).join(', ');

      try {
        const outputText = await sendToChatGPT(
          video.filename,
          transcript,
          keywords,
          locations,
          realm,
          video._id.toHexString(),
        );
        setInputText(outputText); // State update here
        console.log(
          `Transcription successful for video ${video._id.toHexString()}`,
        );
      } catch (error) {
        console.error(
          `Failed to process video ${video._id.toHexString()}:`,
          error,
        );
      }
    }
    Alert.alert('Your transcripts have been generated and analyzed.');
  }

  async function handleQueuePress() {
    const state = await NetInfo.fetch();
    if (videosByIsConvertedAndSelected.length == 0) {
      Alert.alert('No videos in queue');
    } else {
      if (state.isConnected) {
        //if online display that you have _ videos available to convert
        Alert.alert(
          'Videos Ready to Analyze',
          'You have ' +
            videosByIsConvertedAndSelected.length +
            ' video(s) ready to be analyzed. Would you like to analyze these videos? If you click NO you will still have the option to analyze it later.',
          [
            {
              text: 'YES',
              onPress: () => {
                handleYesAnalysis();
              },
            },
            {text: 'NO', onPress: () => console.log('NO Pressed')},
          ],
        );
      } else {
        Alert.alert('You are offline', 'You cannot queue videos while offline');
      }
    }
  }

  useEffect(() => {
    setVideos(videosByIsSelected);
    console.log('selectedVideos:', selectedVideos);
  }, [selectedVideos]);

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [videos, setVideos] = useState<any | null>(null);
  const [buttonPressed, setButtonPressed] = useState(false);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';
  const MHMRdashboardPath = RNFS.DocumentDirectoryPath + '/MHMR/dashboard';
  const audioFolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';
  const scrollRef = React.useRef<ScrollView>(null);
  let onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  const realm = useRealm();

  const videoData = useQuery('VideoData');
  const videosByDate = videoData.sorted('datetimeRecorded', true);
  const videosByIsSelected = videosByDate.filtered('isSelected == true');
  const videosByIsConvertedAndSelected = videosByDate.filtered(
    'isConverted == false AND isSelected == true',
  );
  const [checkedVideos, setCheckedVideos] = useState(new Set<string>());

  const deleteVideo = (filename: string) => {
    var path = MHMRdashboardPath + '/' + filename;
    return RNFS.unlink(path)
      .then(() => {
        console.log('FILE DELETED FROM STORAGE');
      })
      .catch(err => {
        console.log(err.message);
      });
  };

  async function removeFromIsSelectedAndIsConverted(id: Realm.BSON.ObjectId) {
    const video = realm.objectForPrimaryKey<VideoData>('VideoData', id);
    if (video) {
      realm.write(() => {
        video.isSelected = false;
        video.isConverted = false;
      });
      console.log(
        `Video with ID ${id.toHexString()} removed from isSelected and isConverted.`,
      );
    } else {
      console.log(`Video with ID ${id.toHexString()} not found.`);
    }
  }

  async function removeFromIsSelected(id: Realm.BSON.ObjectId) {
    const video = realm.objectForPrimaryKey<VideoData>('VideoData', id);
    if (video) {
      realm.write(() => {
        video.isSelected = false;
      });
      console.log(`Video with ID ${id.toHexString()} removed from isSelected`);
    } else {
      console.log(`Video with ID ${id.toHexString()} not found.`);
    }
  }

  const toggleVideoChecked = (videoId: string) => {
    const updatedCheckedVideos = new Set(checkedVideos);

    if (updatedCheckedVideos.has(videoId)) {
      updatedCheckedVideos.delete(videoId);
    } else {
      updatedCheckedVideos.add(videoId);
    }

    setCheckedVideos(updatedCheckedVideos);
  };

  onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const [session, setSessionValue] = useState(null);
  const testSessionOptions = [
    {label: 'ex 1 - DDMMYYYY/timestamp', value: 0},
    {label: 'ex 2 - DDMMYYYY/timestamp', value: 1},
    {label: 'ex 3 - DDMMYYYY/timestamp', value: 2},
  ];

  function saveVideoSet(
    frequencyData: string[],
    videoIDs: Realm.BSON.ObjectId[],
  ) {
    let tempName = Date().toString().split(' GMT-')[0];
  }

  function getVideoSetName() {}

  const createVideoSet = (
    frequencyData: string[],
    videoIDs: Realm.BSON.ObjectId[],
  ) => {
    realm.write(() => {
      realm.create('VideoSet', {
        _id: new Realm.BSON.ObjectID(),
        datetime: new Date(),
        name: new Date().toString().split(' GMT-')[0],
        frequencyData: frequencyData,
        videoIDs: videoIDs,
      });
    });
  };

  const [videoSetIDs, setVideoSetIDs] = useState<any>([]);
  const [videoSetDropdown, setVideoSetDropdown] = useState<any>([]);

  const videosSelected = videosByDate.filtered('isSelected == true');

  const videoSets = useQuery('VideoSet');
  const videosSetsByDate = videoSets.sorted('datetime', false);
  console.log('sets', videoSets);

  const [videoSetValue, setVideoSetValue] = useState(0);

  useEffect(() => {
    for (let i = 0; i < videosSetsByDate.length; i++) {
      let videoSet = videosSetsByDate[i];
      let videoSetVideoIDs = videoSet.videoIDs;
      let videoSetVideoIDsLength = videoSetVideoIDs.length;
      let videoSetVideos = videoData.filtered(
        '_id == $0',
        new Realm.BSON.ObjectId(videoSetVideoIDs[0]),
      );
      console.log('videosetvideos', videoSetVideos);
      if (videoSetVideos.length == 0) {
        realm.write(() => {
          realm.delete(videoSet);
        });
      }
    }

    formatVideoSetDropdown();
    console.log('dropdown', videoSetDropdown);
    setVideoSetIDs(getSelectedVideoIDS());
  }, []);

  useEffect(() => {
    const videoSets = realm.objects('VideoSet');
  
    const handleChange = () => {
      formatVideoSetDropdown();
    };
  
    videoSets.addListener(handleChange);
    handleChange();  
  
    return () => {
      videoSets.removeListener(handleChange);
    };
  }, [realm]);
  
  function getSelectedVideoIDS() {
    let tempVideoSetIDs = [];
    for (let i = 0; i < videosSelected.length; i++) {
      tempVideoSetIDs.push(videosSelected[i]._id);
    }
    console.log(tempVideoSetIDs);
    return tempVideoSetIDs;
  }

  function formatVideoSetDropdown() {
    let dropdownOptions = [];
    for (let i = 0; i < videosSetsByDate.length; i++) {
      dropdownOptions.push({
        label: videosSetsByDate[i].name,
        value: i,
        id: videosSetsByDate[i]._id,
      });
      console.log('dropdownOptions', dropdownOptions[i]);
    }
    setVideoSetDropdown(dropdownOptions);
  }

  function deselectVideos() {
    for (let i = 0; i < videosSelected.length; i++) {
      videosSelected[i].isSelected = false;
    }
  }

  function selectVideos() {
    console.log(
      '1 -- currentVideoSetDetails',
      videoSetDropdown[videoSetValue],
      '---',
      videoSetValue,
    );
    const currentVideoSetDetails = videoSets.filtered(
      '_id == $0',
      videoSetDropdown[videoSetValue].id,
    );

    let videoIDsFromSet = currentVideoSetDetails[0]?.videoIDs;

    console.log('currentVideoSetDetails', currentVideoSetDetails);
    console.log('videoIDsFromSet', videoIDsFromSet);

    for (let i = 0; i < videoIDsFromSet.length; i++) {
      let videoMatch = videoData.filtered(
        '_id == $0',
        new Realm.BSON.ObjectId(videoIDsFromSet[i]),
      );
      console.log('match- ', videoMatch[0]?.isSelected);
      updateIsSelect(new Realm.BSON.ObjectId(videoIDsFromSet[i]));
    }
  }

  useEffect(() => {
    if (videoSetDropdown.length > 0) {
      clearVideoSet();
      selectVideos();
    }
  }, [videoSetValue]);

  function updateIsSelect(id: Realm.BSON.ObjectId) {
    const video = realm.objectForPrimaryKey<VideoData>('VideoData', id);
    if (video) {
      realm.write(() => {
        video.isSelected = true;
      });
    }
  }

  function clearVideoSet() {
    let selectedVideoIDs = getSelectedVideoIDS();
    console.log('CLEAR------------', selectedVideoIDs);
    for (let i = 0; i < selectedVideoIDs.length; i++) {
      removeFromIsSelected(selectedVideoIDs[i]);
    }
  }
  
  return (
    <View>
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 20,
          alignItems: 'flex-end',
          marginBottom: 10,
          zIndex: 100,
        }}>
        <View style={{position: 'absolute', top: 5, right: 5, zIndex: 100}}>
          <Badge
            value={videosByIsConvertedAndSelected.length}
            status="primary"
          />
        </View>

        <Icon
          reverse
          name="albums-outline"
          size={30}
          type="ionicon"
          color="#1C3EAA"
          onPress={() => {
            handleQueuePress();
          }}
        />
      </View>
      <View style={{height: '25%', width: '100%'}}>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{fontSize: 20}}>Select Video Set: </Text>
            <Dropdown
              data={videoSetDropdown}
              maxHeight={400}
              style={{
                height: 50,
                width: 600,
                paddingHorizontal: 20,
                backgroundColor: '#DBDBDB',
                borderRadius: 22,
              }}
              placeholderStyle={{fontSize: 22}}
              selectedTextStyle={{fontSize: 22}}
              activeColor="#FFC745"
              //backgroundColor='#FFC745'
              labelField="label"
              valueField="value"
              value={videoSetValue}
              onChange={item => {
                setVideoSetValue(item.value);
                setSelectedVideoSet(videoSets[item.value].name);
                console.log('************ selected videoSet ID', videoSets[item.value]._id);
                //clearVideoSet();
              }}
            />
          <View style={{flexDirection: 'row', paddingTop: 10, justifyContent: 'space-around'}}>
            <Button
              disabled={videosSelected.length > 0 ? false : true}
              title="Save Video Set"
              onPress={() => {
                createVideoSet([], getSelectedVideoIDS());
                formatVideoSetDropdown();
                console.log('SAVE', videosSelected);
                setVideoSetValue(videoSetDropdown.length);
              }}
              color={Styles.MHMRBlue}
              radius={50}
              containerStyle={{
                width: '40%',
                marginVertical: 10,
                marginHorizontal: 20,  
              }}
            />
            <Button
              disabled={videosSelected.length > 0 ? false : true}
              title="Clear Video Set"
              onPress={() => {
                clearVideoSet();
              }}
              color={Styles.MHMRBlue}
              radius={50}
              containerStyle={{
                width: '40%',
                marginVertical: 10,
                marginHorizontal: 20,  
              }}
            />
          </View>
          <View style={{flexDirection: 'row', paddingTop: 10, justifyContent: 'space-around'}}>
            <Button
              title="Manage Video Set"
              onPress={() => navigation.navigate('Manage Video Set', { videoSet: videoSets[videoSetValue] })}
              color={Styles.MHMRBlue}
              radius={50}
              containerStyle={{
                width: '40%',
                marginVertical: 10,
                marginHorizontal: 20,
              }}
            />
            <Button
              title="Delete all Video Sets"
              onPress={() => {
                realm.write(() => {
                  realm.delete(videoSets);
                });
                formatVideoSetDropdown();
              }}
              color={Styles.MHMRBlue}
              radius={50}
              containerStyle={{
                width: '40%',
                marginVertical: 10,
                marginHorizontal: 20,
              }}
            />
          </View>
        </View>
      </View>
      <View style={{height: '75%', width: '100%'}}>
        <ScrollView style={{marginTop: 5}} ref={scrollRef}>
          {videos !== null
            ? videos.map((video: VideoData) => {
                const isTranscriptEmpty = video => {
                  return (
                    video.transcript === undefined || video.transcript === ''
                  );
                };

                const checkedTitles = video.keywords
                  .map(key => JSON.parse(key))
                  .filter(obj => obj.checked)
                  .map(obj => obj.title)
                  .join(', ');

                const checkedLocations = video.locations
                  .map(key => JSON.parse(key))
                  .filter(obj => obj.checked)
                  .map(obj => obj.title)
                  .join(', ');

                const transcriptIsEmpty = isTranscriptEmpty(video);
                const isChecked = checkedVideos.has(video._id.toHexString());
                return (
                  <View key={video._id.toHexString()}>
                    <View style={styles.container}>
                      {!buttonPressed ? (
                        <View></View>
                      ) : (
                        <View
                          style={{
                            paddingTop: 100,
                          }}>
                          <CheckBox
                            checked={isChecked}
                            onPress={async () => {
                              if (!isChecked && !transcriptIsEmpty) {
                                toggleVideoChecked(video._id.toHexString());
                                getAuth();
                                await convertToAudio(video);
                                getTranscript(
                                  video.filename.replace('.mp4', '') + '.wav',
                                  video._id.toHexString(),
                                );
                                console.log('checked');
                              } else if (!isChecked && transcriptIsEmpty) {
                                toggleVideoChecked(video._id.toHexString());
                                console.log('else if checked');
                              } else {
                                toggleVideoChecked(video._id.toHexString());
                                console.log('unchecked');
                              }
                            }}
                            containerStyle={{backgroundColor: 'transparent'}}
                          />
                        </View>
                      )}

                      <View style={styles.thumbnail}>
                        <ImageBackground
                          style={{height: '100%', width: '100%'}}
                          source={{
                            uri:
                              'file://' + MHMRfolderPath + '/' + video.filename,
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
                                style={{
                                  alignSelf: 'flex-start',
                                  paddingLeft: 5,
                                }}
                              />
                            ) : null}
                          </Text>
                          <Text style={{fontSize: 20}}>
                            {video.datetimeRecorded?.toLocaleString()}
                          </Text>
                          <View style={{flexDirection: 'row'}}>
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
                          </View>
                        </View>
                        <View>
                          <Button
                            buttonStyle={{
                              height: 50,
                              alignSelf: 'center',
                            }}
                            color={Styles.MHMRBlue}
                            title="Remove Video From Video Set"
                            radius={50}
                            onPress={() => {
                              removeFromIsSelectedAndIsConverted(video._id);
                              console.log(video.isSelected);
                            }}
                          />
                        </View>
                        <View style={styles.buttonContainer}>
                          <View style={styles.space} />
                          <View style={styles.space} />
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            : null}
          <TouchableOpacity
            style={{alignItems: 'center'}}
            onPress={onPressTouch}>
            <Text style={{padding: 5, fontSize: 16, color: 'black'}}>
              Scroll to Top
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
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
    borderColor: 'black',
    borderWidth: StyleSheet.hairlineWidth,
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
export default Dashboard;
