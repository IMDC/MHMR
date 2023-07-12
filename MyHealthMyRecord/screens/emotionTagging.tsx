import React, { Component, useRef, useState } from 'react';
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

  /* given a timestamp, jump to that time in the video */
  const seekToTimestamp = (timestamp: any) => {
    videoRef.current.setNativeProps({ seek: timestamp });
    console.log('press', timestamp);
  };

  return (
    <View style={styles.mainContainer}>
      {/* can delete current time view later */}
      <View>
      </View>
      <View
        style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height / 2.5,
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
          onProgress={(data) => time[0] = data.currentTime}
        />
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
          </View>
          <SafeAreaView>
            <ScrollView style={styles.container}>
              {parsedStickers.length != 0
                ? parsedStickers.map((s: any) => {
                  return (
                    <View key={s.id} style={[styles.commentContainer, styles.row]}>
                      <TouchableOpacity
                        onPress={() => seekToTimestamp(s.timestamp)}
                        style={styles.comment}>
                        <View style={styles.leftContainer}>
                          <Text style={styles.textStyle}>
                            {s.timestamp} - {s.sentiment}
                          </Text>
                        </View>
                      </TouchableOpacity>
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
  leftContainer: {
    width: '94%',
    flexWrap: 'wrap',
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
  comment: {
    // height: 60,
    // position: 'absolute',
    // left: 0,
    //flex: 1,
    //flexWrap: 'wrap',
  },
});

export default EmotionTagging;
