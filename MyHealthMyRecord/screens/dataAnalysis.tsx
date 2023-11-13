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

  const freqDay = [
    {
      label: timestamp1.getHours(),
      value: 1,
    },
    {
      label: timestamp2.getHours(),
      value: 6,
    },
    {
      label: timestamp3.getHours(),
      value: 3,
    },
  ]

  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthAbrev = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  console.log(month[(new Date(2023, 0, 1)).getMonth()]);

  const hours = ["12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM"]

  const [periodValue, setPeriodValue] = useState('1');
  const [segementDay, setSegementDayValue] = useState('1');
  const [segementWeek, setSegementWeekValue] = useState('1');
  const [segementMonth, setSegementMonthValue] = useState('1');

  const periodOptions = [
    { label: 'Daily', value: '1' },
    { label: 'Weekly', value: '2' },
    { label: 'Monthly', value: '3' },
  ];

  const segementDayOptions = [
    { label: '1 hour', value: '1' },
    { label: '2 hour', value: '2' },
    { label: '3 hour', value: '3' },
    { label: '4 hour', value: '4' },
    { label: '5 hour', value: '5' },
    { label: '6 hour', value: '6' },
    { label: '7 hour', value: '7' },
    { label: '8 hour', value: '8' },
    { label: '9 hour', value: '9' },
    { label: '10 hour', value: '10' },
    { label: '11 hour', value: '11' },
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
                <View style={{ flex: 1, marginLeft: 10, marginRight: 10, width: windowWidth }}>
                  <LineChart
                    style={{ flex: 1 }}
                    data={freqDay}
                    yAccessor={({ item }) => item.value}
                    xScale={scale.scaleTime}
                    contentInset={verticalContentInset}
                    svg={{ stroke: 'rgb(134, 65, 244)', strokeWidth: 5 }}
                  >
                    <Svg belowChart={true}>
                      <Rect
                        x="50%"
                        y="0"
                        width="50%"
                        height="100%"
                        fill='rgb(194, 200, 209)'
                      />
                    </Svg>
                    <Grid />
                  </LineChart>
                  <XAxis
                    style={{ marginHorizontal: -40, height: xAxisHeight }}
                    data={freqDay}
                    scale={scale.scaleTime}
                    formatLabel={(value, index) => hours[freqDay[index].label]}
                    contentInset={{ left: 50, right: 50 }}
                    svg={axesSvg}
                  />
                </View>
              </ScrollView>

            </View>

            <Text style={{ fontSize: 25, marginLeft: 20 }}>Filter and Sort</Text>
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
            onPress={onPressBarGraph}
            containerStyle={{
              width: 200,
              marginHorizontal: 30,
              marginVertical: 10,
            }}>
            Bar Graph
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
