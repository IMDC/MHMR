import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ImageBackground, TouchableOpacity, TextInput } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Icon } from '@rneui/themed';
import RNFS from 'react-native-fs';
import { useRealm, VideoSet, VideoData } from '../models/VideoData';
import * as Styles from '../assets/util/styles';

interface ManageVideoSetRouteParams {
  videoSet: VideoSet;
}

interface ManageVideoSetProps {
  route: RouteProp<{ params: ManageVideoSetRouteParams }, 'params'>;
}

const ManageVideoSet: React.FC<ManageVideoSetProps> = ({ route }) => {
  const { videoSet } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const realm = useRealm();
  const [selectedVideoSet, setSelectedVideoSet] = useState<VideoSet | null>(null);
  const [videoSetTitle, setVideoSetTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    if (videoSet) {
      setSelectedVideoSet(videoSet);
      setVideoSetTitle(videoSet.name);
    }
  }, [videoSet]);

  const handleSaveVideoSetTitle = () => {
    if (selectedVideoSet) {
      realm.write(() => {
        selectedVideoSet.name = videoSetTitle;
      });
      setIsEditingTitle(false);
    }
  };

  const handleCancelEditTitle = () => {
    setVideoSetTitle(selectedVideoSet?.name || '');
    setIsEditingTitle(false);
  };

  const handleRemoveVideo = (video: VideoData) => {
    realm.write(() => {
      video.isSelected = false;
    });
  };

  const handleDeleteVideoSet = () => {
    if (selectedVideoSet) {
      realm.write(() => {
        realm.delete(selectedVideoSet);
        navigation.goBack();
      });
    }
  };

  if (!selectedVideoSet) {
    return (
      <View style={styles.container}>
        <Text>No video set selected.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Video Sets</Text>
      <View style={styles.header}>
        {isEditingTitle ? (
          <View style={styles.editTitleContainer}>
            <TextInput
              style={styles.input}
              onChangeText={setVideoSetTitle}
              value={videoSetTitle}
              placeholder="Enter new video set name"
            />
            <Button title="Save" onPress={handleSaveVideoSetTitle} buttonStyle={styles.saveButton} />
            <Button title="Cancel" onPress={handleCancelEditTitle} buttonStyle={styles.cancelButton} />
          </View>
        ) : (
          <TouchableOpacity style={styles.titleContainer} onPress={() => setIsEditingTitle(true)}>
            <Text style={styles.videoSetTitle}>{videoSetTitle}</Text>
            <Icon name="edit" type="material" size={20} color={Styles.MHMRBlue} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView>
        {selectedVideoSet.videoIDs.map((videoId) => {
          const video = realm.objectForPrimaryKey<VideoData>('VideoData', videoId);
          return video ? (
            <View key={video._id.toString()} style={styles.videoContainer}>
              <ImageBackground
                source={{ uri: `file://${RNFS.DocumentDirectoryPath}/MHMR/${video.filename}` }}
                style={styles.thumbnail}>
                <TouchableOpacity onPress={() => navigation.navigate('VideoDetail', { videoId: video._id })}>
                  <Icon name="play-circle" type="ionicon" size={50} color="#fff" />
                </TouchableOpacity>
              </ImageBackground>
              <View style={styles.infoContainer}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Button
                  title="Remove"
                  onPress={() => handleRemoveVideo(video)}
                  buttonStyle={styles.removeButton}
                  titleStyle={styles.removeButtonTitle}
                />
              </View>
            </View>
          ) : null;
        })}
      </ScrollView>
      <Button
        title="Delete Video Set"
        onPress={handleDeleteVideoSet}
        buttonStyle={styles.deleteButton}
      />
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
  editTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  videoSetTitle: {
    fontSize: 20,
    color: Styles.MHMRBlue,
    padding: 10
  },
  saveButton: {
    backgroundColor: Styles.MHMRBlue,
    marginLeft: 10
  },
  cancelButton: {
    backgroundColor: Styles.MHMRBlue,
    marginLeft: 10
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },
  removeButton: {
    backgroundColor: Styles.MHMRBlue,
    paddingHorizontal: 15,
    paddingVertical: 8
  },
  removeButtonTitle: {
    fontSize: 14
  },
  deleteButton: {
    backgroundColor: Styles.MHMRBlue,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: 20
  }
});

export default ManageVideoSet;