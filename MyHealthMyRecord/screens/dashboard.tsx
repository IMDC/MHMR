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

function Dashboard() {
  const route = useRoute();
  const selectedVideos = route.params?.selectedVideos;
  const [inputText, setInputText] = useState('');

  async function handleYesAnalysis() {
    const selectedVideos: Realm.Results<VideoData> = realm
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
    {
      setVideos(videosByIsSelected);
      //set videos by current dropdown video set)
      // console.log(videoData
      // useAddToFile(selectedVideos);
      console.log('test');
      console.log('selectedVideos:', selectedVideos);
    }
  }, [selectedVideos]);

  // ------------------------------------------------------------------------------------------------------------------ //

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [videos, setVideos] = React.useState<any | null>(null);
  const [buttonPressed, setButtonPressed] = React.useState(false);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';
  const MHMRdashboardPath = RNFS.DocumentDirectoryPath + '/MHMR/dashboard';
  const audioFolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';
  const scrollRef: any = React.useRef();
  let onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  const realm = useRealm();

  const videoData: any = useQuery('VideoData');
  const videosByDate = videoData.sorted('datetimeRecorded', true);
  const videosByIsSelected = videosByDate.filtered('isSelected == true');
  const videosByIsConvertedAndSelected = videosByDate.filtered(
    'isConverted == false AND isSelected == true',
  );
  const [checkedVideos, setCheckedVideos] = React.useState(new Set());

  const deleteVideo = (filename: string) => {
    var path = MHMRdashboardPath + '/' + filename;
    //delete from storage
    return (
      RNFS.unlink(path)
        .then(() => {
          console.log('FILE DELETED FROM STORAGE');
          //delete from db
        })

        // `unlink` will throw an error, if the item to unlink does not exist
        .catch(err => {
          console.log(err.message);
        })
    );
  };

  async function removeFromIsSelectedAndIsConverted(id: any) {
    const video = realm.objectForPrimaryKey<VideoData>('VideoData', id);
    if (video) {
      realm.write(() => {
        video.isSelected = false;
        video.isConverted = false;
      });
      console.log(
        `Video with ID ${id} removed from isSelected and isConverted.`,
      );
    } else {
      console.log(`Video with ID ${id} not found.`);
    }
  }

  async function removeFromIsSelected(id: any) {
    const video = realm.objectForPrimaryKey<VideoData>('VideoData', id);
    if (video) {
      realm.write(() => {
        video.isSelected = false;
      });
      console.log(`Video with ID ${id} removed from isSelected`);
    } else {
      console.log(`Video with ID ${id} not found.`);
    }
  }

  const toggleVideoChecked = (videoId: any) => {
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

  function saveVideoSet(frequencyData: string[], videoIDs: string[]) {
    let tempName = Date().toString().split(' GMT-')[0];
  }

  function getVideoSetName() {}

  const createVideoSet = (frequencyData: string[], videoIDs: string[]) => {
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

  // ---------- DROPDOWN STUFF ------------- //

  const [videoSetIDs, setVideoSetIDs] = useState<any>([]);
  const [videoSetDropdown, setVideoSetDropdown] = useState<any>([]);

  const videosSelected = videosByDate.filtered('isSelected == true');

  const videoSets: any = useQuery('VideoSet');
  const videosSetsByDate = videoSets.sorted('datetime', false);
  console.log('sets', videoSets);

  const [videoSetValue, setVideoSetValue] = useState(0);
  let testVideoSetOptions = [];

  useEffect(() => {
    formatVideoSetDropdown();
    console.log('dropdown', videoSetDropdown);
    setVideoSetIDs(getSelectedVideoIDS);
  }, []);

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

  /**
   * Deselect videos after user changes videoset selection from dropdown
   */
  function deselectVideos() {
    for (let i = 0; i < videosSelected.length; i++) {
      videosSelected[i].isSelected = false;
    }
  }

  /**
   * Select new videos after user changes videoset selection from dropdown
   */
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

    let videoIDsFromSet = currentVideoSetDetails[0].videoIDs;

    console.log('currentVideoSetDetails', currentVideoSetDetails);
    console.log('videoIDsFromSet', videoIDsFromSet);

    for (let i = 0; i < videoIDsFromSet.length; i++) {
      let videoMatch = videoData.filtered('_id == $0', videoIDsFromSet[i]);
      //matchedVideoIDs.push(videoIDsFromSet[i]);
      console.log('match- ', videoMatch[0].isSelected);
      updateIsSelect(videoIDsFromSet[i]);
    }
  }

  // maybe this can be moved to dropdown onChange function?
  useEffect(() => {
    if (videoSetDropdown.length > 0) {
      clearVideoSet();
      selectVideos();
    }
  }, [videoSetValue]);

  function updateIsSelect(id: any) {
    const video = realm.objectForPrimaryKey<VideoData>('VideoData', id);
    if (video) {
      realm.write(() => {
        video.isSelected! = true;
      });
    }
  }

  function clearVideoSet() {
    //if (videoSetDropdown.length > 0) {
    /* const currentVideoSetID = videoSetDropdown[videoSetValue].id;
    const currentVideoSetDetails = videoSets.filtered('_id == $0', currentVideoSetID);
    //console.log("-----", currentVideoSetDetails[0], "----------", currentVideoSetDetails[0].videoIDs);
    let videoIDsFromSet = currentVideoSetDetails[0].videoIDs;
    console.log("CLEAR------------", videoIDsFromSet) */

    let selectedVideoIDs = getSelectedVideoIDS();
    console.log('CLEAR------------', selectedVideoIDs);
    for (let i = 0; i < selectedVideoIDs.length; i++) {
      removeFromIsSelected(selectedVideoIDs[i]);
    }
    //}
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
          // elevation: 8,
          zIndex: 100,
        }}>
        <View style={{position: 'absolute', top: 5, right: 5, zIndex: 100}}>
          <Badge
            value={videosByIsConvertedAndSelected.length}
            status="primary"
          />
        </View>
        {/* <Button
          style={{backgroundColor: '#1C3EAA', padding: 20, borderRadius: 5}}
          radius={50}
          buttonStyle={[styles.btnStyle, {}]}
          // onPress={handleSend}>
          onPress={() => {
            console.log('SENDING', selectedVideos);
          }}>
          <Text style={{color: 'white', fontSize: 25}}>Queue</Text>
        </Button> */}

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
              //clearVideoSet();
            }}
          />
          <View style={{flexDirection: 'row', paddingTop: 10}}>
            <Button
              title="Save Video Set"
              onPress={() => {
                createVideoSet([], getSelectedVideoIDS());
                formatVideoSetDropdown();
                console.log('SAVE', videosSelected);
              }}
              color={Styles.MHMRBlue}
              radius={50}
              containerStyle={{
                width: 300,
                marginHorizontal: 30,
                marginVertical: 15,
              }}
            />
            <Button
              title="Clear Video Set"
              onPress={() => {
                // TODO: move this to a function and call onPress()
                clearVideoSet();
              }}
              color={Styles.MHMRBlue}
              radius={50}
              containerStyle={{
                width: 300,
                marginHorizontal: 30,
                marginVertical: 15,
              }}
            />
          </View>

          <View style={{flexDirection: 'row', paddingTop: 10}}>
            <Button
              title="Delete all Video Sets"
              onPress={() => {
                // TODO: move this to a function and call onPress()
                realm.write(() => {
                  realm.delete(videoSets);
                });
                formatVideoSetDropdown();
              }}
              color={Styles.MHMRBlue}
              radius={50}
              containerStyle={{
                width: 300,
                marginHorizontal: 30,
                marginVertical: 10,
              }}
            />
          </View>
        </View>
      </View>
      <View style={{height: '75%', width: '100%'}}>
        {/* beginning of dashboard */}
        {/* {buttonPressed ? (
          <Button
            onPress={() => {
              setButtonPressed(!buttonPressed);
              console.log(buttonPressed);
            }}>
            Done
          </Button>
        ) : (
          <Button
            onPress={() => {
              setButtonPressed(!buttonPressed);
              // console.log(buttonPressed);
            }}>
            Select Videos
          </Button>
        )}
        <Button onPress={getAuth}>get auth</Button>
        <Button onPress={transcribeAudio}>transcribe audio</Button> */}

        {/* <Button onPress={getBinaryAudio}>get binary</Button> */}

        {/* <Button onPress={cognosSession}>cognos session</Button> */}

        <ScrollView style={{marginTop: 5}} ref={scrollRef}>
          {/* <View style={{height: '15%', width: '100%'}}>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 10,
            }}>
            <Text style={{fontSize: 20}}>Select Session: </Text>
            <Dropdown
              data={testSessionOptions}
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
              value={session}
              onChange={item => {
                setSessionValue(item.value);
              }}
            />
            <Button
              title="View Videos in Session"
              onPress={() => navigation.navigate('Dashboard')}
              color={Styles.MHMRBlue}
              radius={50}
              containerStyle={{
                width: 300,
                marginHorizontal: 30,
                marginVertical: 30,
              }}
            />
          </View>
        </View> */}
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

                // console.log(checkedTitles);

                const transcriptIsEmpty = isTranscriptEmpty(video);
                const isChecked = checkedVideos.has(video._id.toString());
                return (
                  <View key={video._id.toString()}>
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
                              // Mark this function as async
                              if (!isChecked && !transcriptIsEmpty) {
                                toggleVideoChecked(video._id.toString());
                                // Assuming getAuth doesn't need to wait for convertToAudio, you can call it without await
                                getAuth();

                                await convertToAudio(video); // Wait for convertToAudio to complete

                                getTranscript(
                                  video.filename.replace('.mp4', '') + '.wav',
                                  video._id.toString(),
                                );

                                console.log('checked');
                              } else if (!isChecked && transcriptIsEmpty) {
                                toggleVideoChecked(video._id.toString());
                                console.log('else if checked');
                              } else {
                                toggleVideoChecked(video._id.toString());
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
                          {/* map temparray and display the keywords here */}
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
                              removeFromIsSelectedAndIsConverted(video._id),
                                console.log(video.isSelected);
                            }}
                            // onPress={() => {
                            //   setVideoSelectedData(video);
                            //   setvideoSelectedFilename(video.filename);
                            //   toggleDialog1();
                            // }}
                          />
                          {/* send to chatgpt button */}
                          {/* <Button
                          onPress={() => {
                            setInputText(
                              'Summarize this video transcript (' +
                                `${video.transcript}` +
                                ') and include the summary of the keywords (' +
                                `${checkedTitles}` +
                                ') and locations (' +
                                `${checkedLocations}` +
                                ') tagged.',
                            );
                            sendToChatGPT(
                              video.filename.replace('.mp4', '') + '.txt',
                              video._id.toString(),
                            );
                          }}>
                          Send to ChatGPT
                        </Button> */}
                        </View>
                        {/* <Text>{video.filename}</Text> */}
                        <View style={styles.buttonContainer}>
                          {/* <Button
                        buttonStyle={styles.btnStyle}
                        title="Convert to Audio"
                        onPress={() => convertToAudio(video)}
                      /> */}
                          <View style={styles.space} />
                          <View style={styles.space} />
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            : null}
          {/* {
            buttonPressed
          ? videos.map((video: VideoData) => {
              // const videoURI = require(MHMRfolderPath + '/' + video.filename);
            return (
                
              
              );
            })
          : null} */}
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
    // paddingLeft: 8,
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
