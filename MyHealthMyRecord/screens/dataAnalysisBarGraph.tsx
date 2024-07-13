import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {VideoData, useRealm, useObject} from '../models/VideoData';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Dimensions,
  Switch,
  TouchableOpacity,
  LogBox,
  Modal,
  StyleSheet,
} from 'react-native';
import {Button, Icon} from '@rneui/themed';
import {LineChart, BarChart, Grid, YAxis, XAxis} from 'react-native-svg-charts';
import Svg, * as svg from 'react-native-svg';
import * as scale from 'd3-scale';
import {Rect} from 'react-native-svg';
import {Dropdown} from 'react-native-element-dropdown';
import * as Styles from '../assets/util/styles';
import {useSetLineGraphData} from '../components/lineGraphData';
import { useDropdownContext } from '../components/videoSetProvider';

const setLineGraphData = useSetLineGraphData();

const DataAnalysisBarGraph = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute();
  const barData = route.params?.data;
  const sentimentData = route.params?.sentimentData;


  const transformedFreqMaps = route.params?.freqMaps.map(freqMap => ({
    ...freqMap,
    videoID: freqMap.videoID.toHexString(),
  }));

  const [freqMaps, setFreqMaps] = useState(transformedFreqMaps);
  const [wordFreqBarGraphData, setWordFreqBarGraphData] = useState(
    barData.dataNoStop,
  );
  //const wordFreqBarGraphData = data.data;

  const realm = useRealm();
  //   const video: any = useObject('VideoData', id);

  const { currentVideoSet } = useDropdownContext();

  /* ======================================================================= */
  // bar graph stuff below
  /* ======================================================================= */

  const [barGraphVertical, setBarGraphVertical] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // array of length of max value in data (first index value) for yAxis
  const yTest = Array.from(
    {length: wordFreqBarGraphData[0]?.value},
    (_, i) => i + 1,
  );
  //const yTest = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  //const yTest = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  /* on press functionality for word frequency bar graph */
  const [wordSelected, setWordSelected] = useState<number | null>(null);
  const wordFreq = wordFreqBarGraphData.map((item, index) => ({
    y: item,
    svg: {
      onPressIn: () => {
        console.log(wordFreqBarGraphData[index]);
        setWordSelected(index);
        const wordLabel = wordFreqBarGraphData[index].text;
        const result = setLineGraphData(freqMaps, wordLabel);
        navigation.navigate('Line Graph', {
          word: wordLabel,
          data: result,
        });
      },
      onPressOut: () => {
        setWordSelected(null);
      },
      //fill: wordSelected === index ? '#55C45E' : 'rgba(134, 65, 244, 0.8)',
    },
  }));

  /**
   * Labels on each bar with the frequency value for the vertical view
   */
  const CUT_OFF_VER = wordFreqBarGraphData[0]?.value - 1;
  const LabelsVertical = ({x, y, bandwidth, data}) =>
    wordFreqBarGraphData.map((value, index) => (
      <svg.Text
        key={index}
        x={x(index) + bandwidth / 2 - 10}
        y={
          value.value > CUT_OFF_VER ? y(value.value) + 20 : y(value.value) - 15
        }
        fontSize={20}
        fill={value.value > CUT_OFF_VER ? 'white' : 'black'}
        alignmentBaseline={'middle'}>
        {value.value}
      </svg.Text>
    ));

  /**
   * Labels on each bar with the frequency value for the vertical view
   */
  const CUT_OFF_HOR = wordFreqBarGraphData[0].value - 1;
  const LabelsHorizontal = ({ x, y, bandwidth, data }) => (
    wordFreqBarGraphData.map((value, index) => (
      <svg.Text
        key={index}
        x={value.value > CUT_OFF_HOR ? x(value.value) - 30 : x(value.value) + 10}
        y={y(index) + (bandwidth / 2)}
        fontSize={14}
        fill={value.value > CUT_OFF_HOR ? 'white' : 'black'}
        alignmentBaseline={'middle'}
      >
        {value.value}
      </svg.Text>
    ))
  );

  const isEnabledStopWords = false;
  const [isEnabledMedWords, setIsEnabledMedWords] = useState(true);
  const toggleSwitchMedWords = () =>
    setIsEnabledMedWords(previousState => !previousState);
  function updateData() {
    if (!isEnabledMedWords && !isEnabledStopWords) {
      setWordFreqBarGraphData(barData.dataNone);
    } else if (!isEnabledStopWords) {
      setWordFreqBarGraphData(barData.dataNoStop);
    } else if (!isEnabledMedWords) {
      setWordFreqBarGraphData(barData.dataNoMed);
    } else {
      setWordFreqBarGraphData(barData.data);
    }
  }
  useEffect(() => {
    updateData();
  }, [isEnabledMedWords]);

   useEffect(() => {
     LogBox.ignoreLogs([
       'Non-serializable values were found in the navigation state.',
     ]);
   });
  
  const scrollLeft = () => {
    scrollViewRef.current?.scrollTo({x: 0, animated: true});
  };

  const scrollRight = () => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  };

  const scrollUp = () => {
    scrollViewRef.current?.scrollTo({y: 0, animated: true});
  };

  const scrollDown = () => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [videoIDs, setVideoIDs] = useState([]);


  const handleSentimentPress = async (sentiment) => {
    try {
      const videoIDsSet = new Set(currentVideoSet.videoIDs);
      const videos = await realm.objects('VideoData').filtered(`sentiment == "${sentiment}"`);
      const filteredVideos = videos.filter(video => videoIDsSet.has(video._id.toString()));
      setVideoIDs(filteredVideos);
      setModalVisible(true);
    } catch (error) {
      console.error('Error in handleSentimentPress:', error);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={{height: '100%'}}>
          <View id="bargraph" style={{flex: 1}}>
            {barGraphVertical == true ? (
              <View id="bargraph-vertical" style={{flex: 1}}>
                <Text
                  style={{
                    padding: 20,
                    fontSize: 20,
                    color: 'black',
                    fontWeight: 'bold',
                  }}>
                  {currentVideoSet?.name} - Count of words mentioned in selected
                  video set
                </Text>
                <View style={{flexDirection: 'row', flex: 1}}>
                  <View style={{width: 50, justifyContent: 'center'}}>
                    <Text
                      style={{
                        transform: [{rotate: '270deg'}],
                        textAlign: 'center',
                        fontSize: 18,
                        color: 'black',
                        width: 60,
                      }}>
                      Count
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', flex: 1}}>
                    <YAxis
                      data={yTest}
                      yAccessor={({index}) => index}
                      contentInset={{top: 10, bottom: 10}}
                      spacing={0.2}
                      formatLabel={value => value}
                      min={0}
                      max={wordFreqBarGraphData[0]?.value}
                      numberOfTicks={wordFreqBarGraphData[0]?.value}
                      style={{height: 600}}
                      svg={{fontSize: 20}}
                    />
                    <TouchableOpacity
                      onPress={scrollLeft}
                      style={{justifyContent: 'center'}}>
                      <Icon name="keyboard-arrow-left" size={60} color="black" />
                    </TouchableOpacity>
                    <ScrollView horizontal={true} ref={scrollViewRef}>
                      <View>
                        <BarChart
                          style={{
                            height: 600,
                            width: wordFreqBarGraphData.length * 50,
                          }}
                          data={wordFreq}
                          yAccessor={({item}) => item.y.value}
                          svg={{fill: 'rgba(' + Styles.MHMRBlueRGB + ', 0.7)'}}
                          contentInset={{top: 10, bottom: 10}}
                          spacing={0.2}
                          gridMin={0}
                          numberOfTicks={wordFreqBarGraphData[0]?.value}>
                          <Grid direction={Grid.Direction.HORIZONTAL} />
                          <LabelsVertical />
                        </BarChart>
                        <XAxis
                          style={{
                            height: 100,
                            marginTop: 0,
                            marginBottom: 20,
                            width: wordFreqBarGraphData.length * 50,
                          }}
                          data={wordFreqBarGraphData}
                          scale={scale.scaleBand}
                          svg={{
                            fontSize: 18,
                            rotation: -45,
                            fill: 'black',
                            originY: 20,
                            translateY: 25,
                            translateX: 0,
                            y: 5,
                          }}
                          formatLabel={(value, index) =>
                            wordFreqBarGraphData[index].text
                          }
                        />
                      </View>
                    </ScrollView>
                    <TouchableOpacity
                      onPress={scrollRight}
                      style={{justifyContent: 'center'}}>
                      <Icon name="keyboard-arrow-right" size={60} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text
                  style={{textAlign: 'center', fontSize: 20, color: 'black'}}>
                  Word
                </Text>
              </View>
            ) : (
              <View id="bargraph-horizontal" style={{flex: 1}}>
                <Text
                  style={{
                    padding: 20,
                    fontSize: 20,
                    color: 'black',
                    fontWeight: 'bold',
                  }}>
                  {currentVideoSet?.name} - Count of words mentioned in selected video set
                </Text>
                <View style={{flexDirection: 'column', height: 800, paddingVertical: 16}}>
                  <Text style={{ textAlign: 'center', fontSize: 20, color: 'black', marginBottom: 10 }}>
                    Count
                  </Text>
                  <TouchableOpacity
                    onPress={scrollUp}
                    style={{alignItems: 'center'}}>
                    <Icon name="keyboard-arrow-up" size={60} color="black" />
                  </TouchableOpacity>
                  <ScrollView ref={scrollViewRef}>
                    <View style={{flexDirection: 'row', flex: 1}}>
                      <View style={{justifyContent: 'center', marginRight: 10}}>
                        <Text
                          style={{
                            textAlign: 'center',
                            fontSize: 18,
                            color: 'black',
                            width: 60,
                          }}>
                          Word
                        </Text>
                      </View>
                      <YAxis
                        data={wordFreqBarGraphData}
                        yAccessor={({index}) => index}
                        scale={scale.scaleBand}
                        contentInset={{top: 10, bottom: 10}}
                        spacing={0.2}
                        formatLabel={(value, index) => wordFreqBarGraphData[index].text}
                        svg={{fontSize: 20, margin: 10}}
                        min={0}
                        max={wordFreqBarGraphData[0]?.value}
                      />
                      <View style={{height: wordFreqBarGraphData.length * 50}}>
                        <BarChart
                          style={{height: wordFreqBarGraphData.length * 50, width: 600}}
                          data={wordFreq}
                          horizontal={true}
                          yAccessor={({item}) => item.y.value}
                          svg={{fill: 'rgba(' + Styles.MHMRBlueRGB + ', 0.7)'}}
                          contentInset={{top: 10, bottom: 10}}
                          spacing={0.2}
                          gridMin={0}
                          numberOfTicks={wordFreqBarGraphData[0]?.value}>
                          <Grid direction={Grid.Direction.VERTICAL} />
                          <LabelsHorizontal />
                        </BarChart>
                      </View>
                    </View>
                  </ScrollView>
                  <TouchableOpacity
                    onPress={scrollDown}
                    style={{alignItems: 'center'}}>
                    <Icon name="keyboard-arrow-down" size={60} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={{height: '15%', width: '100%'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 10,
                }}>
                <Button
                  title="Horizontal"
                  onPress={() => setBarGraphVertical(false)}
                  color={Styles.MHMRBlue}
                  radius={50}
                  containerStyle={{
                    width: 200,
                    marginHorizontal: 30,
                  }}
                />
                <Button
                  title="Vertical"
                  onPress={() => setBarGraphVertical(true)}
                  color={Styles.MHMRBlue}
                  radius={50}
                  containerStyle={{
                    width: 200,
                    marginHorizontal: 30,
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 10,
                }}>
                <Text style={{fontSize: 20}}>Include medical words</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={isEnabledMedWords ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitchMedWords}
                  value={isEnabledMedWords}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              borderBottomColor: 'black',
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />
          <View id="sentiment-bargraph" style={{flex: 1}}>
            <Text
              style={{
                padding: 20,
                fontSize: 20,
                color: 'black',
                fontWeight: 'bold',
              }}>
              {currentVideoSet?.name} - Overall feelings distribution
            </Text>
            <View style={{flexDirection: 'row', flex: 1}}>
              <View style={{width: 50, justifyContent: 'center'}}>
                <Text
                  style={{
                    transform: [{rotate: '270deg'}],
                    textAlign: 'center',
                    fontSize: 18,
                    color: 'black',
                    width: 60,
                  }}>
                  Count
                </Text>
              </View>
              <YAxis
                data={sentimentData}
                yAccessor={({index}) => sentimentData[index].value}
                contentInset={{top: 10, bottom: 10}}
                spacing={0.2}
                formatLabel={value => value}
                min={0}
                max={Math.max(...sentimentData.map(d => d.value))}
                numberOfTicks={Math.max(...sentimentData.map(d => d.value))}
                style={{height: 400}}
                svg={{fontSize: 20}}
              />
              <BarChart
                style={{
                  height: 400,
                  width: Dimensions.get('window').width - 90,
                }}
                data={sentimentData.map((item, index) => ({
                  ...item,
                  svg: {
                    fill:
                      index === 4
                        ? '#00CC00'
                        : index === 3
                        ? '#99CC00'
                        : index === 2
                        ? '#FFCC00'
                        : index === 1
                        ? '#9966CC'
                        : '#6633CC',
                    onPressIn: () => handleSentimentPress(item.label),
                  },
                }))}
                yAccessor={({item}) => item.value}
                contentInset={{top: 10, bottom: 10}}
                spacing={0.2}
                gridMin={0}
                numberOfTicks={Math.max(...sentimentData.map(d => d.value))}>
                <Grid direction={Grid.Direction.HORIZONTAL} />
              </BarChart>
            </View>
            <XAxis
              style={{marginHorizontal: -10}}
              data={sentimentData.map((_, index) => index)}
              scale={scale.scaleBand}
              formatLabel={(value, index) => sentimentData[index].label}
              svg={{
                fontSize: 18,
                fill: 'black',
                translateX: 20,
              }}
              contentInset={{left: 50, right: 50}}
            />
            <Text style={{textAlign: 'center', fontSize: 20, color: 'black', marginBottom: 15}}>
              Feeling
            </Text>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            View video(s) with this sentiment
          </Text>
          {videoIDs.map((video, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                navigation.navigate('Fullscreen Video', {
                  id: video?._id,
                });
                setModalVisible(false);
              }}>
              <Text style={styles.videoIDText}>{video?.title}</Text>
            </TouchableOpacity>
          ))}
          <Button
            title="Close"
            color={Styles.MHMRBlue}
            radius={50}
            onPress={() => setModalVisible(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
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
  videoIDText: {
    marginVertical: 10,
    fontSize: 16,
    color: 'blue',
  },
});

export default DataAnalysisBarGraph;