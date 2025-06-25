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
import Svg, {Circle, Rect} from 'react-native-svg';
import {LineChart, Grid, YAxis, XAxis} from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import * as Styles from '../../assets/util/styles';
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useRealm} from '../../models/VideoData';
import {useDropdownContext} from '../../components/videoSetProvider';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const DataAnalysisLineGraph = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route: any = useRoute();
  const wordLabel = route.params?.word;
  const lineData = route.params?.data;
  const realm = useRealm();
  const {currentVideoSet} = useDropdownContext();

  const [freqDayArray, setFreqDayArray] = useState([[]]);
  const [freqWeekArray, setFreqWeekArray] = useState([[]]);
  const [freqSetRangeArray, setFreqSetRangeArray] = useState([]);
  const [dateOptionsForHours, setDateOptionsForHours] = useState([]);
  const [dateOptionsForWeeks, setDateOptionsForWeeks] = useState([]);
  const [dateOptionsForSetRange, setDateOptionsForSetRange] = useState<
    {label: string; value: number}[]
  >([]);
  const [periodValue, setPeriodValue] = useState('3');
  const [segementDay, setSegementDayValue] = useState('12');
  const [segementWeek, setSegementWeekValue] = useState('2');
  const [segementSetRange, setSegementSetRangeValue] = useState('2');
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

      // Sort range options chronologically
      const sortedDatesForRange = [...lineData.datesForRange].sort(
        (a, b) => a.value - b.value,
      );

      const sortedFreqSetRangeArray = [...lineData.byRange].sort((a, b) => {
        const [monthA, dayA] = a.label.split('-').map(Number);
        const [monthB, dayB] = b.label.split('-').map(Number);

        const dateA = new Date(2000, monthA - 1, dayA); // Month is 0-indexed
        const dateB = new Date(2000, monthB - 1, dayB);

        return dateA - dateB; // Sort in ascending order
      });

      // Log the sorted data for debugging
      console.log(
        'Video Set Dates - sortedDatesForRange:',
        sortedDatesForRange,
      );
      console.log(
        'Video Set Dates - sortedFreqSetRangeArray:',
        sortedFreqSetRangeArray,
      );

      setDateOptionsForSetRange(sortedDatesForRange); // Use sorted range options
      setFreqSetRangeArray(sortedFreqSetRangeArray); // Use sorted range data
    }
  }, [periodValue]);

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

  const weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Function to determine if a date is a weekend
  const isWeekend = (dateStr: string) => {
    const [month, day] = dateStr.split('-').map(Number);
    // Get the year from the first video in the set
    const currentYear = lineData?.datesForHours?.[0]?.label
      ? new Date(lineData.datesForHours[0].label).getFullYear()
      : new Date().getFullYear(); // Fallback to current year if no data
    const date = new Date(currentYear, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
  };

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

  const segementWeekOptions = [{label: 'Start/Mid/End', value: '3'}];

  const segementSetRangeOptions = [{label: 'Weekday/Weekend', value: '2'}];

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

  const Dots = ({x, y}) => (
    <>
      {selectedData
      .filter(value => value.value > 0) //dots on for frequency > 0
      .map((value, index) => (
        <Circle
          key={index}
          cx={x(selectedData.indexOf(value))}
          cy={y(value.value)}
          r={8}
          stroke={'black'}
          fill={'white'}
          onPressIn={() => handlePressIn(value)}
        />
      ))}
    </>
  );

  const scrollLeft = () => {
    scrollViewRef.current?.scrollTo({x: 0, animated: true});
  };

  const scrollRight = () => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  };
  const selectedData =
    periodValue === '1'
      ? freqDayArray[date] || []
      : periodValue === '2'
      ? freqWeekArray[date] || []
      : //: freqSetRangeArray.filter(item => item.value >= 1) || [];
        freqSetRangeArray || [];

  if (selectedData.length === 0) {
    return <Text>No data available for the selected period.</Text>;
  }

  const dataValues = selectedData.map(item => item.value);

  let minValue = Math.min(...dataValues); // Use the smallest value in the data
  let maxValue = Math.max(...dataValues); // Use the largest value in the data

  // Add a buffer to the min and max values to prevent dots from being too close to the edges
  const buffer = 0.5;
  minValue = minValue - buffer < 0 ? 0 : minValue - buffer; // Ensure minValue doesn't go below 0
  maxValue = maxValue;

  const chartWidth = Math.max(windowWidth * 0.95, selectedData.length * 32);

  return (
    <ScrollView contentContainerStyle={{paddingBottom: 100}}>
      <View style={{height: '100%'}}>
        <View id="linegraph">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }}>
            <Text
              style={{
                padding: 20,
                fontSize: 20,
                color: 'black',
                fontWeight: 'bold',
              }}>
              Word count of "{wordLabel}" over time
              {periodValue === '1'
                ? ` for ${dateOptionsForHours[date]?.label}`
                : periodValue === '2'
                ? ` for the week of ${dateOptionsForWeeks[date]?.label}`
                : periodValue === '3'
                ? ` for the video set dates`
                : ''}
            </Text>
            {periodValue === '3' && (
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#d0d0d0' }]} />
                  <Text style={styles.legendText}>Weekday</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#707070' }]} />
                  <Text style={styles.legendText}>Weekend</Text>
                </View>
              </View>
            )}
          </View>
          <View style={{flexDirection: 'row', flex: 1}}>
            <View style={{width: 50, justifyContent: 'center'}}>
              <Text
                style={{
                  transform: [{rotate: '270deg'}],
                  textAlign: 'center',
                  fontSize: 18,
                  color: 'black',
                  width: 60,
                }}>
                Count
              </Text>
            </View>
            <View style={{flexDirection: 'row', flex: 1}}>
              <YAxis
                data={selectedData}
                yAccessor={({item}) => item?.value || 0}
                style={{marginBottom: xAxisHeight, marginRight: 5}}
                contentInset={{
                  top: windowHeight * 0.6 * 0.035,
                  bottom: windowHeight * 0.6 * 0.1,
                }}
                svg={{fontSize: 18, fill: 'black'}}
                min={0}
                max={maxValue}
                numberOfTicks={maxValue < 4 ? maxValue : 4}
                formatLabel={value => Math.round(value)}
              />
              <TouchableOpacity
                onPress={scrollLeft}
                style={[styles.overlayArrow, {left: 5}]}>
                <Icon name="keyboard-arrow-left" size={40} color="black" />
              </TouchableOpacity>
              <ScrollView horizontal={true} ref={scrollViewRef}>
                <View
                  style={{
                    height: windowHeight * 0.6,
                    width: chartWidth,
                    left: periodValue === '3' ? 0 : 0,
                    right: periodValue === '3' ? 0 : 0,
                    top: 0,
                    bottom: 0,
                  }}>
                  <LineChart
                    style={{height: 200, flex: 1}}
                    data={selectedData}
                    contentInset={{top: 13, bottom: 2, left: 4, right: 10}}
                    yAccessor={({item}) => item.value || 0}
                    xAccessor={({index}) => index}
                    yMin={0}
                    yMax={maxValue}
                    svg={{
                      stroke: 'rgb(' + Styles.MHMRBlueRGB + ')',
                      strokeWidth: 5,
                    }}>
                    <Grid />
                    {periodValue === '1' && (
                      <>
                        {Array.from({
                          length: Math.ceil(
                            selectedData.length / parseInt(segementDay),
                          ),
                        }).map((_, i) => (
                          <Rect
                            key={i}
                            x={
                              i *
                              (chartWidth /
                                Math.ceil(
                                  selectedData.length / parseInt(segementDay),
                                ))
                            }
                            y={0}
                            width={
                              chartWidth /
                              Math.ceil(
                                selectedData.length / parseInt(segementDay),
                              )
                            }
                            height={windowHeight * 0.6}
                            fill={i % 2 === 0 ? '#d0d0d0' : '#909090'}
                            opacity={0.5}
                          />
                        ))}
                      </>
                    )}
                    {periodValue === '2' && segementWeek === '2' && (
                      <>
                        {Array.from({length: 3}).map((_, i) => (
                          <Rect
                            key={i}
                            x={i * (chartWidth / 2.45)}
                            y={0}
                            width={chartWidth / 2.45}
                            height={windowHeight * 0.6}
                            fill={
                              i === 0
                                ? '#d0d0d0'
                                : i === 1
                                ? '#d0d0d0'
                                : '#707070'
                            }
                            opacity={0.5}
                          />
                        ))}
                      </>
                    )}
                    {periodValue === '2' && segementWeek === '3' && (
                      <>
                        {Array.from({length: 3}).map((_, i) => (
                          <Rect
                            key={i}
                            x={i * (chartWidth / 3)}
                            y={0}
                            width={chartWidth / 3}
                            height={windowHeight * 0.6}
                            fill={
                              i === 0
                                ? '#d0d0d0'
                                : i === 1
                                ? '#909090'
                                : '#707070'
                            }
                            opacity={0.5}
                          />
                        ))}
                      </>
                    )}
                    {periodValue === '3' && segementSetRange === '2' && (
                      <>
                        {selectedData.map((item, i) => (
                          <Rect
                            key={i}
                            x={i * (chartWidth / selectedData.length)}
                            y={0}
                            width={chartWidth / selectedData.length}
                            height={windowHeight * 0.6}
                            fill={
                              isWeekend(item.label) ? '#707070' : '#d0d0d0'
                            }
                            opacity={0.5}
                          />
                        ))}
                      </>
                    )}
                    <Dots />
                  </LineChart>

                  <XAxis
                    style={{
                      marginHorizontal: 0,
                      height: 80,
                      marginVertical: -5,
                    }}
                    data={selectedData}
                    xAccessor={({index}) => index}
                    scale={scale.scaleLinear}
                    formatLabel={(value, index) => {
                      // Only show label if value > 0
                      if (selectedData[index]?.value > 0) {
                        if (periodValue === '1') {
                          return hours[index % 24];
                        } else if (periodValue === '2') {
                          return weeks[index % 7];
                        } else {
                          return selectedData[index]?.label ?? '';
                        }
                      }
                      return ''; // Return empty string for values <= 0
                    }}
                    contentInset={{
                      left:
                        periodValue === '1'
                          ? 45
                          : periodValue === '2'
                          ? 20
                          : 20,
                      right:
                        periodValue === '1'
                          ? 0
                          : periodValue === '2'
                          ? 20
                          : 9,
                      top: 0,
                      bottom: 0,
                    }}
                    svg={{
                      fontSize: periodValue === '1' ? 14 : 14,
                      fill: 'black',
                      rotation:
                        periodValue === '1'
                          ? -45
                          : periodValue === '3'
                          ? -30
                          : 0,
                      originY:
                        periodValue === '1'
                          ? 30
                          : periodValue === '3'
                          ? 35
                          : 0,
                      textAnchor: periodValue === '1' ? 'end' : 'middle',
                      dy: periodValue === '1' ? 0 : 10,
                    }}
                  />
                </View>
              </ScrollView>
              <TouchableOpacity
                onPress={scrollRight}
                style={[styles.overlayArrow, {right: 5}]}>
                <Icon name="keyboard-arrow-right" size={40} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 20,
              color: 'black',
              marginTop: -25,
            }}>
            {periodValue === '1'
              ? 'Hour'
              : periodValue === '2'
              ? 'Weekday'
              : 'Video Dates'}
          </Text>
          {periodValue != '3' && (
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
                  dropdownPosition="top"
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
          )}
        </View>

        <View style={{paddingHorizontal: 20}}>
          <Text style={[styles.filterTitle, {marginBottom: 10}]}>
            Filter and sort
          </Text>

          <View style={styles.filterContainer}>
            <View style={styles.dropdownGroup}>
              <Text style={styles.dropdownLabel}>Select period:</Text>
              <Dropdown
                dropdownPosition="top"
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

            <View style={styles.dropdownGroup}>
              <Text style={styles.dropdownLabel}>Select segment option:</Text>
              <Dropdown
                dropdownPosition="top"
                data={
                  periodValue === '1'
                    ? segementDayOptions
                    : periodValue === '2'
                    ? segementWeekOptions
                    : segementSetRangeOptions
                }
                style={styles.periodDropdown}
                labelField="label"
                valueField="value"
                placeholder="Weekend/Weekday"
                value={
                  periodValue === '1'
                    ? segementDay
                    : periodValue === '2'
                    ? segementWeek
                    : segementSetRange
                }
                onChange={item => {
                  periodValue === '1'
                    ? setSegementDayValue(item.value)
                    : periodValue === '2'
                    ? setSegementWeekValue(item.value)
                    : setSegementSetRangeValue(item.value);
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
                <Text style={styles.videoItemContainer}>
                  <Text style={styles.videoIDText}>{video?.title}</Text>
                  <Text style={styles.dateText}>
                    {' '}
                    at {video?.datetimeRecorded.toLocaleString()}
                  </Text>
                </Text>
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
    fontSize: 16,
    color: 'blue',
  },
  dateText: {
    fontSize: 16,
    color: 'black',
  },
  videoItemContainer: {
    marginVertical: 10,
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
  overlayArrow: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 30,
    padding: 5,
    top: windowHeight > 800 ? '40%' : '45%', // Adjust for taller screens
  },
  legendContainer: {
    position: 'absolute',
    right: 20,
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  legendBox: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: 'black',
  },
});

export default DataAnalysisLineGraph;
