import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import MHMRVideoPlayer from '../components/mhmrVideoPlayer';

const FullscreenVideo = () => {
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
