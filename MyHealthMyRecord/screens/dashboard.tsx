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
import {Button, Icon, CheckBox} from '@rneui/themed';
import RNFS from 'react-native-fs';
import {FFmpegKit, ReturnCode} from 'ffmpeg-kit-react-native';
import {base64} from 'rfc4648';
import Config from 'react-native-config';
import {API_OPENAI_CHATGPT} from '@env';
import useAddToFile from '../components/addToFile';
import {Dropdown} from 'react-native-element-dropdown';
import * as Styles from '../assets/util/styles';
import addToIsSelected from '../components/addToIsSelected';

function Dashboard() {
  const [checked, setChecked] = React.useState(false);
  const [auth, setAuth] = useState('');
  const [inputText, setInputText] = useState('');
  const [dashboardVideos, setDashboardVideos] = useState<any[]>([]);
  const route = useRoute();
  const selectedVideos = route.params?.selectedVideos;
  // updateSelectedVideos(selectedVideos);
  // if (selectedVideos && selectedVideos.size > 0) {
    // addToIsSelected(selectedVideos);
  // }

  const sendToChatGPT = async (textFileName, _id) => {
    try {
      // Create directories if they don't exist
      const directoryPath = `${RNFS.DocumentDirectoryPath}/MHMR/transcripts`;
      await RNFS.mkdir(directoryPath, {recursive: true});

      // Send the input text to ChatGPT API
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Config.API_OPENAI_CHATGPT}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{role: 'user', content: inputText}],
            max_tokens: 100,
          }),
        },
      );

      const data = await response.json();
      console.log('Response from ChatGPT API:', data); // Log the response

      // Check if data.choices is defined and contains at least one item
      if (data.choices && data.choices.length > 0) {
        const outputText = data.choices[0].message.content;
        const filePath = `${directoryPath}/${textFileName}`;
        await RNFS.writeFile(filePath, outputText, 'utf8');
        Alert.alert('Success', 'Output saved to file: ' + filePath);
      } else {
        throw new Error('Invalid response from ChatGPT API');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to process input.');
    }
  };

  /**
   * Set auth state with a Bearer type authorization token
   */
  const getAuth = async () => {
    try {
      let headersList = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      let bodyContent =
        'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=' +
        Config.API_KEY_SPEECH_TO_TEXT;

      let reqOptions = {
        url: 'https://iam.cloud.ibm.com/identity/token',
        method: 'POST',
        headers: headersList,
        data: bodyContent,
      };

      let response = await axios.request(reqOptions);
      setAuth(response.data.token_type + ' ' + response.data.access_token);
      console.log('New auth token set:', response.data.access_token);
    } catch (error) {
      console.error('Error getting auth token:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received. Request details:', error.request);
      } else {
        console.error('Error details:', error.message);
      }
    }
  };

  /**
   * Get binary version of audio file and call transcribeAudio on all files in MHMR/audio folder on device
   */
  const getTranscript = async (audioFileName: any, _id: any) => {
    const audioFolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';
    const audioFiles = RNFS.readDir(audioFolderPath);

    /*     (await audioFiles).map(f => {
          if (f.isFile()) {
            //var path = audioFolderPath + '/' + f.name;
            console.log(f.name, f.path, f.size); */
    RNFS.readFile(audioFolderPath + '/' + audioFileName, 'base64').then(
      data => {
        console.log(
          data.substring(0, 5),
          ', ',
          data.substring(data.length - 5),
        );
        transcribeAudio(base64.parse(data), _id);
        //RNFS.writeFile(savePath, data, 'base64');
      },
    );
    console.log('done');
    //}
    //});
  };

  /**
   * Transcribe an audio file by sending request to IBM speech-to-text service
   * @param body - The audio file to transcribe
   */
  const transcribeAudio = async (body: any, _id: any) => {
    axios
      .post(
        'https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/08735c5f-70ad-44a9-8cae-dc286520aa53/v1/recognize',
        body,
        {
          headers: {
            Authorization: auth,
            'Content-Type': 'audio/wav',
          },
        },
      )
      .then(response => {
        const transcript =
          response.data.results[0]?.alternatives[0]?.transcript || '';
        const confidence =
          response.data.results[0]?.alternatives[0]?.confidence || 0;
        console.log('Transcript:', transcript);
        console.log('Confidence:', confidence);
        realm.write(() => {
          // Assuming videoData is an array of video objects
          const videoToUpdate = videoData.find(
            video => video._id.toString() === _id,
          );

          if (videoToUpdate) {
            // Update the transcript property within the specific video object
            videoToUpdate.transcript = [transcript];
            videoToUpdate.isTranscribed = true;

            console.log('Realm write operation completed');
          } else {
            console.log('Could not find video to update in the array');
          }
        });
      })
      .catch((err: any) => {
        console.log('Error during transcription:', err.message || err);

        if (err.response?.status === 401) {
          console.log('Need to get a new auth token');
          getAuth();
        }
      });
  };

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
  const videosByIsSelected = videoData.filtered('isSelected == true');
  /**
   * Convert a video to a .wav type audio file and save it in the MHMR/audio folder on the device
   * @param video VideoData object
   */
  const convertToAudio = async (video: VideoData) => {
    console.log('convert to audio');
    const mp3FileName =
      audioFolderPath + '/' + video.filename.replace('.mp4', '') + '.mp3';
    const wavFileName =
      audioFolderPath + '/' + video.filename.replace('.mp4', '') + '.wav';
    const mp4FileName = MHMRfolderPath + '/' + video.filename;

    // Check if the input MP4 file exists
    const mp4FileExists = await RNFS.exists(mp4FileName);
    if (!mp4FileExists) {
      console.error('Input file does not exist:', mp4FileName);
      return; // Exit the function if the file doesn't exist
    }

    // Ensure the output audio directory exists
    const audioFolderExists = await RNFS.exists(audioFolderPath);
    if (!audioFolderExists) {
      try {
        await RNFS.mkdir(audioFolderPath);
      } catch (error) {
        console.error(
          'Failed to create output directory:',
          audioFolderPath,
          error,
        );
        return; // Exit the function if unable to create the directory
      }
    }

    // Execute FFmpegKit command
    FFmpegKit.execute(
      '-i ' +
        mp4FileName +
        ' -vn -acodec pcm_s16le -ar 44100 -ac 2 ' +
        wavFileName,
    )
      .then(async session => {
        const returnCode = await session.getReturnCode();

        if (ReturnCode.isSuccess(returnCode)) {
          console.log('success');
          video.isConverted = true;
        } else if (ReturnCode.isCancel(returnCode)) {
          console.log('cancelled');
        } else {
          console.log('error with FFmpegKit execution');
        }
      })
      .catch(error => {
        console.error('FFmpegKit execution failed:', error);
      });
  };

  useEffect(() => {
    {
      setVideos(videosByIsSelected);
      // console.log(videoData
      // useAddToFile(selectedVideos);
      console.log('test');
      console.log('selectedVideos:', selectedVideos);
    }
  }, [selectedVideos]);

  // React.useEffect(() => {
  //   const fetchVideos = async () => {
  //     try {
  //       const dashboardFolderPath =
  //         RNFS.DocumentDirectoryPath + '/MHMR/dashboard/';
  //       const dashboardFolderExists = await RNFS.exists(dashboardFolderPath);

  //       if (!dashboardFolderExists) {
  //         // Handle the case where the dashboard folder doesn't exist
  //         console.log('Dashboard folder does not exist');
  //         return; // Exit early
  //       }

  //       const filteredVideos = await Promise.all(
  //         videosByDate.map(async (video: any) => {
  //           const videoPath = dashboardFolderPath + video.filename;
  //           const exists = await RNFS.exists(videoPath);
  //           return exists ? video : null;
  //         }),
  //       );
  //       setVideos(filteredVideos.filter(video => video !== null));
  //     } catch (error) {
  //       console.error('Error fetching videos:', error);
  //     }
  //   };

  //   // const addVideosToDashboard = async () => {
  //   //   try {
  //   //     if (selectedVideos) {
  //   //       await useAddToFile(selectedVideos);
  //   //       Alert.alert('Your videos have been added to the dashboard');
  //   //     }
  //   //   } catch (error) {
  //   //     Alert.alert('Error adding videos to dashboard');
  //   //     console.error('Error adding videos to dashboard:', error);
  //   //   }
  //   // };

  //   fetchVideos();
  //   // addVideosToDashboard();
  // }, [videosByDate, selectedVideos]);

  //check file space
  /*
  const FSInfoResult = RNFS.getFSInfo();
  console.log("space: ", (await FSInfoResult).totalSpace, (await FSInfoResult).freeSpace);
  */

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

  async function removeFromIsSelected(id: any) {
    let realm: Realm | null = null;

    try {
      realm = await Realm.open({
        schema: [VideoData.schema],
        deleteRealmIfMigrationNeeded: true,
      });

      const video = realm.objectForPrimaryKey<VideoData>('VideoData', id);
      if (video) {
        realm.write(() => {
          video.isSelected = false;
        });
      } else {
        console.log(`Video with ID ${id} not found.`);
      }
    } catch (error) {
      console.error('Error removing from isSelected:', error);
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

  return (
    <View>
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
      )} */}

      {/* <Button onPress={getAuth}>get auth</Button> */}
      {/* <Button onPress={getBinaryAudio}>get binary</Button> */}
      {/* <Button onPress={transcribeAudio}>transcribe audio</Button>
      <Button onPress={cognosSession}>cognos session</Button> */}

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
                <View>
                  <View style={styles.container} key={video._id.toString()}>
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
                                  style={{margin: 2}}
                                  textStyle={{fontSize: 16}}
                                  mode="outlined"
                                  compact={true}>
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
                                  style={{margin: 2}}
                                  mode="outlined"
                                  compact={true}>
                                  {JSON.parse(key).title}
                                </Chip>
                              );
                            }
                          })}
                        </View>
                      </View>
                      {/* <View>
                        <Text>Transcript: {video.transcript}</Text>
                        <Text>
                          Prompt: Summarize this video transcript "
                          {video.transcript} " and include the summary of the
                          keywords ({checkedTitles}) and locations (
                          {checkedLocations}) tagged.
                        </Text>
                      </View> */}
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
                            removeFromIsSelected(video._id),
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
        <TouchableOpacity style={{alignItems: 'center'}} onPress={onPressTouch}>
          <Text style={{padding: 5, fontSize: 16, color: 'black'}}>
            Scroll to Top
          </Text>
        </TouchableOpacity>
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
