import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCameraDevices, Camera } from 'react-native-vision-camera';
import Video from 'react-native-video';
import { PermissionsAndroid, Platform } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import { Icon, Button } from '@rneui/themed';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

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

    const [videoSource, setVideoSource] = useState<any | string>('');

    const MHMRfolderPath = RNFS.DocumentDirectoryPath + "/MHMR";

    const makeDirectory = async (folderPath: string) => {
        await RNFS.mkdir(folderPath); //create a new folder on folderPath
    };

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
    }, [videoSource]);

    async function StartRecodingHandler() {
        if (camera.current !== null) {
            camera.current.startRecording({
                flash: 'off',
                onRecordingFinished: (video: any) => {
                    setVideoSource(video);
                    console.log(video, 'videodata');
                },
                onRecordingError: (error: any) => console.error(error, 'videoerror'),
            })
            setRecordingInProgress(true);
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

    async function stopRecodingHandler() {
        if (camera.current !== null) {
            await camera.current.stopRecording();
            setShowCamera(false);
            setRecordingInProgress(false);
            setRecordingPaused(false);
        }
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

    //delete
    async function saveVideoCameraRoll(path: any) {
        if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
            return;
        }

        // below: saves to Movies and video plays, path is "/storage/emulated/0/Movies/video.mp4"
        // CameraRoll.save(path);
        // below: saves to Camera and video plays, path is "/storage/emulated/0/DCIM/MHMR/video.mp4"
        CameraRoll.save(path, { album: 'MHMR' })
        Alert.alert('Your recording has been saved');
        navigation.navigate('Home');
    };

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
        RNFS.moveFile(filePath, `${MHMRfolderPath}/${fileName}`)
            .then(() => {
                console.log('File moved.');
                // save video details to db here ?
                Alert.alert('Your recording has been saved');
                navigation.navigate('Home');
            })
            .catch(err => {
                console.log(err.message)
            });
    }

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
                                radius={'sm'}
                                type="solid"
                                onPress={() => {
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
});

export default RecordVideo;
