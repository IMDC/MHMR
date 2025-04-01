import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {VideoData, useRealm, useObject} from '../models/VideoData';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Dimensions,
  Switch,
  TouchableOpacity,
  LogBox,
  Modal,
  StyleSheet,
  FlatList,
} from 'react-native';
import {Button, Icon, CheckBox} from '@rneui/themed';
import {LineChart, BarChart, Grid, YAxis, XAxis} from 'react-native-svg-charts';
import Svg, * as svg from 'react-native-svg';
import * as scale from 'd3-scale';
import {Rect} from 'react-native-svg';
import {Dropdown} from 'react-native-element-dropdown';
import * as Styles from '../assets/util/styles';
import {useSetLineGraphData} from '../components/lineGraphData';
import {useDropdownContext} from '../components/videoSetProvider';
import {useWordList} from '../components/wordListProvider';
import {Alert} from 'react-native';
import WordRemovalModal from '../components/wordRemovalModal';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const setLineGraphData = useSetLineGraphData();

const chunkData = (data, maxItems = 50) => {
  if (!data || data.length <= maxItems) return data;

  // Sort by value in descending order
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Take top maxItems items and return them without creating an "Others" category
  return sortedData.slice(0, maxItems);
};

const DataAnalysisBarGraph = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute();
  const barData = route.params?.data;
  const sentimentData = route.params?.sentimentData;

  const transformedFreqMaps = route.params?.freqMaps.map(freqMap => ({
    ...freqMap,
    videoID: freqMap.videoID.toHexString(),
  }));

  const [freqMaps, setFreqMaps] = useState(transformedFreqMaps);
  const [wordFreqBarGraphData, setWordFreqBarGraphData] = useState(
    barData.dataNoStop,
  );
  //const wordFreqBarGraphData = data.data;

  const [filteredWordFreqBarGraphData, setFilteredWordFreqBarGraphData] =
    useState([]);

  const realm = useRealm();
  //   const video: any = useObject('VideoData', id);

  const {currentVideoSet} = useDropdownContext();

  /* ======================================================================= */
  // bar graph stuff below
  /* ======================================================================= */

  const [barGraphVertical, setBarGraphVertical] = useState(true);
  const horizontalScrollViewRef = useRef<ScrollView>(null);
  const verticalScrollViewRef = useRef<ScrollView>(null);

  // array of length of max value in data (first index value) for yAxis
  const yTest = Array.from(
    {
      length:
        filteredWordFreqBarGraphData.length > 0 &&
        filteredWordFreqBarGraphData[0].value
          ? filteredWordFreqBarGraphData[0].value
          : 0,
    },
    (_, i) => i + 1,
  );

  /* on press functionality for word frequency bar graph */
  const [wordSelected, setWordSelected] = useState<number | null>(null);
  const wordFreq = filteredWordFreqBarGraphData.map((item, index) => ({
    y: item,
    svg: {
      onPressIn: () => {
        console.log(filteredWordFreqBarGraphData[index]);
        setWordSelected(index);
      },
      onPressOut: () => {
        setWordSelected(null);
      },
      //fill: wordSelected === index ? '#55C45E' : 'rgba(134, 65, 244, 0.8)',
    },
  }));

  /**
   * Labels on each bar with the frequency value for the vertical view
   */
  const CUT_OFF_VER = (filteredWordFreqBarGraphData[0]?.value || 1) - 1;
  const LabelsVertical = ({x, y, bandwidth, data}) =>
    filteredWordFreqBarGraphData.map((value, index) => {
      // Only show labels for bars that are tall enough to be significant
      if (value.value < filteredWordFreqBarGraphData[0].value * 0.05)
        return null;

      return (
        <svg.Text
          key={index}
          x={x(index) + bandwidth / 2 - 10}
          y={
            value.value > CUT_OFF_VER
              ? y(value.value) + 20
              : y(value.value) - 15
          }
          fontSize={16}
          fill={value.value > CUT_OFF_VER ? 'white' : 'black'}
          alignmentBaseline={'middle'}>
          {value.value}
        </svg.Text>
      );
    });

  /**
   * Labels on each bar with the frequency value for the vertical view
   */
  const CUT_OFF_HOR = (filteredWordFreqBarGraphData[0]?.value || 1) - 1;
  const LabelsHorizontal = ({x, y, bandwidth, data}) =>
    filteredWordFreqBarGraphData.map((value, index) => (
      <svg.Text
        key={index}
        x={
          value.value > CUT_OFF_HOR ? x(value.value) - 30 : x(value.value) + 10
        }
        y={y(index) + bandwidth / 2}
        fontSize={14}
        fill={value.value > CUT_OFF_HOR ? 'white' : 'black'}
        alignmentBaseline={'middle'}>
        {value.value}
      </svg.Text>
    ));

  const isEnabledStopWords = false;
  const [isEnabledMedWords, setIsEnabledMedWords] = useState(true);
  const toggleSwitchMedWords = () =>
    setIsEnabledMedWords(previousState => !previousState);

  function updateData() {
    let newWordFreqBarGraphData;
    if (!isEnabledMedWords && !isEnabledStopWords) {
      newWordFreqBarGraphData = barData.dataNone;
    } else if (!isEnabledStopWords) {
      newWordFreqBarGraphData = barData.dataNoStop;
    } else if (!isEnabledMedWords) {
      newWordFreqBarGraphData = barData.dataNoMed;
    } else {
      newWordFreqBarGraphData = barData.data;
    }

    // Filter out the "other" category
    newWordFreqBarGraphData = newWordFreqBarGraphData.filter(
      item => item.text.toLowerCase() !== 'other',
    );

    setWordFreqBarGraphData(newWordFreqBarGraphData);
    setFilteredWordFreqBarGraphData(newWordFreqBarGraphData);
  }

  useEffect(() => {
    // Initial data setup - filter out "other" category
    const initialData = barData.dataNoStop.filter(
      item => item.text.toLowerCase() !== 'other',
    );
    setWordFreqBarGraphData(initialData);
    setFilteredWordFreqBarGraphData(initialData);
  }, []);

  useEffect(() => {
    updateData();
  }, [isEnabledMedWords]);

  useEffect(() => {
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state.',
    ]);
  });

  const scrollLeft = () => {
    horizontalScrollViewRef.current?.scrollTo({x: 0, animated: true});
  };

  const scrollRight = () => {
    horizontalScrollViewRef.current?.scrollToEnd({animated: true});
  };

  const scrollUp = () => {
    verticalScrollViewRef.current?.scrollTo({y: 0, animated: true});
  };

  const scrollDown = () => {
    verticalScrollViewRef.current?.scrollToEnd({animated: true});
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [videoIDs, setVideoIDs] = useState([]);
  const {wordList, selectedWords, toggleWordSelection, updateWordList} =
    useWordList();

  const handleSentimentPress = async sentiment => {
    try {
      const videoIDsSet = new Set(currentVideoSet.videoIDs);
      const videos = await realm
        .objects('VideoData')
        .filtered(`sentiment == "${sentiment}"`);
      const filteredVideos = videos.filter(video =>
        videoIDsSet.has(video._id.toString()),
      );
      setVideoIDs(filteredVideos);
      setModalVisible(true);
    } catch (error) {
      console.error('Error in handleSentimentPress:', error);
    }
  };

  const applyWordSelection = () => {
    const filteredData = wordFreqBarGraphData.filter(
      item => !selectedWords.has(item.text),
    );
    setFilteredWordFreqBarGraphData(filteredData);
    updateWordList(filteredData); // Sync globally
    setEditModalVisible(false);
  };

  useEffect(() => {
    if (yTest.length !== undefined) {
      const filteredData = wordFreqBarGraphData.filter(
        item => !selectedWords.has(item.text),
      );
      // Apply chunking to the filtered data
      const chunkedData = chunkData(filteredData);
      setFilteredWordFreqBarGraphData(chunkedData);
    } else {
      Alert.alert(
        'Cannot create graphs',
        'No data available for this video set. Please add more videos to the video set.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    }
  }, [editModalVisible, wordFreqBarGraphData]);

  // Calculate appropriate height based on data size
  const calculateBarHeight = () => {
    const baseHeight = 600;
    const wordCount = filteredWordFreqBarGraphData.length;

    if (wordCount > 50) {
      return Math.min(baseHeight * 1.5, 800); // Cap at 800 for very large datasets
    }

    return baseHeight;
  };

  // Create a function to handle word selection and navigation
  const handleWordSelection = wordLabel => {
    console.log('Selected word:', wordLabel);
    const result = setLineGraphData(freqMaps, wordLabel);
    navigation.navigate('Line Graph', {
      word: wordLabel,
      data: result,
    });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={{height: '100%'}}>
          <View id="bargraph" style={{flex: 1}}>
            {barGraphVertical ? (
              <View id="bargraph-vertical" style={{flex: 1}}>
                <Text
                  style={{
                    padding: 20,
                    fontSize: 20,
                    color: 'black',
                    fontWeight: 'bold',
                  }}>
                  {currentVideoSet?.name} - Count of words mentioned in selected
                  video set
                </Text>
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
                      data={yTest}
                      yAccessor={({index}) => index}
                      contentInset={{top: 10, bottom: 10}}
                      spacing={0.2}
                      formatLabel={value => Math.round(value)} // Ensure whole numbers
                      numberOfTicks={Math.min(
                        6, // Maximum number of ticks is 6
                        Math.ceil(filteredWordFreqBarGraphData[0]?.value || 1), // Dynamically calculate ticks based on data
                      )}
                      min={0}
                      max={filteredWordFreqBarGraphData[0]?.value || 0}
                      numberOfTicks={Math.min(
                        10,
                        filteredWordFreqBarGraphData[0]?.value || 0,
                      )}
                      style={{height: calculateBarHeight()}}
                      svg={{fontSize: 16}}
                    />

                    <TouchableOpacity
                      onPress={scrollLeft}
                      style={[styles.overlayArrow, {left: 5}]}>
                      <Icon
                        name="keyboard-arrow-left"
                        size={40}
                        color="black"
                      />
                    </TouchableOpacity>
                    <ScrollView
                      horizontal={true}
                      ref={horizontalScrollViewRef}
                      showsHorizontalScrollIndicator={true}
                      contentContainerStyle={{alignItems: 'flex-start'}}>
                      <View>
                        <BarChart
                          style={{
                            height: calculateBarHeight(),
                            width: Math.max(
                              filteredWordFreqBarGraphData.length * 50,
                              Dimensions.get('window').width - 100,
                            ),
                          }}
                          data={wordFreq}
                          yAccessor={({item}) => item.y.value}
                          svg={{fill: 'rgba(' + Styles.MHMRBlueRGB + ', 0.7)'}}
                          contentInset={{top: 10, bottom: 10}}
                          spacing={0.2}
                          gridMin={0}
                          numberOfTicks={Math.min(
                            10,
                            filteredWordFreqBarGraphData[0]?.value || 0,
                          )}>
                          <Grid direction={Grid.Direction.HORIZONTAL} />
                          <LabelsVertical />
                        </BarChart>
                        <XAxis
                          style={{
                            height: 100,
                            marginTop: 0,

                            // marginBottom: 10,
                            width: Math.max(
                              filteredWordFreqBarGraphData.length * 50,
                              Dimensions.get('window').width - 100,
                            ),
                          }}
                          data={filteredWordFreqBarGraphData}
                          scale={scale.scaleBand}
                          svg={{
                            fontSize: 0,
                            fill: 'transparent',
                          }}
                          formatLabel={() => ''}
                        />
                        <View
                          style={{
                            height: 100,
                            width: Math.max(
                              filteredWordFreqBarGraphData.length * 50,
                              Dimensions.get('window').width - 100,
                            ),
                            flexDirection: 'row',
                            position: 'absolute',
                            bottom: 0,
                          }}>
                          {filteredWordFreqBarGraphData.map((item, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => handleWordSelection(item.text)}
                              style={{
                                width: 50,
                                height: 100,
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: 'blue',
                                  textDecorationLine: 'underline',
                                  fontSize: 14,
                                  transform: [{rotate: '-45deg'}],
                                  width: 70,
                                  textAlign: 'center',
                                  marginTop: 10,
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail">
                                {item.text}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </ScrollView>
                    <TouchableOpacity
                      onPress={scrollRight}
                      style={[styles.overlayArrow, {right: 5}]}>
                      <Icon
                        name="keyboard-arrow-right"
                        size={40}
                        color="black"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 20,
                    color: 'black',
                    marginTop: -80,
                  }}>
                  Word
                </Text>
              </View>
            ) : (
              <View id="bargraph-horizontal" style={{flex: 1}}>
                <Text
                  style={{
                    padding: 20,
                    fontSize: 20,
                    color: 'black',
                    fontWeight: 'bold',
                  }}>
                  {currentVideoSet?.name} - Count of words mentioned in selected
                  video set
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    height: 800,
                    paddingVertical: 16,
                  }}>
                  <View style={{justifyContent: 'center', marginRight: 10}}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        color: 'black',
                        width: 60,
                        transform: [{rotate: '270deg'}],
                      }}>
                      Word
                    </Text>
                  </View>
                  <View style={{flexDirection: 'column', height: 800}}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 20,
                        color: 'black',
                        marginBottom: 10,
                      }}>
                      Count
                    </Text>
                    <XAxis
                      data={yTest}
                      xAccessor={({index}) => index}
                      contentInset={{left: 10, right: 10}}
                      spacing={0.2}
                      formatLabel={value => value}
                      min={0}
                      max={filteredWordFreqBarGraphData[0]?.value || 0}
                      numberOfTicks={
                        filteredWordFreqBarGraphData[0]?.value || 0
                      }
                      style={{width: 600, marginLeft: 80}}
                      svg={{fontSize: 20}}
                    />
                    <TouchableOpacity
                      onPress={scrollUp}
                      style={{alignItems: 'center'}}>
                      <Icon name="keyboard-arrow-up" size={60} color="black" />
                    </TouchableOpacity>
                    <ScrollView
                      ref={verticalScrollViewRef}
                      style={{height: '100%', flex: 1}}
                      contentContainerStyle={{
                        height: filteredWordFreqBarGraphData.length * 50,
                      }}
                      nestedScrollEnabled={true}>
                      <View style={{flexDirection: 'row', flex: 1}}>
                        <YAxis
                          data={filteredWordFreqBarGraphData}
                          yAccessor={({index}) => index}
                          scale={scale.scaleBand}
                          contentInset={{top: 10, bottom: 10}}
                          spacing={0.2}
                          formatLabel={() => ''}
                          svg={{
                            fontSize: 0,
                            fill: 'transparent',
                          }}
                          min={0}
                          max={filteredWordFreqBarGraphData[0]?.value || 0}
                        />
                        <View
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: 80,
                            height: filteredWordFreqBarGraphData.length * 50,
                          }}>
                          {filteredWordFreqBarGraphData.map((item, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => handleWordSelection(item.text)}
                              style={{
                                height: 50,
                                width: 80,
                                justifyContent: 'center',
                                paddingLeft: 5,
                              }}>
                              <Text
                                style={{
                                  color: 'blue',
                                  textDecorationLine: 'underline',
                                  fontSize: 14,
                                  width: 75,
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail">
                                {item.text}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <ScrollView
                          horizontal={true}
                          ref={horizontalScrollViewRef}
                          nestedScrollEnabled={true}>
                          <View
                            style={{
                              height: filteredWordFreqBarGraphData.length * 50,
                              flexDirection: 'row',
                              flex: 1,
                            }}>
                            <BarChart
                              style={{
                                height:
                                  filteredWordFreqBarGraphData.length * 50,
                                width: 600,
                              }}
                              data={wordFreq}
                              horizontal={true}
                              yAccessor={({item}) => item.y.value}
                              svg={{
                                fill: 'rgba(' + Styles.MHMRBlueRGB + ', 0.7)',
                              }}
                              contentInset={{top: 10, bottom: 10}}
                              spacing={0.2}
                              gridMin={0}
                              numberOfTicks={
                                filteredWordFreqBarGraphData[0]?.value || 0
                              }>
                              <Grid direction={Grid.Direction.VERTICAL} />
                              <LabelsHorizontal />
                            </BarChart>
                          </View>
                        </ScrollView>
                      </View>
                    </ScrollView>
                    <TouchableOpacity
                      onPress={scrollDown}
                      style={{alignItems: 'center'}}>
                      <Icon
                        name="keyboard-arrow-down"
                        size={60}
                        color="black"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            <View style={{height: '15%', width: '100%'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 10,
                }}>
                <Button
                  title="Remove words"
                  onPress={() => setEditModalVisible(true)}
                  color={Styles.MHMRBlue}
                  radius={50}
                  containerStyle={{
                    width: 200,
                    marginHorizontal: 30,
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 10,
                }}>
                <Button
                  title="Horizontal"
                  onPress={() => setBarGraphVertical(false)}
                  color={Styles.MHMRBlue}
                  radius={50}
                  containerStyle={{
                    width: 200,
                    marginHorizontal: 30,
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
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 10,
                }}>
                <Text style={{fontSize: 20}}>Include medical words</Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={isEnabledMedWords ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitchMedWords}
                  value={isEnabledMedWords}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              borderBottomColor: 'black',
              borderBottomWidth: StyleSheet.hairlineWidth,
              marginTop: 30,
            }}
          />
          <View id="sentiment-bargraph" style={{flex: 1}}>
            <Text
              style={{
                padding: 20,
                fontSize: 20,
                color: 'black',
                fontWeight: 'bold',
              }}>
              {currentVideoSet?.name} - Overall feelings distribution
            </Text>
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
              <YAxis
                data={sentimentData}
                yAccessor={({index}) => sentimentData[index].value}
                contentInset={{top: 10, bottom: 10}}
                spacing={0.2}
                formatLabel={value => value}
                min={0}
                max={Math.max(...sentimentData.map(d => d.value))}
                // numberOfTicks={Math.max(...sentimentData.map(d => d.value))}
                numberOfTicks={5}
                style={{height: 400}}
                svg={{fontSize: 20}}
              />
              <BarChart
                style={{
                  height: 400,
                  width: Dimensions.get('window').width - 90,
                }}
                data={sentimentData.map((item, index) => ({
                  ...item,
                  svg: {
                    fill:
                      index === 4
                        ? '#00CC00'
                        : index === 3
                        ? '#99CC00'
                        : index === 2
                        ? '#FFCC00'
                        : index === 1
                        ? '#9966CC'
                        : '#6633CC',
                    onPressIn: () => handleSentimentPress(item.label),
                  },
                }))}
                yAccessor={({item}) => item.value}
                contentInset={{top: 10, bottom: 10}}
                spacing={0.2}
                gridMin={0}
                numberOfTicks={Math.max(...sentimentData.map(d => d.value))}>
                <Grid direction={Grid.Direction.HORIZONTAL} />
              </BarChart>
            </View>
            <XAxis
              style={{marginHorizontal: -10}}
              data={sentimentData.map((_, index) => index)}
              scale={scale.scaleBand}
              formatLabel={(value, index) => sentimentData[index].label}
              svg={{
                fontSize: 18,
                fill: 'black',
                translateX: 20,
              }}
              contentInset={{left: 50, right: 50}}
            />
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20,
                color: 'black',
                marginBottom: 15,
              }}>
              Feeling
            </Text>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            View video(s) with this sentiment
          </Text>
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
      {editModalVisible && (
        <WordRemovalModal setEditModalVisible={setEditModalVisible} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  smallModalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: Dimensions.get('window').height * 0.5,
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
    color: 'black',
  },
  checkboxContainer: {
    width: '30%',
  },
  checkboxText: {
    fontSize: 14,
  },
  flatListContent: {
    flexGrow: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  buttonStyle: {
    flex: 1,
    marginHorizontal: 10,
  },

  overlayArrow: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 30,
    padding: 5,
    top: windowHeight > 800 ? '40%' : '45%', // Adjust for taller screens
  },
});

export default DataAnalysisBarGraph;
