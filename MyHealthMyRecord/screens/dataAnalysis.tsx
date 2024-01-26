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
    navigation.navigate('Word Cloud');
  }

  function onPressLineGraph() {
    navigation.navigate('Line Graph');
  }

  function onPressBarGraph() {
    navigation.navigate('Bar Graph');
  }

  function onPressTextSummary() {
    navigation.navigate('Text Summary');
  }

  function onPressTextGraph() {
    navigation.navigate('Text Graph');
  }

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  //   const video: any = useObject('VideoData', id);
  return (
    <View>

      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <View style={{  }}>
          <Button
            onPress={onPressWordCloud}
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
            }}>
            Word Cloud
          </Button>
          <Button
            onPress={onPressLineGraph}
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
            }}>
            Line Graph
          </Button>
          <Button
            onPress={onPressTextSummary}
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
            }}>
            Text Summary
          </Button>
          <Button
            onPress={onPressBarGraph}
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
            }}>
            Bar Graph
          </Button>

          <Button
            onPress={onPressTextGraph}
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
            }}>
            Text Graph
          </Button>
        </View>
      </View>
    </View>
  );
};

export default DataAnalysis;
