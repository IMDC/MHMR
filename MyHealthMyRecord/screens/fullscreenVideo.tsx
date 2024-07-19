import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {LogBox, View} from 'react-native';
import MHMRVideoPlayer from '../components/mhmrVideoPlayer';
import {useFocusEffect} from '@react-navigation/native';
import {BottomTabBar} from '@react-navigation/bottom-tabs';

const FullscreenVideo = ({navigation}) => {
  useFocusEffect(
    React.useCallback(() => {
      // Hide the tab bar
      navigation.getParent()?.setOptions({
        tabBarStyle: {display: 'none'},
      });

      return () => {
        // Restore the tab bar
        navigation.getParent()?.setOptions({
          tabBarStyle: {display: 'flex'},
        });
      };
    }, [navigation]),
  );

  useEffect(() => {
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state.',
    ]);
  });

  const route: any = useRoute();
  const id = route.params?.id;
  return (
    <View>
      <MHMRVideoPlayer
        videoID={id}
        emotionConsole={false}
        commentConsole={false}
        emotionView={true}
        commentView={true}
        isFullscreen={true}
      />
    </View>
  );
};
export default FullscreenVideo;
