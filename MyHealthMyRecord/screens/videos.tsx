import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { PropsWithChildren } from 'react';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  Pressable,
} from 'react-native';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import { View, Button, Alert, TouchableOpacity, Text } from 'react-native';
import Realm from "realm";
import { VideoData, useQuery, useRealm } from '../models/VideoData';

// import { Button } from '@rneui/themed';

const ViewRecordings = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const videoPlayer = useRef();

  const [videos, setVideos] = useState<any | null>(null);

  const scrollRef: any = useRef();

  const onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const realm = useRealm();
  const videoData: any = useQuery("VideoData");
  const videosByDate = videoData.sorted('datetimeRecorded');
  console.log(videoData);

  videoData.map(video => (
    console.log("test", video._id, video.annotations)
  ))

  const deleteAllVideoDataObjects = () => {
    realm.write(() => {
      realm.delete(videoData);
    });
  };


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
      <Button title="Delete all videos" onPress={() => deleteAllVideoDataObjects()} />

      <ScrollView style={{ marginTop: 10, marginBottom: 80 }} ref={scrollRef}>
        {/* <View style={styles.container}> */}
        {videos !== null
          ? //don't use i as the key, after setting up storage, use video id or uri or something else as the key
          videos.map(
            (
              video: {
                node: {
                  timestamp: ReactNode;
                  image: {
                    filename: ReactNode;
                    location: ReactNode;
                    playableDuration: ReactNode;
                    uri: any;
                  };
                };
              },
              i: any,
            ) => {
              console.log('video details', video.node);
              return (
                // <View>
                //   <View style={styles.cardLeft} key={i}>
                //     <Image
                //       style={{
                //         height: 300,
                //         width: 300,
                //       }}
                //       source={{uri: video.node.image.uri}}
                //     />
                //     <Text>test1</Text>
                //   </View>
                //   <Text>test2</Text>
                // </View>

                // <View style={styles.thumbnail}>
                //   <ImageBackground
                //     style={{
                //       height: 240,
                //       // flex: 1,
                //     }}
                //     source={{uri: video.node.image.uri}}
                //   />
                // </View>
                // <View style={styles.buttonContainer}>
                //   <Button
                //     title="View"
                //     onPress={() => navigation.navigate('Home')}
                //   />
                //   <Button
                //     title="Annotate"
                //     onPress={() => navigation.navigate('Home')}
                //   />
                //   <Button
                //     title="Delete"
                //     onPress={() => navigation.navigate('Home')}
                //   />
                // </View>

                <View style={styles.container} key={i}>
                  <View style={styles.thumbnail}>
                    <ImageBackground
                      style={{
                        height: 240,
                        // flex: 1,
                      }}
                      source={{ uri: video.node.image.uri }}>
                      {/* <Text style={{alignContent:'flex-end', justifyContent: 'flex-end', color: 'white', fontSize: 20}}>
                          {video.node.image.playableDuration}
                        </Text> */}
                    </ImageBackground>
                  </View>

                  <View style={styles.rightContainer}>
                    <Text style={{ fontSize: 16 }}>
                      Name: {video.node.image.filename}
                      {'\n'}
                      Location: {video.node.image.location}
                      {'\n'}
                      Date: {video.node.timestamp}
                    </Text>
                    <View style={styles.buttonContainer}>
                      <Button
                        title="View"
                        onPress={() => navigation.navigate('Home')}
                      />
                      <View style={styles.space} />
                      <Button
                        title="Annotate"
                        onPress={() => navigation.navigate('Home')}
                      />
                      <View style={styles.space} />
                      <Button
                        title="Delete"
                        onPress={() => navigation.navigate('Home')}
                      />
                    </View>
                  </View>
                </View>
              );
            },
          )
          : null}
        {/* </View> */}
        <TouchableOpacity style={{ alignItems: 'center' }} onPress={onPressTouch}>
          <Text style={{ padding: 5, fontSize: 16 }}>Scroll to Top</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
    // paddingLeft: 8,
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardLeft: {
    marginVertical: 8,
    width: '100%',
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
    paddingVertical: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  thumbnail: {
    width: '40%',
    padding: 8,
  },
  space: {
    width: 50,
  },
});

export default ViewRecordings;
