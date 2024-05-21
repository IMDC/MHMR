import React, { Component, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  Image,
  Dimensions,
  FlatList,
  PanResponderGestureState,
  TouchableOpacity,
  LogBox,
} from 'react-native';
const angry = require('../assets/images/emojis/angry.png');
const neutral = require('../assets/images/emojis/neutral.png');
const sad = require('../assets/images/emojis/sad.png');
const smile = require('../assets/images/emojis/smile.png');
const worried = require('../assets/images/emojis/worried.png');
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import { useRoute } from '@react-navigation/native';
import { useRealm, useObject } from '../models/VideoData';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';

const EmotionTagging = () => {

  class Draggable extends React.Component<any, any> {
    _val: { x: number; y: number };
    panResponder: any;
    constructor(props: any) {
      super(props);

      this.state = {
        showDraggable: true,
        dropAreaValues: null,
        pan: new Animated.ValueXY(),
        opacity: new Animated.Value(1),
        source: props.source,
        id: props.id,
      };

      this._val = { x: 0, y: 0 };
      this.state.pan.addListener(
        (value: { x: number; y: number }) => (this._val = value),
      );

      this.panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gesture) => true,
        onPanResponderGrant: (e, gesture) => {
          //pause video here
          videoPlayerRef.current.pause();
          // delete below
          /* if (videoPlayerRef != null) {
            let t: number = videoPlayerRef.current.currentTime;
            let v = videoPlayerRef.current;
            //setTime(t);
            console.log("time at pause:", currentTime, t);
          }    */
          this.state.pan.setOffset({
            x: this._val.x,
            y: this._val.y,
          });
          this.state.pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event(
          [null, { dx: this.state.pan.x, dy: this.state.pan.y }],
          { useNativeDriver: false },
        ),
        onPanResponderRelease: (e, gesture) => {
          //play video here
          videoPlayerRef.current.resume();

          //log emoji id
          const emojiID = this.state.id;
          console.log(emojiID);
          addSticker(this.state.id);

          if (this.isDropArea(gesture)) {
            Animated.sequence([
              Animated.timing(this.state.opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: false,
              }),
              Animated.timing(this.state.pan, {
                toValue: { x: 0, y: 0 },
                duration: 100,
                useNativeDriver: false,
              }),
              Animated.timing(this.state.opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false,
              }),
            ]).start(() =>
              this.setState({
                showDraggable: true,
              }),
            );
          } else {
            Animated.spring(this.state.pan, {
              toValue: { x: 0, y: 0 },
              friction: 10,
              useNativeDriver: false,
            }).start();
          }
        },
      });
    }

    windowWidth = Dimensions.get('window').width;
    windowHeight = Dimensions.get('window').height;
    //   MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

    isDropArea(gesture: PanResponderGestureState) {
      return gesture.moveY < this.windowHeight / 1.5;
    }

    render() {
      return (
        <View style={{ width: '20%', alignItems: 'center' }}>
          {this.renderDraggable()}
        </View>
      );
    }

    renderDraggable() {
      const panStyle = {
        transform: this.state.pan.getTranslateTransform(),
      };
      if (this.state.showDraggable) {
        return (
          console.log('Re-rendering test===='),
          (
            <View style={{ position: 'absolute', paddingRight: 60 }}>
              <Animated.View
                {...this.panResponder.panHandlers}
                style={[
                  panStyle,
                  styles.circle,
                  { opacity: this.state.opacity },
                ]}>
                <Image
                  style={{ height: 120, width: 120 }}
                  source={this.props.source}
                />
              </Animated.View>
            </View>
          )
        );
      }
    }

  }

  const [isDeleteBtnVisible, setDeleteBtnVisible] = useState(false);
  const [isEditBtnVisible, setEditBtnVisible] = useState(true);

  const [stickerSelectedID, setStickerSelectedID] = useState('');
  const [stickerSelectedText, setStickerSelectedText] = useState('');

  function toggleDeleteBtnVisibile() {
    setDeleteBtnVisible(true);
    setEditBtnVisible(false);
  }

  function toggleEditBtnVisible() {
    setDeleteBtnVisible(false);
    setEditBtnVisible(true);
  }

  const [visible, setVisible] = React.useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  const videoPlayerRef: any = useRef<Video>(null);

  const [storedStickers, setStoredStickers] = useState(video.emotionStickers);
  let parsedStickers: string[] = [];
  storedStickers.map((sticker: string) => parsedStickers.push(JSON.parse(sticker)));

  /* current time of video */
  const currentTime = useState(0);

  /* comment shown in overlay */
  const overlaySticker = React.useState('');
  const stickerRef: any = useRef([]);

  //const emotions: any[] = [];

  function addSticker(emotion: string) {
    /* set new sticker values */
    let emotionSchema: any = {
      id: new Realm.BSON.ObjectId(),
      sentiment: emotion,
      timestamp: currentTime[0],
    };

    /* find index to add at so timestamps are in order */
    const commentIndex = parsedStickers.findIndex(
      (element: any) => element.timestamp > emotionSchema.timestamp,
    );

    /* add new sticker to parsed array*/
    if (commentIndex == -1) {
      /* if greater timestamp not found, add new sticker to end of array */
      parsedStickers.push(emotionSchema);
    } else {
      /* if greater timestamp found, add new sticker at the index found */
      parsedStickers.splice(commentIndex, 0, emotionSchema);
    }

    /* write new stickers array to db */
    const newStickers: any[] = [];
    parsedStickers.map((sticker: string) => newStickers.push(JSON.stringify(sticker)));
    setStoredStickers(newStickers);
    if (video) {
      realm.write(() => {
        video.emotionStickers! = newStickers;
      });
    }
  }

  const editSticker = (stickerID: any) => {
    /* find index of comment matching input id and update in array */
    /* const commentIndex = parsedComments.findIndex(
      (element: any) => element.id == commentID,
    );
    parsedComments[commentIndex].text = commentEdit; */

    /* update comments array in db */
    /* const newTextComments: any[] = [];
    parsedComments.map((text: string) =>
      newTextComments.push(JSON.stringify(text)),
    );
    setStoredComments(newTextComments);
    if (video) {
      realm.write(() => {
        video.textComments! = newTextComments;
      });
    } */
  };

  const deleteSticker = (stickerID: any) => {
    /* find index of sticker matching input id and remove from array */
    const stickerIndex = parsedStickers.findIndex(
      (element: any) => element.id == stickerID,
    );
    parsedStickers.splice(stickerIndex, 1);

    /* update stickers array in db */
    const newEmotionStickers: any[] = [];
    parsedStickers.map((sticker: string) =>
      newEmotionStickers.push(JSON.stringify(sticker)),
    );
    setStoredStickers(newEmotionStickers);
    if (video) {
      realm.write(() => {
        video.emotionStickers! = newEmotionStickers;
      });
    }
  };

  useEffect(() => {
    LogBox.ignoreLogs([
      'Warning: Each child in a list should have a unique "key" prop.',
    ]);
  }, []);

  /* initialize array of refs for the sticker list */
  useEffect(() => {
    stickerRef.current = new Array(parsedStickers.length);
  }, []);

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

  /* given a timestamp, jump to that time in the video */
  const seekToTimestamp = (timestamp: any) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seek(timestamp - 0.5);
    }
    console.log('press', timestamp);
  };

  return (
    <View style={styles.mainContainer}>
      <View
        style={{
          width: windowWidth,
          height: windowHeight / 2.5,
          paddingHorizontal: 15,
          paddingTop: 15,
        }}>
        <VideoPlayer
          videoRef={videoPlayerRef}
          source={{ uri: MHMRfolderPath + '/' + video.filename }}
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
        />
        {overlaySticker[0] != '' ? (
          <Image style={[styles.overlayText, { marginRight: windowWidth / 1.5 }]} source={overlaySticker[0]}></Image>
        ) : null }
        {/* <Text style={[styles.overlayText, { marginRight: windowWidth / 1.5 }]}>{overlaySticker[0]}</Text> */}
      </View>

      <View style={styles.ballContainer} />
      <View style={[styles.row, { paddingBottom: 140 }]}>
        <Draggable id="smile" source={smile} />
        <Draggable id="neutral" source={neutral} />
        <Draggable id="worried" source={worried} />
        <Draggable id="sad" source={sad} />
        <Draggable id="angry" source={angry} />
      </View>

      <ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.headerStyle}>Stickers</Text>
          {isDeleteBtnVisible && (
            <TouchableOpacity
              style={{ justifyContent: 'flex-end' }}
              onPress={() => toggleEditBtnVisible()}>
              <Text style={{ fontSize: 16, marginRight: 25 }}>Done</Text>
            </TouchableOpacity>
          )}
          {isEditBtnVisible && (
            <TouchableOpacity
              style={{ justifyContent: 'flex-end' }}
              onPress={() => toggleDeleteBtnVisibile()}>
              <Text style={{ fontSize: 16, marginRight: 25 }}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

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
                    style={[styles.commentContainer, styles.row]}
                  >

                    {/* <Dialog
                      isVisible={visible}
                      onBackdropPress={toggleDialog}>
                      <Dialog.Title title="Edit text" />
                      <Input
                        ref={commentEditInput}
                        inputStyle={{ fontSize: 35 }}
                        //value={text}
                        defaultValue={commentSelectedText}
                        onChangeText={value => setCommentEdit(value)}
                        onSubmitEditing={() => {
                          editComment(commentSelectedID);
                          toggleDialog();
                        }}
                      />

                      <Dialog.Actions>
                        <Dialog.Button
                          title="CONFIRM"
                          onPress={() => {
                            editComment(commentSelectedID);
                            toggleDialog();
                          }}
                        />
                        <Dialog.Button
                          title="CANCEL"
                          onPress={toggleDialog}
                        />
                      </Dialog.Actions>
                    </Dialog> */}

                    <View style={styles.row}>
                      <TouchableOpacity
                        onPress={() => seekToTimestamp(s.timestamp)}
                      >
                        <Text style={styles.textStyle}>
                          {secondsToHms(s.timestamp)} - {s.sentiment}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.rightContainer}>
                      {/* display this when user clicks edit */}
                      {isDeleteBtnVisible && (
                        <View>
                          {/* <TouchableOpacity
                            style={{ alignSelf: 'flex-end' }}
                            onPress={() => {
                              setStickerSelectedText(s.sentiment);
                              setStickerSelectedID(s.id);

                              toggleDialog();
                              // console.log('comment selected', c.text);
                              console.log('sticker selected', s.id);
                            }}>
                            <Text style={{ color: '#1C3EAA', fontSize: 16 }}>
                              Edit
                            </Text>
                          </TouchableOpacity> */}

                          <TouchableOpacity
                            style={{ alignSelf: 'flex-end' }}
                            onPress={() => deleteSticker(s.id)}>
                            <Text style={{ color: '#cf7f11', fontSize: 16 }}>
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
              : null}
          </ScrollView>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};

let CIRCLE_RADIUS = 30;
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    padding: 25
  },
  ballContainer: {
    height: 80,
  },
  // left container style not in use currently
  leftContainer: {
    width: '90%',
    flexWrap: 'wrap',
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
  },
  circle: {
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
  },
  // player style not in use currently
  playerStyle: {
    height: '70%',
    padding: 4
  },
  headerStyle: {
    fontWeight: 'bold',
    fontSize: 28,
    paddingLeft: 25,
  },
  // button style not in use currently
  buttonStyle: {
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 30,
  },
  textStyle: {
    fontSize: 22,
    paddingHorizontal: 15,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  commentContainer: {
    flex: 1,
    paddingVertical: 4,
    paddingTop: 10,
    borderBottomColor: 'grey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  // overlay style not in use currently
  overlay: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
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
});

export default EmotionTagging;
