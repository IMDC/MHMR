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

  const [test, setTest] = useState(null);

  const [videoSetIDs, setVideoSetIDs] = useState<any>([]);
  const [videoSetDropdown, setVideoSetDropdown] = useState<any>([]);

  const [newVideoSetName, setNewVideoSetName] = useState<any | null>(null);

  useEffect(() => {
    formatVideoSetDropdown();
    console.log("dropdown", videoSetDropdown);
    setVideoSetIDs(getSelectedVideoIDS);
  }, []);

  // get videos selected
  const videosSelected = videoData.filtered('isSelected == true');
  //console.log(videosSelected);

  const videoSets: any = useQuery('VideoSet');
  console.log("sets", videoSets);

  function getSelectedVideoIDS() {
    let tempVideoSetIDs = [];
    for (let i = 0; i < videosSelected.length; i++) {
      tempVideoSetIDs.push(videosSelected[i]._id);
    }
    console.log(tempVideoSetIDs);
    return tempVideoSetIDs;
  }

  // loop through, get and save transcript to array with datetime and video id
  for (let i = 0; i < videosSelected.length; i++) {
    let transcript = videosSelected[i].transcript;
    console.log(transcript);
    if (transcript.length > 0) {
      getFreq(transcript[0]);
    } else {
      console.log("empty transcript");
    }
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
    const stopWords = ["HESITATION","I", "i", "ive", "im", "id", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", "dont", "should", "now"];
    const medWords = ["hurt", "hurts", "hurting", "sore", "soreness", "dizzy", "dizziness", "vertigo", "light-headed", "chill", "chills", "diarrhea", "stiff", "stiffness", "pain", "painful", "nausea", "nauseous", "nauseate", "nauseated", "insomnia", "sick", "fever", "ache", "aches", "ached", "aching", "pains", "flu", "vomit", "vomiting", "cough", "coughing", "coughs", "coughed", "tired", "exhausted", "numb", "numbness", "numbed", "weak", "weakness", "tingle", "tingling", "tingles", "tingled", "fever", "shiver", "shivering", "shivered", "rash", "swell", "swollen", "sweat", "sweaty", "sweats", "fatigue", "fatigued", "heartburn", "headache", "headaches", "constipation", "constipated", "bloated", "bloating", "cramp", "cramps", "cramped", "cramping"];
    for (let i = 0; i < stopWords.length; i++) {
      M.delete(stopWords[i]);
    }

    // TODO remove sentiments with %

    for (let [key, value] of M) {
      console.log(`${key} - ${value}`);
    }
    const obj = Object.fromEntries(M);
    console.log(obj);
    return M;
  }

  function convertMaptoJSON(M: any) {
    //M = 
  }

  function saveVideoSet(frequencyData: string[], videoIDs: string[]) {
    let tempName = Date().toString().split(' GMT-')[0];

  }

  function getVideoSetName() {

  }

  const createVideoSet = (
    frequencyData: string[],
    videoIDs: string[],
  ) => {
    realm.write(() => {
      realm.create('VideoSet', {
        _id: new Realm.BSON.ObjectID(),
        datetime: new Date(),
        name: new Date().toString().split(' GMT-')[0],
        frequencyData: frequencyData,
        videoIDs: videoIDs,
      });
    });
  };

  const [videoSetValue, setVideoSetValue] = useState(0);
  let testVideoSetOptions = [];

  function formatVideoSetDropdown() {
    let dropdownOptions = [];
    for (let i = 0; i < videoSets.length; i++) {
      dropdownOptions.push({ label: videoSets[i].name, value: i, id: videoSets[i]._id });
      console.log(dropdownOptions[i]);
    }
    setVideoSetDropdown(dropdownOptions);
  }

  /**
   * Deselect videos after user changes videoset selection from dropdown
   */
  function deselectVideos() {
    for (let i = 0; i < videosSelected.length; i++) {
      videosSelected[i].isSelected = false;
    }
  }

  /**
   * Select new videos after user changes videoset selection from dropdown
   */
  function selectVideos() {
    let targetVideoSet = "";
    for (let i = 0; i < videoSetDropdown.length; i++) {
      if (videoSetValue == videoSetDropdown[i].value) targetVideoSet = videoSetDropdown.id;
    }
    // tbc
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

      <View style={{ height: '30%', width: '100%' }}>
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
          <Button
            title="Save Video Set"
            onPress={() => createVideoSet([], videoSetIDs)}
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
