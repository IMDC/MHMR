
import React, {useRef, useCallback, useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Video from 'react-native-video';
import {
  FlatList,
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {View, Button, Alert, TouchableOpacity, Text} from 'react-native';


const Test = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const videoPlayer = useRef();

  const [videos, setVideos] = useState<any | null>(null);

  async function getRecordings() {
    //delete later, instead use getPhotos right after saving the video so cameraroll uri, vision camera duration etc can be saved to db together
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Videos',
      groupTypes: 'Album',
      groupName: 'MHMR',
      include: [
        'filename',
        'fileSize',
        'fileExtension',
        'imageSize',
        'playableDuration',
        'orientation',
      ],

    })
      .then(r => {
        console.log('test', r.edges);
        setVideos(r.edges);
      })
      .catch(err => {
        //Error Loading Images
      });
  }


  return (
    <View>
      <Button
        title="Go to Home Page"
        onPress={() => navigation.navigate('Home')}
      />

      <Button title="Press this Button" onPress={() => getRecordings()} />
      <ScrollView>
        {videos !== null
          ? //don't use i as the key, after setting up storage, use video id or uri or something else as the key
            videos.map((video: { node: { image: { uri: any; }; }; }, i: any) => {
              console.log('video details', video.node);
              return (
                <>
                  <View style={styles.container}>
                    <View style={styles.thumbnail}>
                      <ImageBackground
                        key="{i}"
                        style={{
                          height: 240,
                          // flex: 1,
                        }}
                        source={{uri: video.node.image.uri}}
                      />
                    </View>
                    <View style={styles.buttonContainer}>
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
                  </View>
                </>
              );
            })
          : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingTop: 120,
    width: '50%',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingLeft: 20,
  },
  container: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: '50%',
    padding: 5,
  },

  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,

    bottom: 0,
    right: 0,
  },
});

export default Test;
