import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Keyboard,
} from 'react-native';
import {Icon,Input} from '@rneui/themed';
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';

const TextComments = () => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route = useRoute();
  const title = route.params?.title;
  const location = route.params?.location;
  const id = route.params?.id;
  const filename = route.params?.filename;
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const input = React.useRef(null);

  function handleClick() {
    input.current.clear();
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
          source={{uri: MHMRfolderPath + '/' + filename}}
          paused={true}
          disableBack={true}
          toggleResizeModeOnFullscreen={true}
          showOnStart={true}
          disableSeekButtons={true}
        />
      </View>
      <View>
        <Input
          // on focus add a button to save the text and pause text
          ref={input}
          containerStyle={{paddingHorizontal: 25, paddingTop: 15}}
          multiline={true}
          placeholder="Enter comments here"
          style={{padding: 15}}
          rightIcon={<Icon name="send" onPress={handleClick} />}
        />
        <Text style={styles.headerStyle}>Comments</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 25},
  playerStyle: {height: '70%', padding: 4},
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
