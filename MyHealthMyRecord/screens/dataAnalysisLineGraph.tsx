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
import Svg, {Circle} from 'react-native-svg';
import {LineChart, Grid, YAxis, XAxis} from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import * as Styles from '../assets/util/styles';
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useRealm} from '../models/VideoData';
import {useDropdownContext} from '../components/videoSetProvider';

const DataAnalysisLineGraph = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route: any = useRoute();
  const wordLabel = route.params?.word;
  const lineData = route.params?.data;
  const realm = useRealm();
  const {currentVideoSet} = useDropdownContext();

  const [freqDayArray, setFreqDayArray] = useState([[]]);
  const [freqWeekArray, setFreqWeekArray] = useState([[]]);
  const [freqSetRangeArray, setFreqSetRangeArray] = useState([[]]);
  const [dateOptionsForHours, setDateOptionsForHours] = useState([]);
  const [dateOptionsForWeeks, setDateOptionsForWeeks] = useState([]);
  const [dateOptionsForSetRange, setDateOptionsForSetRange] = useState<
    {label: string; value: number}[]
  >([]);
  const [periodValue, setPeriodValue] = useState('1');
  const [segementDay, setSegementDayValue] = useState('12');
  const [segementWeek, setSegementWeekValue] = useState('1');
  const [date, setDateValue] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoIDs, setVideoIDs] = useState([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const getWeeksBetweenDates = (startDate: Date, endDate: Date) => {
    // Validate input dates
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new Error('Invalid date objects provided.');
    }

    if (startDate > endDate) {
      return []; // Return an empty array if the start date is after the end date
    }

    const weeks: {label: string; value: number}[] = [];
    let currentDate = new Date(startDate);

    // Align to the previous Sunday for the start date
    while (currentDate.getDay() !== 0) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    let weekCounter = 0;
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Ensure the weekEnd doesn't exceed the endDate
      if (weekEnd > endDate) {
        weekEnd.setTime(endDate.getTime());
      }

      weeks.push({
        label: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
        value: weekCounter,
      });

      currentDate.setDate(currentDate.getDate() + 7);
      weekCounter++;
    }

    return weeks;
  };

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

      // Use datesForWeeks directly
      setDateOptionsForWeeks(lineData.datesForWeeks);
      setFreqWeekArray(lineData.byWeek);

      // Set range options
      setFreqSetRangeArray(lineData.bySetRange);
      const rangeOptions = lineData.datesForWeeks.map((week, index) => ({
        label: week.label,
        value: index,
      }));
      setDateOptionsForSetRange(rangeOptions);
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
    {label: 'Weekly', value: '2'},
    {label: 'Video set dates', value: '3'},
  ];

  const segementDayOptions = [
    {label: '1 hour', value: '1'},
    {label: '3 hour', value: '3'},
    {label: '6 hour', value: '6'},
    {label: '12 hour', value: '12'},
  ];

  const segementWeekOptions = [
    {label: 'By Day', value: '1'},
    {label: 'Weekday/Weekend', value: '2'},
    {label: 'Start/Mid/End', value: '3'},
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
              onPressIn={() => handlePressIn(value)}
              onPressOut={() => console.log('end')}
            />
          ))}
        {periodValue == '2' &&
          freqWeekArray[date]?.map((value, index) => (
            <Circle
              key={index}
              cx={x(index)}
              cy={y(value.value)}
              r={8}
              stroke={'rgb(0, 0, 0)'}
              fill={'white'}
              onPressIn={() => handlePressIn(value)}
              onPressOut={() => console.log('end')}
            />
          ))}
        {periodValue == '3' &&
          freqSetRangeArray.map((value, index) => (
            <Circle
              key={index}
              cx={x(index)}
              cy={y(value.value)}
              r={8}
              stroke={'rgb(0, 0, 0)'}
              fill={'white'}
              onPressIn={() => handlePressIn(value)}
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
                data={
                  periodValue == '1'
                    ? freqDayArray[date]
                    : periodValue == '2'
                    ? freqWeekArray[date]
                    : freqSetRangeArray
                }
                yAccessor={({item}) => item.value}
                style={{marginBottom: xAxisHeight}}
                contentInset={verticalContentInset}
                svg={axesSvg}
                numberOfTicks={5}
              />

              <TouchableOpacity
                onPress={scrollLeft}
                style={styles.iconContainer}>
                <Icon name="keyboard-arrow-left" size={40} color="black" />
              </TouchableOpacity>
              <ScrollView horizontal={true} ref={scrollViewRef}>
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
                    data={
                      periodValue == '1'
                        ? freqDayArray[date]
                        : periodValue == '2'
                        ? freqWeekArray[date]
                        : freqSetRangeArray
                    }
                    yAccessor={({item}) => item.value}
                    xScale={scale.scaleTime}
                    contentInset={verticalContentInset}
                    svg={{
                      stroke: 'rgb(' + Styles.MHMRBlueRGB + ')',
                      strokeWidth: 5,
                    }}>
                    <Grid />
                    <Dots />
                  </LineChart>
                  <XAxis
                    style={{marginHorizontal: -20, height: xAxisHeight}}
                    data={
                      periodValue == '1'
                        ? freqDayArray[0] // Use the first day's hourly data
                        : periodValue == '2'
                        ? freqWeekArray[0] // Use the first week's daily data
                        : freqSetRangeArray // Use the range data
                    }
                    scale={scale.scaleLinear}
                    formatLabel={(value, index) => {
                      if (periodValue == '1') {
                        return hours[index % 24];
                      } else if (periodValue == '2') {
                        return weeks[index % 7];
                      } else {
                        return dateOptionsForSetRange[index]?.label || '';
                      }
                    }}
                    labelStyle={{margin: 5}}
                    contentInset={{left: 50, right: 50}}
                    svg={axesSvg}
                  />
                </View>
              </ScrollView>
              <TouchableOpacity
                onPress={scrollRight}
                style={[styles.iconContainer, {right: 0}]}>
                <Icon name="keyboard-arrow-right" size={40} color="black" />
              </TouchableOpacity>
            </View>
            <View style={{height: '10%', width: '100%'}}>
              <View style={styles.navigationContainer}>
                <Button
                  disabled={date == 0}
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
                    }
                  }}
                />

                <Dropdown
                  data={
                    periodValue == '1'
                      ? dateOptionsForHours
                      : periodValue == '2'
                      ? dateOptionsForWeeks
                      : dateOptionsForSetRange
                  }
                  maxHeight={300}
                  style={styles.dropdown}
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
                      date >= dateOptionsForHours.length - 1) ||
                    (periodValue == '2' &&
                      date >= dateOptionsForWeeks.length - 1) ||
                    (periodValue == '3' &&
                      date >= dateOptionsForSetRange.length - 1)
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
                    setDateValue(date + 1);
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.filterTitle}>Filter and sort</Text>
          <View style={styles.filterContainer}>
            <View id="period-dropdown">
              <Text style={styles.dropdownLabel}>Select period: </Text>
              <Dropdown
                data={periodOptions}
                maxHeight={300}
                style={styles.periodDropdown}
                labelField="label"
                valueField="value"
                value={periodValue}
                onChange={item => {
                  setPeriodValue(item.value);
                  setDateValue(0);
                }}
              />
            </View>

            <View id="segmentDay-dropdown">
              <Text style={styles.dropdownLabel}>Select segment option: </Text>
              <Dropdown
                data={
                  periodValue == '1'
                    ? segementDayOptions
                    : periodValue == '2'
                    ? segementWeekOptions
                    : []
                }
                style={styles.periodDropdown}
                labelField="label"
                valueField="value"
                value={periodValue == '1' ? segementDay : segementWeek}
                onChange={item => {
                  periodValue == '1'
                    ? setSegementDayValue(item.value)
                    : setSegementWeekValue(item.value);
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
  navigationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  dropdown: {
    width: '40%',
    paddingHorizontal: 20,
    backgroundColor: '#DBDBDB',
    borderRadius: 22,
  },
  filterTitle: {
    fontSize: 25,
    marginLeft: '5%',
    marginTop: 5,
  },
  filterContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  dropdownLabel: {
    fontSize: 20,
  },
  periodDropdown: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#DBDBDB',
    borderRadius: 22,
  },
});

export default DataAnalysisLineGraph;
