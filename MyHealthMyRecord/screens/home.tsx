/*import React from 'react';
import type { PropsWithChildren } from 'react';*/
import {ParamListBase, useNavigation} from '@react-navigation/native';
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
  Button,
  Alert,
} from 'react-native';
import {Icon, Image} from '@rneui/themed';
import test from '../assets/images/MHMRLogo.png';

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <>
      <View>
        <Image style={{height: 240, width: 240}}
        source={test} />
        
        <Text
          style={{
            fontSize: 60,
            textAlign: 'center',
          }}>
          MyHealthMyRecord
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }}>
        <View>
          <Icon
            reverse
            name="videocam-outline"
            size={60}
            type="ionicon"
            color="grey"
            onPress={() => navigation.navigate('Record Video')}
          />
          <Text
            style={{
              paddingTop: 15,
              fontSize: 22,
              textAlign: 'center',
            }}>
            Record a Video
          </Text>
        </View>
        <View>
          <Icon
            reverse
            name="image-outline"
            size={60}
            type="ionicon"
            color="grey"
            onPress={() => navigation.navigate('View Recordings')}
          />
          <Text
            style={{
              paddingTop: 15,
              fontSize: 22,
              textAlign: 'center',
            }}>
            View Recordings
          </Text>
        </View>
      </View>
    </>
  );
};

export default Home;
