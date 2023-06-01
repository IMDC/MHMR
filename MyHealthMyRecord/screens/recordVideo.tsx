import React, {useEffect, useState, useRef, useMemo} from 'react';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useCameraDevices, Camera} from 'react-native-vision-camera';
import Video from 'react-native-video';

import {PermissionsAndroid, Platform} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {Icon, Button} from '@rneui/themed';
import {View, TouchableOpacity, Text, StyleSheet, Alert} from 'react-native';
import {Stopwatch} from 'react-native-stopwatch-timer';

const RecordVideo = () => {
  const options = {
    container: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      padding: 5,
      borderRadius: 5,
      width: 200,
      alignItems: 'center',
    },
    text: {
      fontSize: 25,
      color: '#fff',
      marginLeft: 7,
    },
  };

  //stopwatch variables
  const [stopwatchStart, setStopwatchStart] = useState(false);
  const [resetStopwatch, setResetStopwatch] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();


    const camera = useRef(null);
    const videoPlayer = useRef();
    const [deviceType, setDeviceType] = useState(null); // use default lense at startup
    const [deviceDir, setDeviceDir] = useState('back');
    const devices = useCameraDevices(deviceType);
    //use front camera
    const device = devices[deviceDir];

    const [showCamera, setShowCamera] = useState(true);
    const [recordingInProgress, setRecordingInProgress] = useState(false);
    const [recordingPaused, setRecordingPaused] = useState(false);

  const [videoSource, setVideoSource] = useState('');

  useEffect(() => {
    async function getPermission() {
      const newCameraPermission = await Camera.requestCameraPermission();
      const microphonePermission = await Camera.requestMicrophonePermission();
      console.log(newCameraPermission, microphonePermission);
    }
    getPermission();
    if (videoSource != '') {
      console.log('?', videoSource.path);
    }
  }, [videoSource]);

  async function StartRecodingHandler() {
    if (camera.current !== null) {
      camera.current.startRecording({
        flash: 'off',
        onRecordingFinished: video => {
          setVideoSource(video);
          console.log(video, 'videodata');
        },
        onRecordingError: error => console.error(error, 'videoerror'),
      });
      setRecordingInProgress(true);
      // setStopwatchStart(true);
      // setResetStopwatch(false);
    }


    async function pauseRecodingHandler() {
        if (camera.current !== null) {
            await camera.current.pauseRecording();
        }
        setRecordingPaused(true);
    }

    setRecordingPaused(true);
    // setStopwatchStart(false);
    // setResetStopwatch(false);
  }


    async function resumeRecodingHandler() {
        if (camera.current !== null) {
            await camera.current.resumeRecording();
        }
        setRecordingPaused(false);
    }

    setRecordingPaused(false);
    // setStopwatchStart(true);
    // setResetStopwatch(false);
  }

  async function stopRecodingHandler() {
    if (camera.current !== null) {
      await camera.current.stopRecording();
      setShowCamera(false);
      setRecordingInProgress(false);
      setRecordingPaused(false);
      // setResetStopwatch(true);

    }

  if (device == null) {
    return <Text>Camera not available</Text>;
  }

  async function hasAndroidPermission() {
    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  async function saveVideo(path) {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }

    // below: saves to Movies and video plays, path is "/storage/emulated/0/Movies/video.mp4"
    // CameraRoll.save(path);
    // below: saves to Camera and video plays, path is "/storage/emulated/0/DCIM/MHMR/video.mp4"
    CameraRoll.save(path, {album: 'MHMR'})
    Alert.alert('Your recording has been saved');
    navigation.navigate('Home');
  }

  // Show Camera ? (true - recordingInProgress ?
  // (true - stop button and recordongPaused ? (true - resume button) : (false - pause button)) : (false - record button))
  // : (false - re-record/save button)
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

          <View style={styles.topContainer}>
            {/* <Stopwatch
              start={stopwatchStart}
              reset={resetStopwatch}
              options={options}
              msecs={false}
              // getTime={time => {
              //   console.log(time);
              // }}
            /> */}
          </View>

          <View style={styles.buttonContainer}>
            {recordingInProgress ? (
              <>
                {/* <TouchableOpacity

                  onPress={() => {
                    stopRecodingHandler();
                  }}>
                  <Icon name="stop" size={40} type="font-awesome" />
                </TouchableOpacity> */}

                                <Icon
                                    name="stop"
                                    size={40}
                                    type="font-awesome"
                                    onPress={() => {
                                        stopRecodingHandler();
                                    }}
                                />


                {recordingPaused ? (
                  <>

                                        <Icon
                                            name="play"
                                            size={40}
                                            type="font-awesome"
                                            onPress={() => {
                                                resumeRecodingHandler();
                                            }}
                                        />
                                       
                                    </>
                                ) : (
                                    <>

                    <Icon
                      name="pause"
                      size={40}
                      type="font-awesome"
                      onPress={() => {
                        pauseRecodingHandler();
                      }}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <View style={styles.swapButton}>
                  <Icon
                    name="camera-reverse-outline"
                    size={40}
                    type="ionicon"
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
              source={{uri: videoSource.path}} // Can be a URL or a local file.
              paused={false} // make it start
              style={styles.backgroundVideo} // any style you want
              onBuffer={this.onBuffer} // Callback when remote video is buffering
              onError={this.videoError} // Callback when video cannot be loaded
              repeat={true}
              controls={true}
              fullscreen={true}
              resizeMode="cover"
            />
          ) : null}

          <View style={styles.topContainer}>
            <View style={styles.buttons}>
              <Button
                radius={'sm'}
                type="solid"
                onPress={() => {
                  setStopwatchStart(false);
                  setResetStopwatch(true);
                  setShowCamera(true);
                }}>
                Re-Record
                <Icon name="repeat" color="white" />
              </Button>
              <Button
                radius={'sm'}
                type="solid"
                onPress={() => saveVideo(videoSource.path)}>
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
  button: {
    backgroundColor: 'gray',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.0)',
    position: 'absolute',
    justifyContent: 'center',
    width: '100%',
    top: 0,
    padding: 20,
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
    camStopButton: {
        height: 80,
        width: 80,
        borderRadius: 10,
        //ADD backgroundColor COLOR GREY
        backgroundColor: '#B2BEB5',

        alignSelf: 'center',
        borderWidth: 4,
        borderColor: 'white',
    },
    image: {
        width: '100%',
        height: '100%',
        aspectRatio: 9 / 16,
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});

export default RecordVideo;
