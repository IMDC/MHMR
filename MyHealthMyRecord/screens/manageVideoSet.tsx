import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ImageBackground, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Icon } from '@rneui/themed';
import RNFS from 'react-native-fs';
import { useRealm, VideoSet, VideoData } from '../models/VideoData';
import * as Styles from '../assets/util/styles';

const ManageVideoSet = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const realm = useRealm();
  const [videoSets, setVideoSets] = useState<VideoSet[]>([]);
  const [selectedVideoSet, setSelectedVideoSet] = useState<VideoSet | null>(null);
  const [videoSetTitle, setVideoSetTitle] = useState('');

  useEffect(() => {
    const videoSets = realm.objects<VideoSet>('VideoSet');
    setVideoSets(Array.from(videoSets));
  }, [realm]);

  const selectVideoSet = (videoSet: VideoSet) => {
    setSelectedVideoSet(videoSet);
    setVideoSetTitle(videoSet.name);
  };  

  const handleRenameVideoSet = () => {
    if (selectedVideoSet) {
      realm.write(() => {
        selectedVideoSet.name = videoSetTitle;
      });
    }
  };

  const handleRemoveVideo = (video: VideoData) => {
    realm.write(() => {
      video.isSelected = false;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Video Sets</Text>
      {selectedVideoSet ? (
        <>
          <View style={styles.header}>
            <TextInput
              style={styles.input}
              onChangeText={setVideoSetTitle}
              value={videoSetTitle}
              placeholder="Enter new video set name"
            />
            <Button title="Rename" onPress={handleRenameVideoSet} color={Styles.MHMRBlue} />
          </View>
          <ScrollView>
            {selectedVideoSet.videoIDs.map((videoId) => {
              const video = realm.objectForPrimaryKey<VideoData>('VideoData', videoId);
              return video ? (
                <View key={video._id.toString()} style={styles.videoContainer}>
                  <ImageBackground
                    source={{ uri: `file://${RNFS.DocumentDirectoryPath}/MHMR/${video.filename}` }}
                    style={styles.thumbnail}
                  >
                    <TouchableOpacity onPress={() => navigation.navigate('VideoDetail', { videoId: video._id })}>
                      <Icon name="play-circle" type="ionicon" size={50} color="#fff" />
                    </TouchableOpacity>
                  </ImageBackground>
                  <View style={styles.infoContainer}>
                    <Text style={styles.videoTitle}>{video.title}</Text>
                    <Button
                      title="Remove"
                      onPress={() => handleRemoveVideo(video)}
                      color={Styles.MHMRBlue}
                    />
                  </View>
                </View>
              ) : null;
            })}
          </ScrollView>
        </>
      ) : (
        <ScrollView>
          {videoSets.map((videoSet) => (
            <TouchableOpacity key={videoSet._id.toString()} onPress={() => selectVideoSet(videoSet)}>
              <Text style={styles.videoSetTitle}>{videoSet.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginRight: 10
  },
  videoContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center'
  },
  thumbnail: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 10,
    marginRight: 10
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between'
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  videoSetTitle: {
    fontSize: 20,
    color: 'blue',
    padding: 10
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  }
});

export default ManageVideoSet;