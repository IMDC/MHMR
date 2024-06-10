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
//import test from '../assets/images/MHMRLogo_NOBG.png';
const logo = require('../assets/images/MHMRLogo_NOBG.png');

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <>
      <View
        style={{
          // paddingTop: 50,
          // padding: 100,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image style={{height: 240, width: 240}} source={logo} />

        <Text
          style={{
            fontSize: 44,
            alignSelf: 'center',
            color: 'black',
            fontFamily: 'Poppins-Light',
          }}>
          MyHealthMyRecord
        </Text>
      </View>
      <View
        style={{
          paddingTop: 250,
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
            color="#1C3EAA"
            onPress={() => navigation.navigate('Record Video')}
          />
          <Text
            style={{
              paddingTop: 15,
              fontSize: 22,
              textAlign: 'center',
              color: 'black',
            }}>
            Record a Video
          </Text>
        </View>
        {/* <View>
          <Icon
            reverse
            name="image-outline"
            size={60}
            type="ionicon"
            color="#1C3EAA"
            onPress={() => navigation.navigate('View Recordings')}
          />
          <Text
            style={{
              paddingTop: 15,
              fontSize: 22,
              textAlign: 'center',
              color: 'black',
            }}>
            View Recordings
          </Text>
        </View> */}
      </View>
    </>
  );
};

export default Home;
