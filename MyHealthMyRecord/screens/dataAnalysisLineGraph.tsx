import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  LogBox,
} from 'react-native';
import {Button, Icon} from '@rneui/themed';
import {Dropdown} from 'react-native-element-dropdown';
import Svg, {Circle, G, Line, Rect} from 'react-native-svg';
import {LineChart, BarChart, Grid, YAxis, XAxis} from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import * as Styles from '../assets/util/styles';
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useRealm} from '../models/VideoData';
import {transparent} from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

const DataAnalysisLineGraph = () => {
  const [previousButtonState, setPreviousButtonState] = useState(false);
  const [nextButtonState, setNextButtonState] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route: any = useRoute();
  const wordLabel = route.params?.word;
  const lineData = route.params?.data;
  const realm = useRealm();

  const [freqDayArray, setFreqDayArray] = useState([[]]);
  const [freqWeekArray, setFreqWeekArray] = useState([[]]);
  const [freqMonthArray, setFreqMonthArray] = useState([[]]);
  const [dateOptionsForHours, setDateOptionsForHours] = useState([]);
  const [dateOptionsForWeeks, setDateOptionsForWeeks] = useState([]);
  const [dateOptionsForMonths, setDateOptionsForMonths] = useState([]);
  const [periodValue, setPeriodValue] = useState('1');
  const [segementDay, setSegementDayValue] = useState('12');
  const [segementWeek, setSegementWeekValue] = useState('1');
  const [segementMonth, setSegementMonthValue] = useState('1');
  const [date, setDateValue] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoIDs, setVideoIDs] = useState([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state.',
    ]);
  });

  useEffect(() => {
    if (wordLabel == undefined) {
      Alert.alert(
        'No Word Selected',
        'Please select a word from the bar graph to view the word count over time.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } else {
      setFreqDayArray(lineData.byHour);
      setDateOptionsForHours(lineData.datesForHours);
      setFreqWeekArray(lineData.byWeek);
      setDateOptionsForWeeks(lineData.datesForWeeks);
      setFreqMonthArray(lineData.byMonth);
      setDateOptionsForMonths(lineData.datesForMonths);
    }
  }, [periodValue]);

  const windowWidth = Dimensions.get('window').width;

  const axesSvg = {fontSize: 20, fill: 'grey'};
  const verticalContentInset = {top: 10, bottom: 10};
  const xAxisHeight = 30;

  const hours = [
    '12AM',
    '1AM',
    '2AM',
    '3AM',
    '4AM',
    '5AM',
    '6AM',
    '7AM',
    '8AM',
    '9AM',
    '10AM',
    '11AM',
    '12PM',
    '1PM',
    '2PM',
    '3PM',
    '4PM',
    '5PM',
    '6PM',
    '7PM',
    '8PM',
    '9PM',
    '10PM',
    '11PM',
  ];

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weeks = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const periodOptions = [
    {label: 'Daily', value: '1'},
    // {label: 'Weekly', value: '2'},
    {label: 'Monthly', value: '3'},
  ];

  const segementDayOptions = [
    {label: '1 hour', value: '1'},
    {label: '3 hour', value: '3'},
    {label: '6 hour', value: '6'},
    {label: '12 hour', value: '12'},
  ];

  const segementWeekOptions = [
    {label: 'Every Other Day', value: '1'},
    {label: 'Weekday/Weekend', value: '2'},
  ];

  const segementMonthOptions = [
    {label: 'Every Other Month', value: '1'},
    {label: 'Every 2 Months', value: '2'},
    {label: 'Quarters', value: '3'},
    {label: 'Thirds', value: '4'},
    {label: 'Half Year', value: '6'},
  ];

  const handlePressIn = async value => {
    try {
      const videoDataArray = await Promise.all(
        value.videoIDs.map(async videoID => {
          try {
            const objectId = new Realm.BSON.ObjectId(videoID);
            const videoData = realm.objectForPrimaryKey('VideoData', objectId);
            if (videoData) {
              return videoData;
            } else {
              console.error(`Video with ID ${videoID} not found`);
              return null;
            }
          } catch (error) {
            console.error(`Error retrieving video with ID ${videoID}:`, error);
            return null;
          }
        }),
      );
      const filteredVideoDataArray = videoDataArray.filter(
        video => video !== null,
      );
      console.log(filteredVideoDataArray);
      setVideoIDs(filteredVideoDataArray);
      setModalVisible(true);
    } catch (error) {
      console.error('Error in handlePressIn:', error);
    }
  };

  const Dots = (props: Partial<DecoratorProps>) => {
    const {x, y, data} = props;
    return (
      <>
        {periodValue == '1' &&
          freqDayArray[date]?.map((value, index) => (
            <Circle
              key={index}
              cx={x(index)}
              cy={y(value.value)}
              r={8}
              stroke={'rgb(0, 0, 0)'}
              fill={'white'}
              onPressIn={() => {
                handlePressIn(value);
                console.log(value);
              }}
              onPressOut={() => console.log('end')}
            />
          ))}
        {periodValue == '3' &&
          freqMonthArray[date]?.map((value, index) => (
            <Circle
              key={index}
              cx={x(index)}
              cy={y(value.value)}
              r={8}
              stroke={'rgb(0, 0, 0)'}
              fill={'white'}
              onPressIn={() => {
                handlePressIn(value);
                console.log(value);
              }}
              onPressOut={() => console.log('end')}
            />
          ))}
      </>
    );
  };

  const scrollLeft = () => {
    scrollViewRef.current?.scrollTo({x: 0, animated: true});
  };

  const scrollRight = () => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  };

  return (
    <ScrollView>
      <View style={{paddingBottom: '10%'}}>
        <View>
          <View>
            <Text style={{padding: 20, fontSize: 20}}>
              Word count of "{wordLabel}" over time
            </Text>
            <View
              id="linegraph"
              style={{height: 600, padding: 20, flexDirection: 'row'}}>
              <YAxis
                data={freqDayArray[date]}
                yAccessor={({item}) => item.value}
                style={{marginBottom: xAxisHeight}}
                contentInset={verticalContentInset}
                svg={axesSvg}
                numberOfTicks={Math.max(
                  ...freqDayArray[date]?.map(item => item.value),
                )}
              />

              <TouchableOpacity
                onPress={scrollLeft}
                style={styles.iconContainer}>
                <Icon name="keyboard-arrow-left" size={40} color="black" />
              </TouchableOpacity>
              <ScrollView horizontal={true} ref={scrollViewRef}>
                {periodValue == '1' && (
                  <View
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      marginRight: 10,
                      width:
                        windowWidth > 768 ? windowWidth * 1.5 : windowWidth * 2,
                    }}>
                    <LineChart
                      style={{flex: 1}}
                      data={freqDayArray[date]}
                      yAccessor={({item}) => item.value}
                      xScale={scale.scaleTime}
                      contentInset={verticalContentInset}
                      svg={{
                        stroke: 'rgb(' + Styles.MHMRBlueRGB + ')',
                        strokeWidth: 5,
                      }}>
                      <Svg belowChart={true}>
                        {segementDay == '12' && (
                          <Rect
                            x="0%"
                            y="0"
                            width="52%"
                            height="100%"
                            fill="rgb(194, 200, 209)"
                          />
                        )}
                        {segementDay == '6' && (
                          <>
                            <Rect
                              x="0%"
                              y="0"
                              width="26%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="52%"
                              y="0"
                              width="26%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                          </>
                        )}
                        {segementDay == '3' && (
                          <>
                            <Rect
                              x="0%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="26%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="52%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="77%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                          </>
                        )}
                        {segementDay == '1' && (
                          <>
                            <Rect
                              x="0%"
                              y="0"
                              width="5.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="9.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="18%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="26.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="35%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="43.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="52%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="60.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="69%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="77.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="86%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="94.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                          </>
                        )}
                      </Svg>
                      <Grid />
                      <Dots />
                    </LineChart>
                    <XAxis
                      style={{marginHorizontal: -40, height: xAxisHeight}}
                      data={freqDayArray[0]}
                      scale={scale.scaleTime}
                      formatLabel={(value, index) =>
                        hours[freqDayArray[0][index].label]
                      }
                      labelStyle={{margin: 5}}
                      contentInset={{left: 50, right: 50}}
                      svg={axesSvg}
                    />
                  </View>
                )}
                {periodValue == '2' && (
                  <View
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      marginRight: 10,
                      width: windowWidth * 1.5,
                    }}>
                    <LineChart
                      style={{flex: 1}}
                      data={freqWeekArray[date]}
                      yAccessor={({item}) => item.value}
                      xScale={scale.scaleTime}
                      contentInset={verticalContentInset}
                      svg={{
                        stroke: 'rgb(' + Styles.MHMRBlueRGB + ')',
                        strokeWidth: 5,
                      }}>
                      <Svg belowChart={true}>
                        {segementDay == '12' && (
                          <Rect
                            x="0%"
                            y="0"
                            width="52%"
                            height="100%"
                            fill="rgb(194, 200, 209)"
                          />
                        )}
                        {segementDay == '6' && (
                          <>
                            <Rect
                              x="0%"
                              y="0"
                              width="26%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="52%"
                              y="0"
                              width="26%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                          </>
                        )}
                        {segementDay == '3' && (
                          <>
                            <Rect
                              x="0%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="26%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="52%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="77%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                          </>
                        )}
                        {segementDay == '1' && (
                          <>
                            <Rect
                              x="0%"
                              y="0"
                              width="5.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="9.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="18%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="26.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="35%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="43.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="52%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="60.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="69%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="77.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="86%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="94.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                          </>
                        )}
                      </Svg>
                      <Grid />
                      <Dots />
                    </LineChart>
                    <XAxis
                      style={{marginHorizontal: -40, height: xAxisHeight}}
                      data={freqWeekArray[0]}
                      scale={scale.scaleTime}
                      formatLabel={(value, index) =>
                        weeks[freqWeekArray[0][index].label]
                      }
                      labelStyle={{margin: 5}}
                      contentInset={{left: 50, right: 50}}
                      svg={axesSvg}
                    />
                  </View>
                )}
                {periodValue == '3' && (
                  <View
                    style={{
                      flex: 1,
                      marginLeft: 10,
                      marginRight: 10,
                      width: windowWidth * 1.5,
                    }}>
                    <LineChart
                      style={{flex: 1}}
                      data={freqMonthArray[date]}
                      yAccessor={({item}) => item.value}
                      xScale={scale.scaleTime}
                      contentInset={verticalContentInset}
                      svg={{
                        stroke: 'rgb(' + Styles.MHMRBlueRGB + ')',
                        strokeWidth: 5,
                      }}>
                      <Svg belowChart={true}>
                        {segementDay == '12' && (
                          <Rect
                            x="0%"
                            y="0"
                            width="52%"
                            height="100%"
                            fill="rgb(194, 200, 209)"
                          />
                        )}
                        {segementDay == '6' && (
                          <>
                            <Rect
                              x="0%"
                              y="0"
                              width="26%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="52%"
                              y="0"
                              width="26%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                          </>
                        )}
                        {segementDay == '3' && (
                          <>
                            <Rect
                              x="0%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="26%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="52%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="77%"
                              y="0"
                              width="13%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                          </>
                        )}
                        {segementDay == '1' && (
                          <>
                            <Rect
                              x="0%"
                              y="0"
                              width="5.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="9.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="18%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="26.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="35%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="43.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="52%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="60.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="69%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="77.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="86%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                            <Rect
                              x="94.5%"
                              y="0"
                              width="4.25%"
                              height="100%"
                              fill="rgb(194, 200, 209)"
                            />
                          </>
                        )}
                      </Svg>
                      <Grid />
                      <Dots />
                    </LineChart>
                    <XAxis
                      style={{marginHorizontal: -40, height: xAxisHeight}}
                      data={freqMonthArray[0]}
                      scale={scale.scaleTime}
                      formatLabel={(value, index) =>
                        months[freqMonthArray[0][index].label]
                      }
                      labelStyle={{margin: 5}}
                      contentInset={{left: 50, right: 50}}
                      svg={axesSvg}
                    />
                  </View>
                )}
              </ScrollView>
              <TouchableOpacity
                onPress={scrollRight}
                style={[styles.iconContainer, {right: 0}]}>
                <Icon name="keyboard-arrow-right" size={40} color="black" />
              </TouchableOpacity>
            </View>

            <View style={{height: '10%', width: '100%'}}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                }}>
                <Button
                  disabled={date == 0 ? true : false}
                  buttonStyle={styles.btnStyle}
                  title="Previous period"
                  color={Styles.MHMRBlue}
                  radius={50}
                  icon={{
                    name: 'arrow-left',
                    type: 'font-awesome',
                    size: 15,
                    color: 'white',
                  }}
                  onPress={() => {
                    if (date > 0) {
                      setDateValue(date - 1);
                    } else {
                      console.log('There is no previous date');
                    }
                  }}
                />

                <Dropdown
                  data={
                    periodValue == '1'
                      ? dateOptionsForHours
                      : dateOptionsForMonths
                  }
                  maxHeight={300}
                  style={{
                    width: '40%',
                    paddingHorizontal: 20,
                    backgroundColor: '#DBDBDB',
                    borderRadius: 22,
                  }}
                  placeholderStyle={{fontSize: 20}}
                  selectedTextStyle={{fontSize: 20}}
                  labelField="label"
                  valueField="value"
                  value={date}
                  onChange={item => {
                    setDateValue(item.value);
                  }}
                />
                <Button
                  disabled={
                    (periodValue == '1' &&
                      date < dateOptionsForHours.length - 1) ||
                    (periodValue == '2' &&
                      date < dateOptionsForWeeks.length - 1) ||
                    (periodValue == '3' &&
                      date < dateOptionsForMonths.length - 1)
                      ? false
                      : true
                  }
                  title="Next period"
                  buttonStyle={styles.btnStyle}
                  color={Styles.MHMRBlue}
                  radius={50}
                  iconPosition="right"
                  icon={{
                    name: 'arrow-right',
                    type: 'font-awesome',
                    size: 15,
                    color: 'white',
                  }}
                  onPress={() => {
                    if (
                      date < dateOptionsForHours.length - 1 ||
                      date < dateOptionsForMonths.length - 1
                    ) {
                      setDateValue(date + 1);
                    } else {
                      console.log('There is no next date');
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </View>
        <View>
          <Text style={{fontSize: 25, marginLeft: '5%', marginTop: 5}}>
            Filter and sort
          </Text>

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
            }}>
            <View id="period-dropdown">
              <Text style={{fontSize: 20}}>Select period: </Text>
              <Dropdown
                data={periodOptions}
                maxHeight={300}
                style={{
                  width: '100%',
                  paddingHorizontal: 20,
                  backgroundColor: '#DBDBDB',
                  borderRadius: 22,
                }}
                labelField="label"
                valueField="value"
                value={periodValue}
                onChange={item => {
                  setPeriodValue(item.value);
                  console.log('item.label', item.label);
                  console.log('item.value', item.value);
                }}
              />
            </View>
            {/* daily */}

            <View id="segmentDay-dropdown">
              <Text style={{fontSize: 20}}>Select segment option: </Text>
              <Dropdown
                data={
                  periodValue == '1' ? segementDayOptions : segementMonthOptions
                }
                style={{
                  width: '100%',
                  paddingHorizontal: 20,
                  backgroundColor: '#DBDBDB',
                  borderRadius: 22,
                }}
                labelField="label"
                valueField="value"
                value={periodValue == '1' ? segementDay : segementMonth}
                onChange={item => {
                  periodValue == '1'
                    ? setSegementDayValue(item.value)
                    : setSegementMonthValue(item.value);
                }}
              />
            </View>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>View video(s) with this data</Text>
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  btnStyle: {
    width: Styles.windowWidth * 0.22,
  },

  iconContainer: {
    justifyContent: 'center',
  },

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

export default DataAnalysisLineGraph;
