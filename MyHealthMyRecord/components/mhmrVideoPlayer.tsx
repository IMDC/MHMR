import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Keyboard,
  TouchableOpacity,
  ScrollView,
  LogBox,
  Animated,
  Image,
  PanResponder,
  PanResponderGestureState,
} from 'react-native';
import {Icon, Input, Dialog} from '@rneui/themed';
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import {useObject, useRealm} from '../models/VideoData';
import {ObjectId} from 'bson';
import {
  bottomNavBarHeight,
  heightNoTabs,
  navbarHeight,
  screenHeight,
  windowHeight,
  windowWidth,
} from '../assets/util/styles';

const logo = require('../assets/images/MHMRLogo_NOBG.png');
const angry = require('../assets/images/emojis/angry.png');
const neutral = require('../assets/images/emojis/neutral.png');
const sad = require('../assets/images/emojis/sad.png');
const smile = require('../assets/images/emojis/smile.png');
const worried = require('../assets/images/emojis/worried.png');

const MHMRVideoPlayer = ({
  videoID,
  emotionConsole,
  commentConsole,
  emotionView,
  commentView,
  isFullscreen,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const ObjectID = new ObjectId(videoID);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';
  const realm = useRealm();
  const video = useObject('VideoData', ObjectID);
  const videoPath = MHMRfolderPath + '/' + video.filename;
  const videoPlayerRef: any = useRef<Video>(null);
  const input = useRef(null);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const currentTime = useState(0);
  const [isDeleteBtnVisible, setDeleteBtnVisible] = useState(false);
  const [isEditBtnVisible, setEditBtnVisible] = useState(true);
  const [commentSelectedID, setCommentSelectedID] = useState('');
  const [commentSelectedText, setCommentSelectedText] = useState('');
  const overlaySticker = useState('');
  const stickerRef: any = useRef([]);
  const [storedStickers, setStoredStickers] = useState(video.emotionStickers);
  const [storedComments, setStoredComments] = useState(video.textComments);
  const overlayComment = useState('');
  const commentRef: any = useRef([]);
  const newComment = useState('');
  const newTimestamp = useState(1);
  const commentEditInput = useRef(null);
  const [commentEdit, setCommentEdit] = useState('');
  const [commentsVisible, setCommentsVisible] = useState(true);
  const [emotionVisible, setEmotionVisible] = useState(true);
  const [visible, setVisible] = useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };
  let parsedStickers: string[] = [];
  storedStickers.map((sticker: string) =>
    parsedStickers.push(JSON.parse(sticker)),
  );
  let parsedComments = storedComments.map(comment => JSON.parse(comment));

  function addSticker(emotion: string) {
    let emotionSchema: any = {
      id: new Realm.BSON.ObjectId(),
      sentiment: emotion,
      timestamp: currentTime[0],
    };

    const stickerIndex = parsedStickers.findIndex(
      (element: any) => element.timestamp > emotionSchema.timestamp,
    );

    if (stickerIndex == -1) {
      parsedStickers.push(emotionSchema);
    } else {
      parsedStickers.splice(stickerIndex, 0, emotionSchema);
    }
    const newStickers = parsedStickers.map(sticker => JSON.stringify(sticker));
    setStoredStickers(newStickers);
    if (video) {
      realm.write(() => {
        video.emotionStickers! = newStickers;
      });
    }
  }

  useEffect(() => {
    commentRef.current = new Array(parsedComments.length);
    stickerRef.current = new Array(parsedStickers.length);
  }, [parsedComments.length, parsedStickers.length]);

  useEffect(() => {
    LogBox.ignoreLogs([
      'Warning: Each child in a list should have a unique "key" prop.',
    ]);
  }, []);

  useEffect(() => {
    if (commentView) {
      const interval = setInterval(() => {
        let empty = true;
        for (let i = 0; i < parsedComments.length; i++) {
          if (commentRef.current[i]) {
            commentRef.current[i].setNativeProps({
              style: {backgroundColor: 'transparent'},
            });
          }
          if (
            parsedComments[i].timestamp > currentTime[0] &&
            parsedComments[i].timestamp < currentTime[0] + 2
          ) {
            overlayComment[1](
              parsedComments[i].text + ' ' + parsedComments[i].timestamp,
            );
            if (commentRef.current[i]) {
              commentRef.current[i].setNativeProps({
                style: {backgroundColor: '#b7c3eb'},
              });
            }
            empty = false;
            break;
          }
        }
        if (empty) overlayComment[1]('');
      }, 250);
      return () => clearInterval(interval);
    }
  }, [overlayComment, parsedComments, currentTime, commentView]);

  useEffect(() => {
    if (emotionView) {
      const interval = setInterval(() => {
        let empty = true;
        for (let i = 0; i < parsedStickers.length; i++) {
          if (stickerRef.current[i]) {
            stickerRef.current[i].setNativeProps({
              style: {backgroundColor: 'transparent'},
            });
          }
          if (
            parsedStickers[i].timestamp > currentTime[0] &&
            parsedStickers[i].timestamp < currentTime[0] + 2
          ) {
            switch (parsedStickers[i].sentiment) {
              case 'smile':
                overlaySticker[1](smile);
                break;
              case 'neutral':
                overlaySticker[1](neutral);
                break;
              case 'worried':
                overlaySticker[1](worried);
                break;
              case 'sad':
                overlaySticker[1](sad);
                break;
              case 'angry':
                overlaySticker[1](angry);
                break;
              default:
                overlaySticker[1]('');
            }
            if (stickerRef.current[i]) {
              stickerRef.current[i].setNativeProps({
                style: {backgroundColor: '#b7c3eb'},
              });
            }
            empty = false;
            break;
          }
        }
        if (empty) overlaySticker[1]('');
      }, 250);
      return () => clearInterval(interval);
    }
  }, [overlaySticker, parsedStickers, currentTime, emotionView]);

  function secondsToHms(d: number) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);
    return `${('0' + h).slice(-2)}:${('0' + m).slice(-2)}:${('0' + s).slice(
      -2,
    )}`;
  }

  const seekToTimestamp = (timestamp: any) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seek(timestamp - 0.5);
    }
    console.log('press', timestamp);
  };

  function toggleDeleteBtnVisibile() {
    setDeleteBtnVisible(true);
    setEditBtnVisible(false);
  }

  function toggleEditBtnVisible() {
    setDeleteBtnVisible(false);
    setEditBtnVisible(true);
  }

  function addComment() {
    if (newComment[0] === '') return;

    let commentSchema = {
      id: new Realm.BSON.ObjectID(),
      text: newComment[0],
      timestamp: newTimestamp[0],
    };

    const commentIndex = parsedComments.findIndex(
      element => element.timestamp > commentSchema.timestamp,
    );

    if (commentIndex == -1) {
      parsedComments.push(commentSchema);
    } else {
      parsedComments.splice(commentIndex, 0, commentSchema);
    }

    const newTextComments = parsedComments.map(text => JSON.stringify(text));
    setStoredComments(newTextComments);
    if (video) {
      realm.write(() => {
        video.textComments = newTextComments;
      });
    }

    newComment[0] = '';
    input.current.clear();
    Keyboard.dismiss();
    videoPlayerRef.current.resume();
  }

  function editComment(commentID: any) {
    const commentIndex = parsedComments.findIndex(
      (element: any) => element.id == commentID,
    );
    parsedComments[commentIndex].text = commentEdit;

    const newTextComments = parsedComments.map(text => JSON.stringify(text));
    setStoredComments(newTextComments);
    if (video) {
      realm.write(() => {
        video.textComments = newTextComments;
      });
    }
  }

  function deleteComment(commentID: any) {
    const commentIndex = parsedComments.findIndex(
      (element: any) => element.id == commentID,
    );
    parsedComments.splice(commentIndex, 1);

    const newTextComments = parsedComments.map(text => JSON.stringify(text));
    setStoredComments(newTextComments);
    if (video) {
      realm.write(() => {
        video.textComments = newTextComments;
      });
    }
  }

  function deleteSticker(stickerID: any) {
    const stickerIndex = parsedStickers.findIndex(
      (element: any) => element.id == stickerID,
    );
    parsedStickers.splice(stickerIndex, 1);

    const newEmotionStickers = parsedStickers.map(sticker =>
      JSON.stringify(sticker),
    );
    setStoredStickers(newEmotionStickers);
    if (video) {
      realm.write(() => {
        video.emotionStickers = newEmotionStickers;
      });
    }
  }

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
        id: props.id,
      };

      this._val = {x: 0, y: 0};
      this.state.pan.addListener(
        (value: {x: number; y: number}) => (this._val = value),
      );

      this.panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          videoPlayerRef.current.pause();
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
          videoPlayerRef.current.resume();
          const emojiID = this.state.id;
          addSticker(emojiID);

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
            ]).start(() => this.setState({showDraggable: true}));
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

    isDropArea(gesture: PanResponderGestureState) {
      return gesture.moveY < this.windowHeight / 1.5;
    }

    renderDraggable() {
      const panStyle = {
        transform: this.state.pan.getTranslateTransform(),
      };
      if (this.state.showDraggable) {
        return (
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Animated.View
              {...this.panResponder.panHandlers}
              style={[panStyle, styles.circle, {opacity: this.state.opacity}]}>
              <Image style={styles.sticker} source={this.props.source} />
            </Animated.View>
          </View>
        );
      }
    }

    render() {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}>
          {this.renderDraggable()}
        </View>
      );
    }
  }

  return (
    <ScrollView>
      {isFullscreen ? (
        <View style={{ height: screenHeight, width: '100%'}}>
          <View
            style={{
              flex: 1,
            }}>
            <VideoPlayer
              disableVolume={true}
              videoRef={videoPlayerRef}
              source={{uri: videoPath}}
              paused={true}
              disableBack={false}
              toggleResizeModeOnFullscreen={true}
              showOnStart={true}
              isFullscreen={true}
              disableFullscreen={true}
              repeat={false}
              onProgress={data => {
                currentTime[0] = data.currentTime;
              }}
              onSeek={data => {
                currentTime[0] = data.currentTime;
              }}
              onBack={() => navigation.goBack()}
              // disableSeekButtons={true}
            />
          </View>
        </View>
      ) : (
        <View
          style={{
            width: windowWidth,
            height: windowHeight / 2.5,
            paddingHorizontal: 15,
            paddingTop: 15,
          }}>
          <VideoPlayer
            disableVolume={true}
            videoRef={videoPlayerRef}
            source={{uri: videoPath}}
            paused={true}
            disableBack={true}
            toggleResizeModeOnFullscreen={true}
            showOnStart={true}
            disableSeekButtons={true}
            style={{width: Dimensions.get('window').width, height: 300}}
            resizeMode="contain"
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
            isFullscreen={isFullscreen}
          />
        </View>
      )}

      {emotionView && overlaySticker[0] !== '' && (
        <Image
          style={[styles.overlayText, styles.overlaySticker]}
          source={overlaySticker[0]}
        />
      )}
      {commentView && overlayComment[0] !== '' && (
        <View
          style={[
            styles.overlayText,
            styles.overlayTextForComment,
            // {position: 'absolute', top: 10, left: 10},
          ]}>
          <Text style={{width: 100}}>{overlayComment[0]}</Text>
        </View>
      )}

      {commentConsole && (
        <>
          <Input
            ref={input}
            containerStyle={{paddingHorizontal: 25, paddingTop: 35}}
            multiline={true}
            placeholder="Enter comment here..."
            style={{padding: 15}}
            rightIcon={
              <Icon
                name="send"
                onPress={() => {
                  addComment();
                  console.log('------', currentTime[0], newTimestamp);
                }}
              />
            }
            onChangeText={value => {
              newComment[0] = value;
              newTimestamp[0] = currentTime[0];
              console.log('pause at change', currentTime[0]);
            }}
            onFocus={() => videoPlayerRef.current.pause()}
          />
        </>
      )}
      {emotionConsole && (
        <View>
          <View style={styles.ballContainer} />
          <View style={[styles.row, styles.draggableContainer]}>
            <Draggable id="smile" source={smile} />
            <Draggable id="neutral" source={neutral} />
            <Draggable id="worried" source={worried} />
            <Draggable id="sad" source={sad} />
            <Draggable id="angry" source={angry} />
          </View>
        </View>
      )}
      <ScrollView>
        <SafeAreaView>
          <ScrollView style={styles.container}>
            {commentView && !isFullscreen && (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={[styles.headerStyle, {paddingRight: 5}]}>
                      Comments
                    </Text>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        paddingTop: 15,
                        alignSelf: 'center',
                      }}
                      onPress={() => setCommentsVisible(!commentsVisible)}>
                      <Text style={{fontSize: 16}}>
                        {commentsVisible ? 'Hide' : 'Show'}
                      </Text>

                      {/* <Text style={{fontSize: 20, fontWeight: 'bold'}}>Show +</Text> */}
                      <Icon
                        name={
                          commentsVisible
                            ? 'keyboard-arrow-up'
                            : 'keyboard-arrow-down'
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  {isDeleteBtnVisible && (
                    <TouchableOpacity
                      style={{justifyContent: 'center'}}
                      onPress={() => toggleEditBtnVisible()}>
                      <Text style={{fontSize: 16, marginRight: 25}}>Done</Text>
                    </TouchableOpacity>
                  )}
                  {isEditBtnVisible && (
                    <TouchableOpacity
                      style={{justifyContent: 'center'}}
                      onPress={() => toggleDeleteBtnVisibile()}>
                      <Text style={{fontSize: 16, marginRight: 25}}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {commentsVisible && (
                  <View>
                    {parsedComments.length != 0 ? (
                      parsedComments.map((c, i) => (
                        <View
                          ref={el => {
                            commentRef.current[i] = el;
                          }}
                          key={c.id}
                          style={[styles.commentContainer, styles.row]}>
                          <Dialog
                            isVisible={visible}
                            onBackdropPress={toggleDialog}>
                            <Dialog.Title title="Edit text" />
                            <Input
                              ref={commentEditInput}
                              inputStyle={{fontSize: 35}}
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
                          </Dialog>
                          <View style={styles.row}>
                            <TouchableOpacity
                              onPress={() => seekToTimestamp(c.timestamp)}>
                              <Text key={c.id} style={styles.textStyle}>
                                {secondsToHms(c.timestamp)} - {c.text}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.rightContainer}>
                            {isDeleteBtnVisible && (
                              <View style={{flexDirection: 'row'}}>
                                <TouchableOpacity
                                  style={{
                                    alignSelf: 'flex-end',
                                    marginRight: 10,
                                  }}
                                  onPress={() => {
                                    setCommentSelectedText(c.text);
                                    setCommentSelectedID(c.id);
                                    toggleDialog();
                                  }}>
                                  <Icon
                                    name="pencil"
                                    type="font-awesome"
                                    size={24}
                                    color="#1C3EAA"
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={{alignSelf: 'flex-end'}}
                                  onPress={() => deleteComment(c.id)}>
                                  <Icon
                                    name="delete"
                                    size={24}
                                    color="#cf7f11"
                                  />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      // <Text>No comments added </Text>
                      <View>
                        {!commentConsole ? (
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('Text Comments', {
                                id: videoID,
                              })
                            }>
                            <Text
                              style={{
                                fontSize: 20,
                                paddingTop: 10,
                                color: 'blue',
                              }}>
                              No comments added. Click to add a comment.
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={{fontSize: 20, paddingTop: 10}}>
                            No comments added.
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
            {emotionView && !isFullscreen && (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={[styles.headerStyle, {paddingRight: 5}]}>
                      Emotion stickers
                    </Text>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        paddingTop: 15,
                        alignSelf: 'center',
                      }}
                      onPress={() => setEmotionVisible(!emotionVisible)}>
                      <Text style={{fontSize: 16}}>
                        {emotionVisible ? 'Hide' : 'Show'}
                      </Text>

                      <Icon
                        name={
                          emotionVisible
                            ? 'keyboard-arrow-up'
                            : 'keyboard-arrow-down'
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  {isDeleteBtnVisible && (
                    <TouchableOpacity
                      style={{justifyContent: 'center'}}
                      onPress={() => toggleEditBtnVisible()}>
                      <Text style={{fontSize: 16, marginRight: 25}}>Done</Text>
                    </TouchableOpacity>
                  )}
                  {isEditBtnVisible && (
                    <TouchableOpacity
                      style={{justifyContent: 'center'}}
                      onPress={() => toggleDeleteBtnVisibile()}>
                      <Text style={{fontSize: 16, marginRight: 25}}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {emotionVisible && (
                  <View>
                    {parsedStickers.length != 0 ? (
                      parsedStickers.map((s: any, i) => (
                        <View
                          ref={el => {
                            stickerRef.current[i] = el;
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
                          <View style={styles.rightContainer}>
                            {isDeleteBtnVisible && (
                              <View>
                                <TouchableOpacity
                                  style={{alignSelf: 'flex-end'}}
                                  onPress={() => deleteSticker(s.id)}>
                                  <Icon
                                    name="delete"
                                    size={24}
                                    color="#cf7f11"
                                  />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      <View>
                        {!emotionConsole ? (
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('Emotion Tagging', {
                                id: videoID,
                              })
                            }>
                            <Text
                              style={{
                                fontSize: 20,
                                paddingTop: 10,
                                color: 'blue',
                              }}>
                              No emotion stickers added. Click to add a emotion
                              stickers.
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={{fontSize: 20, paddingTop: 10}}>
                            No emotion stickers added.
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
  draggableContainer: {
    // width: '100%',
    paddingHorizontal: 25,
  },
  draggableItem: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  ballContainer: {
    paddingTop: '4%',
    // height: '5%',
  },
  circle: {
    // resizeMode: 'contain',
    width: windowWidth * 0.18,
    height: windowWidth * 0.18,
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
  headerStyle: {
    fontWeight: 'bold',
    fontSize: 32,

    paddingTop: 15,
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
  overlayText: {
    flex: 1,
    position: 'absolute',
    marginTop: 20,
    marginLeft: 20,
    padding: 5,
    backgroundColor: 'white',
    opacity: 0.85,
    borderRadius: 10,
  },
  overlaySticker: {
    width: 100,
    height: 100,
    marginRight: Dimensions.get('window').width / 1.5,
  },
  sticker: {
    resizeMode: 'contain',
    width: windowWidth * 0.18,
    height: windowWidth * 0.18,
  },
  overlayTextForComment: {
    flex: 1,
    right: 20,
  },
});

export default MHMRVideoPlayer;
