import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Icon } from '@rneui/themed';
import RNFS from 'react-native-fs';
import { useRealm, VideoData } from '../models/VideoData';
import * as Styles from '../assets/util/styles';

const ManageVideoSet = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const realm = useRealm();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  useEffect(() => {
    fetchVideos();
  }, [realm]);

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
        {videos.map((video, index) => (
          <View key={video._id.toString()} style={styles.videoContainer}>
            <ImageBackground
              source={{ uri: `file://${MHMRfolderPath}/${video.filename}` }}
              style={styles.thumbnail}
            >
              <TouchableOpacity onPress={() => navigation.navigate('VideoDetail', { videoId: video._id })}>
                <Icon name="play-circle" type="ionicon" size={50} color="#fff" />
              </TouchableOpacity>
            </ImageBackground>
            <View style={styles.infoContainer}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <View style={styles.actionContainer}>
                <Button
                  title="Remove"
                  onPress={() => handleRemoveVideo(video)}
                  color={Styles.MHMRBlue}
                />
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
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  }
});

export default ManageVideoSet;