import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCameraDevices, Camera } from 'react-native-vision-camera';
import Video from 'react-native-video';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { Icon, Button } from '@rneui/themed';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useQuery, useRealm } from '../models/VideoData';
import Realm from 'realm';
import { createRealmContext } from '@realm/react';
import { getAuth, getTranscript } from '../components/stt_api';
import {FFmpegKit, ReturnCode} from 'ffmpeg-kit-react-native';

const RecordVideo = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  
  const camera: any = useRef(null);
  const videoPlayer: any = useRef();
  const [deviceType, setDeviceType] = useState<any | null>(null); // use default lense at startup
  const [deviceDir, setDeviceDir] = useState('back');
  const devices: any = useCameraDevices(deviceType);
  //use front camera
  const device = devices[deviceDir];

  

  const [showCamera, setShowCamera] = useState(true);
  const [recordingInProgress, setRecordingInProgress] = useState(false);
  const [recordingPaused, setRecordingPaused] = useState(false);

  // ref for timer interval
  const timerRef: any = useRef(null);
  // for timer interval
  const timeOfRecording = useState(0);
  // taken from timeOfRecording, used for display
  const displayTime = useState(0);
  // max length of recording allowed in seconds
  const maxLength = useState(60);
  const timeWarningMessage = useState('');
  // for starting and stopping timer
  const [enableTimer, setEnableTimer] = useState(false);

  const [videoSource, setVideoSource] = useState<any | string>('');

  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  /**
   * Make a new directory at the given folder path
   * @param folderPath Path for new folder
   */
  const makeDirectory = async (folderPath: string) => {
    await RNFS.mkdir(folderPath); //create a new folder on folderPath
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
      console.log(newCameraPermission, microphonePermission);
      if (newCameraPermission && microphonePermission) {
        console.log('Permissions granted');
      } else if (newCameraPermission !== 'authorized' || microphonePermission !== 'authorized') {
        console.log('Permissions denied');
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
        onRecordingError: (error: any) => console.error(error, 'videoerror'),
      });
      setRecordingInProgress(true);
      timeOfRecording[0] = 0;
      setEnableTimer(true);
      // getAuth();
    }
  }

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
        console.error('Failed to stop recording:', error);
      }
      console.log(enableTimer, '----zzzz');
    } else {
      console.warn('Camera reference is null');
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
    displayTime[1](0);
    timeWarningMessage[1]('');
  }

  /* timer */
  useEffect(() => {
    console.log(enableTimer, timerRef.current, '----enable timer 1');
    if (enableTimer) {
      timerRef.current = setInterval(() => {
        const time = timeOfRecording[0] + 1;
        console.log(enableTimer, timerRef.current, time, '----enable timer 2');

        timeOfRecording[0] = time;
        console.log('timeeee: ', timeOfRecording[0]);
        displayTime[1](timeOfRecording[0]);

        // 5 second warning
        if (timeOfRecording[0] >= maxLength[0] - 5) timeWarningMessage[1]( (maxLength[0]-timeOfRecording[0]) + ' more seconds');

        // stop recording once max time limit is reached
        if (maxLength[0] > 0 && time >= maxLength[0]) {
          stopRecodingHandler();
          clearInterval(timerRef.current);
          console.log(enableTimer, timerRef.current, '----enable timer 3');
        }

      }, 1000);
    } else {
      stopRecodingHandler();
      clearInterval(timerRef.current);
      console.log(enableTimer, timerRef.current, '----enable timer 4');
    }
    console.log('.........................................ss', enableTimer);
  }, [enableTimer]);


  /**
   * format timestamp from seconds to 00:00:00
   * @param d - data in seconds
   * @returns time in 00:00:00 format
   */
  function secondsToHms(d: number) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
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
      createVideoData(fileName, videoSource.duration, saveDate[0]);
      RNFS.moveFile(filePath, `${MHMRfolderPath}/${fileName}`)
        .then(async () => {
          console.log('File moved.');
          // convert to audio
          const ffmpegCommand = `-i ${MHMRfolderPath}/${fileName} -ar 16000 -ac 1 -vn -acodec pcm_s16le ${audioFolderPath}/${audioFileName}`;
          const session = await FFmpegKit.execute(ffmpegCommand);
          const returnCode = await session.getReturnCode();

              if (ReturnCode.isSuccess(returnCode)) {
                console.log('Conversion success');
                // if isConverted is for audio and not STT
                // video.isConverted = true;
              } else if (ReturnCode.isCancel(returnCode)) {
                console.log('Conversion canceled');
              } else {
                console.error('Conversion failed');
              }

          Alert.alert('Your recording has been saved');
          navigation.navigate('Home');
          // getTranscript(fileName, saveDate[0], 'Bearer ' + getAuth());
        })
        .catch(err => {
          console.log(err.message);
        });
    } catch (err: any) {
      console.error('Error during video saving or conversion:', err);
      Alert.alert(
        'There was an issue saving your recording. Please try again.',
      );
      console.log(err.message);
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
    {id: new Realm.BSON.ObjectID(), value: 7, title: 'Other', checked: false},
  ];


  const painscaleRef = [
    { id: new Realm.BSON.ObjectID(), name: 'Throbbing', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Shooting', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Stabbing', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Sharp', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Cramping', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Gnawing', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Burning', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Aching', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Heavy', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Tender', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Splitting', severity_level: 'none' },
    {
      id: new Realm.BSON.ObjectID(),
      name: 'Tiring/Exhausting',
      severity_level: 'none',
    },
    { id: new Realm.BSON.ObjectID(), name: 'Sickening', severity_level: 'none' },
    { id: new Realm.BSON.ObjectID(), name: 'Fearful', severity_level: 'none' },
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
    realm.write(() => {
      realm.create('VideoData', {
        _id: new Realm.BSON.ObjectID(),
        datetimeRecorded: new Date(),
        title: saveDate,
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
        transcript:[],
        weekday: new Date().toString().split(' ')[0],
      });
    });
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.timer}>{secondsToHms(displayTime[0])}</Text>
          {(timeWarningMessage[0] != '') ? (
            <Text style={styles.timeWarning}>{timeWarningMessage[0]}</Text>
          ): null}
          <View style={styles.buttonContainer}>
            {recordingInProgress ? (
              <>
              <TouchableOpacity onPress={() => {stopRecodingHandler();}}>
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
              source={{ uri: videoSource.path }} // path in cache where vision camera stores video
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
                  setShowCamera(true);
                }}>
                Re-Record
                <Icon name="repeat" color="white" />
              </Button>
              <Button
                buttonStyle={styles.btnStyle}
                radius={'sm'}
                type="solid"
                onPress={() => {
                  saveVideo(videoSource.path);
                  // console.log(painscaleRef);
                }}>
                Save Video
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
    //ADD backgroundColor COLOR GREY
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
  btnStyle: { backgroundColor: '#1C3EAA' },
  timer : {
    color: 'red',
    fontSize: 25,
    backgroundColor: 'white',
    opacity: 0.50,
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
    opacity: 0.50,
    borderRadius: 50,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 100,
    padding: 10,
    
  }
});

export default RecordVideo;
