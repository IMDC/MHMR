import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {VideoData, useRealm, useObject} from '../models/VideoData';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Dimensions,
  Switch,
} from 'react-native';
import {Button} from '@rneui/themed';
import {LineChart, BarChart, Grid, YAxis, XAxis} from 'react-native-svg-charts';
import Svg, * as svg from 'react-native-svg';
import * as scale from 'd3-scale';
import {Rect} from 'react-native-svg';
import {Dropdown} from 'react-native-element-dropdown';
import * as Styles from '../assets/util/styles';
import { useSetLineGraphData } from '../components/lineGraphData';
const setLineGraphData = useSetLineGraphData();

const DataAnalysisBarGraph = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route: any = useRoute();
  const barData = route.params?.data;
  const [freqMaps, setFreqMaps] = useState(route.params?.freqMaps);

  const [wordFreqBarGraphData, setWordFreqBarGraphData] = useState(
    barData.data,
  );
  //const wordFreqBarGraphData = data.data;

  const realm = useRealm();
  //   const video: any = useObject('VideoData', id);

  /* ======================================================================= */
  // bar graph stuff below
  /* ======================================================================= */

  const [barGraphVertical, setBarGraphVertical] = useState(true);

  // array of length of max value in data (first index value) for yAxis
  const yTest = Array.from(
    {length: wordFreqBarGraphData[0]?.value},
    (_, i) => i + 1,
  );
  //const yTest = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  //const yTest = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  /* on press functionality for word frequency bar graph */
  const wordSelected = useState<any>(null);
  const wordFreq = wordFreqBarGraphData.map((item, index) => ({
    y: item,
    svg: {
      onPressIn: () => {
        console.log(wordFreqBarGraphData[index]);
        wordSelected[0] = index;
        const wordLabel = wordFreqBarGraphData[wordSelected[0]].text;
        const result = setLineGraphData(freqMaps, wordLabel);
        navigation.navigate('Line Graph', {
          word: wordLabel,
          data: result,
        });
      },
      onPressOut: () => {
        wordSelected[0] = null;
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

  const [isEnabledStopWords, setIsEnabledStopWords] = useState(true);
  const toggleSwitchStopWords = () =>
    setIsEnabledStopWords(previousState => !previousState);
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
  }, [isEnabledStopWords, isEnabledMedWords]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ height: '85%', padding: 20 }}>
          <View id="bargraph" style={{ flex: 1 }}>
            {barGraphVertical == true ? (
              <View id="bargraph-vertical" style={{ flex: 1 }}>
                <Text>Count of words mentioned in selected video</Text>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <View style={{ width: 50, justifyContent: 'center' }}>
                    <Text style={{ transform: [{ rotate: '270deg' }], textAlign: 'center' }}>Count</Text>
                  </View>
                  <View style={{ flexDirection: 'row', flex: 1 }}>
                    <YAxis
                      data={yTest}
                      yAccessor={({ index }) => index}
                      contentInset={{ top: 10, bottom: 10 }}
                      spacing={0.2}
                      formatLabel={value => value}
                      min={0}
                      max={wordFreqBarGraphData[0]?.value}
                      numberOfTicks={wordFreqBarGraphData[0]?.value}
                      style={{ flex: 1 }}
                    />
                    <ScrollView horizontal={true}>
                      <View>
                        <BarChart
                          style={{ flex: 1, width: wordFreqBarGraphData.length * 50 }}
                          data={wordFreq}
                          yAccessor={({ item }) => item.y.value}
                          svg={{ fill: 'rgba(' + Styles.MHMRBlueRGB + ', 0.7)' }}
                          contentInset={{ top: 10, bottom: 10 }}
                          spacing={0.2}
                          gridMin={0}
                          numberOfTicks={wordFreqBarGraphData[0]?.value}>
                          <Grid direction={Grid.Direction.HORIZONTAL} />
                          <LabelsVertical />
                        </BarChart>
                        <XAxis
                          style={{ height: 60, marginTop: 0, marginBottom: 20, width: wordFreqBarGraphData.length * 50 }}
                          data={wordFreqBarGraphData}
                          scale={scale.scaleBand}
                          svg={{
                            fontSize: 22,
                            rotation: 25,
                            fill: 'black',
                            originY: 35,
                            translateY: 15,
                            translateX: 0,
                            y: 5
                          }}
                          formatLabel={(value: any, index: string | number) =>
                            wordFreqBarGraphData[index].text
                          }
                        />
                      </View>
                    </ScrollView>
                  </View>
                </View>
                <Text style={{ textAlign: 'center' }}>Word</Text>
              </View>
            ) : (
              // <View id="bargraph-horizontal">
              //   <Text>Count of words mentioned in selected video</Text>
              //   <View
              //     style={{
              //       flexDirection: 'row',
              //       height: 800,
              //       paddingVertical: 16,
              //     }}>
              //     <YAxis
              //       data={wordFreqBarGraphData}
              //       yAccessor={({index}) => index}
              //       scale={scale.scaleBand}
              //       contentInset={{top: 10, bottom: 10}}
              //       spacing={0.2}
              //       formatLabel={(value, index) =>
              //         wordFreqBarGraphData[index].text
              //       }
              //       svg={{fontSize: 20, margin: 10}}
              //       min={0}
              //       max={wordFreqBarGraphData[0]?.value}
              //     />
              //     <ScrollView horizontal={true}>
              //       <View style={{flexDirection: 'row'}}>
              //         <BarChart
              //           style={{height: 400, width: wordFreqBarGraphData.length * 50}}
              //           data={wordFreq}
              //           horizontal={true}
              //           yAccessor={({item}) => item.y.value}
              //           svg={{fill: 'rgba(' + Styles.MHMRBlueRGB + ', 0.7)'}}
              //           contentInset={{top: 10, bottom: 10}}
              //           spacing={0.2}
              //           gridMin={0}>
              //           <Grid direction={Grid.Direction.VERTICAL} />
              //           <LabelsHorizontal />
              //         </BarChart>
              //       </View>
              //     </ScrollView>
              //   </View>
              //   <ScrollView horizontal={true}>
              //     <XAxis
              //       data={yTest}
              //       yAccessor={({index}) => index}
              //       scale={scale.scaleBand}
              //       contentInset={{top: 10, bottom: 10, left: 20, right: 20}}
              //       spacing={0.2}
              //       formatLabel={value => value}
              //       style={{marginLeft: 65, width: wordFreqBarGraphData.length * 50}}
              //     />
              //   </ScrollView>
              //   <Text style={{textAlign: 'center'}}>Count</Text>
              // </View>
              null
            )}
            <View style={{ height: '15%', width: '100%' }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {/* <Button
                  title="Horizontal"
                  onPress={() => setBarGraphVertical(false)}
                  color={Styles.MHMRBlue}
                  radius={50}
                  containerStyle={{
                    width: 200,
                    marginHorizontal: 30,
                  }}
                /> */}
                {/* <Button
                  title="Vertical"
                  onPress={() => setBarGraphVertical(true)}
                  color={Styles.MHMRBlue}
                  radius={50}
                  containerStyle={{
                    width: 200,
                    marginHorizontal: 30,
                  }}
                /> */}
              </View>
              <View style={{ height: '20%', width: '100%' }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text>Include Stop Words</Text>
                  <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isEnabledStopWords ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitchStopWords}
                    value={isEnabledStopWords}
                  />
                  <Text>Include Medical Words</Text>
                  <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isEnabledMedWords ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitchMedWords}
                    value={isEnabledMedWords}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DataAnalysisBarGraph;