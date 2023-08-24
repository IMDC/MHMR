import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {VideoData, useRealm, useObject} from '../models/VideoData';
import {SafeAreaView, Text, View} from 'react-native';
import {Button} from '@rneui/themed';
import {LineChart, BarChart, Grid, YAxis, XAxis} from 'react-native-svg-charts';

const DataAnalysis = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const barFill = 'rgb(134, 65, 244)';
  const barData = [
    50,
    10,
    40,
    95,
    -4,
    -24,
    null,
    85,
    undefined,
    0,
    35,
    53,
    -53,
    24,
    50,
    -20,
    -80,
  ];

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
      <View style={{height: '87%'}}>
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
              style={{height: '100%', padding: 40}}
              data={lineChartData}
              svg={{stroke: 'rgb(134, 65, 244)'}}
              contentInset={{top: 20, bottom: 20}}>
              <Grid />
            </LineChart>
          </View>
        )}

        {showBarGraph && (
          <View id="bargraph" style={{height: '90%', padding: 40}}>
            <View style={{}}></View>
            <YAxis
              data={barData}
              contentInset={{top: 0, bottom: 0}}
              svg={{
                fill: 'grey',
                fontSize: 10,
              }}
              yAccessor={({index}) => index}
              numberOfTicks={10}
              formatLabel={value => `${value}ºC`}
            />
            <BarChart
              style={{height: '90%', padding: 40}}
              data={barData}
              svg={{barFill}}
              contentInset={{top: 0, bottom: 0}}>
              <Grid />
            </BarChart>
            <XAxis
              xAccessor={({item, index}) => item}
              style={{marginHorizontal: -10}}
              data={barData}
              formatLabel={(value, index) => index}
              contentInset={{left: 10, right: 10}}
              svg={{fontSize: 10, fill: 'black'}}
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
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <Button
            onPress={onPressWordCloud}
            titleStyle={{fontSize: 20}}
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
            titleStyle={{fontSize: 20}}
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
            titleStyle={{fontSize: 20}}
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
            titleStyle={{fontSize: 20}}
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
            titleStyle={{fontSize: 20}}
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
