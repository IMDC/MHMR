import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
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
} from 'react-native';
import {Icon, Button, Image} from '@rneui/themed';
import VideoPlayer from 'react-native-media-console';
import RNFS from 'react-native-fs';
import { useObject, useRealm } from '../models/VideoData';

const ReviewAnnotations = () => {
  async function saveChanges() {
    navigation.navigate('View Recordings', {
      id,
    });

    Alert.alert('Your changes have been saved!');
  }

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';

  const route: any = useRoute();
  const id = route.params?.id;
  
  const realm = useRealm();
  const video: any = useObject("VideoData", id);
  
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <ScrollView>
      <View
        style={{
          width: windowWidth,
          height: windowHeight / 2.5,
          paddingHorizontal: 15,
          paddingTop: 15,
        }}>
        <VideoPlayer
          source={{uri: MHMRfolderPath + '/' + video.filename}}
          paused={true}
          disableBack={true}
          toggleResizeModeOnFullscreen={true}
          showOnStart={true}
          disableSeekButtons={true}
        />
      </View>

      <View style={styles.container}>
        <Text style={styles.titleStyle}>{video.title}</Text>
        <View>
          {/* <Text style={styles.headerStyle}>Keywords and Locations</Text> */}
          <View style={styles.row}>
            <Text style={styles.tagStyle}>Home</Text>
            <Text style={styles.tagStyle}>Indoors</Text>
          </View>
        </View>
        <View>
          <Text style={styles.headerStyle}>Comments</Text>
          <TouchableOpacity>
            <Text style={styles.textStyle}>
              00:02 - Feeling pain at leg here
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.textStyle}>00:10 - Pain stops</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Button
        buttonStyle={{width: 220, height: 75, alignSelf: 'center'}}
        color="#1C3EAA"
        title="Save Changes"
        onPress={() => saveChanges()}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    fontWeight: 'bold',
    fontSize: 36,
  },
  container: {padding: 15},
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
});

export default ReviewAnnotations;
