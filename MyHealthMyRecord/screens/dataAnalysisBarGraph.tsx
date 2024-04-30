import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { VideoData, useRealm, useObject } from '../models/VideoData';
import { SafeAreaView, View, Text, ScrollView, Dimensions, Switch } from 'react-native';
import { Button } from '@rneui/themed';
import { LineChart, BarChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import Svg, * as svg from 'react-native-svg';
import * as scale from 'd3-scale';
import { Rect } from 'react-native-svg';
import { Dropdown } from 'react-native-element-dropdown';
import * as Styles from '../assets/util/styles';

const DataAnalysisBarGraph = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
    const route: any = useRoute();
    const barData = route.params?.data;
    const [freqMaps, setFreqMaps] = useState(route.params?.freqMaps);

    const [wordFreqBarGraphData, setWordFreqBarGraphData] = useState(barData.data);
    //const wordFreqBarGraphData = data.data;

    const realm = useRealm();
    //   const video: any = useObject('VideoData', id);

    /* ======================================================================= */
    // bar graph stuff below
    /* ======================================================================= */

    const [barGraphVertical, setBarGraphVertical] = useState(true);

    /*     const wordFreqBarGraphData = [
            {
                label: "Pain",
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
                label: "Tired",
                value: 4,
            },
            {
                label: "Energized",
                value: 3,
            },
            {
                label: "Sad",
                value: 1,
            },
            {
                label: "Arm",
                value: 1,
            },
        ] */

    // array of length of max value in data (first index value) for yAxis
    const yTest = Array.from({ length: wordFreqBarGraphData[0].value }, (_, i) => i + 1);
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
                    let result = setLineGraphDataDay(wordLabel);
                    navigation.navigate('Line Graph', {
                        word: wordLabel,
                        data: result,
                    });
                },
                onPressOut: () => {
                    wordSelected[0] = null;
                },
                //fill: wordSelected === index ? '#55C45E' : 'rgba(134, 65, 244, 0.8)',
            }
        })
    );

    /**
     * Labels on each bar with the frequency value for the vertical view
     */
    const CUT_OFF_VER = wordFreqBarGraphData[0].value - 1;
    const LabelsVertical = ({ x, y, bandwidth, data }) => (
        wordFreqBarGraphData.map((value, index) => (
            <svg.Text
                key={index}
                x={x(index) + (bandwidth / 2) - 10}
                y={value.value > CUT_OFF_VER ? y(value.value) + 20 : y(value.value) - 15}
                fontSize={20}
                fill={value.value > CUT_OFF_VER ? 'white' : 'black'}
                alignmentBaseline={'middle'}
            >
                {value.value}
            </svg.Text>
        ))
    );

    /**
     * Labels on each bar with the frequency value for the horizontal view
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
    )

    /**
     * toggle filters
     */
    const [isEnabledStopWords, setIsEnabledStopWords] = useState(true);
    const toggleSwitchStopWords = () => setIsEnabledStopWords(previousState => !previousState);
    const [isEnabledMedWords, setIsEnabledMedWords] = useState(true);
    const toggleSwitchMedWords = () => setIsEnabledMedWords(previousState => !previousState);
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
    ]

    /**
     * Get the line graph data for the daily view
     * @param word the word that the line graph is for
     * @returns 
     */
    function setLineGraphDataDay(word: any) {
        let maps = accessFreqMaps();

        let trackedDates = new Map();
        let trackedHours = new Map();

        let saveDate = "";
        let date = "";
        let hour = 0;

        /** will map to the "Choose Day" Dropdown
         * example: dropdown = [
         * {"label": "Tue Apr 30 2024", "value": 0},
         * {"label": "Wed May 1 2024", "value": 1},
         * ]
         */
        let resultsDates = [];
        /** will map to the line graph data
         * example (two arrays for two days): lineData = [
         * [{"label": 0, "value": 0, videoIDs: []}, ... , {"label": 23, "value": 0, videoIDs: []}],
         * [{"label": 0, "value": 0, videoIDs: []}, ... , {"label": 23, "value": 0, videoIDs: []}],
         * ]
         */
        let resultByHour = [];

        for (let i = 0; i < freqMaps.length; i++) {

            saveDate = freqMaps[i].datetime.toString().split(' ');
            // ex. result of above: Array ["Mon", "Apr", "29", "2024", "13:05:26", "GMT-0400", "(Eastern", "Daylight", "Time)"]
            date = saveDate[0] + " " + saveDate[1] + " " + saveDate[2] + " " + saveDate[3];
            // result of above: "Mon Apr 29 2024"
            hour = freqMaps[i].datetime.getHours();
            // result of above: 13

            // if word is in the map, then...
            if (freqMaps[i].map.has(word)) {
                // if new day, then...
                if (!trackedDates.has(date)) {
                    trackedDates.set(date, 1);
                    // refresh tracked hours for a new day
                    [...trackedHours.keys()].forEach((key) => {
                        trackedHours.set(key, 0);
                        console.log("reset key ", key);
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
                    ]
                    trackedHours.set(hour, 1);
                    // add a day to resultsByHour array
                    resultByHour.push(freqDayTemplate);
                    // add a date for the drop down
                    resultsDates.push({ label: date, value: trackedDates.size - 1 })
                    console.log("ooooooooo new tracked date", date, trackedDates, hour, trackedHours);
                } else {
                    trackedDates.set(date, trackedDates.get(date) + 1);
                    if (!trackedHours.has(hour)) {
                        trackedHours.set(hour, 1);
                        console.log("ooooooooo new tracked hour", hour, trackedHours);
                    } else {
                        trackedHours.set(hour, trackedHours.get(hour) + 1);
                        console.log("ooooooooo already tracked hour", hour, trackedHours);
                    }
                }
                // access most recent day (because maps should be orderd by date already)
                // increment the count for the current video's hour
                resultByHour[trackedDates.size - 1][hour].value += maps[i].get(word);
                resultByHour[trackedDates.size - 1][hour].videoIDs.push(freqMaps[i].videoID);
                console.log("ooooooooo adding word count by hour ---- count: ", hour, maps[i].get(word));
            }
        }
        console.log(resultsDates);
        console.log(resultByHour);
        
        //setFreqMaps([]);
        return { dates: resultsDates, byHour: resultByHour };
    }

    /* ======================================================================= */

    return (
        <View>
            <View style={{ height: '87%' }}>

                <View id="bargraph" style={{ height: '90%', width: '100%', padding: 40 }}>

                    {(barGraphVertical == true) ? (
                        <View id="bargraph-vertical">

                            <Text>Frequency of Words mentioned in Selected Video</Text>

                            {/* <Text style={{ transform: [{ rotate: '-90deg' },], width: '100%', textAlign: 'center' }}>Frequency</Text> */}

                            <View style={{ flexDirection: 'row', height: 400, paddingVertical: 16 }}>

                                <YAxis
                                    data={yTest}
                                    yAccessor={({ index }) => index}
                                    //scale={scale.scaleBand}
                                    contentInset={{ top: 10, bottom: 10 }}
                                    spacing={0.2}
                                    formatLabel={(value) => value}
                                    min={0}
                                    max={wordFreqBarGraphData[0].value}
                                    numberOfTicks={wordFreqBarGraphData[0].value}
                                />
                                <BarChart
                                    style={{ flex: 1, marginLeft: 8 }}
                                    data={wordFreq}
                                    //horizontal={true}
                                    yAccessor={({ item }) => item.y.value}
                                    //xAccessor={({ item }) => item.y.value}
                                    svg={{ fill: 'rgba(' + Styles.MHMRBlueRGB + ', 0.7)' }}
                                    contentInset={{ top: 10, bottom: 10 }}
                                    spacing={0.2}
                                    gridMin={0}
                                    //yMin={0}
                                    //yMax={wordFreqBarGraphData[0].value}
                                    numberOfTicks={wordFreqBarGraphData[0].value}
                                >
                                    <Grid direction={Grid.Direction.HORIZONTAL} />
                                    <LabelsVertical />
                                </BarChart>

                            </View>
                            <XAxis
                                style={{ height: 100, marginTop: 0, marginBottom: 20 }}
                                //xAccessor={({ index }) => index}
                                contentInset={{ left: 20, right: 20 }}
                                data={wordFreqBarGraphData}
                                scale={scale.scaleBand}
                                svg={{ fontSize: 20, rotation: 25, fill: 'black', originY: 35, translateY: 15, translateX: 0 }}
                                formatLabel={(value, index) => wordFreqBarGraphData[index].label}
                            //numberOfTicks={wordFreqBarGraphData.length}
                            //labelStyle={ { color: 'black' } }
                            />
                            <Text style={{ textAlign: 'center' }}>Word</Text>


                        </View>
                    ) : (
                        <View id="bargraph-horizontal">
                            <Text>Frequency of Words mentioned in Selected Video</Text>
                            <View style={{ flexDirection: 'row', height: 400, paddingVertical: 16 }}>
                                <YAxis
                                    data={wordFreqBarGraphData}
                                    yAccessor={({ index }) => index}
                                    scale={scale.scaleBand}
                                    contentInset={{ top: 10, bottom: 10 }}
                                    spacing={0.2}
                                    formatLabel={(value, index) => wordFreqBarGraphData[index].label}
                                    svg={{ fontSize: 20, margin: 10 }}
                                    min={0}
                                    max={wordFreqBarGraphData[0].value}
                                //numberOfTicks={9}
                                />
                                <BarChart
                                    style={{ flex: 1, marginLeft: 8 }}
                                    data={wordFreq}
                                    horizontal={true}
                                    yAccessor={({ item }) => item.y.value}
                                    svg={{ fill: 'rgba(' + Styles.MHMRBlueRGB + ', 0.7)' }}
                                    contentInset={{ top: 10, bottom: 10 }}
                                    spacing={0.2}
                                    gridMin={0}
                                //numberOfTicks={wordFreqBarGraphData[0].value}
                                //bandwidth={30}
                                //spacingInner={0.1}
                                //spacingOuter={0.1}
                                //on={({ item }) => console.log(item.value)}
                                >
                                    <Grid direction={Grid.Direction.VERTICAL} />
                                    <LabelsHorizontal />
                                </BarChart>
                            </View>
                            {/* content inset (left and right) + marginleft to change x-axis label spacing */}
                            <XAxis
                                data={yTest}
                                yAccessor={({ index }) => index}
                                scale={scale.scaleBand}
                                contentInset={{ top: 10, bottom: 10, left: 20, right: 20 }}
                                spacing={0.2}
                                formatLabel={(value) => value}
                                style={{ marginLeft: 65 }}
                            //numberOfTicks={wordFreqBarGraphData[0].value}
                            />
                            <Text style={{ textAlign: 'center' }}>Frequency</Text>
                        </View>
                    )}
                    <View style={{ height: '20%', width: '100%' }}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Button
                                title="Horizontal"
                                onPress={() => setBarGraphVertical(false)}
                                color={Styles.MHMRBlue}
                                radius={50}
                                containerStyle={{
                                    width: 200,
                                    marginHorizontal: 30,
                                    //marginVertical: 10,
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
                                    //marginVertical: 10,
                                }}
                            />
                        </View>
                    </View>

                </View>

                <View style={{ height: '10%', width: '100%' }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
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

            <View style={{}}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>

                </View>
            </View>
        </View>
    );
};

export default DataAnalysisBarGraph;
