import React, {useState, useEffect} from 'react';
import {View, Text, Alert} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useDropdownContext} from './videoSetProvider';
import {VideoData, useQuery, useRealm} from '../models/VideoData';
import * as Styles from '../assets/util/styles';
import {Button, Dialog, Input} from '@rneui/themed';
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const VideoSetDropdown = ({
  videoSetDropdown,
  videoSets,
  saveVideoSetBtn,
  clearVideoSetBtn,
  keepViewBtn,
  manageSetBtn,
  onVideoSetChange,
  onNewSetNameChange,
  plainDropdown,
}) => {
  const {
    handleChange,
    handleNewSet,
    videoSetValue,
    videoSetVideoIDs,
    setVideoSetVideoIDs,
    setVideoSetValue,
    setCurrentVideoSet,
    currentVideoSet,
    isVideoSetSaved,
    handleDeleteSet,
  } = useDropdownContext();
  const realm = useRealm();
  const [localDropdown, setLocalDropdown] = useState(videoSetDropdown);
  const route = useRoute();
  const [visible, setVisible] = useState(false);
  const [dateTime, setDateTime] = useState('');
  const [newVideoSetName, setNewVideoSetName] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const videoData = useQuery<VideoData>('VideoData');

  useEffect(() => {
    const shouldShowCreateNew = route.name === 'Record Video';
    const formattedDropdown = [
      ...(shouldShowCreateNew ? [{
        label: "+ Create New",
        value: "create_new",
        id: "create_new",
      }] : []),
      ...videoSets.map(set => ({
        label: `${set.name}\n\nVideo Count: ${set.videoIDs.length}\nDate Range: ${
          set.earliestVideoDateTime.toLocaleString().split(',')[0]
        } - ${set.latestVideoDateTime.toLocaleString().split(',')[0]}`,
        value: set._id.toString(),
        id: set._id,
      })),
    ];

    setLocalDropdown(formattedDropdown);
  }, [videoSets, plainDropdown]);

  const toggleDialog = () => {
    console.log('toggleDialog');
    setVisible(!visible);
  };

  const createVideoSet = (frequencyData, videoIDs) => {
    const videoObjs = videoIDs.map(id =>
      realm.objects('VideoData').find(video => video._id.toString() === id),
    );
  
    const unconvertedVideos = videoObjs.filter(video => video?.isConverted === false);
    const convertedVideos = videoObjs.filter(video => video?.isConverted === true);
  
    let newSet, newSetCopy;
  
    // Realm write must ONLY touch Realm
    realm.write(() => {
      newSet = realm.create('VideoSet', {
        _id: new Realm.BSON.ObjectID(),
        datetime: new Date().toString().split(' GMT-')[0],
        name: newVideoSetName,
        frequencyData: frequencyData,
        videoIDs: videoIDs,
        summaryAnalysisBullet: '',
        summaryAnalysisSentence: '',
        isSummaryGenerated: false,
        earliestVideoDateTime: videoObjs[0].datetimeRecorded,
        latestVideoDateTime: videoObjs[videoObjs.length - 1].datetimeRecorded,
        isAnalyzed: unconvertedVideos.length === 0 || convertedVideos.length > 0,
        isCurrent: true, // also set as current
      });
  
      const allSets = realm.objects('VideoSet');
      allSets.forEach(set => {
        if (set._id.toHexString() !== newSet._id.toHexString()) {
          set.isCurrent = false;
        }
      });
  
      newSetCopy = {
        _id: newSet._id,
        name: newSet.name,
        videoIDs: [...newSet.videoIDs],
      };
    });
  
    // React state updates must happen AFTER Realm write
    const updatedDropdown = [
      {
        label: '+ Create New',
        value: 'create_new',
        id: 'create_new',
      },
      ...realm.objects('VideoSet').map(set => ({
        label: `${set.name}\n\nVideo Count: ${set.videoIDs.length}\nDate Range: ${
          set.earliestVideoDateTime.toLocaleString().split(',')[0]
        } - ${set.latestVideoDateTime.toLocaleString().split(',')[0]}`,
        value: set._id.toString(),
        id: set._id,
      })),
    ];
  
    setLocalDropdown(updatedDropdown);
    setVideoSetValue(newSetCopy._id.toString());
    handleNewSet(newSet);
    onVideoSetChange(newSetCopy._id.toString());
  };
  

  const clearVideoSet = () => {
    setVideoSetVideoIDs([]);
    setVideoSetValue(null);
    onVideoSetChange(null);
    refreshDropdown();
  };

  const checkSetNameDuplicate = (name: string) => {
    const video = realm.objects('VideoSet').filtered(`name == "${name}"`);
    if (video.length > 0) {
      return true;
    } else {
      return false;
    }
  };


  const refreshDropdown = () => {
    const updatedDropdown = [
      {
        label: "+ Create New",
        value: "create_new",
        id: "create_new",
      },
      ...videoSets.map(set => ({
        label: `${set.name}\n\nVideo Count: ${set.videoIDs.length}\nDate Range: ${
          set.earliestVideoDateTime.toLocaleString().split(',')[0]
        } - ${set.latestVideoDateTime.toLocaleString().split(',')[0]}`,
        value: set._id.toString(),
        id: set._id,
      })),
    ];
  
    setLocalDropdown(updatedDropdown);
  
    if (updatedDropdown.length === 1) {  
      setVideoSetValue(null);
      setVideoSetVideoIDs([]);
      onVideoSetChange(null);
    }
  };

  return (
    <View
      style={{
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {plainDropdown === false && (
        <Dialog isVisible={visible} onBackdropPress={toggleDialog}>
          <Dialog.Title title="Name this video set:" />
          <Input
            inputStyle={{fontSize: 35}}
            placeholder={dateTime}
            // onChangeText={value => setNewKeyword(value)}
            onChangeText={value => {
              setNewVideoSetName(value);
              console.log('New Video Set Name:', newVideoSetName);
            }}
          />
          <Dialog.Actions>
            <Dialog.Button
              title="CONFIRM"
              onPress={() => {
                if (!checkSetNameDuplicate(newVideoSetName)) {
                  createVideoSet([], videoSetVideoIDs);
                  toggleDialog();
                } else {
                  Alert.alert(
                    'Error',
                    'Video set name already exists. Please choose a different name.',
                  );
                  [{text: 'OK'}];
                }
              }}
            />
            <Dialog.Button title="CANCEL" onPress={() => toggleDialog()} />
          </Dialog.Actions>
        </Dialog>
      )}
      {plainDropdown === false && (
        <View style={{paddingBottom: 10}}>
          <Text style={{fontSize: 20}}>Select video set: </Text>
        </View>
      )}
      <Dropdown
        data={localDropdown}
        maxHeight={400}
        style={{
          height: 50,
          width: '80%',
          paddingHorizontal: 20,
          backgroundColor: '#DBDBDB',
          borderRadius: 22,
        }}
        placeholderStyle={{fontSize: 22}}
        selectedTextStyle={{fontSize: 22}}
        placeholder="Select video set"
        activeColor="#FFC745"
        labelField="label"
        valueField="value"
        search
        searchPlaceholder="Search..."
        value={videoSetValue}
        onChange={item => {
          setCurrentVideoSet(
            videoSets.find(set => set._id.toString() === item.value),
          );
          console.log('Current Video Set:', currentVideoSet);
          //console log if videoset isCurrent == true
          console.log(
            'Current Video Set isCurrent:', currentVideoSet?.isCurrent,
          );


          setVideoSetValue(item.value);
          handleChange(item.value, videoSets);
          onVideoSetChange(item.value);
        }}
      />
      {/*when dropdown value is equal to create new*/}
      {saveVideoSetBtn === false &&
        clearVideoSetBtn === false &&
        manageSetBtn === false &&
        videoSetValue === 'create_new' &&
        plainDropdown === false && (
          <View style={{paddingTop: 20, width: '80%', flexDirection: 'column'}}>
            <Text>Name this video set:</Text>
            <Input
              inputStyle={{fontSize: 35}}
              placeholder={dateTime}
              onChangeText={value => {
                setNewVideoSetName(value); // Captures local state
                onNewSetNameChange(value); // Pass value to parent
                console.log('New Video Set Name:', newVideoSetName);
              }}
            />
          </View>
        )}
      {saveVideoSetBtn === false &&
      clearVideoSetBtn === false &&
      manageSetBtn === false &&
      keepViewBtn === true ? (
        <View style={{flexDirection: 'row', paddingTop: 30}}>
          <Button
            title="View videos in video set"
            onPress={() => navigation.navigate('Dashboard')}
            color={Styles.MHMRBlue}
            radius={50}
            containerStyle={{
              width: 300,
            }}
            disabled={localDropdown.length === 0}
          />
        </View>
      ) : (
        <View>
          <View
            style={{
              flexDirection: 'row',
              paddingTop: 10,
              justifyContent: 'center',
            }}>
            {saveVideoSetBtn && (
              <Button
                disabled={
                  videoSetVideoIDs == null || videoSetVideoIDs?.length === 0
                }
                title="Save video set"
                // onPress={() => {
                //   createVideoSet([], videoSetVideoIDs);
                // }}
                onPress={() => {
                  setDateTime(new Date().toString().split(' GMT-')[0]);
                  setNewVideoSetName(new Date().toString().split(' GMT-')[0]);
                  toggleDialog();
                }}
                color={Styles.MHMRBlue}
                radius={50}
                containerStyle={styles.btnContainer}
              />
            )}
            {manageSetBtn && (
              <Button
                disabled={!currentVideoSet || videoSetValue == null}
                title="Manage video set"
                onPress={() =>
                  navigation.navigate('Manage Video Set', {
                    videoSet: currentVideoSet,
                  })
                }
                color={Styles.MHMRBlue}
                radius={50}
                containerStyle={styles.btnContainer}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingTop: 10,
              justifyContent: 'center',
            }}>
            {clearVideoSetBtn && (
              <Button
                disabled={
                  videoSetVideoIDs == null || videoSetVideoIDs?.length === 0
                }
                title="Clear screen"
                onPress={clearVideoSet}
                color={Styles.MHMRBlue}
                radius={50}
                containerStyle={styles.btnContainer}
              />
            )}
          </View>
          {videoSetVideoIDs.length != 0 && isVideoSetSaved === false && (
            <View style={{paddingBottom: 15}}>
              <Text
                style={{fontSize: 20, color: '#C70039', textAlign: 'center'}}>
                Warning! Current video set is not saved. Click 'Save video set'
                to save it.{' '}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = {
  btnContainer: {
    width: '35%',
    marginHorizontal: 30,
    marginVertical: '1%',
  },
};

export default VideoSetDropdown;
