import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {Alert, Dimensions, ScrollView, Text, View} from 'react-native';
import {Button} from '@rneui/themed';
import {Dropdown} from 'react-native-element-dropdown';
import Svg, {Circle, G, Line, Rect} from 'react-native-svg';
import {LineChart, BarChart, Grid, YAxis, XAxis} from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import * as Styles from '../assets/util/styles';

const DataAnalysisLineGraph = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const route: any = useRoute();
  const wordLabel = route.params?.word;
  const lineData = route.params?.data;

  //const freqDayArray = lineData.byHour;
  //const dateOptions = lineData.dates;

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

  const [freqDayArray, setFreqDayArray] = useState([freqDayTemplate]);
  const [dateOptions, setDateOptions] = useState([]);

  useEffect(() => {
    if (wordLabel == undefined) {
      Alert.alert(
        'No Word Selected',
        'Please select a word from the bar graph to view the word count over time.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } else {
      setFreqDayArray(lineData.byHour);
      setDateOptions(lineData.dates);
    }
  }, []);

  /* ======================================================================= */
  // Line graph stuff below
  /* ======================================================================= */

  const windowWidth = Dimensions.get('window').width;

  const axesSvg = {fontSize: 20, fill: 'grey'};
  const verticalContentInset = {top: 10, bottom: 10};
  const xAxisHeight = 30;

  // can delete commented stuff below
  /*     const freqMonth = [
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
    
        const freqDay = [
            {
                label: 0,
                value: 0,
            },
            {
                label: 1,
                value: 0,
            },
            {
                label: 2,
                value: 0,
            },
            {
                label: 3,
                value: 0,
            },
            {
                label: timestamp1.getHours(),
                value: 1,
            },
            {
                label: 5,
                value: 0,
            },
            {
                label: 6,
                value: 0,
            },
            {
                label: 7,
                value: 0,
            },
            {
                label: 8,
                value: 0,
            },
            {
                label: 9,
                value: 0,
            },
            {
                label: 10,
                value: 0,
            },
            {
                label: 11,
                value: 0,
            },
            {
                label: timestamp2.getHours(),
                value: 6,
            },
            {
                label: 13,
                value: 0,
            },
            {
                label: 14,
                value: 0,
            },
            {
                label: timestamp3.getHours(),
                value: 3,
            },
            {
                label: 16,
                value: 0,
            },
            {
                label: 17,
                value: 0,
            },
            {
                label: 18,
                value: 0,
            },
            {
                label: 19,
                value: 0,
            },
            {
                label: 20,
                value: 0,
            },
            {
                label: 21,
                value: 0,
            },
            {
                label: 22,
                value: 0,
            },
            {
                label: 23,
                value: 0,
            },
        ]
    
        const freqDay26 = [
            {
                label: 0,
                value: 0,
            },
            {
                label: 1,
                value: 0,
            },
            {
                label: 2,
                value: 0,
            },
            {
                label: 3,
                value: 0,
            },
            {
                label: 4,
                value: 0,
            },
            {
                label: 5,
                value: 0,
            },
            {
                label: 6,
                value: 7,
            },
            {
                label: 7,
                value: 0,
            },
            {
                label: 8,
                value: 0,
            },
            {
                label: 9,
                value: 0,
            },
            {
                label: 10,
                value: 0,
            },
            {
                label: 11,
                value: 0,
            },
            {
                label: 12,
                value: 6,
            },
            {
                label: 13,
                value: 0,
            },
            {
                label: 14,
                value: 0,
            },
            {
                label: 15,
                value: 0,
            },
            {
                label: 16,
                value: 2,
            },
            {
                label: 17,
                value: 5,
            },
            {
                label: 18,
                value: 0,
            },
            {
                label: 19,
                value: 0,
            },
            {
                label: 20,
                value: 0,
            },
            {
                label: 21,
                value: 0,
            },
            {
                label: 22,
                value: 0,
            },
            {
                label: 23,
                value: 0,
            },
        ]
    
        const freqDay27 = [
            {
                label: 0,
                value: 2,
            },
            {
                label: 1,
                value: 4,
            },
            {
                label: 2,
                value: 6,
            },
            {
                label: 3,
                value: 0,
            },
            {
                label: 4,
                value: 0,
            },
            {
                label: 5,
                value: 0,
            },
            {
                label: 6,
                value: 0,
            },
            {
                label: 7,
                value: 0,
            },
            {
                label: 8,
                value: 0,
            },
            {
                label: 9,
                value: 0,
            },
            {
                label: 10,
                value: 0,
            },
            {
                label: 11,
                value: 0,
            },
            {
                label: 12,
                value: 0,
            },
            {
                label: 13,
                value: 0,
            },
            {
                label: 14,
                value: 0,
            },
            {
                label: 15,
                value: 4,
            },
            {
                label: 16,
                value: 2,
            },
            {
                label: 17,
                value: 1,
            },
            {
                label: 18,
                value: 4,
            },
            {
                label: 19),
                value: 0,
            },
            {
                label: 20,
                value: 0,
            },
            {
                label: 21,
                value: 0,
            },
            {
                label: 22,
                value: 0,
            },
            {
                label: 23,
                value: 0,
            },
        ] */

  //const freqDayArray = [freqDay, freqDay26, freqDay27];

  // can be used for monthly x - axis labels
  const month = [
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
  const monthAbrev = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  //console.log(month[(new Date(2023, 0, 1)).getMonth()]);

  // used for line chart x axis labels
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

  /* ======================================================================= */
  // DROP DOWN STUFF
  /* ======================================================================= */

  const [periodValue, setPeriodValue] = useState('1');
  const [segementDay, setSegementDayValue] = useState('12');
  const [segementWeek, setSegementWeekValue] = useState('1');
  const [segementMonth, setSegementMonthValue] = useState('1');
  const [date, setDateValue] = useState(0);

  const periodOptions = [
    {label: 'Daily', value: '1'},
    {label: 'Weekly', value: '2'},
    {label: 'Monthly', value: '3'},
  ];

  const segementDayOptions = [
    {label: '1 hour', value: '1'},
    //{ label: '2 hour', value: '2' },
    {label: '3 hour', value: '3'},
    //{ label: '4 hour', value: '4' },
    //{ label: '5 hour', value: '5' },
    {label: '6 hour', value: '6'},
    //{ label: '7 hour', value: '7' },
    //{ label: '8 hour', value: '8' },
    //{ label: '9 hour', value: '9' },
    //{ label: '10 hour', value: '10' },
    //{ label: '11 hour', value: '11' },
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
    /* { label: '5 month', value: '5' }, */
    {label: 'Half Year', value: '6'},
  ];

  /* const dateOptions = [
        { label: timestamp1.toDateString(), value: 0 },
        { label: new Date('2023-10-26T23:59:59').toDateString(), value: 1 },
        { label: new Date('2023-10-27T23:59:59').toDateString(), value: 2 },
    ]; */

  /* ======================================================================= */
  // DOT STUFF
  /* ======================================================================= */

  interface DecoratorProps {
    x: (arg: number) => number;
    y: (arg: number) => number;
    data: number[];
  }

  // Dots on the peaks/points of line graph data
  const Dots = (props: Partial<DecoratorProps>) => {
    const {x, y, data} = props;
    return (
      <>
        {freqDayArray[date]?.map((value, index) => (
          <Circle
            key={index}
            cx={x(index)}
            cy={y(value.value)}
            r={8}
            stroke={'rgb(0, 0, 0)'}
            fill={'white'}
            onPressIn={() => {
              // redirect to videos associated with timestamp
              console.log('start');
              Alert.alert(
                'View video(s) with this data',

                // Iterate through videoIDs
                // Display the videoID title in a TouchableOpacity
                // OnPress, navigate to the video
                value.videoIDs.toString(),
                [
                  {
                    text: 'OK',
                    onPress: () => console.log('go to video function here'),
                  },
                
                  {
                    text: 'CLOSE',
                    onPress: () => console.log('CLOSE pressed'),
                  },
                ],
              );
            }}
            onPressOut={() => {
              // reference state change during onPressOut from barGraph page
              console.log('end');
            }}
          />
        ))}
      </>
    );
  };

  return (
    <View>
      <View style={{height: '87%'}}>
        <View>
          <Text style={{padding: 20, fontSize: 20}}>
            Word Count of "{wordLabel}" over time
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
            />

            <ScrollView horizontal={true}>
              <View
                style={{
                  flex: 1,
                  marginLeft: 10,
                  marginRight: 10,
                  width: windowWidth * 1.5,
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
                    {/* day/night - 12 hour */}
                    {segementDay == '12' && (
                      <Rect
                        x="0%"
                        y="0"
                        width="52%"
                        height="100%"
                        fill="rgb(194, 200, 209)"
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
                    {/* 3 hour */}
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
                    {/* 1 hour */}
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
            </ScrollView>
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
                title="Previous"
                color={Styles.MHMRBlue}
                radius={50}
                //style={{ marginLeft: 20, marginRight: 20, paddingLeft: 20, paddingRight: 20 }}
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
                data={dateOptions}
                maxHeight={300}
                style={{
                  width: 400,
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
                title="Next"
                color={Styles.MHMRBlue}
                radius={50}
                //style={{ marginLeft: 20, marginRight: 20, paddingLeft: 20, paddingRight: 20 }}
                iconPosition="right"
                icon={{
                  name: 'arrow-right',
                  type: 'font-awesome',
                  size: 15,
                  color: 'white',
                }}
                onPress={() => {
                  if (date < dateOptions.length - 1) {
                    setDateValue(date + 1);
                  } else {
                    console.log('There is no next date');
                  }
                }}
              />
            </View>
          </View>

          <Text style={{fontSize: 25, marginLeft: 20, marginTop: 20}}>
            Filter and Sort
          </Text>

          <View style={{height: '10%', width: '100%'}}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
              }}>
              <View id="period-dropdown">
                <Text style={{fontSize: 20}}>Select Period: </Text>
                <Dropdown
                  data={periodOptions}
                  maxHeight={300}
                  style={{
                    width: 300,
                    paddingHorizontal: 20,
                    backgroundColor: '#DBDBDB',
                    borderRadius: 22,
                  }}
                  labelField="label"
                  valueField="value"
                  value={periodValue}
                  onChange={item => {
                    setPeriodValue(item.value);
                  }}
                />
              </View>
              {periodValue == '1' && (
                <View id="segmentDay-dropdown">
                  <Text style={{fontSize: 20}}>Select Segment Option: </Text>
                  <Dropdown
                    data={segementDayOptions}
                    //maxHeight={300}
                    style={{
                      width: 300,
                      paddingHorizontal: 20,
                      backgroundColor: '#DBDBDB',
                      borderRadius: 22,
                    }}
                    labelField="label"
                    valueField="value"
                    value={segementDay}
                    onChange={item => {
                      setSegementDayValue(item.value);
                    }}
                  />
                </View>
              )}
              {periodValue == '2' && (
                <View id="segmentWeek-dropdown">
                  <Text style={{fontSize: 20}}>Select Segment Option: </Text>
                  <Dropdown
                    data={segementWeekOptions}
                    //maxHeight={300}
                    style={{
                      width: 300,
                      paddingHorizontal: 20,
                      backgroundColor: '#DBDBDB',
                      borderRadius: 22,
                    }}
                    labelField="label"
                    valueField="value"
                    value={segementWeek}
                    onChange={item => {
                      setSegementWeekValue(item.value);
                    }}
                  />
                </View>
              )}
              {periodValue == '3' && (
                <View id="segmentMonth-dropdown">
                  <Text style={{fontSize: 20}}>Select Segment Option: </Text>
                  <Dropdown
                    data={segementMonthOptions}
                    //maxHeight={300}
                    style={{
                      width: 300,
                      paddingHorizontal: 20,
                      backgroundColor: '#DBDBDB',
                      borderRadius: 22,
                    }}
                    labelField="label"
                    valueField="value"
                    value={segementMonth}
                    onChange={item => {
                      setSegementMonthValue(item.value);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
export default DataAnalysisLineGraph;
