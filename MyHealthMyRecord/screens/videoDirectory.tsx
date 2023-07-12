import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import VideoPlayer from 'react-native-media-console';
import {Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Touchable} from 'react-native';
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
import {Button, Dialog, Icon} from '@rneui/themed';
import {Chip} from 'react-native-paper';
const worried = require('../assets/images/emojis/worried.png');

const ViewRecordings = () => {


  const [visible, setVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [checked, setChecked] = useState(1);

  const toggleDialog = () => {
    setVisible(!visible);
  };

  const toggleDialog1 = () => {
    setVisible1(!visible1);
  };

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [videos, setVideos] = useState<any | null>(null);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const scrollRef: any = useRef();

  let onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const realm = useRealm();
  const videoData: any = useQuery('VideoData');
  const videosByDate = videoData.sorted('datetimeRecorded', true);
  //console.log(videosByDate);

  // delete after figuring out why this page re-renders when annotating on other pages
  /* videoData.map((video: any) =>
    console.log('test', video._id.toString(), video.title),
  ); */


  const deleteAllVideoDataObjects = async () => {
    //delete videos from storage
    const MHMRfiles = RNFS.readDir(MHMRfolderPath);
    (await MHMRfiles).map(f => {
      console.log(
        f.name,
        f.size,
        f.path,
        f.isFile(),
        f.isDirectory(),
        f.ctime,
        f.mtime,
      );
      if (f.isFile()) {
        var path = MHMRfolderPath + '/' + f.name;
        return (
          RNFS.unlink(path)
            .then(() => {
              console.log('FILE DELETED FROM STORAGE');
            })
            // `unlink` will throw an error, if the item to unlink does not exist
            .catch(err => {
              console.log(err.message);
            })
        );
      }
    });

    //delete from db
    realm.write(() => {
      realm.delete(videoData);
      console.log('FILES DELETED FROM DB');
    });
  };

  const deleteVideo = (deleteableVideo: VideoData, filename: string) => {
    var path = MHMRfolderPath + '/' + filename;
    //delete from storage
    return (
      RNFS.unlink(path)
        .then(() => {
          console.log('FILE DELETED FROM STORAGE');
          //delete from db
          realm.write(() => {
            realm.delete(deleteableVideo);
            console.log('FILE DELETED FROM DB');
          });
        })
        // `unlink` will throw an error, if the item to unlink does not exist
        .catch(err => {
          console.log(err.message);
        })
    );
  };

useEffect(() => {
  setVideos(videosByDate);
}, []);



  //check file space
  /*
  const FSInfoResult = RNFS.getFSInfo();
  console.log("space: ", (await FSInfoResult).totalSpace, (await FSInfoResult).freeSpace);
  */

  onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  }

  return (
    <View>
      {/* <Button
        buttonStyle={styles.btnStyle}
        title="View Recordings"
        onPress={() => setVideos(videosByDate)}
      /> */}

      <ScrollView style={{marginTop: 5,}} ref={scrollRef}>
 
        <TouchableOpacity
          // style={{alignItems: 'flex-end'}}
          style={{alignItems: 'center'}}
          onPress={toggleDialog}>
          <Text
            style={{
              fontSize: 16,
              // paddingRight: 20,
              color: 'black',
            }}>
            Delete All Videos
          </Text>
        </TouchableOpacity>
        {videos !== null
          ? videos.map((video: VideoData) => {
            // const videoURI = require(MHMRfolderPath + '/' + video.filename);
              return (
                <View style={styles.container} key={video._id.toString()}>
                  <View style={styles.thumbnail}>
                    <VideoPlayer
                      style={{}}
                      source={{
                        uri: MHMRfolderPath + '/' + video.filename,
                      }}
                      paused={true}
                      disableBack={true}
                      // toggleResizeModeOnFullscreen={true}
                      showOnStart={true}
                      disableSeekButtons={true}
                      isFullscreen={false}
                      onEnterFullscreen={() =>
                        navigation.navigate('Fullscreen Video', {
                          id: video._id,
                        })
                      }
                      // onExitFullscreen={() =>
                      //   navigation.navigate('Fullscreen Video', {
                      //     id: video._id,
                      //   })
                      // }
                    />
                    {/* <Image
                      source={{uri: MHMRfolderPath + '/' + video.filename}}
                    /> */}
                  </View>

                  <View style={styles.rightContainer}>
                    <View>
                      <Text
                        style={{
                          fontSize: 24,
                          color: 'black',
                          fontWeight: 'bold',
                        }}>
                        {video.title}
                        {video.textComments.length !== 0 ? (
                          <Icon
                            name="chatbox-ellipses"
                            type="material"
                            color="black"
                            type="ionicon"
                            size={22}
                            style={{alignSelf: 'flex-start', paddingLeft: 5}}
                          />
                        ) : null}
                      </Text>
                      <Text style={{fontSize: 20}}>
                        {video.datetimeRecorded?.toLocaleString()}
                      </Text>

                      {/* map temparray and display the keywords here */}
                      <View style={{flexDirection: 'row'}}>
                        {video.keywords.map((key: string) => {
                          if (JSON.parse(key).checked) {
                            return (
                              <Chip
                                key={JSON.parse(key).title}
                                style={{margin: 2}}
                                textStyle={{fontSize: 16}}
                                mode="outlined"
                                compact={true}>
                                {JSON.parse(key).title}
                              </Chip>
                            );
                          }
                        })}
                        {video.locations.map((key: string) => {
                          if (JSON.parse(key).checked) {
                            return (
                              <Chip
                                key={JSON.parse(key).title}
                                textStyle={{fontSize: 16}}
                                style={{margin: 2}}
                                mode="outlined"
                                compact={true}>
                                {JSON.parse(key).title}
                              </Chip>
                            );
                          }
                        })}
                      </View>
                    </View>
                    {/* if textcomment length is does not equal 0, add an icon */}

                    <View style={styles.buttonContainer}>
                      {/* <Button
                        buttonStyle={styles.btnStyle}
                        title="View Video"
                        onPress={() =>
                          navigation.navigate('Fullscreen Video', {
                            id: video._id,
                          })
                        }
                      />
                      <View style={styles.space} /> */}
                      <Button
                        buttonStyle={styles.btnStyle}
                        title="Markup Video"
                        onPress={() =>
                          navigation.navigate('Annotation Menu', {
                            id: video._id,
                          })
                        }
                      />
                      <View style={styles.space} />
                      <Button
                        buttonStyle={styles.btnStyle}
                        title="Delete Video"
                        onPress={() => deleteVideo(video, video.filename)}
                        // onPress={() => toggleDialog1()}
                      />
                    </View>
                  </View>
                  <Dialog isVisible={visible} onBackdropPress={toggleDialog}>
                    <Dialog.Title title="Are you sure you want to delete all videos?" />
                    <Text style={{fontSize: 20}}>
                      These videos will be deleted immediately. You can't undo
                      this action.
                    </Text>
                    <Dialog.Actions>
                      <Dialog.Button
                        title="Delete"
                        onPress={() => deleteAllVideoDataObjects()}
                      />
                      <Dialog.Button
                        title="Cancel"
                        onPress={() => toggleDialog()}
                      />
                    </Dialog.Actions>
                  </Dialog>
                  <Dialog isVisible={visible1} onBackdropPress={toggleDialog1}>
                    <Dialog.Title title="Are you sure you want to delete this video?" />
                    <Text style={{fontSize: 20}}>
                      This item will be deleted immediately. You can't undo this
                      action.
                    </Text>
                    <Dialog.Actions>
                      <Dialog.Button
                        title="Delete"
                        onPress={() => deleteVideo(video, video.filename)}
                      />
                      <Dialog.Button
                        title="Cancel"
                        onPress={() => toggleDialog1()}
                      />
                    </Dialog.Actions>
                  </Dialog>
                </View>
              );
            })
          : null}
          <TouchableOpacity
            style={{alignItems: 'center'}}
            onPress={onPressTouch}>
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
