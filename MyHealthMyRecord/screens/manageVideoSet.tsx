import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {RouteProp, useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Button, Icon} from '@rneui/themed';
import RNFS from 'react-native-fs';
import {useRealm, VideoSet, VideoData} from '../models/VideoData';
import * as Styles from '../assets/util/styles';
import {useDropdownContext} from '../components/videoSetProvider';
import {get} from 'react-native/Libraries/TurboModule/TurboModuleRegistry';


const ManageVideoSet = () => {
  const {videoSetVideoIDs, currentVideoSet, currentSetID} = useDropdownContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const realm = useRealm();
  const route = useRoute();
  const videoSet = route.params.videoSet;

  const [videos, setVideos] = useState<VideoData[]>([]);
  const [videoSetTitle, setVideoSetTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [lastRemovedVideo, setLastRemovedVideo] = useState<VideoData | null>(
    null,
  );

  useEffect(() => {
    console.log(
      '{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{Selected Video Set in Manage:',
      currentVideoSet,
    );
    console.log('currentSetID', currentSetID);
    console.log('[----------------------videoSet', videoSet);
    const getVideoData = async () => {
      const videoSetData = videoSetVideoIDs?.map(videoID => {
        const objectId = new Realm.BSON.ObjectId(videoID);
        return realm.objectForPrimaryKey('VideoData', objectId);
      }).filter(video => video !== null);
      setVideos(videoSetData as VideoData[]);
      setVideoSetTitle(currentVideoSet?.name || '');
    };

    if (isFocused) {
      getVideoData();
    }
  }, [isFocused, currentVideoSet, realm]);

  const handleSaveVideoSetTitle = () => {
    if (currentVideoSet) {
      realm.write(() => {
        currentVideoSet.name = videoSetTitle;
      });
      setIsEditingTitle(false);
    }
  };

  const handleCancelEditTitle = () => {
    setVideoSetTitle(currentVideoSet?.name || '');
    setIsEditingTitle(false);
  };

  const RemoveVideoAlert = (video: VideoData) => {
    Alert.alert(
      'Remove Video',
      'Are you sure you want to remove this video from the set?',
      [
        {text: 'OK', onPress: () => handleRemoveVideo(video)},
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
    );
  }


  const handleRemoveVideo = (video: VideoData) => {
    setLastRemovedVideo(video);
    realm.write(() => {
      // remove video id from from video set
      currentVideoSet.videoIDs = currentVideoSet.videoIDs.filter(
        id => id !== video._id.toString(),
      );
    });
    setVideos(videos.filter(v => v._id.toString() !== video._id.toString()));
  };

  const handleUndoRemoveVideo = () => {
    if (lastRemovedVideo) {
      realm.write(() => {
        currentVideoSet.videoIDs.push(lastRemovedVideo._id.toString());
      });
      setVideos([...videos, lastRemovedVideo]);
      setLastRemovedVideo(null);
    }
  };

  const DeleteVideoSetAlert = () => {
    Alert.alert(
      'Delete Video Set',
      'Are you sure you want to delete this video set?',
      [
        {text: 'OK', onPress: () => handleDeleteVideoSet()},
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
    );
  }

  const handleDeleteVideoSet = () => {
    if (currentVideoSet) {
      realm.write(() => {
        realm.delete(currentVideoSet);
        navigation.goBack();
      });
    }
  };

  if (!currentVideoSet) {
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
              radius={50}
              title="Save"
              onPress={handleSaveVideoSetTitle}
              buttonStyle={styles.saveButton}
            />
            <Button
              radius={50}
              title="Cancel"
              onPress={handleCancelEditTitle}
              buttonStyle={styles.cancelButton}
            />
          </View>
        ) : (
          <>
            <View>
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
            </View>
            <View style={{flexDirection: 'row'}}>
              {lastRemovedVideo && (
                <Button
                  radius={50}
                  title="Undo last removed video"
                  onPress={handleUndoRemoveVideo}
                  buttonStyle={styles.deleteButton}
                />
              )}
              <Button
                radius={50}
                title="Delete video set"
                onPress={DeleteVideoSetAlert}
                buttonStyle={styles.deleteButton}
              />
            </View>
          </>
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
                  reverse
                  name="play-sharp"
                  type="ionicon"
                  color="#1C3EAA"
                  size={20}
                />
              </TouchableOpacity>
            </ImageBackground>
            <View style={styles.infoContainer}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Button
                radius={50}
                title="Remove"
                onPress={() => RemoveVideoAlert(video)}
                color={Styles.MHMRBlue}
              />
            </View>
          </View>
        ))}
      </ScrollView>
      {/* {lastRemovedVideo && (
        <Button
          radius={50}
          title="Undo remove"
          onPress={handleUndoRemoveVideo}
          buttonStyle={styles.deleteButton}
        />
      )} */}
      {/* <Button
        radius={80}
        title="Delete video set"
        onPress={handleDeleteVideoSet}
        buttonStyle={styles.deleteButton}
      /> */}
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
    marginLeft: 10,
    backgroundColor: Styles.MHMRBlue,

  },
});

export default ManageVideoSet;
