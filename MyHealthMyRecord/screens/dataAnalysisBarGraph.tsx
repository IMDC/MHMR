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

const DataAnalysisBarGraph = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

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
    const wordSelected = useState<any>(null);
    const wordFreq = wordFreqBarGraphData.map(
        (item, index) => ({
            y: item,
            svg: {
                onPressIn: () => {
                    console.log(wordFreqBarGraphData[index]);
                    wordSelected[0] = index;
                    const wordLabel = wordFreqBarGraphData[wordSelected[0]].label;
                    navigation.navigate('Line Graph', {wordLabel});
                },
                onPressOut: () => {
                    wordSelected[0] = null;
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

    const route: any = useRoute();
    const id = route.params?.id;

    const realm = useRealm();
    //   const video: any = useObject('VideoData', id);
    return (
        <View>
            <View style={{ height: '87%' }}>


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



            </View>
            <View style={{}}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>

                </View>
            </View>
        </View>
    );
};

export default DataAnalysisBarGraph;
