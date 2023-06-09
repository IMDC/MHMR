import React, {useRef, useState, ReactNode} from 'react';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import VideoPlayer from 'react-native-media-console';
import {ScrollView, StyleSheet} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {View, Button, TouchableOpacity, Text} from 'react-native';

const ViewRecordings = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [videos, setVideos] = useState<any | null>(null);

  const scrollRef: any = useRef();

  const onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
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
      <Button title="View Recordings" onPress={() => getRecordings()} />
      <ScrollView style={{marginTop: 5, marginBottom: 40}} ref={scrollRef}>
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
                  <View style={styles.container} key={i}>
                    <View style={styles.thumbnail}>
                      <VideoPlayer
                        style={{}}
                        source={{
                          uri: video.node.image.uri,
                        }}
                        paused={true}
                        disableBack={true}
                        toggleResizeModeOnFullscreen={true}
                      />
                    </View>

                    <View style={styles.rightContainer}>
                      <Text style={{fontSize: 16}}>
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
                          title="Edit"
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
        <TouchableOpacity style={{alignItems: 'center'}} onPress={onPressTouch}>
          <Text style={{padding: 5, fontSize: 16}}>Scroll to Top</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
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
    height: 240,
    width: '40%',
    padding: 4,
  },
  space: {
    width: 50,
  },
});

export default ViewRecordings;
