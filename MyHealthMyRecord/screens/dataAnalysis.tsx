import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { VideoData, useRealm, useObject } from '../models/VideoData';
import { SafeAreaView, View, Text, ScrollView, Dimensions } from 'react-native';
import { Button } from '@rneui/themed';
import { LineChart, BarChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import Svg, * as svg from 'react-native-svg';
import * as scale from 'd3-scale';
import { Rect } from 'react-native-svg';
import { Dropdown } from 'react-native-element-dropdown';

const DataAnalysis = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const barFill = 'rgb(134, 65, 244)';
  const barData = [
    50,
    10,
    40,
    95,
    85,
    0,
    35,
    53,
    24,
    50,
  ];

  /* ======================================================================= */
  // Line graph stuff below
  /* ======================================================================= */

  const windowWidth = Dimensions.get('window').width;

  const axesSvg = { fontSize: 20, fill: 'grey' };
  const verticalContentInset = { top: 10, bottom: 10 }
  const xAxisHeight = 30

  const freqMonth = [
    {
      label: new Date(2023, 0, 1),
      value: 3,
    },
    {
      label: new Date(2023, 1, 1),
      value: 7,
    },
    {
      label: new Date(2023, 2, 1),
      value: 3,
    },
    {
      label: new Date(2023, 3, 1),
      value: 15,
    },
    {
      label: new Date(2023, 4, 1),
      value: 6,
    },
    {
      label: new Date(2023, 5, 1),
      value: 8,
    },
    {
      label: new Date(2023, 6, 1),
      value: 12,
    },
    {
      label: new Date(2023, 7, 1),
      value: 8,
    },
    {
      label: new Date(2023, 8, 1),
      value: 1,
    },
    {
      label: new Date(2023, 9, 1),
      value: 7,
    },
    {
      label: new Date(2023, 10, 1),
      value: 14,
    },
    {
      label: new Date(2023, 11, 1),
      value: 9,
    },
  ]



  const timestamp1 = new Date('2023-10-25T04:55:30');
  const timestamp2 = new Date('2023-10-25T12:55:30');
  const timestamp3 = new Date('2023-10-25T15:55:30');

  const timestamp4 = new Date('2023-10-26T15:55:30');
  const timestamp5 = new Date('2023-10-28T15:55:30');

  const timestamp12AM = new Date('2023-10-25T00:00:00');
  const timestamp1AM = new Date('2023-10-25T01:00:00');
  const timestamp2AM = new Date('2023-10-25T02:00:00');
  const timestamp3AM = new Date('2023-10-25T03:00:00');
  const timestamp4AM = new Date('2023-10-25T04:00:00');
  const timestamp5AM = new Date('2023-10-25T05:00:00');
  const timestamp6AM = new Date('2023-10-25T06:00:00');
  const timestamp7AM = new Date('2023-10-25T07:00:00');
  const timestamp8AM = new Date('2023-10-25T08:00:00');
  const timestamp9AM = new Date('2023-10-25T09:00:00');
  const timestamp10AM = new Date('2023-10-25T10:00:00');
  const timestamp11AM = new Date('2023-10-25T11:00:00');
  const timestamp12PM = new Date('2023-10-25T12:00:00');
  const timestamp1PM = new Date('2023-10-25T13:00:00');
  const timestamp2PM = new Date('2023-10-25T14:00:00');
  const timestamp3PM = new Date('2023-10-25T15:00:00');
  const timestamp4PM = new Date('2023-10-25T16:00:00');
  const timestamp5PM = new Date('2023-10-25T17:00:00');
  const timestamp6PM = new Date('2023-10-25T18:00:00');
  const timestamp7PM = new Date('2023-10-25T19:00:00');
  const timestamp8PM = new Date('2023-10-25T20:00:00');
  const timestamp9PM = new Date('2023-10-25T21:00:00');
  const timestamp10PM = new Date('2023-10-25T22:00:00');
  const timestamp11PM = new Date('2023-10-25T23:59:59');

  const freqDay = [
    {
      label: timestamp12AM.getHours(),
      value: 0,
    },
    {
      label: timestamp1AM.getHours(),
      value: 0,
    },
    {
      label: timestamp2AM.getHours(),
      value: 0,
    },
    {
      label: timestamp3AM.getHours(),
      value: 0,
    },
    {
      label: timestamp1.getHours(),
      value: 1,
    },
    {
      label: timestamp5AM.getHours(),
      value: 0,
    },
    {
      label: timestamp6AM.getHours(),
      value: 0,
    },
    {
      label: timestamp7AM.getHours(),
      value: 0,
    },
    {
      label: timestamp8AM.getHours(),
      value: 0,
    },
    {
      label: timestamp9AM.getHours(),
      value: 0,
    },
    {
      label: timestamp10AM.getHours(),
      value: 0,
    },
    {
      label: timestamp11AM.getHours(),
      value: 0,
    },
    {
      label: timestamp2.getHours(),
      value: 6,
    },
    {
      label: timestamp1PM.getHours(),
      value: 0,
    },
    {
      label: timestamp2PM.getHours(),
      value: 0,
    },
    {
      label: timestamp3.getHours(),
      value: 3,
    },
    {
      label: timestamp4PM.getHours(),
      value: 0,
    },
    {
      label: timestamp5PM.getHours(),
      value: 0,
    },
    {
      label: timestamp6PM.getHours(),
      value: 0,
    },
    {
      label: timestamp7PM.getHours(),
      value: 0,
    },
    {
      label: timestamp8PM.getHours(),
      value: 0,
    },
    {
      label: timestamp9PM.getHours(),
      value: 0,
    },
    {
      label: timestamp10PM.getHours(),
      value: 0,
    },
    {
      label: timestamp11PM.getHours(),
      value: 0,
    },
  ]

  const freqDay26 = [
    {
      label: new Date('2023-10-26T00:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T01:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T02:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T03:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T04:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T05:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T06:00:00').getHours(),
      value: 7,
    },
    {
      label: new Date('2023-10-26T07:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T08:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T09:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T10:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T11:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T12:00:00').getHours(),
      value: 6,
    },
    {
      label: new Date('2023-10-26T13:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T14:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T15:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T16:00:00').getHours(),
      value: 2,
    },
    {
      label: new Date('2023-10-26T17:00:00').getHours(),
      value: 5,
    },
    {
      label: new Date('2023-10-26T18:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T19:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T20:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T21:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T22:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-26T23:00:00').getHours(),
      value: 0,
    },
  ]

  const freqDay27 = [
    {
      label: new Date('2023-10-27T00:00:00').getHours(),
      value: 2,
    },
    {
      label: new Date('2023-10-27T01:00:00').getHours(),
      value: 4,
    },
    {
      label: new Date('2023-10-27T02:00:00').getHours(),
      value: 6,
    },
    {
      label: new Date('2023-10-27T03:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T04:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T05:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T06:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T07:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T08:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T09:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T10:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T11:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T12:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T13:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T14:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T15:00:00').getHours(),
      value: 4,
    },
    {
      label: new Date('2023-10-27T16:00:00').getHours(),
      value: 2,
    },
    {
      label: new Date('2023-10-27T17:00:00').getHours(),
      value: 1,
    },
    {
      label: new Date('2023-10-27T18:00:00').getHours(),
      value: 4,
    },
    {
      label: new Date('2023-10-27T19:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T20:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T21:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T22:00:00').getHours(),
      value: 0,
    },
    {
      label: new Date('2023-10-27T23:00:00').getHours(),
      value: 0,
    },
  ]

  const freqDayArray = [freqDay,freqDay26,freqDay27];
  
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthAbrev = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  console.log(month[(new Date(2023, 0, 1)).getMonth()]);

  const hours = ["12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM"]

  const [periodValue, setPeriodValue] = useState('1');
  const [segementDay, setSegementDayValue] = useState('12');
  const [segementWeek, setSegementWeekValue] = useState('1');
  const [segementMonth, setSegementMonthValue] = useState('1');
  const [date, setDateValue] = useState(0);

  const periodOptions = [
    { label: 'Daily', value: '1' },
    { label: 'Weekly', value: '2' },
    { label: 'Monthly', value: '3' },
  ];

  const segementDayOptions = [
    { label: '1 hour', value: '1' },
    //{ label: '2 hour', value: '2' },
    { label: '3 hour', value: '3' },
    //{ label: '4 hour', value: '4' },
    //{ label: '5 hour', value: '5' },
    { label: '6 hour', value: '6' },
    //{ label: '7 hour', value: '7' },
    //{ label: '8 hour', value: '8' },
    //{ label: '9 hour', value: '9' },
    //{ label: '10 hour', value: '10' },
    //{ label: '11 hour', value: '11' },
    { label: '12 hour', value: '12' },
  ];

  const segementWeekOptions = [
    { label: 'Every Other Day', value: '1' },
    { label: 'Weekday/Weekend', value: '2' },
  ];

  const segementMonthOptions = [
    { label: '1 month', value: '1' },
    { label: '2 month', value: '2' },
    { label: '3 month', value: '3' },
    { label: '4 month', value: '4' },
    { label: '5 month', value: '5' },
    { label: '6 month', value: '6' },
  ];

  const dateOptions = [
    { label: timestamp1.toDateString(), value: 0 },
    { label: new Date('2023-10-26T23:59:59').toDateString(), value: 1 },
    { label: new Date('2023-10-27T23:59:59').toDateString(), value: 2 },
  ];

  /* ======================================================================= */
  // bar graph stuff below
  /* ======================================================================= */

  const [barGraphVertical, setBarGraphVertical] = useState(true);

  const wordFreqBarGraphData = [
    {
      label: "Tired",
      value: 15,
    },
    {
      label: "Ache",
      value: 13,
    },
    {
      label: "Weak",
      value: 12,
    },
    {
      label: "Sleep",
      value: 8,
    },
    {
      label: "Happy",
      value: 7,
    },
    {
      label: "Pain",
      value: 3,
    },
    {
      label: "Energized",
      value: 3,
    },
    {
      label: "Fever",
      value: 1,
    },
    {
      label: "Fever",
      value: 0,
    },
  ]

  const yTest = Array.from({ length: 15 }, (_, i) => i + 1);
  //const yTest = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  //const yTest = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  /* on press functionality for word frequency bar graph */
  const [wordSelected, setWordSelected] = useState<any>(null);
  const wordFreq = wordFreqBarGraphData.map(
    (item, index) => ({
      y: item,
      svg: {
        onPressIn: () => {
          console.log(wordFreqBarGraphData[index]);
          setWordSelected(index);
          onPressLineGraph();
        },
        onPressOut: () => {
          setWordSelected(null);
        },
        //fill: wordSelected === index ? '#55C45E' : 'rgba(134, 65, 244, 0.8)',
      }
    })
  );

  const CUT_OFF = 14;
  const Labels = ({ x, y, bandwidth, data }) => (
    wordFreqBarGraphData.map((value, index) => (
      <svg.Text
        key={index}
        x={x(index) + (bandwidth / 2)}
        y={value.value > CUT_OFF ? y(value.value) + 20 : y(value.value) - 15}
        fontSize={20}
        fill={value.value > CUT_OFF ? 'white' : 'black'}
        alignmentBaseline={'middle'}

      >
        {value.value}
      </svg.Text>
    ))
  );

  /* ======================================================================= */

  const lineChartData = [
    50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80,
  ];

  const [showWordCloud, setShowWordCloud] = useState(true);
  const [showLineGraph, setShowLineGraph] = useState(false);
  const [showBarGraph, setShowBarGraph] = useState(false);
  const [showTextSummary, setShowTextSummary] = useState(false);
  const [showTextGraph, setShowTextGraph] = useState(false);

  function onPressWordCloud() {
    setShowWordCloud(true);
    setShowLineGraph(false);
    setShowBarGraph(false);
    setShowTextSummary(false);
    setShowTextGraph(false);
  }

  function onPressLineGraph() {
    setShowWordCloud(false);
    setShowLineGraph(true);
    setShowBarGraph(false);
    setShowTextSummary(false);
    setShowTextGraph(false);
  }

  function onPressBarGraph() {
    setShowWordCloud(false);
    setShowLineGraph(false);
    setShowBarGraph(true);
    setShowTextSummary(false);
    setShowTextGraph(false);
  }

  function onPressTextSummary() {
    setShowWordCloud(false);
    setShowLineGraph(false);
    setShowBarGraph(false);
    setShowTextSummary(true);
    setShowTextGraph(false);
  }

  function onPressTextGraph() {
    setShowWordCloud(false);
    setShowLineGraph(false);
    setShowBarGraph(false);
    setShowTextSummary(false);
    setShowTextGraph(true);
  }

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  //   const video: any = useObject('VideoData', id);
  return (
    <View>
      <View style={{ height: '87%' }}>
        {showWordCloud && (
          <View id="wordcloud">
            <Text>test1</Text>
          </View>
        )}
        {showLineGraph && (
          /*           
                    <View id="linegraph">
                      <YAxis
                        data={lineChartData}
                        // contentInset={contentInset}
                        svg={{
                          fill: 'grey',
                          fontSize: 10,
                        }}
                        numberOfTicks={10}
                      // formatLabel={value => `${value}ºC`}
                      />
                      <LineChart
                        style={{ height: '100%', padding: 40 }}
                        data={lineChartData}
                        svg={{ stroke: 'rgb(134, 65, 244)' }}
                        contentInset={{ top: 20, bottom: 20 }}>
                        <Grid />
                      </LineChart>
                    </View>
                      */

          /*   <View>
              <Text style={{ padding: 20, fontSize: 20 }}>Word Count of "{wordFreqBarGraphData[wordSelected].label}" over time</Text>
              <View id="linegraph" style={{ height: 600, padding: 20, flexDirection: 'row' }}>
  
                <YAxis
                  data={freqMonth}
                  yAccessor={({ item }) => item.value}
                  style={{ marginBottom: xAxisHeight }}
                  contentInset={verticalContentInset}
                  svg={axesSvg}
                />
  
                <ScrollView horizontal={true}>
                  <View style={{ flex: 1, marginLeft: 10, marginRight: 10, width: windowWidth }}>
                    <LineChart
                      style={{ flex: 1 }}
                      data={freqMonth}
                      yAccessor={({ item }) => item.value}
                      contentInset={verticalContentInset}
                      svg={{ stroke: 'rgb(134, 65, 244)' }}
                    >
                      <Grid />
                    </LineChart>
                    <XAxis
                      style={{ marginHorizontal: -40, height: xAxisHeight }}
                      data={freqMonth}
                      formatLabel={(value, index) => monthAbrev[(freqMonth[index].label).getMonth()]}
                      contentInset={{ left: 50, right: 50 }}
                      svg={axesSvg}
                    />
                  </View>
                </ScrollView>
  
              </View>
            </View> 
   */
          <View>
            <Text style={{ padding: 20, fontSize: 20 }}>Word Count of "{wordFreqBarGraphData[wordSelected].label}" over time</Text>
            <View id="linegraph" style={{ height: 600, padding: 20, flexDirection: 'row' }}>

              <YAxis
                data={freqDay}
                yAccessor={({ item }) => item.value}
                style={{ marginBottom: xAxisHeight }}
                contentInset={verticalContentInset}
                svg={axesSvg}
              />

              <ScrollView horizontal={true}>
                <View style={{ flex: 1, marginLeft: 10, marginRight: 10, width: windowWidth * 1.5 }}>
                  <LineChart
                    style={{ flex: 1 }}
                    data={freqDayArray[date]}
                    yAccessor={({ item }) => item.value}
                    xScale={scale.scaleTime}
                    contentInset={verticalContentInset}
                    svg={{ stroke: 'rgb(134, 65, 244)', strokeWidth: 5 }}
                  >
                    <Svg belowChart={true}>
                      {/* day/night - 12 hour */}
                      {segementDay == '12' && (
                        <Rect
                          x="0%"
                          y="0"
                          width="52%"
                          height="100%"
                          fill='rgb(194, 200, 209)'
                        />
                      )}
                      {/* 6 hour */}
                      {segementDay == '6' && (
                        <>
                          <Rect
                            x="0%"
                            y="0"
                            width="26%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="52%"
                            y="0"
                            width="26%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                        </>
                      )}
                      {/* 3 hour */}
                      {segementDay == '3' && (
                        <>
                          <Rect
                            x="0%"
                            y="0"
                            width="13%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="26%"
                            y="0"
                            width="13%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="52%"
                            y="0"
                            width="13%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="77%"
                            y="0"
                            width="13%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                        </>
                      )}
                      {/* 1 hour */}
                      {segementDay == '1' && (
                        <>
                          <Rect
                            x="0%"
                            y="0"
                            width="5.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="9.5%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="18%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="26.5%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="35%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="43.5%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="52%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="60.5%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="69%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="77.5%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="86%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                          <Rect
                            x="94.5%"
                            y="0"
                            width="4.25%"
                            height="100%"
                            fill='rgb(194, 200, 209)' />
                        </>
                      )}
                    </Svg>
                    <Grid />
                  </LineChart>
                  <XAxis
                    style={{ marginHorizontal: -40, height: xAxisHeight }}
                    data={freqDay}
                    scale={scale.scaleTime}
                    formatLabel={(value, index) => hours[freqDay[index].label]}
                    labelStyle={{ margin: 5 }}
                    contentInset={{ left: 50, right: 50 }}
                    svg={axesSvg}
                  />
                </View>
              </ScrollView>

            </View>

            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
              <Button
                title="Previous"
                style={{ marginLeft: 20, marginRight: 20, paddingLeft: 20, paddingRight: 20 }}
                icon={{
                  name: 'arrow-left',
                  type: 'font-awesome',
                  size: 15,
                  color: 'white',
                }}
                onPress={() => {
                  if (date > 0) {
                    setDateValue(date-1);
                  } else {
                    console.log("There is no previous date");
                  }
                }}
              />
              <Dropdown
                data={dateOptions}
                maxHeight={300}
                style={{ width: 400 }}
                placeholderStyle={{ fontSize: 20 }}
                selectedTextStyle={{ fontSize: 20 }}
                labelField="label"
                valueField="value"
                onChange={item => {
                  setDateValue(item.value);
                }}
              />
              <Button
                title="Next"
                style={{ marginLeft: 20, marginRight: 20, paddingLeft: 20, paddingRight: 20 }}
                iconPosition='right'
                icon={{
                  name: 'arrow-right',
                  type: 'font-awesome',
                  size: 15,
                  color: 'white',
                }}
                onPress={() => {
                  if (date < dateOptions.length-1) {
                    setDateValue(date+1);
                  } else {
                    console.log("There is no next date");
                  }
                }}
              />
            </View>

            <Text style={{ fontSize: 25, marginLeft: 20, marginTop: 20 }}>Filter and Sort</Text>
            <View style={{ flexDirection: 'row', marginLeft: 20 }}>
              <View id="period-dropdown" style={{ padding: 10 }}>
                <Text style={{ fontSize: 20 }}>Select Period: </Text>
                <Dropdown
                  data={periodOptions}
                  maxHeight={300}
                  style={{ width: 200 }}
                  labelField="label"
                  valueField="value"
                  onChange={item => {
                    setPeriodValue(item.value);
                  }}
                />
              </View>
              {periodValue == '1' && (
                <View id="segmentDay-dropdown" style={{ padding: 10 }}>
                  <Text style={{ fontSize: 20 }}>Select Segment Option: </Text>
                  <Dropdown
                    data={segementDayOptions}
                    //maxHeight={300}
                    style={{ width: 200 }}
                    labelField="label"
                    valueField="value"
                    onChange={item => {
                      setSegementDayValue(item.value);
                    }}
                  />
                </View>
              )}
              {periodValue == '2' && (
                <View id="segmentWeek-dropdown" style={{ padding: 10 }}>
                  <Text style={{ fontSize: 20 }}>Select Segment Option: </Text>
                  <Dropdown
                    data={segementWeekOptions}
                    //maxHeight={300}
                    style={{ width: 200 }}
                    labelField="label"
                    valueField="value"
                    onChange={item => {
                      setSegementWeekValue(item.value);
                    }}
                  />
                </View>
              )}
              {periodValue == '3' && (
                <View id="segmentMonth-dropdown" style={{ padding: 10 }}>
                  <Text style={{ fontSize: 20 }}>Select Segment Option: </Text>
                  <Dropdown
                    data={segementMonthOptions}
                    //maxHeight={300}
                    style={{ width: 200 }}
                    labelField="label"
                    valueField="value"
                    onChange={item => {
                      setSegementMonthValue(item.value);
                    }}
                  />
                </View>
              )}
            </View>

          </View>

        )}

        {showBarGraph && (
          <View id="bargraph" style={{ height: '90%', padding: 40 }}>
            {/* 
            <View style={{}}>
            <YAxis
              data={barData}
              contentInset={{ top: 0, bottom: 0 }}
              svg={{
                fill: 'grey',
                fontSize: 10,
              }}
              yAccessor={({ index }) => index}
              numberOfTicks={10}
              formatLabel={value => `${value}ºC`}
            />
            <BarChart
              style={{ height: '90%', padding: 40 }}
              data={barData}
              svg={{ barFill }}
              contentInset={{ top: 0, bottom: 0 }}>
              <Grid />
            </BarChart>
            <XAxis
              xAccessor={({ item, index }) => item}
              style={{ marginHorizontal: -10 }}
              data={barData}
              formatLabel={(value, index) => index}
              contentInset={{ left: 10, right: 10 }}
              svg={{ fontSize: 10, fill: 'black' }}
            />
            </View> */}
            {/*
            <Text>Frequency of the word 'Pain' over January-April</Text>
            <View style={{ flexDirection: 'row', height: 200, paddingVertical: 16 }}>
              <YAxis
                data={freqMonth}
                yAccessor={({ index }) => index}
                scale={scale.scaleBand}
                contentInset={{ top: 10, bottom: 10 }}
                spacing={0.2}
                formatLabel={(_, index) => month[(freqMonth[index].label).getMonth()]}
              />
              <BarChart
                style={{ flex: 1, marginLeft: 8 }}
                data={freqMonth}
                horizontal={true}
                yAccessor={({ item }) => item.value}
                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                contentInset={{ top: 10, bottom: 10 }}
                spacing={0.2}
                gridMin={0}
              //on={({ item }) => console.log(item.value)}
              >
                <Grid direction={Grid.Direction.VERTICAL} />
                <Labels />
              </BarChart>
            </View> */}

            {(barGraphVertical == true) ? (
              <View id="bargraph-vertical">
                <Text>Frequency of Words mentioned in Selected Video</Text>
                <View style={{ flexDirection: 'row', height: 400, paddingVertical: 16 }}>
                  <YAxis
                    data={yTest}
                    yAccessor={({ index }) => index}
                    scale={scale.scaleBand}
                    contentInset={{ top: 10, bottom: 10 }}
                    spacing={0.2}
                    formatLabel={(value) => value}
                  />
                  <BarChart
                    style={{ flex: 1, marginLeft: 8 }}
                    data={wordFreq}
                    //horizontal={true}
                    yAccessor={({ item }) => item.y.value}
                    //xAccessor={({ item }) => item.y.value}
                    svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                    contentInset={{ top: 10, bottom: 10 }}
                    spacing={0.2}
                    gridMin={0}
                  >
                    <Grid direction={Grid.Direction.HORIZONTAL} />
                    <Labels />
                  </BarChart>
                </View>
                <XAxis
                  style={{ height: 100, marginTop: 20, marginBottom: 20 }}
                  //xAccessor={({ index }) => index}
                  //contentInset={{ left: 20, right: 40 }}
                  data={wordFreqBarGraphData}
                  scale={scale.scaleBand}
                  svg={{ fontSize: 20, rotation: 40, fill: 'black', originY: 35, translateY: 0 }}
                  formatLabel={(value, index) => wordFreqBarGraphData[index].label}
                //labelStyle={ { color: 'black' } }
                />
              </View>
            ) : (
              <View id="bargraph-horizontal">
                <Text>Frequency of Words mentioned in Selected Video</Text>
                <View style={{ flexDirection: 'row', height: 200, paddingVertical: 16 }}>
                  <YAxis
                    data={wordFreqBarGraphData}
                    yAccessor={({ index }) => index}
                    scale={scale.scaleBand}
                    contentInset={{ top: 10, bottom: 10 }}
                    spacing={0.2}
                    formatLabel={(value, index) => wordFreqBarGraphData[index].label}
                  />
                  <BarChart
                    style={{ flex: 1, marginLeft: 8 }}
                    data={wordFreq}
                    horizontal={true}
                    yAccessor={({ item }) => item.y.value}
                    svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                    contentInset={{ top: 10, bottom: 10 }}
                    spacing={0.2}
                    gridMin={0}
                  //on={({ item }) => console.log(item.value)}
                  >
                    <Grid direction={Grid.Direction.VERTICAL} />
                    {/* <Labels /> */}
                  </BarChart>
                </View>
                <XAxis
                  data={yTest}
                  yAccessor={({ index }) => index}
                  scale={scale.scaleBand}
                  contentInset={{ top: 10, bottom: 10 }}
                  spacing={0.2}
                  formatLabel={(value) => value}
                />
              </View>
            )}
            <Button
              title="Horizontal"
              onPress={() => setBarGraphVertical(false)}
            />
            <Button
              title="Vertical"
              onPress={() => setBarGraphVertical(true)}
            />
          </View>

        )}

        {showTextSummary && (
          <View id="textsummary">
            <Text>test4</Text>
          </View>
        )}
        {showTextGraph && (
          <View id="textgraph">
            <Text>test5</Text>
          </View>
        )}
      </View>
      <View style={{}}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Button
            onPress={onPressWordCloud}
            titleStyle={{ fontSize: 20 }}
            containerStyle={{
              width: 200,
              marginHorizontal: 30,
              marginVertical: 10,
            }}
            iconRight={true}
            icon={{
              name: 'cloud',
              type: 'font-awesome',
              size: 20,
              color: 'white',
            }}>
            Word Cloud
          </Button>
          <Button
            onPress={onPressLineGraph}
            titleStyle={{ fontSize: 20 }}
            containerStyle={{
              width: 200,
              marginHorizontal: 30,
              marginVertical: 10,
            }}
            iconRight={true}
            icon={{
              name: 'chart-line',
              type: 'font-awesome-5',
              size: 20,
              color: 'white',
            }}>
            Line Graph
          </Button>
          <Button
            onPress={onPressTextSummary}
            titleStyle={{ fontSize: 20 }}
            containerStyle={{
              width: 200,
              marginHorizontal: 30,
              marginVertical: 10,
            }}
            iconRight={true}
            icon={{
              name: 'file-alt',
              type: 'font-awesome-5',
              size: 20,
              color: 'white',
            }}>
            Text Summary
          </Button>
          <Button
            onPress={onPressBarGraph}
            titleStyle={{ fontSize: 20 }}
            containerStyle={{
              width: 200,
              marginHorizontal: 30,
              marginVertical: 10,
            }}
            iconRight={true}
            icon={{
              name: 'chart-bar',
              type: 'font-awesome-5',
              size: 20,
              color: 'white',
            }}>
            Bar Graph
          </Button>

          <Button
            onPress={onPressTextGraph}
            titleStyle={{ fontSize: 20 }}
            containerStyle={{
              width: 200,
              marginHorizontal: 50,
              marginVertical: 10,
            }}
            iconRight={true}
            icon={{
              name: 'project-diagram',
              type: 'font-awesome-5',
              size: 20,
              color: 'white',
            }}>
            Text Graph
          </Button>
        </View>
      </View>
    </View>
  );
};

export default DataAnalysis;
