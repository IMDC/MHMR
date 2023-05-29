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
    //delete later, instead use getPhotos right after saving the video so cameraroll uri, vision camera duration etc can be saved to db together
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
          //don't use i as the key, after setting up storage, use video id or uri or something else as the key
          videos.map((video, i) => {
            console.log("video details", video.node);
            return (
              <View key={i}>
                <Text>Key {i}</Text>
                <Text>{video.node.image.uri}</Text>
                <Button
                  title="View"
                  onPress={() => navigation.navigate('Home')}
                />
                <Button
                  title="Annotate"
                  onPress={() => navigation.navigate('Home')}
                />
                <Button
                  title="Delete"
                  onPress={() => navigation.navigate('Home')}
                />
              </View>
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