import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
  Dimensions,
  TouchableOpacity,
  LogBox,
  Image
} from 'react-native';
const angry = require('../assets/images/emojis/angry.png');
const neutral = require('../assets/images/emojis/neutral.png');
const sad = require('../assets/images/emojis/sad.png');
const smile = require('../assets/images/emojis/smile.png');
const worried = require('../assets/images/emojis/worried.png');
import { Icon, Button } from '@rneui/themed';
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import { useObject, useRealm } from '../models/VideoData';
import { Chip } from 'react-native-paper';

const ReviewAnnotations = () => {
  async function saveChanges() {
    navigation.navigate('View Recordings', {
      id,
    });

    Alert.alert('Your changes have been saved!');
  }

  useEffect(() => {
    LogBox.ignoreLogs(['Non-serializable values were found in the navigation state.']);
  });

  const videoPlayerRef: any = useRef(null);

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject("VideoData", id);

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  /* get stored comments and parse them */
  const [storedComments, setStoredComments] = useState(video.textComments);
  let parsedComments: any[] = [];
  storedComments.map((text: string) => parsedComments.push(JSON.parse(text)));

  const [storedStickers, setStoredStickers] = useState(video.emotionStickers);
  let parsedStickers: string[] = [];
  storedStickers.map((sticker: string) => parsedStickers.push(JSON.parse(sticker)));

  /* current time of video */
  const currentTime = useState(0);

  /* comment shown in overlay */
  const overlayComment = React.useState('');
  const commentRef: any = useRef([]);

  /* comment shown in overlay */
  const overlaySticker = React.useState('');
  const stickerRef: any = useRef([]);

  /* update comment overlay every 250ms*/
  useEffect(() => {
    const interval = setInterval(() => {
      let empty = true;
      // add condition check: if video is not paused, then update overlay
      for (let i = 0; i < parsedComments.length; i++) {
        commentRef[i].setNativeProps({ style: { backgroundColor: 'transparent' } });
        if ((parsedComments[i].timestamp > currentTime[0]) && (parsedComments[i].timestamp < currentTime[0] + 2)) {
          /* set overlay comment if current time is within time of timestamp to timestamp+2s */
          overlayComment[1](parsedComments[i].text + " " + parsedComments[i].timestamp);
          //highlight comment in comment list
          if (commentRef[i] != null) {
            commentRef[i].setNativeProps({ style: { backgroundColor: '#b7c3eb' } });
          }
          empty = false;
          break;
        }
      }
      /* set overlay to empty if no comments have timestamp that falls around current time */
      if (empty) overlayComment[1]('');
    }, 250);
    return () => clearInterval(interval);
  }, [overlayComment]);

  /* update sticker overlay every 250ms*/
  useEffect(() => {
    const interval = setInterval(() => {
      let empty = true;
      // add condition check: if video is not paused, then update overlay
      for (let i = 0; i < parsedStickers.length; i++) {
        stickerRef[i].setNativeProps({ style: { backgroundColor: 'transparent' } });
        if ((parsedStickers[i].timestamp > currentTime[0]) && (parsedStickers[i].timestamp < currentTime[0] + 2)) {
          /* set overlay sticker if current time is within time of timestamp to timestamp+2s */
          if (parsedStickers[i].sentiment == 'smile') {
            overlaySticker[1](smile);
          } else if (parsedStickers[i].sentiment == 'neutral') {
            overlaySticker[1](neutral);
          } else if (parsedStickers[i].sentiment == 'worried') {
            overlaySticker[1](worried);
          } else if (parsedStickers[i].sentiment == 'sad') {
            overlaySticker[1](sad);
          } else if (parsedStickers[i].sentiment == 'angry') {
            overlaySticker[1](angry);
          }
          //highlight sticker in sticker list
          if (stickerRef[i] != null) {
            stickerRef[i].setNativeProps({ style: { backgroundColor: '#b7c3eb' } });
          }
          empty = false;
          break;
        }
      }
      /* set overlay to empty if no stickers have timestamp that falls around current time */
      if (empty) overlaySticker[1]('');
    }, 250);
    return () => clearInterval(interval);
  }, [overlaySticker]);

  /* format timestamp from seconds to 00:00:00*/
  function secondsToHms(d: number) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
  }

  const seekToTimestamp = (timestamp: any) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seek(timestamp);
    }
    console.log('press', timestamp);
  };

  return (
    <ScrollView>
      <View
        style={{
          width: windowWidth,
          height: windowHeight / 2.5,
          paddingHorizontal: 15,
          paddingTop: 15,
        }}>
        <VideoPlayer
          videoRef={videoPlayerRef}
          source={{uri: MHMRfolderPath + '/' + video.filename}}
          paused={true}
          disableBack={true}
          toggleResizeModeOnFullscreen={true}
          showOnStart={true}
          disableSeekButtons={true}
          onProgress={data => {
            currentTime[0] = data.currentTime;
          }}
          onSeek={data => {
            currentTime[0] = data.currentTime;
          }}
          onEnterFullscreen={() =>
            navigation.navigate('Fullscreen Video', {
              id: video._id,
            })
          }
        />
        {overlayComment[0] != '' ? (
          <View style={[
            styles.overlayText,
            styles.overlayTextForComment,
            { position: 'absolute', bottom: 10, left: 10 }
          ]}>
            <Text>{overlayComment[0]}</Text>
          </View>
        ) : null}
        {overlaySticker[0] != '' ? (
          <Image style={[styles.overlayText, styles.overlaySticker]} source={overlaySticker[0]} />
        ) : null}
      </View>

      <View style={styles.container}>
        <Text style={styles.titleStyle}>{video.title}</Text>
        <View>
          {/* <Text style={styles.headerStyle}>Keywords and locations</Text> */}
          <View style={styles.row}>
            {video.keywords.map((key: string) => {
              if (JSON.parse(key).checked) {
                return (
                  <Chip
                    key={JSON.parse(key).title}
                    style={{
                      margin: 2,
                      backgroundColor: '#E1BE6A',
                    }}
                    textStyle={{fontSize: 16}}
                    mode="outlined"
                    compact={true}
                    icon={'tag'}>
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
                    style={{
                      margin: 2,
                      backgroundColor: '#40B0A6',
                    }}
                    mode="outlined"
                    compact={true}
                    icon={'map-marker'}>
                    {JSON.parse(key).title}
                  </Chip>
                );
              }
            })}
          </View>
        </View>
        <View>
          <Text style={styles.headerStyle}>Comments</Text>

          <SafeAreaView>
            <ScrollView style={styles.container}>
              {parsedComments.length != 0
                ? parsedComments.map((c: any, i) => {
                    return (
                      <View
                        ref={el => {
                          if (el != null) {
                            commentRef[i] = el;
                          }
                        }}
                        key={c.id}
                        style={[styles.commentContainer, styles.row]}>
                        <View style={styles.row}>
                          <TouchableOpacity
                            onPress={() => seekToTimestamp(c.timestamp)}>
                            <Text key={c.id} style={styles.textStyle}>
                              {secondsToHms(c.timestamp)} - {c.text}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                : <Text>No comments added</Text>}
            </ScrollView>
          </SafeAreaView>
        </View>

        <View>
          <Text style={styles.headerStyle}>Emotion stickers</Text>

          <SafeAreaView>
            <ScrollView style={styles.container}>
              {parsedStickers.length != 0
                ? parsedStickers.map((s: any, i) => {
                    return (
                      <View
                        ref={el => {
                          if (el != null) {
                            stickerRef[i] = el;
                          }
                        }}
                        key={s.id}
                        style={[styles.commentContainer, styles.row]}>
                        <View style={styles.row}>
                          <TouchableOpacity
                            onPress={() => seekToTimestamp(s.timestamp)}>
                            <Text style={styles.textStyle}>
                              {secondsToHms(s.timestamp)} - {s.sentiment}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                : <Text>No stickers added</Text>}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>

      <Button
        buttonStyle={{width: 220, height: 75, alignSelf: 'center'}}
        color="#1C3EAA"
        radius={50}
        title="Save changes"
        onPress={() => saveChanges()}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    fontWeight: 'bold',
    fontSize: 36,
  },
  container: { padding: 15 },
  row: { flexDirection: 'row' },
  headerStyle: {
    fontWeight: 'bold',
    fontSize: 28,
    paddingLeft: 10,
    paddingVertical: 10,
  },
  textStyle: {
    fontSize: 22,
    paddingHorizontal: 15,
  },
  tagStyle: {
    backgroundColor: '#dadada',
    paddingHorizontal: 15,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    fontSize: 22,
    borderRadius: 18,
    margin: 4,
    marginRight: 8,
  },
  commentContainer: {
    flex: 1,
    paddingVertical: 4,
    paddingTop: 10,
    borderBottomColor: 'grey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overlayText: {
    flex: 1,
    position: 'absolute',
    //textAlignVertical: 'center',
    marginTop: 20,
    marginLeft: 20,
    padding: 5,
    backgroundColor: 'white',
    opacity: 0.85,
    borderRadius: 10,
  },
  overlayTextForComment: {
    textAlignVertical: 'center',
    //change margintop to something more responsive
    marginTop: 450,
  },
  overlaySticker: {
    width: 100,
    height: 100,
    marginRight: Dimensions.get('window').width / 1.5,
  },
});

export default ReviewAnnotations;
