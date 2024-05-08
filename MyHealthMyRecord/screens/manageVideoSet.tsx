import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ImageBackground, TouchableOpacity, TextInput } from 'react-native';
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

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [editing, setEditing] = useState<boolean>(false);

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
    if (newName.trim() !== '') {
      realm.write(() => {
        video.title = newName.trim();
      });
      fetchVideos();
      setNewName('');
      setSelectedVideoId(null);
      setEditing(false);
    }
  };

  const selectVideoToRename = (videoId: string) => {
    setSelectedVideoId(videoId);
    const selectedVideo = videos.find(video => video._id.toString() === videoId);
    if (selectedVideo) {
      setNewName(selectedVideo.title);
      setEditing(true);
    }
  };

  const cancelRename = () => {
    setNewName('');
    setSelectedVideoId(null);
    setEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Video Set</Text>
      <ScrollView>
        {videos.map((video, index) => (
          <View key={video._id.toString()} style={styles.videoContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('VideoDetail', { videoId: video._id })}>
              <ImageBackground
                source={{ uri: `file://${MHMRfolderPath}/${video.filename}` }}
                style={styles.thumbnail}
              >
                <Icon name="play-circle" type="ionicon" size={50} color="#fff" />
              </ImageBackground>
            </TouchableOpacity>
            <View style={styles.infoContainer}>
              {selectedVideoId === video._id.toString() && editing ? (
                <View style={styles.editingContainer}>
                  <TextInput
                    style={styles.input}
                    value={newName}
                    onChangeText={text => setNewName(text)}
                    placeholder="Enter new name"
                  />
                  <View style={styles.buttonContainer}>
                    <Button
                      title="Save"
                      onPress={() => handleRenameVideo(video)}
                      buttonStyle={styles.button}
                    />
                    <Button
                      title="Cancel"
                      onPress={cancelRename}
                      buttonStyle={styles.button}
                    />
                  </View>
              </View>
              ) : (
                <TouchableOpacity onPress={() => selectVideoToRename(video._id.toString())}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.videoTitle}>{video.title}</Text>
                    <Icon name="create" type="ionicon" size={20} color="#ccc" style={{ marginLeft: 5 }} />
                  </View>
                </TouchableOpacity>
              )}
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
  },
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: 100,
    marginHorizontal: 10,
    backgroundColor: Styles.MHMRBlue,
  },
  input: {
    flex: 1,
    fontSize: 18,
    borderWidth: 1,
    padding: 8,
    borderRadius: 10,
    borderColor: '#ccc',
    maxWidth: 400
  }
});

export default ManageVideoSet;