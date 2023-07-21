import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Keyboard,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Button, Icon, Input, Dialog } from '@rneui/themed';
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import { VideoData, useObject, useRealm } from '../models/VideoData';
const logo = require('../assets/images/MHMRLogo_NOBG.png');
import { Portal, PaperProvider } from 'react-native-paper';

const TextComments = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

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

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route: any = useRoute();
  const id = route.params?.id;
  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  const videoPlayerRef: any = useRef(null);

  /* get stored comments and parse them */
  const [storedComments, setStoredComments] = useState(video.textComments);
  let parsedComments: any[] = [];
  storedComments.map((text: string) => parsedComments.push(JSON.parse(text)));

  /* add comment ref */
  const input: any = React.useRef(null);

  /* current time of video */
  const currentTime = useState(0);

  /* add comment with new text input and timestamp */
  const newComment = React.useState('');
  const newTimestamp = React.useState(1);

  /* edit comment ref */
  const commentEditInput: any = useRef(null);
  const [commentEdit, setCommentEdit] = React.useState('');

  /* comment shown in overlay */
  const overlayComment = React.useState('');

  const addComment = () => {
    /* validation: no empty comments */
    if (newComment[0] == '') return;

    /* set new comment values */
    let commentSchema: any = {
      id: new Realm.BSON.ObjectID(),
      text: newComment[0],
      timestamp: newTimestamp[0],
    };

    /* find index to add at so timestamps are in order */
    const commentIndex = parsedComments.findIndex(
      (element: any) => element.timestamp > commentSchema.timestamp,
    );

    /* add new comment to parsed array*/
    if (commentIndex == -1) {
      /* if greater timestamp not found, add new comment to end of array */
      parsedComments.push(commentSchema);
    } else {
      /* if greater timestamp found, add new comment at the index found */
      parsedComments.splice(commentIndex, 0, commentSchema);
    }

    /* write new comments array to db */
    const newTextComments: any[] = [];
    parsedComments.map((text: string) =>
      newTextComments.push(JSON.stringify(text)),
    );
    setStoredComments(newTextComments);
    if (video) {
      realm.write(() => {
        video.textComments! = newTextComments;
      });
    }

    /* reset */
    newComment[0] = '';
    input.current.clear();
    Keyboard.dismiss();
    videoPlayerRef.current.setNativeProps({ paused: false });
  };

  const editComment = (commentID: any) => {
    /* find index of comment matching input id and update in array */
    const commentIndex = parsedComments.findIndex(
      (element: any) => element.id == commentID,
    );
    parsedComments[commentIndex].text = commentEdit;

    /* update comments array in db */
    const newTextComments: any[] = [];
    parsedComments.map((text: string) =>
      newTextComments.push(JSON.stringify(text)),
    );
    setStoredComments(newTextComments);
    if (video) {
      realm.write(() => {
        video.textComments! = newTextComments;
      });
    }
  };

  const deleteComment = (commentID: any) => {
    /* find index of comment matching input id and remove from array */
    const commentIndex = parsedComments.findIndex(
      (element: any) => element.id == commentID,
    );
    parsedComments.splice(commentIndex, 1);

    /* update comments array in db */
    const newTextComments: any[] = [];
    parsedComments.map((text: string) =>
      newTextComments.push(JSON.stringify(text)),
    );
    setStoredComments(newTextComments);
    if (video) {
      realm.write(() => {
        video.textComments! = newTextComments;
      });
    }
  };

  /* update comment overlay every 250ms*/
  useEffect(() => {
    const interval = setInterval(() => {
      let empty = true;
      for (let i = 0; i < parsedComments.length; i++) {
        if ((parsedComments[i].timestamp > currentTime[0]) && (parsedComments[i].timestamp < currentTime[0] + 2)) {
          /* set overlay comment if current time is within time of timestamp to timestamp+2s */
          overlayComment[1](parsedComments[i].text + " " + parsedComments[i].timestamp);
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

  /* given a timestamp, jump to that time-0.5s in the video */
  const seekToTimestamp = (timestamp: any) => {
    videoPlayerRef.current.setNativeProps({ seek: timestamp - 0.5 });
    console.log('press', timestamp);
  };

  return (
    <>
      <View
        style={[styles.testContainer, {
          width: windowWidth,
          height: windowHeight / 2.5,
          paddingHorizontal: 15,
          paddingTop: 15,
        }]}>
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
        <Text style={[styles.overlayText, { marginRight: windowWidth / 1.5 }]}>{overlayComment[0]}</Text>
      </View>
      <Input
        ref={input}
        containerStyle={{ paddingHorizontal: 25, paddingTop: 15 }}
        multiline={true}
        placeholder="Enter comment here..."
        style={{ padding: 15 }}
        rightIcon={<Icon name="send" onPress={() => {
          addComment();
          console.log("------", currentTime[0], newTimestamp);
        }} />}
        onChangeText={value => {
          newComment[0] = value;
          newTimestamp[0] = currentTime[0];
          console.log("pause at change", currentTime[0]);
        }}
        onFocus={() => {
          videoPlayerRef.current.setNativeProps({ paused: true });
        }}
      />
      <ScrollView>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.headerStyle}>Comments</Text>
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
              {parsedComments.length != 0
                ? parsedComments.map((c: any) => {
                  return (
                    <View
                      key={c.id}
                      style={[styles.commentContainer, styles.row]}>
                      <Dialog
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
                      </Dialog>
                      <View style={styles.leftContainer}>
                        <TouchableOpacity
                          onPress={() => seekToTimestamp(c.timestamp)}
                          style={styles.comment}>
                          <Text style={styles.textStyle}>
                            {secondsToHms(c.timestamp)} - {c.text}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.rightContainer}>
                        {/* <Button
                            title="Edit"
                            icon={{
                              name: 'pencil-outline',
                              size: 30,
                              type: 'ionicon',
                              color: '#FFFFFF',
                            }}
                            iconRight
                            iconContainerStyle={{marginLeft: 15}}
                            titleStyle={{fontWeight: '500'}}
                            // buttonStyle={[
                            //   styles.buttonStyle,
                            //   {backgroundColor: '#1C3EAA'},
                            // ]}
                            containerStyle={{
                              width: 150,
                              marginHorizontal: 10,
                              marginVertical: 5,
                            }}
                            onPress={() => editComment(c.id)}/>
                          <Button
                            title="Delete"
                            icon={{
                              name: 'trash-outline',
                              size: 30,
                              type: 'ionicon',
                              color: '#FFFFFF',
                            }}
                            iconRight
                            iconContainerStyle={{marginLeft: 15}}
                            titleStyle={{fontWeight: '500'}}
                            // buttonStyle={[
                            //   styles.buttonStyle,
                            //   {backgroundColor: '#cf7f11'},
                            // ]}
                            containerStyle={{
                              width: 150,
                              marginHorizontal: 10,
                              marginVertical: 5,
                            }}
                            onPress={() => deleteComment(c.id)}/> */}
                        {/* display this when user clicks edit */}
                        {isDeleteBtnVisible && (
                          <View>
                            <TouchableOpacity
                              style={{ alignSelf: 'flex-end' }}
                              onPress={() => {
                                setCommentSelectedText(c.text);
                                setCommentSelectedID(c.id);

                                toggleDialog();
                                // console.log('comment selected', c.text);
                                console.log('comment selected', c.id);
                              }}>
                              <Text style={{ color: '#1C3EAA', fontSize: 16 }}>
                                Edit
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={{ alignSelf: 'flex-end' }}
                              onPress={() => deleteComment(c.id)}>
                              <Text style={{ color: '#cf7f11', fontSize: 16 }}>
                                Delete
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      {/* <Dialog
                          isVisible={visible}
                          onBackdropPress={toggleDialog}>
                          <Dialog.Title title="Edit text" />
                          <Input
                            ref={commentEditInput}
                            inputStyle={{fontSize: 35}}
                            //value={text}
                            defaultValue={c.text}
                            onChangeText={value => setCommentEdit(value)}
                            onSubmitEditing={() => updateComment()}
                          />

                          <Dialog.Actions>
                            <Dialog.Button
                              title="CONFIRM"
                              onPress={() => {
                                toggleDialog();
                              }}
                            />
                            <Dialog.Button
                              title="CANCEL"
                              onPress={toggleDialog}
                            />
                          </Dialog.Actions>
                        </Dialog> */}
                    </View>
                  );
                })
                : null}
            </ScrollView>
          </SafeAreaView>
        </View>
        {/* <View>
          <Text>Current Time: {currentTime}</Text>
        </View>
        <View>
          <Text>Test: {test}</Text>
        </View> */}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 25 },
  playerStyle: { height: '70%', padding: 4 },
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
  row: {
    flexDirection: 'row',
    //flexWrap: 'wrap',
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

export default TextComments;
