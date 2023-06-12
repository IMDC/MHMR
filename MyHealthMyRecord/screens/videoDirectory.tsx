import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import VideoPlayer from 'react-native-media-console';
import {ScrollView, StyleSheet} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {View, TouchableOpacity, Text} from 'react-native';
import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type {PropsWithChildren} from 'react';
import Video from 'react-native-video';
import Realm from 'realm';
import {VideoData, useQuery, useRealm} from '../models/VideoData';
import RNFS from 'react-native-fs';
import {Button} from '@rneui/themed';

const ViewRecordings = () => {
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [videos, setVideos] = useState<any | null>(null);

  const scrollRef: any = useRef();

  const onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const realm = useRealm();
  const videoData: any = useQuery('VideoData');
  const videosByDate = videoData.sorted('datetimeRecorded');
  console.log(videoData);

  // setVideos(videoData);

  videoData.map((video: {_id: any; annotations: any}) =>
    console.log('test', video._id, video.annotations),
  );

  const deleteAllVideoDataObjects = () => {
    realm.write(() => {
      realm.delete(videoData);
    });
  };

  return (
    <View>
      <Button
        buttonStyle={styles.btnStyle}
        title="View Recordings"
        onPress={() => setVideos(videoData)}
      />
      <Button
        buttonStyle={styles.btnStyle}
        title="Delete all Videos"
        onPress={() => deleteAllVideoDataObjects()}
      />
      <ScrollView style={{marginTop: 5, marginBottom: 40}} ref={scrollRef}>
        {/* <View style={styles.container}> */}
        {videos !== null
          ? //don't use i as the key, after setting up storage, use video id or uri or something else as the key
            videos.map(
              (video: {
                _id: React.Key | null | undefined;
                filename: string;
                title:
                  | string
                  | number
                  | boolean
                  | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                  | React.ReactFragment
                  | React.ReactPortal
                  | null
                  | undefined;
                location:
                  | string
                  | number
                  | boolean
                  | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                  | React.ReactFragment
                  | React.ReactPortal
                  | null
                  | undefined;
                datetimeRecorded:
                  | string
                  | number
                  | boolean
                  | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                  | React.ReactFragment
                  | React.ReactPortal
                  | null
                  | undefined;
              }) => {
                //console.log('video details', video.node);
                return (
                  <View style={styles.container} key={video._id}>
                    <View style={styles.thumbnail}>
                      <VideoPlayer
                        style={{}}
                        source={{
                          uri: MHMRfolderPath + '/' + video.filename,
                        }}
                        paused={true}
                        disableBack={true}
                        toggleResizeModeOnFullscreen={true}
                        showOnStart={true}
                        disableSeekButtons={true}
                      />
                    </View>

                    <View style={styles.rightContainer}>
                      <Text style={{fontSize: 24, color: 'black'}}>
                        Name: {video.title}
                        {'\n'}
                        Location: {video.location}
                        {'\n'}
                        Date: {video.datetimeRecorded?.toLocaleString()}
                      </Text>
                      <View style={styles.buttonContainer}>
                        <Button
                          buttonStyle={styles.btnStyle}
                          title="Edit"
                          onPress={() => navigation.navigate('Annotation Menu')}
                        />
                        <View style={styles.space} />
                        <Button
                          buttonStyle={styles.btnStyle}
                          title="Delete Video"
                          onPress={() => navigation.navigate('Home')}
                        />
                      </View>
                    </View>
                  </View>
                );
              },
            )
          : null}
        <TouchableOpacity style={{alignItems: 'center'}} onPress={onPressTouch}>
          <Text style={{padding: 5, fontSize: 16, color: 'black'}}>
            Scroll to Top
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  btnStyle: {
    backgroundColor: '#1C3EAA',
  },

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
    paddingVertical: 15,
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
