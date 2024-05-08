import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Icon } from '@rneui/themed';
import { Chip } from 'react-native-paper';
import RNFS from 'react-native-fs';
import { useRealm, VideoData } from '../models/VideoData';
import * as Styles from '../assets/util/styles';

const ManageVideoSet = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const realm = useRealm();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const [newNames, setNewNames] = useState<{ [key: string]: string }>({});

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

  const handleRenameVideo = (video: VideoData) => {
    const newName = newNames[video._id.toString()] || '';
    if (newName !== '') {
      realm.write(() => {
        video.title = newName;
      });
      fetchVideos();
    }
  };

  const updateNewName = (id: string, newName: string) => {
    setNewNames({ ...newNames, [id]: newName });
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
              <TextInput
                style={styles.input}
                onChangeText={(text) => updateNewName(video._id.toString(), text)}
                placeholder="Enter new name"
              />
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Chip icon="tag" textStyle={styles.chipText}>{video.keywords.join(', ')}</Chip>
              <View style={styles.actionContainer}>
                <Button
                  title="Rename"
                  onPress={() => handleRenameVideo(video)}
                  color={Styles.MHMRBlue}
                />
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
  chipText: {
    fontSize: 16,
    color: '#000'
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  button: {
    padding: 5,
    paddingHorizontal: 10
  },
  input: {
    fontSize: 18,
    marginBottom: 10,
    borderWidth: 1,
    padding: 8,
    borderRadius: 10,
    borderColor: '#ccc'
  }
});

export default ManageVideoSet;