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
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  const [emotionStickers, setEmotionStickers] = useState(video.emotionStickers);
  let parsedStickers: string[] = [];
  emotionStickers.map((sticker: string) => parsedStickers.push(JSON.parse(sticker)));

  const videoRef: any = useRef<Video>(null);

  const time = useState(0);

  /* comment shown in overlay */
  const overlayComment = React.useState('');

  const [isDeleteBtnVisible, setDeleteBtnVisible] = useState(false);
  const [isEditBtnVisible, setEditBtnVisible] = useState(true);

  const [commentSelectedID, setCommentSelectedID] = useState('');
  const [commentSelectedText, setCommentSelectedText] = useState('');

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

  //const emotions: any[] = [];

  function addEmotion(emotion: string) {
    let emotionSchema: any = {
      id: new Realm.BSON.ObjectId(),
      sentiment: emotion,
      timestamp: time[0],
    };

    parsedStickers.push(emotionSchema);
    console.log("parsed", parsedStickers);

    const newStickers: any[] = [];
    parsedStickers.map((sticker: string) => newStickers.push(JSON.stringify(sticker)));

    setEmotionStickers(newStickers);
    if (video) {
      realm.write(() => {
        video.emotionStickers! = newStickers;
      });
    }
    //console.log(time);

  }

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
          videoRef.current.setNativeProps({ paused: true });
          // delete below
          /* if (videoRef != null) {
            let t: number = videoRef.current.currentTime;
            let v = videoRef.current;
            //setTime(t);
            console.log("time at pause:", time, t);
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
          videoRef.current.setNativeProps({ paused: false });

          //log emoji id
          const emojiID = this.state.id;
          console.log(emojiID);
          addEmotion(this.state.id);

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

  const editComment = (commentID: any) => {
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

  const deleteComment = (commentID: any) => {
    /* find index of comment matching input id and remove from array */
    /* const commentIndex = parsedComments.findIndex(
      (element: any) => element.id == commentID,
    );
    parsedComments.splice(commentIndex, 1); */

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

  /* given a timestamp, jump to that time in the video */
  const seekToTimestamp = (timestamp: any) => {
    videoRef.current.setNativeProps({ seek: timestamp });
    console.log('press', timestamp);
  };

  /* update comment overlay every 250ms*/
  useEffect(() => {
    const interval = setInterval(() => {
      let empty = true;
      // add condition check: if video is not paused, then update overlay
      for (let i = 0; i < parsedStickers.length; i++) {
        if ((parsedStickers[i].timestamp > time[0]) && (parsedStickers[i].timestamp < time[0] + 2)) {
          /* set overlay comment if current time is within time of timestamp to timestamp+2s */
          overlayComment[1](parsedStickers[i].sentiment + " " + parsedStickers[i].timestamp);
          empty = false;
          break;
        }
      }
      /* set overlay to empty if no comments have timestamp that falls around current time */
      if (empty) overlayComment[1]('');
    }, 250);
    return () => clearInterval(interval);
  }, [overlayComment]);

    /* format timestamp from seconds to 00:00:00*/
    function secondsToHms(d: number) {
      d = Number(d);
      var h = Math.floor(d / 3600);
      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);
      return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
    }

  return (
    <View style={styles.mainContainer}>
      {/* can delete current time view later */}
      <View>
      </View>
      <View
        style={{
          width: windowWidth,
          height: windowHeight / 2.5,
          paddingHorizontal: 15,
          paddingTop: 15,
        }}>
        <VideoPlayer
          videoRef={videoRef}
          source={{ uri: MHMRfolderPath + '/' + video.filename }}
          paused={true}
          disableBack={true}
          toggleResizeModeOnFullscreen={true}
          showOnStart={true}
          disableSeekButtons={true}
          onProgress={data => {
            time[0] = data.currentTime;
          }}
          onSeek={data => {
            time[0] = data.currentTime;
          }}
        />
        <Text style={[styles.overlayText, { marginRight: windowWidth / 1.5 }]}>{overlayComment[0]}</Text>
      </View>

      <View style={styles.ballContainer} />
      <View style={[styles.row, { paddingBottom: 140 }]}>
        <Draggable id="smile" source={smile} />
        <Draggable id="neutral" source={neutral} />
        <Draggable id="worried" source={worried} />
        <Draggable id="sad" source={sad} />
        <Draggable id="angry" source={angry} />
      </View>

      <ScrollView style={styles.container}>
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
              ? parsedStickers.map((s: any) => {
                return (
                  <View key={s.id}>
                    <View style={[styles.commentContainer, styles.row]}>
                      <TouchableOpacity
                        onPress={() => seekToTimestamp(s.timestamp)}
                        style={styles.comment}>
                        <Text style={styles.textStyle}>
                          {secondsToHms(s.timestamp)} - {s.sentiment}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.rightContainer}>
                      {/* display this when user clicks edit */}
                      {isDeleteBtnVisible && (
                        <View>
                          <TouchableOpacity
                            style={{ alignSelf: 'flex-end' }}
                            onPress={() => deleteComment(s.id)}>
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
  ballContainer: {
    height: 80,
  },
  circle: {
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
  },
  row: {
    flexDirection: 'row',
  },
  container: { padding: 25 },
  playerStyle: { height: '70%', padding: 4 },
  commentContainer: {
    flex: 1,
    paddingVertical: 4,
    paddingTop: 10,
    // flexWrap: 'wrap',
    //backgroundColor: '#dadbe0',
    // justifyContent: 'flex-end',
    borderBottomColor: 'grey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerStyle: {
    fontWeight: 'bold',
    fontSize: 28,
    paddingLeft: 25,
  },
  textStyle: {
    fontSize: 22,
    paddingHorizontal: 15,
    // backgroundColor: 'pink',
    // flex: 1,
    // flexWrap: 'wrap',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  leftContainer: {
    width: '90%',
    flexWrap: 'wrap',
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    // backgroundColor: '#dadbe0',
    // backgroundColor: 'pink',
    alignItems: 'flex-end',
  },
  comment: {
    // height: 60,
    // position: 'absolute',
    // left: 0,
    //flex: 1,
    //flexWrap: 'wrap',
  },
  buttonStyle: {
    //width: 120,
    //height: 50,
    //textAlign: 'right',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 30,
  },
  testContainer: {
    //flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    //opacity: 0.5,
    //backgroundColor: 'red',
  },
  overlayText: {
    flex: 1,
    position: 'absolute',
    textAlignVertical: 'center',
    marginTop: 20,
    marginLeft: 20,
    padding: 5,
    backgroundColor: 'white',
    opacity: 0.85,
    borderRadius: 10,
  },
});

export default EmotionTagging;
