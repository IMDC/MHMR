import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useDropdownContext} from './videoSetProvider';
import {useRealm} from '../models/VideoData';
import * as Styles from '../assets/util/styles';
import {Button} from '@rneui/themed';
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const VideoSetDropdown = ({
  videoSetDropdown,
  videoSets,
  saveVideoSetBtn,
  clearVideoSetBtn,
  deleteAllVideoSetsBtn,
  manageSetBtn,
  onVideoSetChange,
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
    setCurrentSetID,
    currentSetID,
  } = useDropdownContext();
  const realm = useRealm();
  const [localDropdown, setLocalDropdown] = useState(videoSetDropdown);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  useEffect(() => {
    const formattedDropdown = videoSets.map(set => ({
      label: set.name,
      value: set._id.toString(),
      id: set._id,
    }));
    setLocalDropdown(formattedDropdown);
  }, [videoSets]);

  const createVideoSet = (frequencyData, videoIDs) => {
    let newSet;
    realm.write(() => {
      newSet = realm.create('VideoSet', {
        _id: new Realm.BSON.ObjectID(),
        datetime: new Date(),
        name: new Date().toString().split(' GMT-')[0],
        frequencyData: frequencyData,
        videoIDs: videoIDs,
        summaryAnalysis: '',
        isSummaryGenerated: false,
      });

      const updatedVideoSets = realm.objects('VideoSet');
      const updatedDropdown = updatedVideoSets.map(set => ({
        label: set.name,
        value: set._id.toString(),
        id: set._id,
      }));

      setLocalDropdown(updatedDropdown);

      const newVideoSetValue = newSet._id.toString();
      setVideoSetValue(newVideoSetValue);
      handleNewSet(newSet);
      onVideoSetChange(newVideoSetValue);
    });
  };

  const clearVideoSet = () => {
    setVideoSetVideoIDs([]);
    setVideoSetValue(null);
    onVideoSetChange(null);
    refreshDropdown();
  };

  const deleteAllVideoSets = () => {
    realm.write(() => {
      realm.delete(realm.objects('VideoSet'));
    });
    setLocalDropdown([]);
    setLocalDropdown([]);
    setVideoSetValue(null);
    setVideoSetVideoIDs([]);
    onVideoSetChange(null);
  };

  const refreshDropdown = () => {
    const updatedDropdown = videoSets.map(set => ({
      label: set.name,
      value: set._id.toString(),
      id: set._id,
    }));
    setLocalDropdown(updatedDropdown);
    if (updatedDropdown.length === 0) {
      setVideoSetValue(null);
      setVideoSetVideoIDs([]);
      onVideoSetChange(null);
    }
  };

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View style={{paddingBottom: 10}}>
        <Text style={{fontSize: 20}}>Select video set: </Text>
      </View>
      <Dropdown
        data={localDropdown}
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
        labelField="label"
        valueField="value"
        value={videoSetValue}
        onChange={item => {
          setVideoSetValue(item.value);
          handleChange(item.value, videoSets);
          onVideoSetChange(item.value);
        }}
      />
      {saveVideoSetBtn === false &&
      clearVideoSetBtn === false &&
      manageSetBtn === false &&
      deleteAllVideoSetsBtn === false ? (
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
          <View style={{flexDirection: 'row', paddingTop: 10}}>
            {saveVideoSetBtn && (
              <Button
                disabled={
                  videoSetVideoIDs == null || videoSetVideoIDs?.length === 0
                }
                title="Save video set"
                onPress={() => {
                  createVideoSet([], videoSetVideoIDs);
                }}
                color={Styles.MHMRBlue}
                radius={50}
                containerStyle={{
                  width: 300,
                  marginHorizontal: 30,
                  marginVertical: 15,
                }}
              />
            )}
            {clearVideoSetBtn && (
              <Button
                disabled={
                  videoSetVideoIDs == null || videoSetVideoIDs?.length === 0
                }
                title="Clear video set"
                onPress={clearVideoSet}
                color={Styles.MHMRBlue}
                radius={50}
                containerStyle={{
                  width: 300,
                  marginHorizontal: 30,
                  marginVertical: 15,
                }}
              />
            )}
          </View>
          <View style={{flexDirection: 'row', paddingTop: 10}}>
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
                containerStyle={{
                  width: 300,
                  marginHorizontal: 30,
                  marginVertical: 10,
                }}
              />
            )}
            {deleteAllVideoSetsBtn && (
              <Button
                title="Delete all video sets"
                onPress={deleteAllVideoSets}
                color={Styles.MHMRBlue}
                radius={50}
                containerStyle={{
                  width: 300,
                  marginHorizontal: 30,
                  marginVertical: 10,
                }}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default VideoSetDropdown;
