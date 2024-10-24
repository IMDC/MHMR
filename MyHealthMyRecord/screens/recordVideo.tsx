import React, {useEffect, useState, useRef, useMemo} from 'react';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useCameraDevices, Camera} from 'react-native-vision-camera';
import Video from 'react-native-video';
import {PermissionsAndroid, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {Icon, Button, Dialog, Input} from '@rneui/themed';
import {View, TouchableOpacity, Text, StyleSheet, Alert} from 'react-native';
import {useQuery, useRealm} from '../models/VideoData';
import Realm from 'realm';
import {createRealmContext} from '@realm/react';
import {getAuth, getTranscript} from '../components/stt_api';
import {FFmpegKit, ReturnCode} from 'ffmpeg-kit-react-native';
import {useLoader} from '../components/loaderProvider';

const RecordVideo = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [saveBtnState, setSaveBtnState] = useState(false);
  const camera: any = useRef(null);
  const videoPlayer: any = useRef();
  const [deviceType, setDeviceType] = useState<any | null>(null); // use default lense at startup
  const [deviceDir, setDeviceDir] = useState('front');
  const devices: any = useCameraDevices(deviceType);
  //use front camera
  const device = devices[deviceDir];
  const {showLoader, hideLoader} = useLoader();

  const [showCamera, setShowCamera] = useState(true);
  const [recordingInProgress, setRecordingInProgress] = useState(false);
  const [recordingPaused, setRecordingPaused] = useState(false);

  // ref for timer interval
  const timerRef: any = useRef(null);
  // for timer interval
  const [timeLeft, setTimeLeft] = useState(60);
  // max length of recording allowed in seconds
  const maxLength = 60;
  const [timeWarningMessage, setTimeWarningMessage] = useState('');
  const [showExtendButton, setShowExtendButton] = useState(false);
  // for starting and stopping timer
  const [enableTimer, setEnableTimer] = useState(false);
  const [timerExtended, setTimerExtended] = useState(false);

  const [videoSource, setVideoSource] = useState<any | string>('');
  const [dateTime, setDateTime] = useState('');
  const [newVideoName, setNewVideoName] = useState('');
  const [visible, setVisible] = useState(false);

  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  /**
   * Make a new directory at the given folder path
   * @param folderPath Path for new folder
   */
  const makeDirectory = async (folderPath: string) => {
    await RNFS.mkdir(folderPath); //create a new folder on folderPath
  };

  const toggleDialog = () => {
    console.log('toggleDialog');
    setVisible(!visible);
  };

  const realm = useRealm();
  const result = useQuery('VideoData');
  //console.log("result:", result);
  //const videodatas = useMemo(() => result.sorted("datetimeRecorded"), [result]);
  //console.log("videodatas:", videodatas);

  useEffect(() => {
    async function getPermission() {
      const newCameraPermission = await Camera.requestCameraPermission();
      const microphonePermission = await Camera.requestMicrophonePermission();
      if (
        newCameraPermission !== 'authorized' ||
        microphonePermission !== 'authorized'
      ) {
        Alert.alert(
          'Permissions denied',
          'Camera and microphone permissions are required.',
        );
      }
    }
    getPermission();
    //testing state for videoSource to make sure it's being updated right after video is recorded, test later and if it updates fine without this if condition we can delete it
    if (videoSource != '') {
      console.log('?', videoSource.path);
    }
    makeDirectory(MHMRfolderPath);
    makeDirectory(MHMRfolderPath + '/audio');
    makeDirectory(MHMRfolderPath + '/dashboard');
  }, [videoSource]);

  /**
   * Start recording handler for VisionCamera, start timer
   */
  const StartRecodingHandler = async () => {
    if (camera.current !== null) {
      camera.current.startRecording({
        flash: 'off',
        onRecordingFinished: (video: any) => {
          setVideoSource(video);
          console.log(video, 'videodata');
        },
        onRecordingError: (error: any) => {
          Alert.alert(
            'Recording Error',
            'The recording failed because no valid data was produced. Please try again.',
            [{text: 'OK'}],
          );
          // console.error(error);
          navigation.navigate('Home');
        },
      });
      setRecordingInProgress(true);
      setTimeLeft(maxLength);
      setEnableTimer(true);
      setTimerExtended(false);
      setTimeWarningMessage('');
      setShowExtendButton(false);
    }
  };

  async function pauseRecodingHandler() {
    if (camera.current !== null) {
      await camera.current.pauseRecording();
    }
    setRecordingPaused(true);
  }

  async function resumeRecodingHandler() {
    if (camera.current !== null) {
      await camera.current.resumeRecording();
    }
    setRecordingPaused(false);
  }

  /**
   * Stop recording handler for VisionCamera, reset recording options for next recording
   */
  const stopRecodingHandler = async () => {
    if (camera.current !== null) {
      try {
        await camera.current.stopRecording();
        console.log('Recording stopped successfully');
        resetRecording();
      } catch (error) {
        Alert.alert(
          'Stop Recording Error',
          'Failed to stop the recording. Please try again.',
          [{text: 'OK'}],
        );
        // console.error(error);
      }
    }
  };

  /**
   * Reset recording options
   */
  const resetRecording = () => {
    setShowCamera(false);
    setRecordingInProgress(false);
    setRecordingPaused(false);
    setEnableTimer(false);
    setTimeLeft(maxLength);
    setTimeWarningMessage('');
    setShowExtendButton(false);
    setTimerExtended(false);
  };

  const extendTime = () => {
    if (!timerExtended) {
      setTimeLeft(prevTimeLeft => prevTimeLeft + 60);
      setShowExtendButton(false);
      setTimerExtended(true);
      setTimeWarningMessage('');
    }
  };

  /* timer */
  useEffect(() => {
    if (enableTimer) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          const newTimeLeft = prevTimeLeft - 1;
          if (newTimeLeft <= 10 && newTimeLeft > 0) {
            setTimeWarningMessage(`${newTimeLeft} more seconds`);
          } else if (newTimeLeft <= 0) {
            stopRecodingHandler();
            clearInterval(timerRef.current);
          }
          if (newTimeLeft <= 15 && newTimeLeft > 0 && !timerExtended) {
            setShowExtendButton(true);
          }
          return newTimeLeft;
        });
      }, 1000);
    } else {
      stopRecodingHandler();
      clearInterval(timerRef.current);
    }
    return () => {
      clearInterval(timerRef.current);
    };
  }, [enableTimer, timerExtended]);

  /**
   * format timestamp from seconds to 00:00:00
   * @param d - data in seconds
   * @returns time in 00:00:00 format
   */
  function secondsToHms(d: number) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);
    return (
      ('0' + h).slice(-2) +
      ':' +
      ('0' + m).slice(-2) +
      ':' +
      ('0' + s).slice(-2)
    );
  }

  if (device == null) {
    return <Text>Camera not available</Text>;
  }

  /**
   * Check if device has permissions to read external storage and cameraroll
   * @returns boolean - true if permission granted, false if not
   */
  async function hasAndroidPermission() {
    const version = +Platform.Version;
    const permission =
      version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  /**
   * Save video to app storage, save VideoData object to database
   * @param path path of stored VisionCamera recording
   */
  async function saveVideo(path: any) {
    showLoader('Saving video...');
    const filePath = path.replace('file://', '');
    const pathSegments = filePath.split('/');
    const fileName = pathSegments[pathSegments.length - 1];
    const audioFileName = fileName.replace('.mp4', '.wav');
    const audioFolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';

    const audioFolderExists = await RNFS.exists(audioFolderPath);
    if (!audioFolderExists) {
      await RNFS.mkdir(audioFolderPath);
    }

    // delete console logs later
    console.log(filePath);
    // ex. /data/user/0/com.myhealthmyrecord/cache/VisionCamera-20230606_1208147672158123173592211.mp4
    console.log(pathSegments);
    // ex. ["", "data", "user", "0", "com.myhealthmyrecord", "cache", "VisionCamera-20230606_1208147672158123173592211.mp4"]
    console.log(fileName);
    // ex. VisionCamera-20230606_1208147672158123173592211.mp4

    // RNFS.DocumentDirectoryPath is /data/user/0/com.myhealthmyrecord/files
    const date = new Date().toString();
    const saveDate = date.split(' GMT-');
    console.log(date, saveDate);
    try {
      const videoId = createVideoData(
        fileName,
        videoSource.duration,
        saveDate[0],
      );
      RNFS.moveFile(filePath, `${MHMRfolderPath}/${fileName}`)
        .then(async () => {
          console.log('File moved.');
          // convert to audio
          const ffmpegCommand = `-i ${MHMRfolderPath}/${fileName} -ar 16000 -ac 1 -vn -acodec pcm_s16le ${audioFolderPath}/${audioFileName}`;
          const session = await FFmpegKit.execute(ffmpegCommand);
          const returnCode = await session.getReturnCode();

          if (ReturnCode.isSuccess(returnCode)) {
            Alert.alert(
              'Your recording has been saved.',
              'Would you like to record another or markup video?',
              [
                {
                  text: 'View Recordings',
                  onPress: () => {
                    navigation.navigate('Manage Videos', {
                      screen: 'View Recordings',
                    });
                    setShowCamera(true);
                  },
                },
                {
                  text: 'Record Another',
                  onPress: () => {
                    setShowCamera(true);
                  },
                },
                {
                  text: 'Markup video',
                  onPress: () => {
                    navigation.navigate('Manage Videos', {
                      screen: 'Add or Edit Markups',
                      params: {id: videoId},
                    });
                    setShowCamera(true);
                  },
                },
              ],
            );
            hideLoader();
            //
            // video.isConverted = true;
          } else if (ReturnCode.isCancel(returnCode)) {
            console.log('Conversion canceled');
          } else {
            hideLoader();
            Alert.alert(
              'Conversion failed',
              'There was an issue converting your video to audio.',
            );
          }
        })
        .catch(err => {
          Alert.alert(
            'File Move Error',
            'There was an issue moving your recording. Please try again.',
            [{text: 'OK'}],
          );
          navigation.navigate('Home');
        });
    } catch (err: any) {
      Alert.alert(
        'Save Error',
        'There was an issue saving your recording. Please try again.',
        [{text: 'OK'}],
      );
      // console.error(err);
    }
  }
  const keywordRef = [
    {id: new Realm.BSON.ObjectID(), value: 1, title: 'None', checked: false},
    {id: new Realm.BSON.ObjectID(), value: 2, title: 'Chronic', checked: false},
    {id: new Realm.BSON.ObjectID(), value: 3, title: 'Weak', checked: false},
    {
      id: new Realm.BSON.ObjectID(),
      value: 4,
      title: 'Depression',
      checked: false,
    },
    {id: new Realm.BSON.ObjectID(), value: 5, title: 'Pain', checked: false},
    {id: new Realm.BSON.ObjectID(), value: 6, title: 'Fever', checked: false},
    {
      id: new Realm.BSON.ObjectID(),
      value: 7,
      title: 'Wellness',
      checked: false,
    },
  ];

  const weekdayRef = [
    {id: new Realm.BSON.ObjectID(), value: 1, title: 'Sun'},
    {id: new Realm.BSON.ObjectID(), value: 2, title: 'Mon'},
    {id: new Realm.BSON.ObjectID(), value: 3, title: 'Tues'},
    {id: new Realm.BSON.ObjectID(), value: 4, title: 'Wed'},
    {id: new Realm.BSON.ObjectID(), value: 5, title: 'Thu'},
    {id: new Realm.BSON.ObjectID(), value: 6, title: 'Fri'},
    {id: new Realm.BSON.ObjectID(), value: 7, title: 'Sat'},
  ];

  const locationRef = [
    {id: new Realm.BSON.ObjectID(), value: 1, title: 'Home', checked: false},
    {id: new Realm.BSON.ObjectID(), value: 2, title: 'Work', checked: false},
    {id: new Realm.BSON.ObjectID(), value: 3, title: 'School', checked: false},
    {id: new Realm.BSON.ObjectID(), value: 4, title: 'Park', checked: false},
    {id: new Realm.BSON.ObjectID(), value: 5, title: 'Indoors', checked: false},
    {
      id: new Realm.BSON.ObjectID(),
      value: 6,
      title: 'Outdoors',
      checked: false,
    },
  ];

  const painscaleRef = [
    {id: new Realm.BSON.ObjectID(), name: 'Throbbing', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Shooting', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Stabbing', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Sharp', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Cramping', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Gnawing', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Burning', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Aching', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Heavy', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Tender', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Splitting', severity_level: 'none'},
    {
      id: new Realm.BSON.ObjectID(),
      name: 'Tiring/Exhausting',
      severity_level: 'none',
    },
    {id: new Realm.BSON.ObjectID(), name: 'Sickening', severity_level: 'none'},
    {id: new Realm.BSON.ObjectID(), name: 'Fearful', severity_level: 'none'},
    {
      id: new Realm.BSON.ObjectID(),
      name: 'Cruel/Punishing',
      severity_level: 'none',
    },
  ];

  let keywordInit: string[] = [];
  let locationInit: string[] = [];
  let painscaleInit: string[] = [];
  let weekdayInit: string[] = [];

  keywordRef.map(key => keywordInit.push(JSON.stringify(key)));
  locationRef.map(loc => locationInit.push(JSON.stringify(loc)));
  painscaleRef.map(pain => painscaleInit.push(JSON.stringify(pain)));
  weekdayRef.map(day => weekdayInit.push(JSON.stringify(day)));

  const createVideoData = (
    filename: string,
    duration: number,
    saveDate: string,
  ) => {
    const videoData = {
      _id: new Realm.BSON.ObjectID(),
      datetimeRecorded: dateTime,
      title: newVideoName,
      filename: filename,
      duration: duration,
      textComments: [],
      emotionStickers: [],
      keywords: keywordInit,
      locations: locationInit,
      painScale: painscaleInit,
      numericScale: 0,
      isSelected: false,
      isConverted: false,
      isTranscribed: false,
      transcript: '',
      weekday: new Date().toString().split(' ')[0],
      sentiment: '',
      tsOutputBullet: '',
      tsOutputSentence: '',
      summaryAnalysisBullet: '',
      summaryAnalysisSentence: '',
    };

    let videoId;
    realm.write(() => {
      videoId = realm.create('VideoData', videoData)._id;
    });
    return videoId;
  };

  return (
    <View style={styles.container}>
      <Dialog isVisible={visible} onBackdropPress={toggleDialog}>
        <Dialog.Title title="Name this video:" />
        <Input
          inputStyle={{fontSize: 35}}
          placeholder={dateTime}
          // onChangeText={value => setNewKeyword(value)}
          onChangeText={value => {
            setNewVideoName(value);
            console.log('New Video Set Name:', newVideoName);
          }}
        />
        <Dialog.Actions>
          <Dialog.Button
            title="CONFIRM"
            onPress={() => {
              saveVideo(videoSource.path);
              toggleDialog();
            }}
          />
          <Dialog.Button title="CANCEL" onPress={() => toggleDialog()} />
        </Dialog.Actions>
      </Dialog>
      {showCamera ? (
        <>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCamera}
            video={true}
            audio={true}
          />
          <Text style={styles.timer}>{secondsToHms(timeLeft)}</Text>
          {timeWarningMessage != '' ? (
            <Text style={styles.timeWarning}>{timeWarningMessage}</Text>
          ) : null}
          {showExtendButton && !timerExtended && (
            <View style={styles.extendButtonContainer}>
              <TouchableOpacity
                style={styles.extendButton}
                onPress={extendTime}>
                <Icon
                  name="timer"
                  size={20}
                  color="white"
                  style={styles.extendButtonIcon}
                />
                <Text style={styles.extendButtonText}>Extend timer once</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.buttonContainer}>
            {recordingInProgress ? (
              <>
                <TouchableOpacity
                  onPress={() => {
                    stopRecodingHandler();
                  }}>
                  <Icon
                    name="stop"
                    size={40}
                    type="font-awesome"
                    color="white"
                    // onPress={() => {
                    //   stopRecodingHandler();
                    // }}
                  />
                </TouchableOpacity>
                {/* 
                {recordingPaused ? (
                  <Icon
                    name="play"
                    size={40}
                    type="font-awesome"
                    color="white"
                    onPress={() => {
                      resumeRecodingHandler();
                    }}
                  />
                ) : (
                  <Icon
                    name="pause"
                    size={40}
                    type="font-awesome"
                    color="white"
                    onPress={() => {
                      pauseRecodingHandler();
                    }}
                  />
                )} */}
              </>
            ) : (
              <>
                <View style={styles.swapButton}>
                  <Icon
                    name="camera-reverse-outline"
                    size={40}
                    type="ionicon"
                    color="white"
                    onPress={() => {
                      if (deviceDir == 'back') {
                        setDeviceDir('front');
                      } else {
                        setDeviceDir('back');
                      }
                    }}
                  />
                </View>
                <TouchableOpacity
                  style={styles.camButton}
                  onPress={() => {
                    StartRecodingHandler();
                    setSaveBtnState(false);
                  }}
                />
              </>
            )}
          </View>
        </>
      ) : (
        <>
          {videoSource !== '' ? (
            <Video
              ref={ref => (videoPlayer.current = ref)}
              source={{uri: videoSource.path}} // path in cache where vision camera stores video
              paused={false} // make it start
              style={styles.backgroundVideo}
              repeat={true}
              controls={true}
              fullscreen={true}
              resizeMode="cover"
            />
          ) : null}

          <View style={styles.topContainer}>
            <View style={styles.buttons}>
              <Button
                buttonStyle={styles.btnStyle}
                radius={'sm'}
                type="solid"
                onPress={() => {
                  navigation.navigate('Home');
                }}>
                Exit without saving
                <Icon
                  name="exit-to-app"
                  color="white"
                  containerStyle={{transform: [{rotate: '180deg'}]}}
                />
              </Button>
              <Button
                buttonStyle={styles.btnStyle}
                radius={'sm'}
                type="solid"
                onPress={() => {
                  setShowCamera(true);
                }}>
                Re-record
                <Icon name="repeat" color="white" />
              </Button>
              <Button
                disabled={saveBtnState}
                buttonStyle={styles.btnStyle}
                radius={'sm'}
                type="solid"
                onPress={() => {
                  setDateTime(new Date().toString().split(' GMT-')[0]);
                  setNewVideoName(new Date().toString().split(' GMT-')[0]);
                  toggleDialog();
                  // saveVideo(videoSource.path);
                  // setSaveBtnState(true);
                }}>
                Save video
                <Icon name="save" color="white" />
              </Button>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    padding: 20,
    justifyContent: 'space-evenly',
  },
  swapButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  topContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    top: 0,
    padding: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  camButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#B2BEB5',
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  btnStyle: {backgroundColor: '#1C3EAA'},
  timer: {
    color: 'red',
    fontSize: 25,
    backgroundColor: 'white',
    opacity: 0.5,
    borderRadius: 50,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
    padding: 15,
  },
  timeWarning: {
    color: 'orange',
    fontSize: 15,
    backgroundColor: 'black',
    opacity: 0.5,
    borderRadius: 50,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 100,
    padding: 10,
  },
  extendButtonContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    borderRadius: 20,
    padding: 10,
  },
  extendButton: {
    backgroundColor: '#1C3EAA',
    padding: 10,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  extendButtonIcon: {
    marginRight: 5,
  },
  extendButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default RecordVideo;
