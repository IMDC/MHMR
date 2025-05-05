import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
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
  Image,
} from 'react-native';
const angry = require('../../assets/images/emojis/angry.png');
const neutral = require('../../assets/images/emojis/neutral.png');
const sad = require('../../assets/images/emojis/sad.png');
const smile = require('../../assets/images/emojis/smile.png');
const worried = require('../../assets/images/emojis/worried.png');
import {Icon, Button} from '@rneui/themed';
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import {useObject, useRealm} from '../../models/VideoData';
import {Chip} from 'react-native-paper';
import MHMRVideoPlayer from '../../components/mhmrVideoPlayer';

const ReviewAnnotations = () => {
  async function saveChanges() {
    navigation.navigate('View Recordings', {
      id,
    });

    Alert.alert('Your changes have been saved!');
  }

  useEffect(() => {
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state.',
    ]);
  });

  const videoPlayerRef: any = useRef(null);

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.titleStyle}>{video.title}</Text>
        <ScrollView horizontal={true} style={styles.row}>
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
        </ScrollView>
      </View>

      <View>
        <MHMRVideoPlayer
          videoID={id}
          emotionConsole={false}
          commentConsole={false}
          emotionView={true}
          commentView={true}
          isFullscreen={false}
        />
      </View>

      <View style={{paddingTop: 30, marginBottom: 40}}>
        <Button
          buttonStyle={{width: 200, height: 65, alignSelf: 'center'}}
          color="#1C3EAA"
          radius={50}
          title="Save changes"
          onPress={() => saveChanges()}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    fontWeight: 'bold',
    fontSize: 36,
  },
  container: {paddingHorizontal: 15},
  row: {flexDirection: 'row'},
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
