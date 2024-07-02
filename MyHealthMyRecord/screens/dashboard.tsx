import {useNavigation, useRoute, useIsFocused} from '@react-navigation/native';
import * as React from 'react';
import {useState, useEffect} from 'react';
import {
  ScrollView,
  ImageBackground,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  LogBox,
} from 'react-native';
import {Text, Chip} from 'react-native-paper';
import {VideoData, useRealm, useQuery} from '../models/VideoData';
import {Icon, Badge, Button} from '@rneui/themed';
import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';
import {sendToChatGPT} from '../components/chatgpt_api';
import VideoSetDropdown from '../components/videoSetDropdown';
import * as Styles from '../assets/util/styles';
import {ObjectId} from 'bson';
import {useDropdownContext} from '../components/videoSetProvider';

function Dashboard() {
 const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute();
  const isFocused = useIsFocused();
  const realm = useRealm();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [videoSetDropdown, setVideoSetDropdown] = useState([]);
  const [selectedVideoSet, setSelectedVideoSet] = useState();
  const [inputText, setInputText] = useState('');
  const videoData = useQuery<VideoData>('VideoData');
  const videoSets = useQuery<any>('VideoSet');
  const videosByDate = videoData.sorted('datetimeRecorded', true);
  const videosByIsConvertedAndSelected = videosByDate.filtered(
    'isConverted == false AND isSelected == true',
  );

  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';
  var selectedSetVideos = [];

  const {
    handleChange,
    videoSetValue,
    videoSetVideoIDs,
    setVideoSetVideoIDs,
    setVideoSetValue,
    sendToVideoSet,
    setSendToVideoSet,
    currentVideos,
    setCurrentVideos,
    setCurrentVideoSet,
    currentVideoSet,
  } = useDropdownContext();

  // useEffect to update videoSetVideoIDs when the array is added to or removed from
    
  useEffect(() => {
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state.',
    ]);
  });

  useEffect(() => {
    const selectedVideos = route.params?.selectedVideos || [];
    console.log('selectedVideos:', selectedVideos);
    console.log('selectedVideos.size:', selectedVideos.size);
    console.log('sendToVideoSet number:', sendToVideoSet);
    console.log('selectedVideoSet:', selectedVideoSet);
    if (sendToVideoSet == 0 || sendToVideoSet == undefined) {
      if (videoSetVideoIDs) {
        const videoIDSet = new Set(videoSetVideoIDs);
        selectedSetVideos = videoData.filter(video => {
          if (!video._id) {
            console.error('Video _id is undefined:', video);
            return false;
          }
          return videoIDSet.has(video._id.toString());
        });
        setVideos(selectedSetVideos);
      } else {
        setVideos([]); // Clear videos if no video set is selected
      }
    } else if (sendToVideoSet == 1) {
      // Send to current video set

      // Add the selected videos to the current video set using realm schema
      // Map through videoData and match the ids in selectedVideos array to the videoData ids and add to the current video set schema
      // then also add the selectedVideo ids to the videoSetVideoIDs array

      const selectedVideosArray = Array.from(selectedVideos);
      setVideoSetVideoIDs(
        Array.from(new Set([...videoSetVideoIDs, ...selectedVideosArray])),
      );
      selectedSetVideos = videoData.filter(video => {
        const objectId = new ObjectId(video._id);
        return selectedVideosArray.some(selectedVideo =>
          objectId.equals(selectedVideo),
        );
      });

      const videoIDSet = new Set(videoSetVideoIDs);
      const addToSelectedSetVideos = videoData.filter(video => {
        if (!video._id) {
          console.error('Video _id is undefined:', video);
          return false;
        }
        return videoIDSet.has(video._id.toString());
      });

      selectedSetVideos.push(addToSelectedSetVideos[0]);
      console.log('selected videos array:', selectedVideosArray);
      setVideos(Array.from(new Set(selectedSetVideos)));

      // add these videos to the current video set if there is a selected video set
      realm.write(() => {
        currentVideoSet.videoIDs = Array.from(
          new Set([...currentVideoSet.videoIDs, ...selectedVideosArray]),
        );
        console.log('NEW currentSet.videoIDs:', currentVideoSet.videoIDs);
      });

      setSendToVideoSet(0);
    } else if (sendToVideoSet == 2) {
      // Send to new video set
      // Display the videos associated with the IDs in isSelected

      setVideoSetValue(null);
      const selectedVideosArray = Array.from(selectedVideos);
      setVideoSetVideoIDs(Array.from(selectedVideos));
      selectedSetVideos = videoData.filter(video => {
        const objectId = new ObjectId(video._id);

        return selectedVideosArray.some(selectedVideo =>
          objectId.equals(selectedVideo),
        );
      });
      console.log('selected videos array:', selectedVideosArray);
      setVideos(selectedSetVideos);
      setSendToVideoSet(0);
    }

    console.log('selectedSetVideos:', selectedSetVideos);
    // remove duplicates from videoSetVideoIDs
    // setVideoSetVideoIDs(...Array.from(new Set(videoSetVideoIDs)));
    if (isFocused) {
      setVideos(selectedSetVideos);
    }
    console.log('-'.repeat(40));
    console.log('videoSetVideoIDs in Dashboard.tsx:', videoSetVideoIDs);
    console.log('-'.repeat(40));
  }, [
    route.params?.selectedVideos,
    currentVideoSet,
    isFocused,
    videoData,
    // videoSetVideoIDs,
    videoSetValue,
    isFocused,
  ]);

  const handleVideoSelectionChange = (selectedId: string) => {
    if (!selectedId) {
      setSelectedVideoSet(undefined);
      setVideos([]);
      return;
    }
    const selectedSet = videoSets.find(
      set => set._id.toString() === selectedId,
    );
    setSelectedVideoSet(selectedSet);
  };

  const handleDeleteAllVideoSets = () => {
    realm.write(() => {
      const allVideoSets = realm.objects('VideoSet');
      realm.delete(allVideoSets);
      setVideoSetDropdown([]);
    });
  };

  async function handleYesAnalysis() {
    const selectedVideos = realm
      .objects<VideoData>('VideoData')
      .filtered('isConverted == false AND isSelected == true');

    for (const video of selectedVideos) {
      const getTranscriptByFilename = (filename: string) => {
        const video = videos.find(video => video.filename === filename);
        return video ? video.transcript : '';
      };

      const getCheckedKeywords = (filename: string) => {
        const video = videos.find(video => video.filename === filename);
        return video
          ? video.keywords
              .map(key => JSON.parse(key))
              .filter(obj => obj.checked)
              .map(obj => obj.title)
          : [];
      };

      const getCheckedLocations = (filename: string) => {
        const video = videos.find(video => video.filename === filename);
        return video
          ? video.locations
              .map(key => JSON.parse(key))
              .filter(obj => obj.checked)
              .map(obj => obj.title)
          : [];
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
          'bullet'
        );
        setInputText(outputText);
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

  return (
    <View style={{height: '100%'}}>
      {/*Badge checks the current videoSetVideoIds if they are isConverted and returns the amount*/}
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

      <ScrollView style={{marginTop: 5}}>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View style={{flex: 1}}>
            <VideoSetDropdown
              videoSetDropdown={videoSetDropdown}
              videoSets={realm.objects('VideoSet')}
              saveVideoSetBtn={true}
              clearVideoSetBtn={true}
              deleteAllVideoSetsBtn={true}
              manageSetBtn={true}
              onVideoSetChange={handleVideoSelectionChange}
            />
          </View>
        </View>
        {videos !== null || videos !== undefined
          ? videos.map(video => {
              // const isTranscriptEmpty = video => {
              //   return (
              //     video.transcript === undefined || video.transcript === ''
              //   );
              // };

              // const checkedTitles = video.keywords
              //   .map(key => JSON.parse(key))
              //   .filter(obj => obj.checked)
              //   .map(obj => obj.title)
              //   .join(', ');

              // const checkedLocations = video.locations
              //   .map(key => JSON.parse(key))
              //   .filter(obj => obj.checked)
              //   .map(obj => obj.title)
              //   .join(', ');
              return (
                <View key={video._id.toString()}>
                  <View style={styles.container}>
                    <View style={styles.thumbnail}>
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
                            'file://' + MHMRfolderPath + '/' + video.filename,
                        }}>
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
                            color="#1C3EAA"
                            size={20}
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
                      <View></View>
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
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  space: {
    width: 50,
  },
});

export default Dashboard;
