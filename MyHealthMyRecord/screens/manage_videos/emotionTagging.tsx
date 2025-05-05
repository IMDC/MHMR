import React, {Component, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  Image,
  Dimensions,
  FlatList,
  PanResponderGestureState,
  TouchableOpacity,
  LogBox,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
const angry = require('../../assets/images/emojis/angry.png');
const neutral = require('../../assets/images/emojis/neutral.png');
const sad = require('../../assets/images/emojis/sad.png');
const smile = require('../../assets/images/emojis/smile.png');
const worried = require('../../assets/images/emojis/worried.png');
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import {useRealm, useObject} from '../../models/VideoData';
import Video from 'react-native-video';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native';
import MHMRVideoPlayer from '../../components/mhmrVideoPlayer';
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const EmotionTagging = () => {

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [isDeleteBtnVisible, setDeleteBtnVisible] = useState(false);
  const [isEditBtnVisible, setEditBtnVisible] = useState(true);

  function toggleDeleteBtnVisibile() {
    setDeleteBtnVisible(true);
    setEditBtnVisible(false);
  }

  function toggleEditBtnVisible() {
    setDeleteBtnVisible(false);
    setEditBtnVisible(true);
  }

  const [visible, setVisible] = React.useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  const videoPlayerRef: any = useRef<typeof Video>(null);


  return (
    <View style={styles.mainContainer}>
      <MHMRVideoPlayer
        videoID={id}
        emotionConsole={true}
        commentConsole={false}
        emotionView={true}
        commentView={false}
        isFullscreen={false}
      />
      <TouchableOpacity style={styles.saveButton} onPress={() => {navigation.goBack()}}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    padding: 25,
  },
  ballContainer: {
    height: 80,
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
  },
  circle: {
    width: 120,
    height: 120,
  },
  headerStyle: {
    fontWeight: 'bold',
    fontSize: 28,
    paddingLeft: 25,
  },
  textStyle: {
    fontSize: 22,
    paddingHorizontal: 15,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  commentContainer: {
    flex: 1,
    paddingVertical: 4,
    paddingTop: 10,
    borderBottomColor: 'grey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overlayText: {
    flex: 1,
    position: 'absolute',
    marginTop: 20,
    marginLeft: 20,
    padding: 5,
    backgroundColor: 'white',
    opacity: 0.85,
    borderRadius: 10,
  },
  overlaySticker: {
    width: 100,
    height: 100,
    marginRight: Dimensions.get('window').width / 1.5,
  },
  sticker: {
    width: 100,
    height: 100,
  },
  saveButton: {
    backgroundColor: '#0047AB',
    padding: 12,
    borderRadius: 25,
    margin: 16,
    alignItems: 'center',
    width: 140,
    alignSelf: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmotionTagging;
