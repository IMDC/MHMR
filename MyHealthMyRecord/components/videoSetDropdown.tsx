import React, {useContext, useState, useEffect} from 'react';
import { View, Text } from 'react-native';
import {Button, Icon, CheckBox, Badge} from '@rneui/themed';
import {Dropdown} from 'react-native-element-dropdown';
import {VideoSetContext} from './videoSetProvider';
import {VideoData, useRealm} from '../models/VideoData';
import * as Styles from '../assets/util/styles';

const VideoSetDropdown = ({
  videoSetDropdown,
  videoSets,
  saveVideoSetBtn,
  clearVideoSetBtn,
  deleteAllVideoSetsBtn,
  manageSetBtn,
}) => {
  const {videoSetValue, setVideoSetValue, handleChange} =
    useContext(VideoSetContext);
    const realm = useRealm();
  const [localDropdown, setLocalDropdown] = useState(videoSetDropdown);

  // Helper function to get IDs of selected videos
  const getSelectedVideoIDs = () => {
    const selectedVideos = realm.objects('VideoData').filtered('isSelected == true');
    return selectedVideos.map(video => video._id.toString());
  };

  useEffect(() => {
    // Format and update dropdown upon component mount or change in videoSets
    const formattedDropdown = videoSets.map(set => ({
      label: set.name,
      value: set._id.toString(),
      id: set._id,
    }));
    setLocalDropdown(formattedDropdown);
  }, [videoSets]);

  // Create a new video set
  const createVideoSet = videoIDs => {
    realm.write(() => {
      realm.create('VideoSet', {
        _id: new Realm.BSON.ObjectID(),
        datetime: new Date(),
        name: new Date().toISOString(),
        videoIDs: videoIDs,
      });
    });
    refreshDropdown();
  };

  // Clear the current video set
  const clearVideoSet = () => {
    realm.write(() => {
      getSelectedVideoIDs().forEach(id => {
        const video = realm.objectForPrimaryKey('VideoData', id);
        if (video) video.isSelected = false;
      });
    });
    refreshDropdown();
  };

  // Delete all video sets
  const deleteAllVideoSets = () => {
    realm.write(() => {
      realm.delete(videoSets);
    });
    setLocalDropdown([]);
  };

  // Refresh dropdown data
  const refreshDropdown = () => {
    const updatedDropdown = videoSets.map(set => ({
      label: set.name,
      value: set._id.toString(),
      id: set._id,
    }));
    setLocalDropdown(updatedDropdown);
  };

  return (
    <View
      style={{
        height: '25%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{fontSize: 20}}>Select Video Set: </Text>
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
          handleChange(item, videoSets);
        }}
      />
      <View style={{flexDirection: 'row', paddingTop: 10}}>
        {saveVideoSetBtn && (
          <Button
            disabled={getSelectedVideoIDs().length === 0}
            title="Save Video Set"
            onPress={() => createVideoSet(getSelectedVideoIDs())}
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
            disabled={getSelectedVideoIDs().length === 0}
            title="Clear Video Set"
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
            title="Manage Sets"
            onPress={() => console.log('Manage sets')}
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
            title="Delete all Video Sets"
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
  );
};

export default VideoSetDropdown;
