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

const FullscreenVideo = () => {

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route = useRoute();
  const filename = route.params?.filename;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={{width: windowWidth, height: windowHeight}}>
      <VideoPlayer
        source={{uri: MHMRfolderPath + '/' + filename}}
        paused={false}
        disableBack={true}
        toggleResizeModeOnFullscreen={true}
        showOnStart={true}
        isFullscreen={true}
        // disableSeekButtons={true}
      />
    </SafeAreaView>
  );
};
export default FullscreenVideo;
