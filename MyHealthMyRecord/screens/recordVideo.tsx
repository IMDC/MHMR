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
  const maxLength = useState(10);
  // for starting and stopping timer
  const [enableTimer, setEnableTimer] = useState(false);

  const [videoSource, setVideoSource] = useState<any | string>('');

  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

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
    }
    getPermission();
    //testing state for videoSource to make sure it's being updated right after video is recorded, test later and if it updates fine without this if condition we can delete it
    if (videoSource != '') {
      console.log('?', videoSource.path);
    }
    makeDirectory(MHMRfolderPath);
    makeDirectory(MHMRfolderPath + '/audio');
  }, [videoSource]);

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

  const stopRecodingHandler = async () => {
    if (camera.current !== null) {
      await camera.current.stopRecording();
      resetRecording();
      console.log(enableTimer, '----zzzz');
    }
  }

  const resetRecording = () => {
    setShowCamera(false);
    setRecordingInProgress(false);
    setRecordingPaused(false);
    setEnableTimer(false);
    displayTime[1](0);
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

        if (timeOfRecording[0] == maxLength[0] - 5) console.log('five more sec');

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


  /* format timestamp from seconds to 00:00:00*/
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

  async function saveVideo(path: any) {
    const filePath = path.replace('file://', '');
    const pathSegments = filePath.split('/');
    const fileName = pathSegments[pathSegments.length - 1];

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
        .then(() => {
          console.log('File moved.');
          // save video details to db here ?
          Alert.alert('Your recording has been saved');
          navigation.navigate('Home');
        })
        .catch(err => {
          console.log(err.message);
        });
    } catch (err: any) {
      Alert.alert(
        'There was an issue saving your recording. Please try again.',
      );
      console.log(err.message);
    }
  }
  const keywordRef = [
    { id: new Realm.BSON.ObjectID(), title: 'None', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Chronic', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Weak', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Depression', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Pain', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Fever', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Wellness', checked: false },
  ];

  const locationRef = [
    { id: new Realm.BSON.ObjectID(), title: 'Home', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Work', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'School', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Park', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Indoors', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Outdoors', checked: false },
    { id: new Realm.BSON.ObjectID(), title: 'Other', checked: false },
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

  keywordRef.map(key => keywordInit.push(JSON.stringify(key)));
  locationRef.map(loc => locationInit.push(JSON.stringify(loc)));
  painscaleRef.map(pain => painscaleInit.push(JSON.stringify(pain)));

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
          <Text style={styles.timer}>Time: {secondsToHms(displayTime[0])}</Text>
          <View style={styles.buttonContainer}>
            {recordingInProgress ? (
              <>
                <Icon
                  name="stop"
                  size={40}
                  type="font-awesome"
                  color="white"
                  onPress={() => {
                    stopRecodingHandler();
                  }}
                />

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
                )}
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
                  console.log(painscaleRef);
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
    backgroundColor: 'white',
    opacity: 0.50,
    borderRadius: 50,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 5,
    padding: 15,
  }
});

export default RecordVideo;
