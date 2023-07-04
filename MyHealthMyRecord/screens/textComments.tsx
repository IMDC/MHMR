import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
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
import { Icon, Input } from '@rneui/themed';
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import { VideoData, useObject, useRealm } from '../models/VideoData';
const logo = require('../assets/images/MHMRLogo_NOBG.png');

const TextComments = () => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const videoPlayerRef: any = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [test, setTest] = useState(0);

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  const [textComments, setTextComments] = useState(video.textComments);
  let parsedComments: string[] = [];
  textComments.map((text: string) => parsedComments.push(JSON.parse(text)));

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const input: any = React.useRef(null);

  const [newComment, setNewComment] = React.useState('');
  const [newTimestamp, setTimestamp] = React.useState(1);

  const addComment = () => {
    let commentSchema: any = { id: new Realm.BSON.ObjectID(), text: newComment, timestamp: newTimestamp };
    /* add new comment to parsed array and stringify parsed array*/
    parsedComments.push(commentSchema);
    //console.log("==parsed==", parsedComments);
    const newTextComments: any[] = [];
    parsedComments.map((text: string) => newTextComments.push(JSON.stringify(text)));
    //console.log("==temp==", newTextComments);
    setTextComments(newTextComments);
    /* write new comments array to db */
    if (video) {
      realm.write(() => {
        video.textComments! = newTextComments;
      });
    }

    //setTest(videoPlayerRef.calculateTime());
    //console.log("test", test);

    /* reset */
    setNewComment('');
    input.current.clear();
    Keyboard.dismiss();
    videoPlayerRef.current.setNativeProps({paused: false});
  }

  const seekToTimestamp = (timestamp: any) => {
    videoPlayerRef.current.setNativeProps({seek: timestamp});
    console.log("press", timestamp);
  }

  // delete ?
  function handleClick() {
    if (input.current != null) input.current.clear();
    Keyboard.dismiss();
  }
  
  return (
    <SafeAreaView>
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
            setCurrentTime(data.currentTime);
          }}
          //poster={logo}
          //posterResizeMode="cover"
          //onPause={calculateTime()}
        />
      </View>
      <View>
        <Input
          // on focus add a button to save the text and pause text
          ref={input}
          containerStyle={{ paddingHorizontal: 25, paddingTop: 15 }}
          multiline={true}
          placeholder="Enter comment here"
          style={{ padding: 15 }}
          rightIcon={<Icon name="send" onPress={addComment} />}
          onChangeText={value => {
            setNewComment(value);
            videoPlayerRef.current.setNativeProps({paused: true});
            setTimestamp(currentTime);
          }}
        />
        <Text style={styles.headerStyle}>Comments</Text>
        <ScrollView>
          {/* ACTION: set key for each comment in */}
          {parsedComments.length != 0
            ? parsedComments.map((c: any) => {
              return (
                <TouchableOpacity key={c.id} onPress={() => seekToTimestamp(c.timestamp)}>
                  <Text style={styles.textStyle}>{c.timestamp} - {c.text}</Text>
                </TouchableOpacity>
              );
            })
            : null}
        </ScrollView>
      </View>
      <View>
        <Text>Current Time: {currentTime}</Text>
      </View>
      <View>
        <Text>Test: {test}</Text>
      </View>
    </SafeAreaView>
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
  },
});

export default TextComments;
