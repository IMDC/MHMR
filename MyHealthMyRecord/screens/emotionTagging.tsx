import React, {Component, useRef} from 'react';
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
} from 'react-native';
import angry from '../assets/images/emojis/angry.png';
import neutral from '../assets/images/emojis/neutral.png';
import sad from '../assets/images/emojis/sad.png';
import smile from '../assets/images/emojis/smile.png';
import worried from '../assets/images/emojis/worried.png';
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import {useRoute} from '@react-navigation/native';
import {useRealm, useObject} from '../models/VideoData';
import Video from 'react-native-video';

const EmotionTagging = () => {
  
const videoRef = useRef<Video>(null);

class Draggable extends React.Component<any, any> {
  _val: {x: number; y: number};
  panResponder: any;
  constructor(props: any) {
    super(props);

    this.state = {
      showDraggable: true,
      dropAreaValues: null,
      pan: new Animated.ValueXY(),
      opacity: new Animated.Value(1),
      source: props.source,
    };

    this._val = {x: 0, y: 0};
    this.state.pan.addListener(
      (value: {x: number; y: number}) => (this._val = value),
    );

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        //pause video here
        videoRef.current.setNativeProps({paused: true})
        this.state.pan.setOffset({
          x: this._val.x,
          y: this._val.y,
        });
        this.state.pan.setValue({x: 0, y: 0});
      },
      onPanResponderMove: Animated.event(
        [null, {dx: this.state.pan.x, dy: this.state.pan.y}],
        {useNativeDriver: false},
      ),
      onPanResponderRelease: (e, gesture) => {
        //play video here
        videoRef.current.setNativeProps({paused: false});

        if (this.isDropArea(gesture)) {
          Animated.sequence([
            Animated.timing(this.state.opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: false,
            }),
            Animated.timing(this.state.pan, {
              toValue: {x: 0, y: 0},
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
            toValue: {x: 0, y: 0},
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
      <View style={{width: '20%', alignItems: 'center'}}>
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
        <View style={{position: 'absolute', paddingRight: 60}}>
          <Animated.View
            {...this.panResponder.panHandlers}
            style={[panStyle, styles.circle, {opacity: this.state.opacity}]}>
            <Image
              style={{height: 120, width: 120}}
              source={this.props.source}
            />
          </Animated.View>
        </View>
      );
    }
  }
}

  const route: any = useRoute();
  const id = route.params?.id;
  const realm = useRealm();
  const video: any = useObject('VideoData', id);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';
  return (
    <View style={styles.mainContainer}>
      <View
        style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height / 1.5,
          paddingHorizontal: 15,
          paddingTop: 15,
        }}>
        <VideoPlayer
          videoRef={videoRef}
          source={{uri: MHMRfolderPath + '/' + video.filename}}
          paused={true}
          disableBack={true}
          toggleResizeModeOnFullscreen={true}
          showOnStart={true}
          disableSeekButtons={true}
        />
      </View>
      <View style={styles.ballContainer} />
      <View style={styles.row}>
        <Draggable source={smile} />
        <Draggable source={neutral} />
        <Draggable source={worried} />
        <Draggable source={sad} />
        <Draggable source={angry} />
      </View>
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
});

export default EmotionTagging;
