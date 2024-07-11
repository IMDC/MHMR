import React, {Component, useEffect, useRef, useState} from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
const angry = require('../assets/images/emojis/angry.png');
const neutral = require('../assets/images/emojis/neutral.png');
const sad = require('../assets/images/emojis/sad.png');
const smile = require('../assets/images/emojis/smile.png');
const worried = require('../assets/images/emojis/worried.png');
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import {useRoute} from '@react-navigation/native';
import {useRealm, useObject} from '../models/VideoData';
import Video from 'react-native-video';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native';
import MHMRVideoPlayer from '../components/mhmrVideoPlayer';

const EmotionTagging = () => {

  const [isDeleteBtnVisible, setDeleteBtnVisible] = useState(false);
  const [isEditBtnVisible, setEditBtnVisible] = useState(true);

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


  return (
    <View style={styles.mainContainer}>
      <MHMRVideoPlayer
        videoID={id}
        emotionConsole={true}
        commentConsole={false}
        emotionView={true}
        commentView={false}
        isFullscreen={false}
      />
    </View>
    // <View style={styles.mainContainer}>
    //   <View
    //     style={{
    //       width: windowWidth,
    //       height: windowHeight / 2.5,
    //       paddingHorizontal: 15,
    //       paddingTop: 15,
    //     }}>
    //     <VideoPlayer
    //       videoRef={videoPlayerRef}
    //       source={{uri: MHMRfolderPath + '/' + video.filename}}
    //       paused={true}
    //       disableBack={true}
    //       toggleResizeModeOnFullscreen={true}
    //       showOnStart={true}
    //       disableSeekButtons={true}
    //       onProgress={data => {
    //         currentTime[0] = data.currentTime;
    //       }}
    //       onSeek={data => {
    //         currentTime[0] = data.currentTime;
    //       }}
    //     />
    //     {overlaySticker[0] != '' ? (
    //       <Image
    //         style={[styles.overlayText, styles.overlaySticker]}
    //         source={overlaySticker[0]}></Image>
    //     ) : null}
    //     {/* <Text style={[styles.overlayText, { marginRight: windowWidth / 1.5 }]}>{overlaySticker[0]}</Text> */}
    //   </View>

    //   <View style={styles.ballContainer} />
    //   <View style={[styles.row, {paddingBottom: 140}]}>
    //     <Draggable id="smile" source={smile} />
    //     <Draggable id="neutral" source={neutral} />
    //     <Draggable id="worried" source={worried} />
    //     <Draggable id="sad" source={sad} />
    //     <Draggable id="angry" source={angry} />
    //   </View>

    //   <ScrollView>
    //     <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
    //       <Text style={styles.headerStyle}>Stickers</Text>
    //       {isDeleteBtnVisible && (
    //         <TouchableOpacity
    //           style={{justifyContent: 'flex-end'}}
    //           onPress={() => toggleEditBtnVisible()}>
    //           <Text style={{fontSize: 16, marginRight: 25}}>Done</Text>
    //         </TouchableOpacity>
    //       )}
    //       {isEditBtnVisible && (
    //         <TouchableOpacity
    //           style={{justifyContent: 'flex-end'}}
    //           onPress={() => toggleDeleteBtnVisibile()}>
    //           <Text style={{fontSize: 16, marginRight: 25}}>Edit</Text>
    //         </TouchableOpacity>
    //       )}
    //     </View>

    //     <SafeAreaView>
    //       <ScrollView style={styles.container}>
    //         {parsedStickers.length != 0
    //           ? parsedStickers.map((s: any, i) => {
    //               return (
    //                 <View
    //                   ref={el => {
    //                     if (el != null) {
    //                       stickerRef[i] = el;
    //                     }
    //                   }}
    //                   key={s.id}
    //                   style={[styles.commentContainer, styles.row]}>
    //                   {/* <Dialog
    //                   isVisible={visible}
    //                   onBackdropPress={toggleDialog}>
    //                   <Dialog.Title title="Edit text" />
    //                   <Input
    //                     ref={commentEditInput}
    //                     inputStyle={{ fontSize: 35 }}
    //                     //value={text}
    //                     defaultValue={commentSelectedText}
    //                     onChangeText={value => setCommentEdit(value)}
    //                     onSubmitEditing={() => {
    //                       editComment(commentSelectedID);
    //                       toggleDialog();
    //                     }}
    //                   />

    //                   <Dialog.Actions>
    //                     <Dialog.Button
    //                       title="CONFIRM"
    //                       onPress={() => {
    //                         editComment(commentSelectedID);
    //                         toggleDialog();
    //                       }}
    //                     />
    //                     <Dialog.Button
    //                       title="CANCEL"
    //                       onPress={toggleDialog}
    //                     />
    //                   </Dialog.Actions>
    //                 </Dialog> */}

    //                   <View style={styles.row}>
    //                     <TouchableOpacity
    //                       onPress={() => seekToTimestamp(s.timestamp)}>
    //                       <Text style={styles.textStyle}>
    //                         {secondsToHms(s.timestamp)} - {s.sentiment}
    //                       </Text>
    //                     </TouchableOpacity>
    //                   </View>
    //                   <View style={styles.rightContainer}>
    //                     {/* display this when user clicks edit */}
    //                     {isDeleteBtnVisible && (
    //                       <View>
    //                         {/* <TouchableOpacity
    //                         style={{ alignSelf: 'flex-end' }}
    //                         onPress={() => {
    //                           setStickerSelectedText(s.sentiment);
    //                           setStickerSelectedID(s.id);

    //                           toggleDialog();
    //                           // console.log('comment selected', c.text);
    //                           console.log('sticker selected', s.id);
    //                         }}>
    //                         <Text style={{ color: '#1C3EAA', fontSize: 16 }}>
    //                           Edit
    //                         </Text>
    //                       </TouchableOpacity> */}

    //                         <TouchableOpacity
    //                           style={{alignSelf: 'flex-end'}}
    //                           onPress={() => deleteSticker(s.id)}>
    //                           <Icon name="delete" size={24} color="#cf7f11" />
    //                         </TouchableOpacity>
    //                       </View>
    //                     )}
    //                   </View>
    //                 </View>
    //               );
    //             })
    //           : null}
    //       </ScrollView>
    //     </SafeAreaView>
    //   </ScrollView>
    // </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    padding: 25,
  },
  ballContainer: {
    height: 80,
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
    width: 120,
    height: 120,
  },
  headerStyle: {
    fontWeight: 'bold',
    fontSize: 28,
    paddingLeft: 25,
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
    width: 100,
    height: 100,
  },
});

export default EmotionTagging;
