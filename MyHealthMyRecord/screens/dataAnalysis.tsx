import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { VideoData, useRealm, useObject, useQuery } from '../models/VideoData';
import { SafeAreaView, View, Text, ScrollView, Dimensions } from 'react-native';
import { Button } from '@rneui/themed';
import { LineChart, BarChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import Svg, * as svg from 'react-native-svg';
import * as scale from 'd3-scale';
import { Rect } from 'react-native-svg';
import { Dropdown } from 'react-native-element-dropdown';
//import { VideoSet } from '../models/VideoSet';
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
  console.log("**********************************************************");

  const [test, setTest] = useState(null);

  const [videoSetIDs, setVideoSetIDs] = useState<any>([]);
  const [videoSetDropdown, setVideoSetDropdown] = useState<any>([]);

  const [newVideoSetName, setNewVideoSetName] = useState<any | null>(null);

  useEffect(() => {
    formatVideoSetDropdown();
    //console.log("dropdown", videoSetDropdown);
    setVideoSetIDs(getSelectedVideoIDS);
  }, []);

  // get videos selected
  const videosSelected = videoData.filtered('isSelected == true');
  //console.log(videosSelected);

  const videoSets: any = useQuery('VideoSet');
  const videosSetsByDate = videoSets.sorted('datetime', false);
  //console.log("sets", videoSets);

  function getSelectedVideoIDS() {
    let tempVideoSetIDs = [];
    for (let i = 0; i < videosSelected.length; i++) {
      tempVideoSetIDs.push(videosSelected[i]._id);
    }
    console.log(tempVideoSetIDs);
    return tempVideoSetIDs;
  }

  //const [freqMaps, setFreqMaps] = useState<any>([]);
  const [freqMapsWithInfo, setFreqMapsWithInfo] = useState<any>([]);
  const [barData, setBarData] = useState<any>([]);

  /*   function addFreqMap(freqMap: any) {
      let temp = freqMaps;
      temp.push(freqMap);
      setFreqMaps(temp);
    } */

  function addFreqMapWithInfo(freqMapWithInfo: any) {
    let temp = freqMapsWithInfo;
    temp.push(freqMapWithInfo);
    setFreqMapsWithInfo(temp);
  }

  function accessFreqMaps() {
    let temp = freqMapsWithInfo;
    let result = [];
    for (let i = 0; i < temp.length; i++) {
      result.push(temp[i].map);
    }
    return result;
  }

  // loop through, get and save transcript to array with datetime and video id
  function getFreqMaps() {
    for (let i = 0; i < videosSelected.length; i++) {
      let transcript = videosSelected[i].transcript;
      let datetime = videosSelected[i].datetimeRecorded;
      console.log(transcript);
      if (transcript.length > 0) {
        let temp = getFreq(transcript[0], datetime);
        let freqWithInfo = { videoID: videosSelected[i]._id, datetime: videosSelected[i].datetimeRecorded, map: temp };
        addFreqMapWithInfo(freqWithInfo);
        //addFreqMap(temp);
      } else {
        console.log("empty transcript");
      }
    }
  }

  useEffect(() => {
    // no analysis if no videos currently selected because it breaks/error at combineFreqMaps()
    if (videosSelected.length != 0) {
      getFreqMaps();
      combineFreqMaps();
    }
  }, []);

  // in loop (?) do transcript count function

  const [map, setMap] = useState<any>([]);
  const [trackedDates, setTrackedDates] = useState(null);


  function getFreq(transcript: string, datetime: any) {

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

    // TODO: make a button for user to choose whether to remove stopWords and/or medWords
    // TODO: function to get map that ONLY includes medWords is probably necessary too
    const stopWords = ["", "HESITATION", "I", "i", "ive", "im", "id", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", "dont", "should", "now"];
    const medWords = ["hurt", "hurts", "hurting", "sore", "soreness", "dizzy", "dizziness", "vertigo", "light-headed", "chill", "chills", "diarrhea", "stiff", "stiffness", "pain", "painful", "nausea", "nauseous", "nauseate", "nauseated", "insomnia", "sick", "fever", "ache", "aches", "ached", "aching", "pains", "flu", "vomit", "vomiting", "cough", "coughing", "coughs", "coughed", "tired", "exhausted", "numb", "numbness", "numbed", "weak", "weakness", "tingle", "tingling", "tingles", "tingled", "fever", "shiver", "shivering", "shivered", "rash", "swell", "swollen", "sweat", "sweaty", "sweats", "fatigue", "fatigued", "heartburn", "headache", "headaches", "constipation", "constipated", "bloated", "bloating", "cramp", "cramps", "cramped", "cramping"];
    for (let i = 0; i < stopWords.length; i++) {
      M.delete(stopWords[i]);
    }

    let jsonTest = [];
    let dayJson = [];
    for (let [key, value] of M) {
      //console.log(`${key} - ${value}`);
      jsonTest.push({ label: `${key}`, value: `${value}`, date: datetime });
      dayJson.push({ label: datetime.getHours(), value: `${value}` });

    }
    const obj = Object.fromEntries(M);
    //console.log(obj);
    //console.log("json", datetime, "--", jsonTest);
    //console.log(dayJson);

    return M;
  }

  function convertMaptoJSON(M: any) {
    //M = 
  }

  /* ------------------------------ BAR GRAPH FREQUENCY ------------------------------ */

  /**
   * Combine two maps - Given freq maps of two videos, combine the freq count
   * @param map1 
   * @param map2 
   * @returns 
   */
  function combineMaps(map1: any, map2: any) {
    let combinedMap = new Map([...map1]);

    map2.forEach((value: any, key: any) => {
      if (combinedMap.has(key)) {
        combinedMap.set(key, combinedMap.get(key) + value);
      } else {
        combinedMap.set(key, value);
      }
    });

    return combinedMap;
  }

  /**
   * Combine all of the freqMaps from each video
   */
  function combineFreqMaps() {
    let temp = accessFreqMaps();
    //console.log(freqMaps);
    let result = temp[0];
    for (let i = 1; i < temp.length; i++) {
      result = combineMaps(result, temp[i]);
    }
    // sort by largest value to smallest value
    result = new Map([...result.entries()].sort((a, b) => b[1] - a[1]));
    let jsonTest = [];
    // barData formatting
    for (let [key, value] of result) {
      //console.log(`${key} - ${value}`);
      jsonTest.push({ label: `${key}`, value: parseInt(`${value}`) });
    }
    console.log(result);
    console.log(jsonTest);
    setBarData(jsonTest);
    setFreqMapsWithInfo([]);
  }

  /* ------------------------------ LINE GRAPH FREQUENCY ------------------------------ */



  /* ------------------------------ DROP DOWN MENU ------------------------------ */

  //TODO: not dynamic, need to make sure when new videoset is created, this drop down reflects that
  //TODO: similar to code in dashboard.tsx, when dropdown option selected, it changes isSelected field for videos in DB

  const [videoSetValue, setVideoSetValue] = useState(0);
  let testVideoSetOptions = [];

  function formatVideoSetDropdown() {
    let dropdownOptions = [];
    for (let i = 0; i < videosSetsByDate.length; i++) {
      dropdownOptions.push({ label: videosSetsByDate[i].name, value: i, id: videosSetsByDate[i]._id });
      console.log(dropdownOptions[i]);
    }
    setVideoSetDropdown(dropdownOptions);
  }

  /* ======================================================================= */
  return (
    <View>

      {/*       <Dialog isVisible={visible} onBackdropPress={toggleDialog}>
        <Dialog.Title title="Add a new keyword:" />
        <Input
          inputStyle={{ fontSize: 35 }}
          placeholder="Enter keyword here..."
          onChangeText={value => setNewKeyword(value)}
        />
        <Dialog.Actions>
          <Dialog.Button
            title="CONFIRM"
            onPress={() => {
              addKeyword();
              toggleDialog();
              console.log(newKeyword);
            }}
          />
          <Dialog.Button title="CANCEL" onPress={() => toggleDialog()} />
        </Dialog.Actions>
      </Dialog> */}

      <View style={{ height: '25%', width: '100%' }}>
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20 }}>Select Video Set: </Text>
          <Dropdown
            data={videoSetDropdown}
            maxHeight={400}
            style={{ height: 50, width: 600, paddingHorizontal: 20, backgroundColor: '#DBDBDB', borderRadius: 22 }}
            placeholderStyle={{ fontSize: 22 }}
            selectedTextStyle={{ fontSize: 22 }}
            activeColor='#FFC745'
            //backgroundColor='#FFC745'
            labelField="label"
            valueField="value"
            value={videoSetValue}
            onChange={item => {
              setVideoSetValue(item.value);
            }}
          />
          <Button
            title="View Videos in Video Set"
            onPress={() => navigation.navigate('Dashboard')}
            color={Styles.MHMRBlue}
            radius={50}
            containerStyle={{
              width: 300,
              marginHorizontal: 30,
              marginVertical: 30,
            }}
          />
          {/*           <Button
            title="Save Video Set"
            onPress={() => createVideoSet([], videoSetIDs)}
            color={Styles.MHMRBlue}
            radius={50}
            containerStyle={{
              width: 300,
              marginHorizontal: 30,
              marginVertical: 30,
            }}
          /> */}
        </View>
      </View>

      <View style={{ height: '70%', width: '100%' }}>
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            onPress={() => navigation.navigate('Bar Graph', {
              data: barData,
            })}
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
