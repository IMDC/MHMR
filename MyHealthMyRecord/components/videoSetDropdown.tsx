import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useDropdownContext} from './videoSetProvider';
import {useRealm} from '../models/VideoData';
import * as Styles from '../assets/util/styles';
import {ObjectId} from 'bson';
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
  const {handleChange, videoSetValue, setVideoSetValue, } = useDropdownContext();
  const realm = useRealm();
  const [localDropdown, setLocalDropdown] = useState(videoSetDropdown);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const getSelectedVideoIDs = () => {
    const selectedVideos = realm
      .objects('VideoData')
      .filtered('isSelected == true');
    return selectedVideos.map(video => video._id.toString());
  };

  useEffect(() => {
    const formattedDropdown = videoSets.map(set => ({
      label: set.name,
      value: set._id.toString(),
      id: set._id,
    }));
    setLocalDropdown(formattedDropdown);
  }, [videoSets]);

  const createVideoSet = (frequencyData, videoIDs) => {
    realm.write(() => {
      realm.create('VideoSet', {
        _id: new Realm.BSON.ObjectID(),
        datetime: new Date(),
        name: new Date().toString().split(' GMT-')[0],
        frequencyData: frequencyData,
        videoIDs: videoIDs,
      });
    });
    refreshDropdown();
  };

  const clearVideoSet = () => {
    realm.write(() => {
      getSelectedVideoIDs().forEach(id => {
        const video = realm.objectForPrimaryKey('VideoData', new ObjectId(id));
        if (video) {
          video.isSelected = false;
        }
      });
    });
    console.log('Cleared video set');
    refreshDropdown();
  };

  const deleteAllVideoSets = () => {
    realm.write(() => {
      realm.delete(realm.objects('VideoSet'));
    });
    setLocalDropdown([]);
  };

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
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View style={{paddingBottom: 10}}>
        <Text style={{fontSize: 20}}>Select Video Set: </Text>
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
          onVideoSetChange(item.value); // Notify parent component of the change
        }}
      />
      {saveVideoSetBtn === false &&
      clearVideoSetBtn === false &&
      manageSetBtn == false &&
      deleteAllVideoSetsBtn == false ? (
        <View style={{flexDirection: 'row', paddingTop: 30}}>
          <Button
            title="View Videos in Video Set"
            onPress={() => navigation.navigate('Dashboard')}
            color={Styles.MHMRBlue}
            radius={50}
            containerStyle={{
              width: 300,
            }}
          />
        </View>
      ) : (
        <View>
          <View style={{flexDirection: 'row', paddingTop: 10}}>
            {saveVideoSetBtn && (
              <Button
                disabled={getSelectedVideoIDs().length === 0}
                title="Save Video Set"
                onPress={() => {
                  createVideoSet([], getSelectedVideoIDs());
                  setVideoSetValue(videoSetDropdown.length.toString());
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
      )}
    </View>
  );
};

export default VideoSetDropdown;
