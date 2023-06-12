import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import VideoPlayer from 'react-native-media-console';
import { ScrollView, StyleSheet } from 'react-native';
import { View, TouchableOpacity, Text } from 'react-native';
import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { PropsWithChildren } from 'react';
import Video from 'react-native-video';
import Realm from 'realm';
import { VideoData, useQuery, useRealm } from '../models/VideoData';
import RNFS from 'react-native-fs';
import { Button } from '@rneui/themed';

const ViewRecordings = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [videos, setVideos] = useState<any | null>(null);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const scrollRef: any = useRef();

  const onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const realm = useRealm();
  const videoData: any = useQuery('VideoData');
  const videosByDate = videoData.sorted('datetimeRecorded', true);
  console.log(videosByDate);

  // delete later
  videoData.map((video: { _id: any; annotations: any }) =>
    console.log('test', video._id.toString(), video.annotations),
  );

  const deleteAllVideoDataObjects = async () => {
    //delete videos from storage
    const MHMRfiles = RNFS.readDir(MHMRfolderPath);
    (await MHMRfiles).map((f) => {
      console.log(f.name, f.size, f.path, f.isFile(), f.isDirectory(), f.ctime, f.mtime);
      if (f.isFile()) {
        var path = MHMRfolderPath + '/' + f.name;
        return RNFS.unlink(path)
          .then(() => {
            console.log('FILE DELETED FROM STORAGE');
          })
          // `unlink` will throw an error, if the item to unlink does not exist
          .catch((err) => {
            console.log(err.message);
          });
      }
    })

    //delete from db
    realm.write(() => {
      realm.delete(videoData);
      console.log('FILES DELETED FROM DB');
    });
  };

  const deleteVideo = (deleteableVideo: VideoData, filename: string) => {
    var path = MHMRfolderPath + '/' + filename;
    //delete from storage
    return RNFS.unlink(path)
      .then(() => {
        console.log('FILE DELETED FROM STORAGE');
        //delete from db
        realm.write(() => {
          realm.delete(deleteableVideo);
          console.log('FILE DELETED FROM DB');
        });
      })
      // `unlink` will throw an error, if the item to unlink does not exist
      .catch((err) => {
        console.log(err.message);
      });
  };

  //check file space
  /*
  const FSInfoResult = RNFS.getFSInfo();
  console.log("space: ", (await FSInfoResult).totalSpace, (await FSInfoResult).freeSpace);
  */

  return (
    <View>
      <Button
        buttonStyle={styles.btnStyle}
        title="View Recordings"
        onPress={() => setVideos(videosByDate)}
      />
      <Button
        buttonStyle={styles.btnStyle}
        title="Delete all Videos"
        onPress={() => deleteAllVideoDataObjects()}
      />
      <ScrollView style={{ marginTop: 5, marginBottom: 40 }} ref={scrollRef}>
        {/* <View style={styles.container}> */}
        {videos !== null
          ?
          videos.map(
            (video: VideoData) => {
              return (
                <View style={styles.container} key={(video._id).toString()}>
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
                    <Text style={{ fontSize: 24, color: 'black' }}>
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
                        onPress={() => deleteVideo(video, video.filename)}
                      />
                    </View>
                  </View>
                </View>
              );
            },
          )
          : null}
        <TouchableOpacity style={{ alignItems: 'center' }} onPress={onPressTouch}>
          <Text style={{ padding: 5, fontSize: 16, color: 'black' }}>
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
