/*import React from 'react';
import type { PropsWithChildren } from 'react';*/
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
//import VideoRecorder from 'react-native-beautiful-video-recorder';
import {
  View,
  Button,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
/*
start = () => {
  // 30 seconds
  this.videoRecorder.open({ maxLength: 3 }, (data) => {
    console.log('captured data', data);
  });
}
*/
const Test = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <View>
      <Button
        title="Go to Home Page"
        onPress={() => navigation.navigate('Home')}
      />
      <Button
          title="Press this Button"
          onPress={() => Alert.alert('Simple Button pressed')}
      />
      
    </View>
  );
}
//<VideoRecorder ref={(ref) => { this.videoRecorder = ref; }} />
export default Test;
