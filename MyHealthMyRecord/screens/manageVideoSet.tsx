import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {RouteProp, useIsFocused, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Icon} from '@rneui/themed';
import RNFS from 'react-native-fs';
import {useRealm, VideoSet, VideoData} from '../models/VideoData';
import * as Styles from '../assets/util/styles';
import {useDropdownContext} from '../components/videoSetProvider';
import {get} from 'react-native/Libraries/TurboModule/TurboModuleRegistry';


const ManageVideoSet = () => {
  const {videoSetVideoIDs, selectedVideoSet} = useDropdownContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const realm = useRealm();

  const [videos, setVideos] = useState<VideoData[]>([]);
  const [videoSetTitle, setVideoSetTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [lastRemovedVideo, setLastRemovedVideo] = useState<VideoData | null>(
    null,
  );

  useEffect(() => {
    console.log(
      '{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{Selected Video Set in Manage:',
      selectedVideoSet,
    );
    const getVideoData = async () => {
      const videoSetData = videoSetVideoIDs?.map(videoID => {
        const objectId = new Realm.BSON.ObjectId(videoID);
        return realm.objectForPrimaryKey('VideoData', objectId);
      });
      setVideos(videoSetData);
      setVideoSetTitle(selectedVideoSet?.name || '');
    };

    if (isFocused) {
      getVideoData();
    }
  }, [isFocused, selectedVideoSet, realm]);

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
    setLastRemovedVideo(video);
    realm.write(() => {
      // remove video id from from video set
      selectedVideoSet.videoIDs = selectedVideoSet.videoIDs.filter(
        id => id !== video._id.toString(),
      );
    });
    setVideos(videos.filter(v => v._id.toString() !== video._id.toString()));
  };

  const handleUndoRemoveVideo = () => {
    if (lastRemovedVideo) {
      realm.write(() => {
        selectedVideoSet.videoIDs.push(lastRemovedVideo._id.toString());
      });
      setVideos([...videos, lastRemovedVideo]);
      setLastRemovedVideo(null);
    }
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
      <View style={styles.header}>
        {isEditingTitle ? (
          <View style={styles.editTitleContainer}>
            <TextInput
              style={styles.input}
              onChangeText={setVideoSetTitle}
              value={videoSetTitle}
              placeholder="Enter new video set name"
            />
            <Button
              title="Save"
              onPress={handleSaveVideoSetTitle}
              buttonStyle={styles.saveButton}
            />
            <Button
              title="Cancel"
              onPress={handleCancelEditTitle}
              buttonStyle={styles.cancelButton}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => setIsEditingTitle(true)}>
            <Text style={styles.videoSetTitle}>{videoSetTitle}</Text>
            <Icon
              name="edit"
              type="material"
              size={20}
              color={Styles.MHMRBlue}
            />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView>
        {videos.map((video, index) => (
          <View key={video._id.toString()} style={styles.videoContainer}>
            <ImageBackground
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/MHMR/${video.filename}`,
              }}
              style={styles.thumbnail}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Fullscreen Video', {id: video._id})
                }>
                <Icon
                  name="play-circle"
                  type="ionicon"
                  size={50}
                  color="#fff"
                />
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
        ))}
      </ScrollView>
      {lastRemovedVideo && (
        <Button
          title="Undo Remove"
          onPress={handleUndoRemoveVideo}
          buttonStyle={styles.deleteButton}
        />
      )}
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
  },
  editTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoSetTitle: {
    fontSize: 24,
    color: 'gray',
    padding: 10,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: Styles.MHMRBlue,
    width: 100,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: Styles.MHMRBlue,
    width: 100,
    marginLeft: 10,
  },
  videoContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  thumbnail: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 10,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  removeButton: {
    backgroundColor: Styles.MHMRBlue,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: Styles.MHMRBlue,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: 20,
  },
});

export default ManageVideoSet;
