/*import React from 'react';
import type { PropsWithChildren } from 'react';*/
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Button,
  Alert,
} from 'react-native';

const RecordVideo = () => {
  const navigation = useNavigation();
  return (
    <View>
      <Button
        title="Go to Home Page"
        onPress={() => navigation.navigate('Home')}
      />
      <Button
        title="Record a Video"
        onPress={() => Alert.alert('Simple Button pressed')}
      />
    </View>
  );
}

export default RecordVideo;
