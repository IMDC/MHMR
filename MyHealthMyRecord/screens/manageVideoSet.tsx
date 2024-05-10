import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Icon } from '@rneui/themed';
import RNFS from 'react-native-fs';
import { useRealm, VideoData, VideoSet } from '../models/VideoData';
import * as Styles from '../assets/util/styles';

const ManageVideoSet = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const realm = useRealm();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [videoSets, setVideoSets] = useState<VideoSet[]>([]);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  useEffect(() => {
    fetchVideoSets();
    fetchVideos();
  }, [realm]);

  const fetchVideoSets = () => {
    const sets = realm.objects<VideoSet>('VideoSet');
    setVideoSets(Array.from(sets));
  };

  const fetchVideos = () => {
    const videoSet = realm.objects<VideoData>('VideoData').filtered('isSelected == true');
    const videoArray = Array.from(videoSet);
    setVideos(videoArray);
  };

  const handleRemoveVideo = (video: VideoData) => {
    realm.write(() => {
      video.isSelected = false;
    });
    fetchVideos();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Video Set</Text>
      <ScrollView>
        {videoSets.map((set, index) => (
          <View key={set._id.toString()} style={styles.setContainer}>
            <Text style={styles.setName}>{set.name}</Text>
          </View>
        ))}
        {videos.map((video, index) => (
          <View key={video._id.toString()} style={styles.videoContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('VideoDetail', { videoId: video._id })}>
              <ImageBackground source={{ uri: `file://${MHMRfolderPath}/${video.filename}` }} style={styles.thumbnail}>
                <Icon name="play-circle" type="ionicon" size={50} color="#fff" />
              </ImageBackground>
            </TouchableOpacity>
            <View style={styles.infoContainer}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <View style={styles.actionContainer}>
                <Button title="Remove" onPress={() => handleRemoveVideo(video)} color={Styles.MHMRBlue} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
  setContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10
  },
  setName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  videoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
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
    flex: 1
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});

export default ManageVideoSet;