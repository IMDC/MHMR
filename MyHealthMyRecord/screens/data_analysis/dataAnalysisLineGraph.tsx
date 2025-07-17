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
  FlatList,
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
import {useDropdownContext} from '../../providers/videoSetProvider';
import {useSetLineGraphData} from '../../components/lineGraphData';
import {useWordList} from '../../providers/wordListProvider';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const DataAnalysisLineGraph = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route: any = useRoute();
  const wordLabel = route.params?.word;
  const lineData = route.params?.data;
  const realm = useRealm();
  const {currentVideoSet} = useDropdownContext();
  const {wordList} = useWordList();

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
  const [selectedWords, setSelectedWords] = useState([]);
  const [showWordPicker, setShowWordPicker] = useState(false);
  const [tempSelectedWords, setTempSelectedWords] = useState(new Set());

  // Get the line graph data generation function
  const setLineGraphData = useSetLineGraphData();

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

  // Chart layout constants
  const axesSvg = {fontSize: 14, fill: '#333'};
  const verticalContentInset = {top: 20, bottom: 20};
  const xAxisHeight = 40;
  const chartHeight = windowHeight * 0.5;
  const rectY = verticalContentInset.top;
  const rectHeight =
    chartHeight - verticalContentInset.top - verticalContentInset.bottom;

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

  const scrollLeft = () => {
    scrollViewRef.current?.scrollTo({x: 0, animated: true});
  };

  const scrollRight = () => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  };

  // Generate available words for selection
  const generateAvailableWords = () => {
    console.log('generateAvailableWords - wordList:', wordList);

    if (!wordList || !Array.isArray(wordList)) {
      console.log('wordList is empty or not an array');
      return [];
    }

    // Filter out the current word and already selected words
    const availableWords = wordList
      .filter(word => word.text !== wordLabel) // Exclude current word
      .filter(
        word => !selectedWords.some(selected => selected.word === word.text),
      ) // Exclude already selected words
      .map(word => word.text)
      .sort();

    console.log('Available words result:', availableWords);
    return availableWords;
  };

  // Add word for comparison
  const addWordForComparison = (word: string) => {
    if (selectedWords.length >= 2) return; // Limit to 2 additional words (3 total)

    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#FF8E53',
      '#9B59B6',
      '#3498DB',
      '#E74C3C',
      '#2ECC71',
    ];

    // Get currently used colors
    const usedColors = selectedWords.map(wordData => wordData.color);

    // Find the first available color that's not currently used
    const availableColor =
      colors.find(color => !usedColors.includes(color)) ||
      colors[selectedWords.length % colors.length];

    setSelectedWords([...selectedWords, {word, color: availableColor}]);
    setShowWordPicker(false);
  };

  // Remove word from comparison
  const removeWordFromComparison = (wordToRemove: string) => {
    setSelectedWords(selectedWords.filter(word => word.word !== wordToRemove));
  };

  // Toggle word selection in modal
  const toggleWordSelection = (word: string) => {
    setTempSelectedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  // Apply selected words from modal
  const applySelectedWords = () => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#FF8E53',
      '#9B59B6',
      '#3498DB',
      '#E74C3C',
      '#2ECC71',
    ];

    const newWords = Array.from(tempSelectedWords).map((word, index) => ({
      word,
      color: colors[index % colors.length],
    }));

    setSelectedWords(newWords);
    setTempSelectedWords(new Set());
    setShowWordPicker(false);
  };

  // Open word picker modal
  const openWordPicker = () => {
    setTempSelectedWords(new Set(selectedWords.map(w => w.word)));
    setShowWordPicker(true);
  };

  // Get data for the main word
  let mainWordData =
    periodValue === '1'
      ? freqDayArray[date] || []
      : periodValue === '2'
      ? freqWeekArray[date] || []
      : freqSetRangeArray || [];

  // If main word data is empty, try to generate it using the same logic as comparison words
  if (!mainWordData || mainWordData.length === 0) {
    console.log('Main word data is empty, generating from currentVideoSet...');
    if (currentVideoSet && Array.isArray(currentVideoSet) && wordLabel) {
      const generatedData = setLineGraphData(currentVideoSet, wordLabel);
      mainWordData =
        periodValue === '1'
          ? generatedData.byHour[date] || []
          : periodValue === '2'
          ? generatedData.byWeek[date] || []
          : generatedData.byRange || [];
    }
  }

  // Debug logging
  console.log('mainWordData:', mainWordData);
  console.log('periodValue:', periodValue);
  console.log('date:', date);
  console.log('freqDayArray:', freqDayArray);
  console.log('freqWeekArray:', freqWeekArray);
  console.log('freqSetRangeArray:', freqSetRangeArray);

  // Get data for comparison words
  const getComparisonWordData = (word: string) => {
    // Get actual data for the comparison word using the same logic as main word
    if (!currentVideoSet || !currentVideoSet.frequencyData) {
      console.log('No frequencyData found for comparison word:', word);
      return [];
    }

    try {
      // Parse the frequency data from the video set
      const parsedData = currentVideoSet.frequencyData
        .filter(item => typeof item === 'string')
        .map(item => JSON.parse(item));

      console.log(
        'Comparison word data for:',
        word,
        'parsedData length:',
        parsedData.length,
      );

      // Use the same line graph data generation logic for the comparison word
      const comparisonData = setLineGraphData(parsedData, word);

      console.log(
        'Comparison data for:',
        word,
        'comparisonData:',
        comparisonData,
      );

      // Return the appropriate data based on period value
      if (periodValue === '1') {
        return comparisonData.byHour[date] || [];
      } else if (periodValue === '2') {
        return comparisonData.byWeek[date] || [];
      } else if (periodValue === '3') {
        return comparisonData.byRange || [];
      }

      return [];
    } catch (error) {
      console.error('Error generating comparison data for word:', word, error);
      return [];
    }
  };

  // Combine all data for display
  const allWordsData = [
    {
      word: wordLabel,
      data: mainWordData,
      color: 'rgb(' + Styles.MHMRBlueRGB + ')',
    },
    ...selectedWords.map(wordData => ({
      word: wordData.word,
      data: getComparisonWordData(wordData.word),
      color: wordData.color,
    })),
  ];

  const selectedData = mainWordData || []; // Keep for compatibility with fallback

  // Gather all y values from all visible lines for axis scaling
  const allYValues = allWordsData
    .map(wordObj => (wordObj.data || []).map(item => item?.value ?? 0))
    .flat();
  // If no data, fallback to [0]
  const yValuesForAxis = allYValues.length > 0 ? allYValues : [0];

  // Prepare multi-line data for single LineChart
  const multiLineData = [
    {
      data: selectedData.map(item => item?.value ?? 0),
      svg: {
        stroke: 'rgb(' + Styles.MHMRBlueRGB + ')',
        strokeWidth: 4,
        opacity: 0.9,
      },
      key: wordLabel,
      color: 'rgb(' + Styles.MHMRBlueRGB + ')',
    },
    ...selectedWords.map(wordData => {
      const comparisonData = getComparisonWordData(wordData.word);
      return {
        data: (comparisonData || []).map(item => item?.value ?? 0),
        svg: {stroke: wordData.color, strokeWidth: 3, opacity: 0.8},
        key: wordData.word,
        color: wordData.color,
      };
    }),
  ];

  // Find the longest data array among all lines for X axis and chart width
  const xAxisData = multiLineData.reduce(
    (longest, series) =>
      series.data.length > longest.length ? series.data : longest,
    multiLineData[0]?.data || [],
  );

  // Decorator for all lines' dots
  const MultiLineDots = ({x, y, data}) => (
    <>
      {data.map((series, seriesIdx) =>
        series.data.map((value, idx) =>
          value > 0 ? (
            <Circle
              key={`${series.key}-dot-${idx}`}
              cx={x(idx)}
              cy={y(value)}
              r={seriesIdx === 0 ? 8 : 6}
              stroke={series.color}
              fill={'white'}
              strokeWidth={seriesIdx === 0 ? 2 : 2}
              onPressIn={
                seriesIdx === 0
                  ? () => handlePressIn(selectedData[idx])
                  : undefined
              }
            />
          ) : null,
        ),
      )}
    </>
  );

  if (!selectedData || selectedData.length === 0) {
    return <Text>No data available for the selected period.</Text>;
  }

  let minValue = Math.min(...yValuesForAxis);
  let maxValue = Math.max(...yValuesForAxis);

  // Add a buffer to the min and max values to prevent dots from being too close to the edges
  const buffer = 0.5;
  minValue = minValue - buffer < 0 ? 0 : minValue - buffer;
  // Optionally add a small buffer to maxValue for visual padding
  maxValue = maxValue + buffer;

  const chartWidth = Math.max(windowWidth * 0.95, selectedData.length * 32);

  const chartCardStyle = {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: '3%',
    marginTop: 18,
    marginBottom: 10,
    paddingVertical: 18,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 100,
        backgroundColor: '#F6F8FB',
        minHeight: windowHeight,
      }}>
      <View style={{minHeight: windowHeight, width: '100%'}}>
        <View id="linegraph" style={chartCardStyle}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingRight: 0,
              marginBottom: 10,
            }}>
            <Text
              style={{
                paddingLeft: 10,
                paddingBottom: 10,
                fontSize: 22,
                color: '#222',
                fontWeight: 'bold',
                flex: 1,
                flexWrap: 'wrap',
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
                  <View
                    style={[styles.legendBox, {backgroundColor: '#d0d0d0'}]}
                  />
                  <Text style={styles.legendText}>Weekday</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendBox, {backgroundColor: '#707070'}]}
                  />
                  <Text style={styles.legendText}>Weekend</Text>
                </View>
              </View>
            )}
          </View>

          {/* Word Selection UI */}
          <View style={styles.wordSelectionContainer}>
            <View style={styles.selectedWordsContainer}>
              {/* Main word chip */}
              <View key={wordLabel} style={styles.wordChip}>
                <View
                  style={[
                    styles.wordColorIndicator,
                    {backgroundColor: 'rgb(' + Styles.MHMRBlueRGB + ')'},
                  ]}
                />
                <Text style={styles.wordChipText}>{wordLabel}</Text>
                <Text style={styles.mainWordLabel}>(Main)</Text>
              </View>
              {/* Comparison word chips */}
              {selectedWords &&
                Array.isArray(selectedWords) &&
                selectedWords.map((wordData, index) => (
                  <View key={wordData.word} style={styles.wordChip}>
                    <View
                      style={[
                        styles.wordColorIndicator,
                        {backgroundColor: wordData.color},
                      ]}
                    />
                    <Text style={styles.wordChipText}>{wordData.word}</Text>
                    <TouchableOpacity
                      onPress={() => removeWordFromComparison(wordData.word)}
                      style={styles.removeWordButton}>
                      <Icon name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
            {selectedWords && selectedWords.length < 2 && (
              <TouchableOpacity
                onPress={openWordPicker}
                style={styles.addWordButton}>
                <Icon name="add" size={20} color="white" />
                <Text style={styles.addWordButtonText}>Add Word</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Modern Axes Layout */}
          <View
            style={{
              height: chartHeight + xAxisHeight,
              paddingHorizontal: 0,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <YAxis
              data={yValuesForAxis}
              yAccessor={({item}: {item: any}) => item}
              style={{marginBottom: xAxisHeight, width: 40}}
              contentInset={verticalContentInset}
              svg={axesSvg}
              min={0}
              max={maxValue}
              numberOfTicks={maxValue < 4 ? maxValue : 4}
              formatLabel={value => Math.round(value)}
            />

            {/* Chart and X Axis */}
            <View style={{flex: 1, marginLeft: 10}}>
              <ScrollView
                horizontal
                ref={scrollViewRef}
                showsHorizontalScrollIndicator={false}>
                <View style={{width: chartWidth}}>
                  {/* Chart */}
                  <LineChart
                    style={{height: chartHeight, width: chartWidth}}
                    data={multiLineData}
                    yMin={0}
                    yMax={maxValue || 1}
                    contentInset={verticalContentInset}>
                    <Grid />
                    {/* Rect overlays (segments) */}
                    {periodValue === '1' && (
                      <>
                        {Array.from({
                          length: Math.ceil(
                            selectedData.length / (parseInt(segementDay) || 12),
                          ),
                        }).map((_, i) => (
                          <Rect
                            key={i}
                            x={
                              i *
                              (chartWidth /
                                Math.ceil(
                                  selectedData.length /
                                    (parseInt(segementDay) || 12),
                                ))
                            }
                            y={rectY}
                            width={
                              chartWidth /
                              Math.ceil(
                                selectedData.length /
                                  (parseInt(segementDay) || 12),
                              )
                            }
                            height={rectHeight}
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
                            y={rectY}
                            width={chartWidth / 2.45}
                            height={rectHeight}
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
                            y={rectY}
                            width={chartWidth / 3}
                            height={rectHeight}
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
                            y={rectY}
                            width={chartWidth / selectedData.length}
                            height={rectHeight}
                            fill={isWeekend(item.label) ? '#707070' : '#d0d0d0'}
                            opacity={0.5}
                          />
                        ))}
                      </>
                    )}
                    {/* Dots for all lines */}
                    <MultiLineDots data={multiLineData} />
                  </LineChart>
                  {/* X Axis below the chart, scrolls together */}
                  <XAxis
                    style={{marginHorizontal: 0, height: xAxisHeight}}
                    data={xAxisData}
                    xAccessor={({index}) => index}
                    scale={scale.scaleLinear}
                    formatLabel={(value, index) => {
                      // Only show label if value is not empty/zero/undefined in any series
                      const mainVal = selectedData[index]?.value;
                      const anyVal = multiLineData.some(
                        series =>
                          series.data[index] && series.data[index] !== 0,
                      );
                      if (!anyVal) return '';
                      if (periodValue === '1') {
                        return hours[index % 24];
                      } else if (periodValue === '2') {
                        return weeks[index % 7];
                      } else {
                        // Prefer main word's label, fallback to undefined
                        return selectedData[index]?.label ?? '';
                      }
                    }}
                    contentInset={{left: 10, right: 10}}
                    svg={axesSvg}
                  />
                </View>
              </ScrollView>
            </View>
          </View>

          <Text
            style={{
              textAlign: 'center',
              fontSize: 20,
              color: 'black',
              // marginTop: -25,
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={[styles.modalText, {textAlign: 'center'}]}>
                View video(s) with this data
              </Text>
              <FlatList
                data={videoIDs}
                persistentScrollbar={true}
                keyExtractor={item => item._id.toString()}
                renderItem={({item}) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={styles.videoItemContainer}>
                      <Text style={styles.videoIDText}>{item.title}</Text>
                      <Text style={styles.dateText}>
                        at {item.datetimeRecorded.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.iconContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('Fullscreen Video', {
                            id: item._id,
                          });
                          setModalVisible(false);
                        }}
                        style={styles.iconButton}>
                        <Icon
                          name="play-circle-outline"
                          type="ionicon"
                          size={24}
                          color="blue"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('Text Report', {
                            filterVideoId: item._id.toString(),
                          });
                          setModalVisible(false);
                        }}
                        style={styles.iconButton}>
                        <Icon
                          name="document-text-outline"
                          type="ionicon"
                          size={24}
                          color="green"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
              <Button
                title="Close"
                color={Styles.MHMRBlue}
                radius={50}
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </Modal>

        {/* Word Picker Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showWordPicker}
          onRequestClose={() => setShowWordPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.centeredModalView}>
              <Text style={[styles.modalText, {fontSize: 22, marginBottom: 4}]}>
                Compare Words
              </Text>
              <Text
                style={[
                  styles.modalSubtext,
                  {
                    marginBottom: 18,
                    fontSize: 15,
                    color:
                      tempSelectedWords.size >= 2 ? Styles.MHMRBlue : '#666',
                  },
                ]}>
                Select up to 2 words to compare
              </Text>
              <ScrollView
                style={{width: '100%', marginBottom: 10}}
                contentContainerStyle={{
                  alignItems: 'center',
                  paddingBottom: 10,
                }}>
                <View style={styles.chipGridContainer}>
                  {(() => {
                    const availableWords = generateAvailableWords();
                    if (!availableWords || availableWords.length === 0) {
                      return (
                        <View style={{padding: 20, alignItems: 'center'}}>
                          <Text style={{color: 'gray', fontSize: 16}}>
                            No words available
                          </Text>
                          <Text
                            style={{
                              color: 'gray',
                              fontSize: 14,
                              marginTop: 10,
                            }}>
                            Make sure videos have transcripts with word counts
                          </Text>
                        </View>
                      );
                    }
                    return availableWords.map((word, index) => {
                      const selected = tempSelectedWords.has(word);
                      const disabled = tempSelectedWords.size >= 2 && !selected;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.wordChipModal,
                            selected && styles.wordChipModalSelected,
                            disabled && styles.wordChipModalDisabled,
                          ]}
                          onPress={() => toggleWordSelection(word)}
                          disabled={disabled}
                          activeOpacity={0.7}>
                          <Text
                            style={[
                              styles.wordChipModalText,
                              selected && styles.wordChipModalTextSelected,
                              disabled && styles.wordChipModalTextDisabled,
                            ]}>
                            {word}
                          </Text>
                          {selected && (
                            <Icon
                              name="check"
                              size={16}
                              color="white"
                              style={{marginLeft: 4}}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    });
                  })()}
                </View>
              </ScrollView>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setTempSelectedWords(new Set());
                    setShowWordPicker(false);
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.applyButton,
                    {opacity: tempSelectedWords.size > 0 ? 1 : 0.5},
                  ]}
                  onPress={applySelectedWords}
                  disabled={tempSelectedWords.size === 0}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  btnStyle: {
    width: '100%',
    minWidth: 120,
    maxWidth: 180,
    paddingVertical: 10,
    backgroundColor: Styles.MHMRBlue,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 300,
    maxWidth: 500,
    width: '90%',
    minHeight: 320,
    maxHeight: 600,
    alignSelf: 'center',
  },
  modalText: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  videoIDText: {
    fontSize: 16,
    color: Styles.MHMRBlue,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 15,
    color: '#444',
  },
  videoItemContainer: {
    marginVertical: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    gap: 10,
  },
  dropdown: {
    width: '45%',
    paddingHorizontal: 10,
    backgroundColor: '#F0F2F5',
    borderRadius: 18,
    minHeight: 44,
    marginHorizontal: 5,
  },
  filterTitle: {
    fontSize: 22,
    marginLeft: '5%',
    marginTop: 10,
    fontWeight: 'bold',
    color: '#222',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    gap: 10,
  },
  dropdownGroup: {
    flex: 1,
    minWidth: 120,
    marginHorizontal: 6,
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    fontWeight: '600',
  },
  periodDropdown: {
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#F0F2F5',
    borderRadius: 18,
    minHeight: 44,
    marginVertical: 2,
  },
  overlayArrow: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 30,
    padding: 2,
    top: '40%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginLeft: 10,
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
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  legendText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  wordSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: 10,
    gap: 8,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  wordColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  wordChipText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
  },
  removeWordButton: {
    padding: 2,
    marginLeft: 4,
    backgroundColor: '#d9534f',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },
  addWordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Styles.MHMRBlue,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addWordButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '600',
  },
  wordOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: '100%',
  },
  wordOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Styles.MHMRBlue,
    borderColor: Styles.MHMRBlue,
  },
  wordOptionText: {
    fontSize: 16,
    color: '#222',
    flex: 1,
    fontWeight: '500',
  },
  wordOptionDisabled: {
    color: '#ccc',
  },
  mainWordLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  modalSubtext: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
    color: '#666',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: Styles.MHMRBlue,
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chipGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 10,
    minHeight: 60,
  },
  wordChipModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    minWidth: 60,
    minHeight: 36,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  wordChipModalSelected: {
    backgroundColor: Styles.MHMRBlue,
  },
  wordChipModalDisabled: {
    opacity: 0.5,
  },
  wordChipModalText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  wordChipModalTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  wordChipModalTextDisabled: {
    color: '#bbb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    // Remove centering here so only the modalView content is centered
  },
  centeredModalView: {
    width: '90%',
    height: '50%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 300,
    maxWidth: 500,
    minHeight: 320,
    maxHeight: 600,
    justifyContent: 'flex-start',
  },
  iconButton: {
    padding: 5,
  },
});

export default DataAnalysisLineGraph;
