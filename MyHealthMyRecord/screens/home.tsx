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
  TouchableOpacity,
} from 'react-native';
import {Icon, Image} from '@rneui/themed';
import {useNetwork} from '../components/networkProvider';
//import test from '../assets/images/MHMRLogo_NOBG.png';
const logo = require('../assets/images/MHMRLogo_NOBG.png');
import * as Styles from '../assets/util/styles';

const Home = () => {
  const {online} = useNetwork();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <>
      {/* {!online && (
        <View
          style={{
            paddingHorizontal: 10,
            paddingTop: 10,
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}>
          <Icon
            name="alert-circle-outline"
            size={24}
            type="ionicon"
            color={Styles.MHMRBlue}
            // style={{width: Styles.bottomNavIconSize}}
          />
          <Text style={{fontSize: 18, color: Styles.MHMRBlue}}>
            You are offline.
          </Text>
        </View>
      )} */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 10,
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}>
        <TouchableOpacity onPress={() => navigation.navigate('Help')}>
          <Icon
            name="information-circle-outline"
            size={24}
            type="ionicon"
            color={Styles.MHMRBlue}
            // style={{width: Styles.bottomNavIconSize}}
          />
          <Text
            style={{
              textAlign: 'center',
              justifyContent: 'center',
              color: Styles.MHMRBlue,
            }}>
            Help
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-evenly',
        }}>
        <View
          id="title"
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            resizeMode="contain"
            style={{
              height: Styles.windowWidth * 0.2,
              width: Styles.windowWidth * 0.2,
            }}
            source={logo}
          />

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
          id="record button"
          style={{
            flex: 2,
            paddingBottom: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon
            reverse
            name="videocam-outline"
            size={Styles.windowHeight * 0.05}
            type="ionicon"
            color={Styles.MHMRBlue}
            onPress={() => navigation.navigate('Record Video')}
          />
          <Text
            style={{
              paddingTop: 5,
              fontSize: 22,
              textAlign: 'center',

              color: 'black',
            }}>
            Record a video
          </Text>
        </View>
      </View>
    </>
  );
};

export default Home;
