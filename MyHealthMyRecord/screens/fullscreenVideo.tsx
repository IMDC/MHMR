import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Icon, Button, Image} from '@rneui/themed';
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
import {useObject, useRealm} from '../models/VideoData';

const FullscreenVideo = () => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route: any = useRoute();
  const id = route.params?.id;
  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={{width: windowWidth, height: windowHeight - 220}}>
      <VideoPlayer
        source={{uri: MHMRfolderPath + '/' + video.filename}}
        paused={true}
        disableBack={true}
        toggleResizeModeOnFullscreen={true}
        showOnStart={true}
        isFullscreen={true}
        repeat={false}
        // disableSeekButtons={true}
      />
    </SafeAreaView>
  );
};
export default FullscreenVideo;
