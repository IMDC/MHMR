import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { VideoData, useRealm, useObject } from '../models/VideoData';
import { SafeAreaView, View, Text } from 'react-native';
import { Button } from '@rneui/themed';
import { LineChart, BarChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import * as svg from 'react-native-svg';
import * as scale from 'd3-scale';

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

  const freq = [
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
  ]

  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  console.log(month[(new Date(2023, 0, 1)).getMonth()]);

  const CUT_OFF = 14;
  const Labels = ({  x, y, bandwidth, data }) => (
    freq.map((value, index) => (
        <svg.Text
            key={ index }
            x={ value.value > CUT_OFF ? x(value.value) - 25 : x(value.value) + 10 }
            y={ y(index) + (bandwidth / 2) }
            fontSize={ 14 }
            fill={ value.value > CUT_OFF ? 'white' : 'black' }
            alignmentBaseline={ 'middle' }
            
        >
            {value.value}
        </svg.Text>
    ))
);

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
        )}

        {showBarGraph && (
          <View id="bargraph" style={{ height: '90%', padding: 40 }}>
            {/* <View style={{}}></View>
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
            /> */}
            <Text>Frequency of the word 'Pain' over January-April</Text>
            <View style={{ flexDirection: 'row', height: 200, paddingVertical: 16 }}>
              <YAxis
                data={freq}
                yAccessor={({ index }) => index}
                scale={scale.scaleBand}
                contentInset={{ top: 10, bottom: 10 }}
                spacing={0.2}
                formatLabel={(_, index) => month[(freq[index].label).getMonth()]}
              />
              <BarChart
                style={{ flex: 1, marginLeft: 8}}
                data={freq}
                horizontal={true}
                yAccessor={({ item }) => item.value}
                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                contentInset={{ top: 10, bottom: 10 }}
                spacing={0.2}
                gridMin={0}
                //on={({ item }) => console.log(item.value)}
              >
                <Grid direction={Grid.Direction.VERTICAL}/>
                <Labels/>
              </BarChart>
            </View>
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
