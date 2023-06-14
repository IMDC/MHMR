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
  Button,
  Alert,
} from 'react-native';
import {Icon, Image} from '@rneui/themed';
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';

const EmotionTagging = () => {
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route = useRoute();
  const title = route.params?.title;
  const location = route.params?.location;
  const id = route.params?.id;
  const filename = route.params?.filename;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.playerStyle}>
        <VideoPlayer
          source={{uri: MHMRfolderPath + '/' + filename}}
          paused={true}
          disableBack={true}
          toggleResizeModeOnFullscreen={true}
          showOnStart={true}
          disableSeekButtons={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 25},
  playerStyle: {height: '70%', padding: 4},
});

export default EmotionTagging;
