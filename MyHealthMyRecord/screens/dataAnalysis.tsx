import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {VideoData, useRealm, useObject, useQuery} from '../models/VideoData';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Dimensions,
  Modal,
  StyleSheet,
} from 'react-native';
import {Button} from '@rneui/themed';
import {LineChart, BarChart, Grid, YAxis, XAxis} from 'react-native-svg-charts';
import Svg, * as svg from 'react-native-svg';
import * as scale from 'd3-scale';
import {Rect} from 'react-native-svg';
import {Dropdown} from 'react-native-element-dropdown';
//import { VideoSet } from '../models/VideoSet';
import Realm from 'realm';
import * as Styles from '../assets/util/styles';
import VideoSetDropdown from '../components/videoSetDropdown';
import {color} from '@rneui/base';
import {useDropdownContext} from '../components/videoSetProvider';
import {stopWords, medWords} from '../assets/util/words';
import {useSetLineGraphData} from '../components/lineGraphData';

const DataAnalysis = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [lineGraphNavigationVisible, setLineGraphNavigationVisible] =
    useState(false);
  const {
    handleChange,
    videoSetValue,
    videoSetVideoIDs,
    setVideoSetValue,
    currentVideos,
    currentVideoSet,
  } = useDropdownContext();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route: any = useRoute();
  const setLineGraphData = useSetLineGraphData();
  const [wordLabel, setWordLabel] = useState('');
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [videoSetDropdown, setVideoSetDropdown] = useState([]);
  const [selectedVideoSet, setSelectedVideoSet] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const videoData = useQuery<VideoData>('VideoData');
  const videoSets = useQuery<any>('VideoSet');
  const videosByDate = videoData.sorted('datetimeRecorded', true);
  const videosByIsSelected = currentVideos;
  const [viewValue, setViewValue] = useState(1);
  const [data, setData] = useState<any>([]);
  const [selectedWord, setSelectedWord] = useState('');

  const handleVideoSelectionChange = (selectedId: string) => {
    const selectedSet = videoSets.find(
      set => set._id.toString() === selectedId,
    );
    setSelectedVideoSet(selectedSet);
  };

  /* ======================================================================= */

  const id = route.params?.id;

  const realm = useRealm();
  //const video: any = useObject('VideoData', id);

  //console.log(videosByDate);
  console.log('**********************************************************');

  useEffect(() => {
    if (selectedVideoSet && selectedVideoSet.videoIDs && videoData) {
      const videoIDSet = new Set(selectedVideoSet.videoIDs);
      const selectedSetVideos = videoData.filter(video => {
        if (!video._id) {
          console.error('Video _id is undefined:', video);
          return false;
        }
        return videoIDSet.has(video._id.toString());
      });
      setVideos(selectedSetVideos);
    } else {
      setVideos(videosByIsSelected);
    }
    console.log('videoSetVideoIDs in dataAnalysis.tsx:', videoSetVideoIDs);
  }, [selectedVideoSet, videoSetVideoIDs]);

  // get videos selected
  const videosSelected = currentVideos;
  //console.log(videosSelected);

  const videosSetsByDate = videoSets.sorted('datetime', false);
  //console.log("sets", videoSets);

  //const [freqMaps, setFreqMaps] = useState<any>([]);
  const [freqMapsWithInfo, setFreqMapsWithInfo] = useState<any>([]);
  const [routeFreqMaps, setRouteFreqMaps] = useState<any>([]);

  const [barData, setBarData] = useState<any>([]);

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
      console.log('transcript:', transcript);
      if (transcript.length > 0) {
        let temp = getFreq(transcript[0], datetime);
        let freqWithInfo = {
          videoID: videosSelected[i]._id,
          datetime: videosSelected[i].datetimeRecorded,
          map: temp,
        };
        addFreqMapWithInfo(freqWithInfo);
        //addFreqMap(temp);
      } else {
        console.log('empty transcript');
      }
    }
  }

  useEffect(() => {
    if (videosSelected.length > 0) {
      getFreqMaps();
      combineFreqMaps();
    }
  }, [currentVideos]);

  function removePunctuationAndLowercase(text: string) {
    return text.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();
  }
  
  function getFreq(transcript: string, datetime: any) {
    let M = new Map();
  
    // Remove punctuation and convert to lowercase
    transcript = removePunctuationAndLowercase(transcript);
  
    let word = '';
  
    for (let i = 0; i < transcript.length; i++) {
      if (transcript[i] === ' ') {
        if (!M.has(word)) {
          M.set(word, 1);
          word = '';
        } else {
          M.set(word, M.get(word) + 1);
          word = '';
        }
      } else {
        word += transcript[i];
      }
    }
         
    if (!M.has(word)) {
      M.set(word, 1);
    } else {
      M.set(word, M.get(word) + 1);
    }
  
    M = new Map([...M.entries()].sort());
  
    let jsonTest = [];
    let dayJson = [];
    for (let [key, value] of M) {
      //console.log(`${key} - ${value}`);
      jsonTest.push({label: `${key}`, value: `${value}`, date: datetime});
      dayJson.push({label: datetime.getHours(), value: `${value}`});
    }
    const obj = Object.fromEntries(M);
    //console.log(obj);
    //console.log("json", datetime, "--", jsonTest);
    //console.log(dayJson);

    return M;
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

    let mapNoStop = new Map([...result.entries()]);
    let mapNoMed = new Map([...result.entries()]);
    let mapNone = new Map([...result.entries()]);

    // remove "" (empty string) and "%HESITATION" from all maps
    result.delete('');
    mapNoStop.delete('');
    mapNoMed.delete('');
    mapNone.delete('');
    result.delete('HESITATION');
    mapNoStop.delete('HESITATION');
    mapNoMed.delete('HESITATION');
    mapNone.delete('HESITATION');

    // remove stop words and med words
    for (let i = 0; i < stopWords.length; i++) {
      mapNoStop.delete(stopWords[i]);
      mapNone.delete(stopWords[i]);
    }
    for (let i = 0; i < medWords.length; i++) {
      mapNoMed.delete(medWords[i]);
      mapNone.delete(medWords[i]);
    }

    // TODO: function to get map that ONLY includes medWords is probably necessary too

    let bar = [];
    let barNoStop = [];
    let barNoMed = [];
    let barNone = [];
    let counter = 0;

    // barData formatting
    for (let [key, value] of result) {
      //console.log(`${key} - ${value}`);
      bar.push({text: `${key}`, value: parseInt(`${value}`)});
      if (data.length <= bar.length) {
        // data.push({label: `${key}`, value: `${counter}`});
        setData(data => [...data, {label: `${key}`, value: `${counter}`}]);
      }
    }
    for (let [key, value] of mapNoStop) {
      //console.log(`${key} - ${value}`);
      barNoStop.push({text: `${key}`, value: parseInt(`${value}`)});
    }
    for (let [key, value] of mapNoMed) {
      //console.log(`${key} - ${value}`);
      barNoMed.push({text: `${key}`, value: parseInt(`${value}`)});
    }
    for (let [key, value] of mapNone) {
      //console.log(`${key} - ${value}`);
      barNone.push({text: `${key}`, value: parseInt(`${value}`)});
    }
    console.log(result);
    console.log(barNone);
    // set bar data that will be sent to barGraph page through navigation
    setBarData({
      data: bar,
      dataNoStop: barNoStop,
      dataNoMed: barNoMed,
      dataNone: barNone,
    });
    setRouteFreqMaps(freqMapsWithInfo);
    setFreqMapsWithInfo([]);
  }

  /* ------------------------------ LINE GRAPH FREQUENCY ------------------------------ */

  //const [map, setMap] = useState<any>([]);
  //const [trackedDates, setTrackedDates] = useState(null);

  /*   function setLineGraphDataDay(freqMaps, word) {
    let temp = accessFreqMaps();
    
    //let trackedDates = [];
    //trackedDates.push(temp[0].datetime);

    let trackedDates = new Map();
    let trackedHours = new Map();

    let result = temp[0];
    let saveDate = temp[0].datetime.toString().split(' ');
    // ex. result of above: Array ["Mon", "Apr", "29", "2024", "13:05:26", "GMT-0400", "(Eastern", "Daylight", "Time)"]
    let date = saveDate[0] + " " + saveDate[1] + " " + saveDate[2] + " " + saveDate[3];
    // result of above: "Mon Apr 29 2024"
    let hour = temp[0].datetime.getHours();
    // result of above: 13
    trackedDates.set(date, 1);
    trackedHours.set(hour, 1);

    for (let i = 1; i < temp.length; i++) {
      //result = combineMaps(result, temp[i]);

      saveDate = temp[i].datetime.toString().split(' ');
      date = saveDate[0] + saveDate[1] + saveDate[2] + saveDate[3];;
      
      if (!trackedDates.has(date)) {
        trackedDates.set(date, 1);
        //result = combineMaps(result, temp[i]);
      } else {
        trackedDates.set(date, trackedDates.get(date) + 1);
        //result = combineMaps(result, temp[i]);
      }


    }
  } */

  /* ------------------------------ DROP DOWN MENU ------------------------------ */

  /* ======================================================================= */
  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <View
        style={{
          height: '30%',
          width: '100%',
        }}>
        <VideoSetDropdown
          videoSetDropdown={videoSetDropdown}
          videoSets={realm.objects('VideoSet')}
          saveVideoSetBtn={false}
          clearVideoSetBtn={false}
          deleteAllVideoSetsBtn={false}
          manageSetBtn={false}
          onVideoSetChange={handleVideoSelectionChange}
        />
      </View>

      <View
        style={{
          height: '50%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Button
          disabled={currentVideoSet?.length === 0}
          onPress={() =>
            navigation.navigate('Bar Graph', {
              data: barData,
              freqMaps: routeFreqMaps,
            })
          }
          titleStyle={{fontSize: 40}}
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
          disabled={currentVideoSet?.length === 0}
          onPress={() => {
            setModalVisible(true);
            console.log('-------------------------data', data);
          }}
          titleStyle={{fontSize: 40}}
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
          disabled={currentVideoSet?.length === 0}
          onPress={() => navigation.navigate('Word Cloud', {data: barData})}
          titleStyle={{fontSize: 40}}
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
          disabled={currentVideoSet?.length === 0}
          onPress={() => navigation.navigate('Text Summary')}
          titleStyle={{fontSize: 40}}
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
          Text Report
        </Button>
        {/* <Button
          disabled={true}
          onPress={() => navigation.navigate('Text Graph')}
          titleStyle={{fontSize: 40}}
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
        </Button> */}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Select a word to view in line graph:
          </Text>
          <Dropdown
            //display the text from barData
            data={data}
            maxHeight={400}
            style={{
              height: 50,
              width: 600,
              paddingHorizontal: 20,
              backgroundColor: '#DBDBDB',
              borderRadius: 22,
            }}
            // placeholderStyle={styles.placeholderStyle}
            // selectedTextStyle={styles.selectedTextStyle}
            // activeColor={Styles.MHMRBlue}
            itemTextStyle={{textAlign: 'center'}}
            labelField="label"
            valueField="value"
            onChange={item => {
              setViewValue(item.value);
              setSelectedWord(item.label);
              console.log('routeFreqMaps:', routeFreqMaps);
              console.log('viewValue:', viewValue);
              setLineGraphNavigationVisible(true);
              console.log('item:', item.label);
            }}
          />
          <View style={{flexDirection: 'row'}}>
            <Button
              containerStyle={{marginTop: 20}}
              title="Close"
              color={Styles.MHMRBlue}
              radius={50}
              onPress={() => setModalVisible(false)}
            />
            {lineGraphNavigationVisible && (
              <Button
                containerStyle={{marginTop: 20, marginLeft: 10}}
                title="View line graph"
                color={Styles.MHMRBlue}
                radius={50}
                onPress={() => {
                  const wordLabel = selectedWord;
                  const result = setLineGraphData(routeFreqMaps, wordLabel);
                  console.log('routeFreqMaps:', routeFreqMaps);
                  console.log('result:', result);
                  setModalVisible(false);
                  navigation.navigate('Line Graph', {
                    word: wordLabel,
                    data: result,
                  });
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },

  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default DataAnalysis;
