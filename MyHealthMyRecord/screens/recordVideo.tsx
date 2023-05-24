import React, { useEffect, useState, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCameraDevices, Camera } from 'react-native-vision-camera';
import Video from 'react-native-video';
import video from '../assets/videos/test.mp4';
import {
    View,
    Button,
    Alert,
    TouchableOpacity,
    Text,
    StyleSheet,
    Image,
    Dimensions,
} from 'react-native';


const RecordVideo = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    const camera = useRef(null);
    const videoPlayer = useRef();
    const devices = useCameraDevices();
    //use front camera
    const device = devices.back;

    const [showCamera, setShowCamera] = useState(true);
    const [recordingInProgress, setRecordingInProgress] = useState(false);
    const [recordingPaused, setRecordingPaused] = useState(false);

    //delete
    const [imageSource, setImageSource] = useState('');
    const [videoSource, setVideoSource] = useState('');

    useEffect(() => {
        async function getPermission() {
            const newCameraPermission = await Camera.requestCameraPermission();
            const microphonePermission = await Camera.requestMicrophonePermission();
            console.log(newCameraPermission, microphonePermission);
        }
        getPermission();
        if (videoSource != '') {
            console.log('?', videoSource.path)
        }
    }, [videoSource]);

    //delete
    /*
    const capturePhoto = async () => {
        if (camera.current !== null) {
            const photo = await camera.current.takePhoto({});
            setImageSource(photo.path);
            setShowCamera(false);
            console.log(photo.path);
        }
    };
    */

    async function StartRecodingHandler() {
        if (camera.current !== null) {
            camera.current.startRecording({
                flash: 'off',
                onRecordingFinished: (video) => {
                    setVideoSource(video);
                    console.log(video, 'videodata');
                },
                onRecordingError: (error) => console.error(error, 'videoerror'),
            })
            //setVideoSource(video);
            //console.log(videoSource);
            setRecordingInProgress(true);
        }
    }

    async function pauseRecodingHandler() {
        if (camera.current !== null) {
            await camera.current.pauseRecording()
        }
        setRecordingPaused(true);
    }

    async function resumeRecodingHandler() {
        if (camera.current !== null) {
            await camera.current.resumeRecording()
        }
        setRecordingPaused(false);
    }

    async function stopRecodingHandler() {
        if (camera.current !== null) {
            await camera.current.stopRecording()
            setShowCamera(false);
            setRecordingInProgress(false);
            setRecordingPaused(false);
        }
    }

    if (device == null) {
        return <Text>Camera not available</Text>;
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

                    <View style={styles.buttonContainer}>
                        {recordingInProgress ? (
                            <>
                                <TouchableOpacity
                                    onPress={() => { stopRecodingHandler() }}>
                                    <Text style={{ fontSize: 35 }}>Stop</Text>
                                </TouchableOpacity>
                                {recordingPaused ? (
                                    <>

                                        <TouchableOpacity onPress={() => { resumeRecodingHandler() }}>
                                            <Text style={{ fontSize: 35 }}>Resume</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity onPress={() => { pauseRecodingHandler() }}>
                                            <Text style={{ fontSize: 35 }}>Pause</Text>
                                        </TouchableOpacity>
                                    </>
                                )}


                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.camButton}
                                    onPress={() => StartRecodingHandler()}
                                />
                            </>
                        )}
                    </View>
                </>
            ) : (
                <>
                    {imageSource !== '' ? (
                        <Image
                            style={styles.image}
                            source={{
                                uri: `file://'${imageSource}`,
                            }}
                        />
                    ) : null}

                    {videoSource !== '' ? (
                        <Text>{videoSource.path}</Text>
                    ) : null}

                    <Video
                        ref={ref => (videoPlayer.current = ref)}
                        source={{ uri: videoSource.path }}   // Can be a URL or a local file.
                        paused={false}                  // make it start    
                        style={styles.backgroundVideo}  // any style you want
                        onBuffer={this.onBuffer}                // Callback when remote video is buffering
                        onError={this.videoError}               // Callback when video cannot be loaded
                        repeat={true}
                        controls={true}
                        fullscreen={true}
                        resizeMode="cover" />

                    {/* <View style={styles.backButton}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                padding: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: '#fff',
                                width: 100,
                            }}
                            disabled
                            onPress={() => setShowCamera(true)}>
                            <Text style={{ color: 'white', fontWeight: '500' }}>Disabled</Text>
                        </TouchableOpacity>
                    </View> */}
                    <View style={styles.playbackContainer}>
                        <View style={styles.buttons}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#fff',
                                    padding: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 10,
                                    borderWidth: 2,
                                    borderColor: '#77c3ec',
                                }}
                                onPress={() => setShowCamera(true)}>
                                <Text style={{ color: '#77c3ec', fontWeight: '500' }}>
                                    Re-Record
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#77c3ec',
                                    padding: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 10,
                                    borderWidth: 2,
                                    borderColor: 'white',
                                }}
                                onPress={() => setShowCamera(true)}>
                                <Text style={{ color: 'white', fontWeight: '500' }}>
                                    Use Video
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}

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
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        bottom: 0,
        padding: 20,
    },
    playbackContainer: {
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
