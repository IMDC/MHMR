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

const DataAnalysisBarGraph = () => {
  Date.prototype.getWeek = function () {
    var onejan = new Date(this.getFullYear(), 0, 1);
    var today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    var dayOfYear = (today - onejan + 86400000) / 86400000;
    return Math.ceil(dayOfYear / 7);
  };

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
        let result = setLineGraphData(wordLabel);
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

  /**
   * Labels on each bar with the frequency value for the horizontal view
   */
  // const CUT_OFF_HOR = wordFreqBarGraphData[0]?.value - 1;
  // const LabelsHorizontal = ({x, y, bandwidth, data}) =>
  //   wordFreqBarGraphData.map((value, index) => (
  //     <svg.Text
  //       key={index}
  //       x={
  //         value.value > CUT_OFF_HOR ? x(value.value) - 30 : x(value.value) + 10
  //       }
  //       y={y(index) + bandwidth / 2}
  //       fontSize={14}
  //       fill={value.value > CUT_OFF_HOR ? 'white' : 'black'}
  //       alignmentBaseline={'middle'}>
  //       {value.value}
  //     </svg.Text>
  //   ));

  /**
   * toggle filters
   */
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

  /* ======================================================================= */
  // line graph stuff below
  /* ======================================================================= */

  // maybe not necessary, just gets a list of only the maps
  // currently used in setLineGraphDataDay() but instances can probably be replaced with freqMaps[i].map
  function accessFreqMaps() {
    let temp = freqMaps;
    let result = [];
    for (let i = 0; i < temp.length; i++) {
      result.push(temp[i].map);
    }
    return result;
  }

  // base template for how to format each day
  let freqDayTemplate = [
    {
      label: 0,
      value: 0,
      videoIDs: [],
    },
    {
      label: 1,
      value: 0,
      videoIDs: [],
    },
    {
      label: 2,
      value: 0,
      videoIDs: [],
    },
    {
      label: 3,
      value: 0,
      videoIDs: [],
    },
    {
      label: 4,
      value: 0,
      videoIDs: [],
    },
    {
      label: 5,
      value: 0,
      videoIDs: [],
    },
    {
      label: 6,
      value: 0,
      videoIDs: [],
    },
    {
      label: 7,
      value: 0,
      videoIDs: [],
    },
    {
      label: 8,
      value: 0,
      videoIDs: [],
    },
    {
      label: 9,
      value: 0,
      videoIDs: [],
    },
    {
      label: 10,
      value: 0,
      videoIDs: [],
    },
    {
      label: 11,
      value: 0,
      videoIDs: [],
    },
    {
      label: 12,
      value: 0,
      videoIDs: [],
    },
    {
      label: 13,
      value: 0,
      videoIDs: [],
    },
    {
      label: 14,
      value: 0,
      videoIDs: [],
    },
    {
      label: 15,
      value: 0,
      videoIDs: [],
    },
    {
      label: 16,
      value: 0,
      videoIDs: [],
    },
    {
      label: 17,
      value: 0,
      videoIDs: [],
    },
    {
      label: 18,
      value: 0,
      videoIDs: [],
    },
    {
      label: 19,
      value: 0,
      videoIDs: [],
    },
    {
      label: 20,
      value: 0,
      videoIDs: [],
    },
    {
      label: 21,
      value: 0,
      videoIDs: [],
    },
    {
      label: 22,
      value: 0,
      videoIDs: [],
    },
    {
      label: 23,
      value: 0,
      videoIDs: [],
    },
  ];

  let freqWeekTemplate = [
    {
      label: 0,
      value: 0,
      videoIDs: [],
    },
    {
      label: 1,
      value: 0,
      videoIDs: [],
    },
    {
      label: 2,
      value: 0,
      videoIDs: [],
    },
    {
      label: 3,
      value: 0,
      videoIDs: [],
    },
    {
      label: 4,
      value: 0,
      videoIDs: [],
    },
    {
      label: 5,
      value: 0,
      videoIDs: [],
    },
    {
      label: 6,
      value: 0,
      videoIDs: [],
    },
  ];

  let freqMonthTemplate = [
    {
      label: 0,
      value: 0,
      videoIDs: [],
    },
    {
      label: 1,
      value: 0,
      videoIDs: [],
    },
    {
      label: 2,
      value: 0,
      videoIDs: [],
    },
    {
      label: 3,
      value: 0,
      videoIDs: [],
    },
    {
      label: 4,
      value: 0,
      videoIDs: [],
    },
    {
      label: 5,
      value: 0,
      videoIDs: [],
    },
    {
      label: 6,
      value: 0,
      videoIDs: [],
    },
    {
      label: 7,
      value: 0,
      videoIDs: [],
    },
    {
      label: 8,
      value: 0,
      videoIDs: [],
    },
    {
      label: 9,
      value: 0,
      videoIDs: [],
    },
    {
      label: 10,
      value: 0,
      videoIDs: [],
    },
    {
      label: 11,
      value: 0,
      videoIDs: [],
    },
  ];

  /**
   * Get the line graph data for the daily view
   * @param word the word that the line graph is for
   * @returns
   */
  function setLineGraphData(word: any) {
    let maps = accessFreqMaps();

    let trackedDatesForHours = new Map();
    let trackedHours = new Map();
    let trackedDatesForWeeks = new Map();
    let trackedWeeks = new Map();
    let trackedDatesForMonths = new Map();
    let trackedMonths = new Map();

    let saveDate = '';
    let date = '';
    let weekDate = '';
    let monthDate = '';
    let yearDate = '';
    let hour = 0;
    let week = 0;
    let month = 0;
    let year = 0;

    let resultsDatesForHours = [];
    let resultByHour = [];
    let resultsDatesForWeeks = [];
    let resultByWeek = [];
    let resultsDatesForMonths = [];
    let resultByMonth = [];
    let resultsDatesForYears = [];
    let resultByYear = [];

    for (let i = 0; i < freqMaps.length; i++) {
      saveDate = freqMaps[i].datetime.toString().split(' ');
      // ex. result of above: Array ["Mon", "Apr", "29", "2024", "13:05:26", "GMT-0400", "(Eastern", "Daylight", "Time)"]
      date =
        saveDate[0] + ' ' + saveDate[1] + ' ' + saveDate[2] + ' ' + saveDate[3];
      // result of above: "Mon Apr 29 2024"
      monthDate = saveDate[1] + ' ' + saveDate[3];
      // result of above: "Apr 2024"

      yearDate = saveDate[3];
      // result of above: "2024"

      hour = freqMaps[i].datetime.getHours();
      // result of above: 13
      week = freqMaps[i].datetime.getWeek();
      // result of above: 18
      month = freqMaps[i].datetime.getMonth();
      // result of above: 3
      year = freqMaps[i].datetime.getFullYear();
      // result of above: 2024

      // if word is in the map, then...
      if (freqMaps[i].map.has(word)) {
        // if new day, then...
        if (!trackedDatesForHours.has(date)) {
          trackedDatesForHours.set(date, 1);
          // refresh tracked hours for a new day
          [...trackedHours.keys()].forEach(key => {
            trackedHours.set(key, 0);
            console.log('reset key ', key);
          });
          // need to reset template data
          freqDayTemplate = [
            {
              label: 0,
              value: 0,
              videoIDs: [],
            },
            {
              label: 1,
              value: 0,
              videoIDs: [],
            },
            {
              label: 2,
              value: 0,
              videoIDs: [],
            },
            {
              label: 3,
              value: 0,
              videoIDs: [],
            },
            {
              label: 4,
              value: 0,
              videoIDs: [],
            },
            {
              label: 5,
              value: 0,
              videoIDs: [],
            },
            {
              label: 6,
              value: 0,
              videoIDs: [],
            },
            {
              label: 7,
              value: 0,
              videoIDs: [],
            },
            {
              label: 8,
              value: 0,
              videoIDs: [],
            },
            {
              label: 9,
              value: 0,
              videoIDs: [],
            },
            {
              label: 10,
              value: 0,
              videoIDs: [],
            },
            {
              label: 11,
              value: 0,
              videoIDs: [],
            },
            {
              label: 12,
              value: 0,
              videoIDs: [],
            },
            {
              label: 13,
              value: 0,
              videoIDs: [],
            },
            {
              label: 14,
              value: 0,
              videoIDs: [],
            },
            {
              label: 15,
              value: 0,
              videoIDs: [],
            },
            {
              label: 16,
              value: 0,
              videoIDs: [],
            },
            {
              label: 17,
              value: 0,
              videoIDs: [],
            },
            {
              label: 18,
              value: 0,
              videoIDs: [],
            },
            {
              label: 19,
              value: 0,
              videoIDs: [],
            },
            {
              label: 20,
              value: 0,
              videoIDs: [],
            },
            {
              label: 21,
              value: 0,
              videoIDs: [],
            },
            {
              label: 22,
              value: 0,
              videoIDs: [],
            },
            {
              label: 23,
              value: 0,
              videoIDs: [],
            },
          ];

          trackedHours.set(hour, 1);
          // add a day to resultsByHour array
          resultByHour.push(freqDayTemplate);
          // add a date for the drop down
          resultsDatesForHours.push({
            label: date,
            value: trackedDatesForHours.size - 1,
          });
          console.log(
            'ooooooooo new tracked date',
            date,
            trackedDatesForHours,
            hour,
            trackedHours,
          );
        } else {
          trackedDatesForHours.set(date, trackedDatesForHours.get(date) + 1);
          if (!trackedHours.has(hour)) {
            trackedHours.set(hour, 1);
            console.log('ooooooooo new tracked hour', hour, trackedHours);
          } else {
            trackedHours.set(hour, trackedHours.get(hour) + 1);
            console.log('ooooooooo already tracked hour', hour, trackedHours);
          }
        }

        if (!trackedDatesForWeeks.has(date)) {
          trackedDatesForWeeks.set(date, 1);
          // refresh tracked hours for a new day
          [...trackedWeeks.keys()].forEach(key => {
            trackedWeeks.set(key, 0);
            console.log('reset key ', key);
          });
          // need to reset template data
          freqWeekTemplate = [
            {
              label: 0,
              value: 0,
              videoIDs: [],
            },
            {
              label: 1,
              value: 0,
              videoIDs: [],
            },
            {
              label: 2,
              value: 0,
              videoIDs: [],
            },
            {
              label: 3,
              value: 0,
              videoIDs: [],
            },
            {
              label: 4,
              value: 0,
              videoIDs: [],
            },
            {
              label: 5,
              value: 0,
              videoIDs: [],
            },
            {
              label: 6,
              value: 0,
              videoIDs: [],
            },
          ];

          trackedWeeks.set(hour, 1);
          // add a day to resultsByHour array
          resultByWeek.push(freqWeekTemplate);
          // add a date for the drop down
          resultsDatesForWeeks.push({
            label: week,
            value: trackedDatesForWeeks.size - 1,
          });
          console.log(
            'ooooooooo new tracked week',
            week,
            trackedDatesForWeeks,
            hour,
            trackedWeeks,
          );
        } else {
          trackedDatesForWeeks.set(week, trackedDatesForWeeks.get(week) + 1);
          if (!trackedWeeks.has(week)) {
            trackedWeeks.set(week, 1);
            console.log('ooooooooo new tracked week', week, trackedWeeks);
          } else {
            trackedWeeks.set(week, trackedWeeks.get(week) + 1);
            console.log('ooooooooo already tracked week', week, trackedWeeks);
          }
        }

        if (!trackedDatesForMonths.has(yearDate)) {
          trackedDatesForMonths.set(yearDate, 1);
          // refresh tracked hours for a new day
          [...trackedMonths.keys()].forEach(key => {
            trackedMonths.set(key, 0);
            console.log('reset key ', key);
          });
          // need to reset template data
          freqMonthTemplate = [
            {
              label: 0,
              value: 0,
              videoIDs: [],
            },
            {
              label: 1,
              value: 0,
              videoIDs: [],
            },
            {
              label: 2,
              value: 0,
              videoIDs: [],
            },
            {
              label: 3,
              value: 0,
              videoIDs: [],
            },
            {
              label: 4,
              value: 0,
              videoIDs: [],
            },
            {
              label: 5,
              value: 0,
              videoIDs: [],
            },
            {
              label: 6,
              value: 0,
              videoIDs: [],
            },
            {
              label: 7,
              value: 0,
              videoIDs: [],
            },
            {
              label: 8,
              value: 0,
              videoIDs: [],
            },
            {
              label: 9,
              value: 0,
              videoIDs: [],
            },
            {
              label: 10,
              value: 0,
              videoIDs: [],
            },
            {
              label: 11,
              value: 0,
              videoIDs: [],
            },
          ];

          trackedMonths.set(month, 1);
          // add a day to resultsByHour array
          resultByMonth.push(freqMonthTemplate);
          // add a date for the drop down
          resultsDatesForMonths.push({
            label: yearDate,
            value: trackedDatesForMonths.size - 1,
          });
          console.log(
            'ooooooooo new tracked month',
            yearDate,
            trackedDatesForMonths,
            month,
            trackedMonths,
          );
        } else {
          trackedDatesForMonths.set(
            yearDate,
            trackedDatesForMonths.get(month) + 1,
          );
          if (!trackedMonths.has(month)) {
            trackedMonths.set(month, 1);
            console.log('ooooooooo new tracked month', month, trackedMonths);
          } else {
            trackedMonths.set(month, trackedMonths.get(month) + 1);
            console.log(
              'ooooooooo already tracked month',
              month,
              trackedMonths,
            );
          }
        }

        // access most recent day (because maps should be orderd by date already)
        // increment the count for the current video's hour
        // resultByMonth[trackedDatesForMonths.size - 1][month].videoIDs.push(
        //   freqMaps[i].videoID,
        // );
        // resultByWeek[trackedDatesForWeeks.size - 1][week].videoIDs.push(
        //   freqMaps[i].videoID,
        // );
        resultByMonth[trackedDatesForMonths.size - 1][month].value +=
          maps[i].get(word);
        resultByMonth[trackedDatesForMonths.size - 1][month].videoIDs.push(
          freqMaps[i].videoID,
        );
        // resultByWeek[trackedDatesForWeeks.size - 1][week].value += maps[i].get(
        //   word,
        // );
        // resultByWeek[trackedDatesForWeeks.size - 1][week].videoIDs.push(
        //   freqMaps[i].videoID,
        // );
        resultByHour[trackedDatesForHours.size - 1][hour].value +=
          maps[i].get(word);
        resultByHour[trackedDatesForHours.size - 1][hour].videoIDs.push(
          freqMaps[i].videoID,
        );
        console.log(
          'ooooooooo adding word count by week ---- count: ',
          week,
          maps[i].get(word),
        );
      }
    }
    console.log(resultsDatesForHours);
    console.log(resultByHour);
    console.log(resultsDatesForWeeks);
    console.log(resultByWeek);
    console.log(resultsDatesForMonths);
    console.log(resultByMonth);

    //setFreqMaps([]);
    return {
      datesForHours: resultsDatesForHours,
      byHour: resultByHour,
      datesForWeeks: resultsDatesForWeeks,
      byWeek: resultByWeek,
      datesForMonths: resultsDatesForMonths,
      byMonth: resultByMonth,
      // datesForYears: resultsDatesForYears,
      // byYear: resultByYear,
    };
  }

  /* ======================================================================= */

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          <View id="bargraph" style={{ flex: 1 }}>
            {barGraphVertical == true ? (
              <View id="bargraph-vertical" style={{ flex: 1 }}>
                <Text>Count of words mentioned in selected video</Text>
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
                    style={{ height: 400 }}
                  />
                  <ScrollView horizontal={true}>
                    <View>
                      <BarChart
                        style={{ height: 400, width: wordFreqBarGraphData.length * 50 }}
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
            <View style={{ height: '20%', width: '100%' }}>
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