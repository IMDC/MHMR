import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { VideoData, useRealm, useObject, useQuery } from '../models/VideoData';
import { SafeAreaView, View, Text, ScrollView, Dimensions } from 'react-native';
import { Button } from '@rneui/themed';
import { LineChart, BarChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import Svg, * as svg from 'react-native-svg';
import * as scale from 'd3-scale';
import { Rect } from 'react-native-svg';
import { Dropdown } from 'react-native-element-dropdown';
//import { useQuery, useRealm } from '../models/AnalysisData';
import Realm from 'realm';
import * as Styles from '../assets/util/styles';

const DataAnalysis = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route: any = useRoute();

  /* ======================================================================= */

  const id = route.params?.id;

  const realm = useRealm();
  //const video: any = useObject('VideoData', id);
  const videoData: any = useQuery('VideoData');
  const videosByDate = videoData.sorted('datetimeRecorded', true);

  //console.log(videosByDate);

  const [test, setTest] = useState(null);

  // get videos selected
  const videosSelected = videoData.filtered('isTranscribed == true');
  console.log(videosSelected);

  // loop through, get and save transcript to array with datetime and video id
  for (let i = 0; i < videosSelected.length; i++) {
    let transcript = videosSelected[i].transcript;
    console.log(transcript);
    if (transcript.length > 0) getFreq(transcript[0]);
  }

  // in loop (?) do transcript count function

  function getFreq(transcript: string) {

    let M = new Map();

    let word = "";

    for (let i = 0; i < transcript.length; i++) {

      if (transcript[i] === " ") {
        if (!M.has(word)) {
          M.set(word, 1);
          word = "";
        }
        else {
          M.set(word, M.get(word) + 1);
          word = "";
        }
      }
      else {
        word += transcript[i];
      }
    }

    if (!M.has(word)) {
      M.set(word, 1);
    } else {
      M.set(word, M.get(word) + 1);
    }

    M = new Map([...M.entries()].sort());

    // TODO separate into pronouns, etc. (stopwords/medwords)
    const deleteWords = ["", "the", "I", "a", "had", "them", "they", "they're", "don't", "from", "and", "all", "are", "but", "so", "you", "is", "of"];
    for (let i = 0; i < deleteWords.length; i++) {
      M.delete(deleteWords[i]);
    }

    // TODO remove sentiments with %

    for (let [key, value] of M) {
      console.log(`${key} - ${value}`);
    }
    const obj = Object.fromEntries(M);
    console.log(obj);
    return M;
  }

  const createAnalysisData = (
    freqDataInput: string[],
  ) => {
    realm.write(() => {
      realm.create('AnalysisData', {
        _id: new Realm.BSON.ObjectID(),
        datetime: new Date(),
        frequencyData: freqDataInput,
      });
    });
  };

  const [session, setSessionValue] = useState(null);
  const testSessionOptions = [
    { label: 'ex 1 - DDMMYYYY/timestamp', value: 0 },
    { label: 'ex 2 - DDMMYYYY/timestamp', value: 1 },
    { label: 'ex 3 - DDMMYYYY/timestamp', value: 2 },
  ];

  /* ======================================================================= */
  return (
    <View>

      <View style={{ height: '30%', width: '100%' }}>
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20 }}>Select Session: </Text>
          <Dropdown
            data={testSessionOptions}
            maxHeight={400}
            style={{ height: 50, width: 600, paddingHorizontal: 20, backgroundColor: '#DBDBDB', borderRadius: 22 }}
            placeholderStyle={{ fontSize: 22 }}
            selectedTextStyle={{ fontSize: 22 }}
            activeColor='#FFC745'
            //backgroundColor='#FFC745'
            labelField="label"
            valueField="value"
            value={session}
            onChange={item => {
              setSessionValue(item.value);
            }}
          />
          <Button
            title="View Videos in Session"
            onPress={() => navigation.navigate('Dashboard')}
            color={Styles.MHMRBlue}
            radius={50}
            containerStyle={{
              width: 300,
              marginHorizontal: 30,
              marginVertical: 30,
            }}
          />
        </View>
      </View>

      <View style={{ height: '70%', width: '100%' }}>
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            onPress={() => navigation.navigate('Bar Graph')}
            titleStyle={{ fontSize: 40 }}
            containerStyle={{
              width: 400,
              marginHorizontal: 30,
              marginVertical: 10,
            }}
            iconRight={true}
            icon={{
              name: 'chart-bar',
              type: 'font-awesome-5',
              size: 40,
              color: 'white',
            }}
            color={Styles.MHMRBlue}
            radius={50}>
            Bar Graph
          </Button>
          <Button
            onPress={() => navigation.navigate('Line Graph')}
            titleStyle={{ fontSize: 40 }}
            containerStyle={{
              width: 400,
              marginHorizontal: 30,
              marginVertical: 10,
            }}
            iconRight={true}
            icon={{
              name: 'chart-line',
              type: 'font-awesome-5',
              size: 40,
              color: 'white',
            }}
            color={Styles.MHMRBlue}
            radius={50}>
            Line Graph
          </Button>
          <Button
            disabled={true}
            onPress={() => navigation.navigate('Word Cloud')}
            titleStyle={{ fontSize: 40 }}
            containerStyle={{
              width: 400,
              marginHorizontal: 30,
              marginVertical: 10,
            }}
            iconRight={true}
            icon={{
              name: 'cloud',
              type: 'font-awesome',
              size: 40,
              color: 'white',
            }}
            color={Styles.MHMRBlue}
            radius={50}>
            Word Cloud
          </Button>
          <Button
            onPress={() => navigation.navigate('Text Summary')}
            titleStyle={{ fontSize: 40 }}
            containerStyle={{
              width: 400,
              marginHorizontal: 30,
              marginVertical: 10,
            }}
            iconRight={true}
            icon={{
              name: 'file-alt',
              type: 'font-awesome-5',
              size: 40,
              color: 'white',
            }}
            color={Styles.MHMRBlue}
            radius={50}>
            Text Summary
          </Button>
          <Button
            disabled={true}
            onPress={() => navigation.navigate('Text Graph')}
            titleStyle={{ fontSize: 40 }}
            containerStyle={{
              width: 400,
              marginHorizontal: 30,
              marginVertical: 10,
            }}
            iconRight={true}
            icon={{
              name: 'project-diagram',
              type: 'font-awesome-5',
              size: 40,
              color: 'white',
            }}
            color={Styles.MHMRBlue}
            radius={50}>
            Text Graph
          </Button>
        </View>
      </View>
    </View>
  );
};

export default DataAnalysis;
