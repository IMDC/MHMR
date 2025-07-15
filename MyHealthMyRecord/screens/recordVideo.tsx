import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  ParamListBase,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useCameraDevices, Camera} from 'react-native-vision-camera';
import Video from 'react-native-video';
import {PermissionsAndroid, Platform, Touchable} from 'react-native';
import RNFS from 'react-native-fs';
import {Icon, Button, Dialog, Input} from '@rneui/themed';
import {View, TouchableOpacity, Text, StyleSheet, Alert} from 'react-native';
import {useQuery, useRealm, VideoData, VideoSet} from '../models/VideoData';
import Realm from 'realm';
import {createRealmContext} from '@realm/react';
import {
  getAuth,
  getTranscript,
  transcribeWithWhisper,
} from '../components/stt_api';
import {
  detectCrisisContent,
  generateCrisisWarning,
  getCrisisResourcesText,
  CrisisDetectionResult,
} from '../components/crisisDetection';
import {useLoader} from '../components/loaderProvider';
import {
  useDropdownContext,
  DropdownContextType,
} from '../components/videoSetProvider';
import VideoSetDropdown from '../components/videoSetDropdown';
import {
  bottomNavBarHeight,
  NavBarGrey,
  screenWidth,
  MHMRBlue,
} from '../assets/util/styles';

const RecordVideo = () => {
  const {videoSetVideoIDs, videoSetValue, setVideoSetValue, handleNewSet} =
    useDropdownContext() as DropdownContextType;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [saveBtnState, setSaveBtnState] = useState(false);
  const [selectedVideoSet, setSelectedVideoSet] = useState<any>(null);
  const camera: any = useRef(null);
  const videoPlayer: any = useRef();
  const [deviceType, setDeviceType] = useState<any | null>(null); // use default lense at startup
  const [deviceDir, setDeviceDir] = useState('front');
  const [newVideoSetName, setNewVideoSetName] = useState('');
  const devices: any = useCameraDevices(deviceType);
  //use front camera
  const device = devices[deviceDir];
  const {showLoader, hideLoader} = useLoader();
  const videoSets = useQuery<any>('VideoSet');
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [showCamera, setShowCamera] = useState(true);
  const [recordingInProgress, setRecordingInProgress] = useState(false);
  const [recordingPaused, setRecordingPaused] = useState(false);
  const [createdVideoSetBool, setCreatedVideoSetBool] = useState(false);
  const [paused, setPaused] = useState(false);
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
  const [addToVideoSetPromptVisible, setAddToVideoSetPromptVisible] =
    useState(false);
  const [videoSetOverlayVisible, setVideoSetOverlayVisible] = useState(false);
  const [crisisWarningVisible, setCrisisWarningVisible] = useState(false);
  const [crisisDetectionResult, setCrisisDetectionResult] =
    useState<CrisisDetectionResult | null>(null);
  const [currentVideoId, setCurrentVideoId] =
    useState<Realm.BSON.ObjectId | null>(null);

  const handleNewSetNameChange = (name: React.SetStateAction<string>) => {
    setNewVideoSetName(name); // Update state when name changes
  };

  const handleConfirm = () => {
    if (videoSetValue === 'create_new' && newVideoSetName) {
      realm.write(() => {
        realm.create('VideoSet', {
          _id: new Realm.BSON.ObjectID(), // Generate new ID
          datetime: new Date().toString().split(' GMT-')[0],
          name: newVideoSetName, // Use captured name
          videoIDs: [], // Empty list for now
          summaryAnalysisBullet: '',
          summaryAnalysisSentence: '',
          isSummaryGenerated: false,
        });
      });
      console.log(`New Video Set ${newVideoSetName} created!`);
    }

    // Close the dialog after saving or if it's an existing set
    toggleSetPromptDialog();
  };

  const handleVideoSelectionChange = (selectedId: string) => {
    const selectedSet = videoSets.find(
      (set: any) => (set._id as Realm.BSON.ObjectId).toString() === selectedId,
    ) as VideoSet | undefined;

    if (selectedId === 'create_new') {
      setDateTime(new Date().toString().split(' GMT-')[0]);
      setSelectedVideoSet('create_new');
      setVideos([]);
      toggleSetNameDialog();
    } else if (selectedId) {
      setSelectedVideoSet(selectedSet);
    } else {
      setSelectedVideoSet(undefined);
      setVideos([]);
      return;
    }
  };
  const [setNameVisible, setSetNameVisible] = useState(false);

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

  const toggleVideoSetOverlay = () => {
    console.log('toggleVideoSetOverlay');
    setVideoSetOverlayVisible(!videoSetOverlayVisible);
  };

  const toggleSetNameDialog = () => {
    console.log('toggleSetNameDialog');
    setNewVideoSetName(new Date().toString().split(' GMT-')[0]);
    console.log('dateTime:', dateTime);
    setSetNameVisible(!setNameVisible);
  };

  const toggleSetPromptDialog = () => {
    console.log('toggleSetPromptDialog');
    setAddToVideoSetPromptVisible(!addToVideoSetPromptVisible);
  };

  const realm = useRealm();
  const result = useQuery('VideoData');

  const getVideoNameCount = (baseName: string) => {
    const videos = realm
      .objects('VideoData')
      .filtered(`title BEGINSWITH "${baseName}"`);
    return videos.length; // This returns the number of videos that start with the base name
  };

  const checkNameDuplicate = (name: string) => {
    const video = realm.objects('VideoData').filtered(`title == "${name}"`);
    if (video.length > 0) {
      return true;
    } else {
      return false;
    }
  };
  //console.log("result:", result);
  //const videodatas = useMemo(() => result.sorted("datetimeRecorded"), [result]);
  //console.log("videodatas:", videodatas);

  useFocusEffect(
    React.useCallback(() => {
      // Hide the tab bar
      navigation.getParent()?.setOptions({
        tabBarStyle: {display: 'none'},
      });
      return () => {
        // Restore the tab bar
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            height: bottomNavBarHeight,
            backgroundColor: NavBarGrey,
          },
        });
      };
    }, [navigation]),
  );

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
      // console.log('?', videoSource.path);
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
        setPaused(false);
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
  async function saveVideo(path: any, selectedVideoSet: any) {
    showLoader('Saving video...');
    const filePath = path.replace('file://', '');
    const pathSegments = filePath.split('/');
    const fileName = pathSegments[pathSegments.length - 1];
    const audioFileName = fileName.replace('.mp4', '.wav');
    const audioFolderPath = `${RNFS.DocumentDirectoryPath}/MHMR/audio`;

    const audioFolderExists = await RNFS.exists(audioFolderPath);
    if (!audioFolderExists) {
      await RNFS.mkdir(audioFolderPath);
    }

    const date = new Date().toString();
    const saveDate = date.split(' GMT-');

    try {
      const videoId = createVideoData(
        fileName,
        videoSource.duration,
        saveDate[0],
      );

      console.log('videoId after creation:', videoId);

      if (!videoId) {
        throw new Error(
          'Failed to create video data. videoId is null or undefined.',
        );
      }

      // Move the video file to your designated folder
      await RNFS.moveFile(filePath, `${MHMRfolderPath}/${fileName}`);
      console.log('File moved.');

      if (selectedVideoSet === 'none') {
        // Save video normally if no set is selected
        console.log('No set selected. Saving video normally');
      } else {
        // Add the video to the selected video set if it's not "create_new" or "none"
        if (selectedVideoSet) {
          console.log('Selected video set:', selectedVideoSet.name);
          realm.write(() => {
            //convert videoId to string
            const videoIdString = videoId?.toString();
            (selectedVideoSet as any).videoIDs.push(videoIdString);
          });
        }
      }

      // Transcribe the video using Whisper after saving
      const transcriptResult = await transcribeWithWhisper(
        fileName,
        videoId.toString(),
        realm,
      );
      if (transcriptResult.transcript) {
        // Check for crisis content
        const crisisResult = detectCrisisContent(transcriptResult.transcript);

        realm.write(() => {
          const video = realm.objectForPrimaryKey(
            'VideoData',
            videoId,
          ) as VideoData | null;
          if (video) {
            video.transcript = transcriptResult.transcript;
            video.isTranscribed = true;
            video.isConverted = true;
            video.flagged_for_harm = crisisResult.flagged;
          }
        });

        // Show crisis warning if harmful content is detected
        if (crisisResult.flagged) {
          setCrisisDetectionResult(crisisResult);
          setCrisisWarningVisible(true);
          hideLoader();
          return; // Don't show the normal save success dialog
        }
      }

      hideLoader();
      Alert.alert(
        'Your recording has been saved.',
        'Would you like to record another video and create a video set or markup video?',
        [
          {
            text: 'View Recordings',
            onPress: () => {
              if (createdVideoSetBool == true) {
                realm.write(() => {
                  videoSetVideoIDs.push(videoId.toString());
                });
              }
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
            text: 'Markup Video',
            onPress: () => {
              console.log('videoId before navigation:', videoId);
              if (videoId) {
                navigation.navigate('Manage Videos', {
                  screen: 'Add or Edit Markups',
                  params: {id: videoId.toString()},
                });
                setShowCamera(true);
              } else {
                console.error('videoId is null or undefined');
                Alert.alert(
                  'Error',
                  'Unable to navigate due to missing video ID.',
                );
              }
            },
          },
        ],
      );
    } catch (err) {
      hideLoader();
      Alert.alert(
        'Save Error',
        'There was an issue saving your recording. Please try again.',
        [{text: 'OK'}],
      );
      console.error(err);
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

  const createVideoSet = (frequencyData: any[], videoIDs: string[]) => {
    let videoIDsArray = videoIDs.map((id: string) => {
      return realm
        .objects('VideoData')
        .find(
          (video: any) => (video._id as Realm.BSON.ObjectId).toString() === id,
        ) as VideoData | undefined;
    });

    console.log('videoIDsArray:', videoIDsArray);

    let newSet: VideoSet | undefined;
    realm.write(() => {
      newSet = realm.create(VideoSet, {
        _id: new Realm.BSON.ObjectID(),
        datetime: new Date().toString().split(' GMT-')[0],
        name: newVideoSetName,
        frequencyData: frequencyData,
        videoIDs: videoIDs,
        summaryAnalysisBullet: '',
        summaryAnalysisSentence: '',
        isSummaryGenerated: false,
        earliestVideoDateTime: dateTime,
        latestVideoDateTime: dateTime,
      }) as VideoSet;

      // Update the dropdown value (if necessary)
      const updatedVideoSets = realm.objects(
        'VideoSet',
      ) as unknown as VideoSet[];
      const updatedDropdown = updatedVideoSets.map(set => {
        const s = set as VideoSet;
        return {
          label: `${s.name}\n\nVideo Count: ${s.videoIDs.length}\nDate Range: ${
            s.earliestVideoDateTime.toLocaleString().split(',')[0]
          } - ${s.latestVideoDateTime.toLocaleString().split(',')[0]}`,
          value: (s._id as Realm.BSON.ObjectId).toString(),
          id: s._id,
        };
      });

      const newVideoSetValue = newSet._id.toString();
      setVideoSetValue(newVideoSetValue);
      handleNewSet(newSet); // Call the function to handle new set logic
    });

    if (!newSet) throw new Error('Failed to create new VideoSet');

    return newSet;
  };

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
      numericScale: 0.0,
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

    let videoId: Realm.BSON.ObjectId | undefined;
    realm.write(() => {
      videoId = realm.create('VideoData', videoData)._id as Realm.BSON.ObjectId;
    });
    if (!videoId) throw new Error('Failed to create videoId');

    console.log('VideoData created:', videoData);
    console.log('Generated videoId:', videoId);

    return videoId;
  };

  return (
    <View style={styles.container}>
      <Dialog isVisible={visible} onBackdropPress={toggleDialog}>
        <Dialog.Title title="Name this video:" />
        <Input
          inputStyle={{fontSize: 35}}
          placeholder={dateTime}
          onChangeText={value => {
            setNewVideoName(value); // Update state with user input
          }}
        />
        <Dialog.Actions>
          <Dialog.Button
            title="CONFIRM"
            onPress={() => {
              const currentVideoName = newVideoName.trim() || dateTime; // Fallback to dateTime if newVideoName is empty
              if (!checkNameDuplicate(currentVideoName)) {
                saveVideo(videoSource.path, selectedVideoSet);
                setSaveBtnState(true);
                toggleDialog();
              } else {
                Alert.alert(
                  `There is already a video named "${currentVideoName}".`,
                  'Please rename the video.',
                  [
                    {
                      text: 'OK',
                    },
                  ],
                );
              }
            }}
          />
          <Dialog.Button
            title="CANCEL"
            onPress={() => {
              toggleDialog();
              setPaused(false);
            }}
          />
        </Dialog.Actions>
      </Dialog>

      <Dialog isVisible={setNameVisible} onBackdropPress={toggleSetNameDialog}>
        <Dialog.Title title="Name this video set:" />
        <Input
          inputStyle={{fontSize: 35}}
          placeholder={dateTime}
          onChangeText={value => {
            setNewVideoSetName(value);

            console.log('New Video Set Name:', value); // Log the new name as it changes
          }}
        />
        <Dialog.Actions>
          <Dialog.Button
            title="CONFIRM"
            onPress={async () => {
              if (newVideoSetName == '') {
                setNewVideoSetName(dateTime);
                const newSet = createVideoSet([], videoSetVideoIDs);

                setSelectedVideoSet(newSet);

                console.log('Newly Created Video Set:', newSet); // Log the newly created set
                toggleSetNameDialog();
              } else {
                const newSet = createVideoSet([], videoSetVideoIDs);

                setSelectedVideoSet(newSet);

                console.log('Newly Created Video Set:', newSet); // Log the newly created set
                toggleSetNameDialog();
              }
            }}
          />
          <Dialog.Button title="CANCEL" onPress={toggleSetNameDialog} />
        </Dialog.Actions>
      </Dialog>

      <Dialog
        isVisible={addToVideoSetPromptVisible}
        onBackdropPress={toggleSetPromptDialog}>
        <Dialog.Title title="Would you like to add this video to a set?" />

        <VideoSetDropdown
          videoSetDropdown={[]}
          videoSets={realm.objects('VideoSet')}
          saveVideoSetBtn={false}
          clearVideoSetBtn={false}
          keepViewBtn={false}
          manageSetBtn={false}
          onVideoSetChange={() => {}}
          onNewSetNameChange={() => {}}
          plainDropdown={false}
        />
        <Dialog.Actions>
          <Dialog.Button title="CONFIRM" onPress={handleConfirm} />

          <Dialog.Button
            title="CANCEL"
            onPress={() => toggleSetPromptDialog()}
          />
        </Dialog.Actions>
      </Dialog>

      <Dialog
        isVisible={crisisWarningVisible}
        onBackdropPress={() => setCrisisWarningVisible(false)}>
        <Dialog.Title title="⚠️ Crisis Warning" />
        <Text style={styles.crisisWarningText}>
          {crisisDetectionResult &&
            generateCrisisWarning(crisisDetectionResult)}
        </Text>
        <Text style={styles.crisisResourcesText}>
          {getCrisisResourcesText()}
        </Text>
        <Dialog.Actions>
          <Dialog.Button
            title="I UNDERSTAND"
            onPress={() => {
              setCrisisWarningVisible(false);
              // Show the normal save success dialog after crisis warning
              Alert.alert(
                'Your recording has been saved.',
                'Would you like to record another video and create a video set or markup video?',
                [
                  {
                    text: 'View Recordings',
                    onPress: () => {
                      if (createdVideoSetBool == true && currentVideoId) {
                        realm.write(() => {
                          videoSetVideoIDs.push(currentVideoId.toString());
                        });
                      }
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
                    text: 'Markup Video',
                    onPress: () => {
                      console.log('videoId before navigation:', currentVideoId);
                      if (currentVideoId) {
                        navigation.navigate('Manage Videos', {
                          screen: 'Add or Edit Markups',
                          params: {id: currentVideoId.toString()},
                        });
                        setShowCamera(true);
                      } else {
                        console.error('videoId is null or undefined');
                        Alert.alert(
                          'Error',
                          'Unable to navigate due to missing video ID.',
                        );
                      }
                    },
                  },
                ],
              );
            }}
          />
        </Dialog.Actions>
      </Dialog>
      {showCamera ? (
        <View style={{width: '100%', height: '100%', alignItems: 'center'}}>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCamera}
            video={true}
            audio={true}
          />
          <View style={{flexDirection: 'column', alignItems: 'center'}}>
            {/* Timer */}
            <Text style={styles.timer}>{secondsToHms(timeLeft)}</Text>
          </View>

          {/* Video Set Dropdown */}
          {videoSetOverlayVisible && (
            <View style={styles.setContainer}>
              <View style={styles.topBox}>
                <Text style={styles.label}>Adding to:</Text>
                <View style={{width: '60%', height: '60%', flex: 1}}>
                  <VideoSetDropdown
                    videoSetDropdown={[]}
                    videoSets={realm.objects('VideoSet')}
                    saveVideoSetBtn={false}
                    clearVideoSetBtn={false}
                    keepViewBtn={false}
                    manageSetBtn={false}
                    onVideoSetChange={() => {}}
                    onNewSetNameChange={() => {}}
                    plainDropdown={false}
                  />
                </View>
                <Icon
                  name="close"
                  size={30}
                  type="ionicon"
                  color="black"
                  onPress={() => {
                    toggleVideoSetOverlay();
                  }}
                />
              </View>
            </View>
          )}
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
                <View></View>
                <TouchableOpacity
                  style={{alignSelf: 'center', justifyContent: 'center'}}
                  onPress={() => {
                    stopRecodingHandler();
                  }}>
                  <Icon
                    name="stop"
                    size={40}
                    type="font-awesome"
                    color="white"
                  />
                </TouchableOpacity>
                <View></View>
              </>
            ) : (
              <>
                <View>
                  <Icon
                    name="add-outline"
                    size={40}
                    type="ionicon"
                    color="white"
                    onPress={() => {
                      toggleVideoSetOverlay();
                    }}
                  />
                  <Text style={{color: 'white', alignSelf: 'center'}}>
                    Add to Video Set
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.camButton}
                  onPress={() => {
                    StartRecodingHandler();
                    setSaveBtnState(false);
                  }}
                />
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
              </>
            )}
          </View>
        </View>
      ) : (
        <>
          {videoSource !== '' ? (
            <Video
              ref={ref => (videoPlayer.current = ref)}
              source={{uri: videoSource.path}} // path in cache where vision camera stores video
              paused={paused} // make it start
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
                  setPaused(true);
                  Alert.alert(
                    'Discard video?',
                    'Are you sure you want to discard this video?',
                    [
                      {
                        text: 'Yes',
                        onPress: () => {
                          setShowCamera(true);
                          setSaveBtnState(false);
                        },
                      },
                      {
                        text: 'No',
                        onPress: () => {},
                      },
                    ],
                  );
                }}>
                Exit without saving
                <Icon
                  name="exit-to-app"
                  type="ionicon"
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
                <Icon name="repeat" type="ionicon" color="white" />
              </Button>
              <Button
                disabled={saveBtnState}
                buttonStyle={styles.btnStyle}
                radius={'sm'}
                type="solid"
                onPress={() => {
                  setPaused(true);
                  setDateTime(new Date().toString().split(' GMT-')[0]);
                  setNewVideoName(new Date().toString().split(' GMT-')[0]);
                  toggleDialog();
                  // saveVideo(videoSource.path);
                  // setSaveBtnState(true);
                }}>
                Save video
                <Icon name="save" type="ionicon" color="white" />
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
    bottom: 0,
    alignItems: 'center',
    width: '100%',
    padding: 20,
    justifyContent: 'space-between',
  },
  topContainer: {
    position: 'absolute',
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
  btnStyle: {backgroundColor: MHMRBlue},
  timer: {
    color: 'red',
    fontSize: 25,
    backgroundColor: 'white',
    opacity: 0.5,
    borderRadius: 50,
    justifyContent: 'center',
    padding: 15,
    textAlign: 'center',
    marginVertical: 10,
  },
  timeWarning: {
    color: 'orange',
    fontSize: 15,
    backgroundColor: 'black',
    opacity: 0.5,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  setContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  topBox: {
    width: '60%',
    backgroundColor: 'white',
    opacity: 0.5,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  label: {
    fontSize: 18,
    marginRight: 10,
    color: 'black',
  },
  extendButtonContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    borderRadius: 20,
    padding: 10,
  },
  extendButton: {
    backgroundColor: MHMRBlue,
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
  crisisWarningText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  crisisResourcesText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RecordVideo;
