import React, { useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Video from 'react-native-video';
import { Image, PermissionsAndroid, Platform, StyleSheet } from "react-native";
import { CameraRoll, PhotoIdentifier } from "@react-native-camera-roll/camera-roll";
import {
  View,
  Button,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';

const Test = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const videoPlayer = useRef();

  const [videos, setVideos] = useState<any | null>(null);

  async function getRecordings() {
    CameraRoll.getPhotos({
      first: 5,
      assetType: 'Videos',
      groupTypes: 'Album',
      groupName: 'MHMR',
      include: ['filename', 'fileSize', 'fileExtension', 'imageSize', 'playableDuration', 'orientation'],
    })
      .then(r => {
        console.log('test', r.edges);
        setVideos(r.edges);
      })
      .catch((err) => {
        //Error Loading Images
      });
  };


  return (
    <View>
      <Button
        title="Go to Home Page"
        onPress={() => navigation.navigate('Home')}
      />
      <Button
        title="Press this Button"
        onPress={() => getRecordings()}
      />
      <ScrollView>
        {videos !== null ? (
          videos.map((video, i) => {
            console.log("video details", video.node);
            return (
              <>
                <Video
                  ref={ref => (videoPlayer.current = ref)}
                  source={{ uri: video.node.image.uri }} // Can be a URL or a local file.
                  paused={false} // make it start
                  style={styles.backgroundVideo} // any style you want
                  onBuffer={this.onBuffer} // Callback when remote video is buffering
                  onError={this.videoError} // Callback when video cannot be loaded
                  repeat={true}
                  controls={true}
                  fullscreen={true}
                  resizeMode="cover"
                />
                <Text>Key {i}</Text>
                <Text>{video.node.image.uri}</Text>
              </>
            );
          })
        ) : null}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundVideo: {
      position: 'absolute',
      top: 0,
      left: 500,
      bottom: 0,
      right: 0,
  },
});

export default Test;