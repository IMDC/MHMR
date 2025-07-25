import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {useRealm} from '../../models/VideoData';
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
  Alert,
  FlatList,
} from 'react-native';
import {Button, Icon} from '@rneui/themed';
import {BarChart, Grid, YAxis, XAxis} from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import * as Styles from '../../assets/util/styles';
import {useSetLineGraphData} from '../../components/lineGraphData';
import {useDropdownContext} from '../../providers/videoSetProvider';
import {useWordList} from '../../providers/wordListProvider';
import WordRemovalModal from '../../components/wordRemovalModal';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const DataAnalysisBarGraph = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute();
  const sentimentData = route.params?.sentimentData;
  const setLineGraphData = useSetLineGraphData();
  const realm = useRealm();
  const {currentVideoSet} = useDropdownContext();
  const {wordList, selectedWords, toggleWordSelection, updateWordList} =
    useWordList();

  const [barData, setBarData] = useState([]);
  const [filteredBarData, setFilteredBarData] = useState([]);
  const [barGraphVertical, setBarGraphVertical] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [videoIDs, setVideoIDs] = useState([]);
  const [isEnabledMedWords, setIsEnabledMedWords] = useState(true);

  const scrollRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);

  // array of length of max value in data (first index value) for yAxis
  const yTest = Array.from(
    {
      length:
        filteredBarData.length > 0
          ? Math.ceil(filteredBarData[0].value / 5) * 5
          : 5,
    },
    (_, i) => i * 5,
  );

  useEffect(() => {
    if (!currentVideoSet?.frequencyData) {
      console.log('No frequencyData found in currentVideoSet');
      return;
    }

    let parsed = [];
    try {
      parsed = currentVideoSet.frequencyData
        .map(entry => {
          const parsedEntry = JSON.parse(entry);
          const wordEntries = Object.entries(parsedEntry.map);
          return wordEntries.map(([word, count]) => ({
            text: word,
            value: count,
          }));
        })
        .flat();
    } catch (err) {
      console.error('Error parsing frequency data:', err);
      return;
    }

    // Merge duplicates
    const mergedMap = new Map();
    for (const item of parsed) {
      if (mergedMap.has(item.text)) {
        mergedMap.set(item.text, mergedMap.get(item.text) + item.value);
      } else {
        mergedMap.set(item.text, item.value);
      }
    }

    const cleaned = Array.from(mergedMap.entries())
      .map(([text, value]) => ({text, value}))
      .filter(item => item.text && item.text.toLowerCase() !== 'hesitation')
      .sort((a, b) => b.value - a.value);

    setBarData(cleaned);
    updateWordList(cleaned);
  }, [currentVideoSet]);

  useEffect(() => {
    updateFilteredBarData();
  }, [wordList, selectedWords, editModalVisible]);

  const updateFilteredBarData = () => {
    const cleaned = wordList.filter(item => !selectedWords.has(item.text));
    setFilteredBarData(cleaned);
  };

  const handleWordSelection = (label: string) => {
    const parsed = currentVideoSet.frequencyData
      .filter(item => typeof item === 'string') // filter out non-strings
      .map(item => JSON.parse(item)); // safely parse
    const result = setLineGraphData(parsed, label);
    navigation.navigate('Line Graph', {
      word: label,
      data: result,
    });
  };

  // Calculate maxValue to ensure exactly 6 ticks (0 to maxValue)
  const maxValue =
    filteredBarData.length > 0
      ? Math.ceil(filteredBarData[0].value / 25) * 25 // Round up to nearest multiple of 25 for 5 intervals
      : 25; // default to 25 for 6 ticks (0,5,10,15,20,25)

  const chartWidth = Math.max(
    filteredBarData.length * 50,
    Dimensions.get('window').width - 100,
  );
  const barWidth = chartWidth / filteredBarData.length;

  const handleSentimentPress = async sentiment => {
    const videoIDsSet = new Set(currentVideoSet.videoIDs);
    const videos = realm
      .objects('VideoData')
      .filtered(`sentiment == "${sentiment}"`);
    const filtered = videos.filter(v => videoIDsSet.has(v._id.toString()));
    setVideoIDs(filtered);
    setModalVisible(true);
  };

  const sentimentOrder = {
    'Very Negative': 0,
    Negative: 1,
    Neutral: 2,
    Positive: 3,
    'Very Positive': 4,
  };

  const sortedSentimentData = [...sentimentData].sort(
    (a, b) => sentimentOrder[a.label] - sentimentOrder[b.label],
  );

  if (filteredBarData.length === 0) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 18, textAlign: 'center', marginHorizontal: 30}}>
          No word frequency data is available to display. Try selecting another
          video set or adding more audio-rich videos.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <Text
          style={{
            textAlign: 'center',
            padding: 20,
            fontSize: 20,
            color: 'black',
            fontWeight: 'bold',
          }}>
          Word Frequency of {currentVideoSet?.name}
        </Text>
        <View style={{height: Dimensions.get('window').height * 0.75}}>
          <ScrollView horizontal ref={horizontalScrollRef}>
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
            <View style={{flexDirection: 'column', flex: 1}}>
              <View style={{flexDirection: 'row', flex: 1}}>
                <YAxis
                  data={yTest}
                  yAccessor={({value}) => value}
                  contentInset={{top: 10, bottom: 10}}
                  spacing={0.2}
                  formatLabel={value => Math.round(value)} // Ensure whole numbers
                  numberOfTicks={8} // Keep consistent with grid
                  min={0}
                  max={maxValue}
                  // style={{height: calculateBarHeight()}}
                  svg={{fontSize: 16}}
                />
                <BarChart
                  style={{
                    // height: calculateBarHeight(),
                    width: chartWidth,
                  }}
                  data={filteredBarData}
                  yAccessor={({item}) => item.value}
                  svg={{fill: 'rgba(' + Styles.MHMRBlueRGB + ', 0.7)'}}
                  contentInset={{top: 10, bottom: 10}}
                  spacing={0}
                  gridMin={0}
                  gridMax={maxValue}>
                  <Grid direction={Grid.Direction.HORIZONTAL} />
                </BarChart>
              </View>
              <XAxis
                style={{
                  height: 100,
                  marginTop: 0,
                  width: chartWidth,
                }}
                data={filteredBarData}
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
                  width: chartWidth,
                  flexDirection: 'row',
                  position: 'absolute',
                  bottom: 0,
                }}>
                {filteredBarData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleWordSelection(item.text)}
                    style={{
                      width: barWidth,
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
                        width: barWidth + 20, // give extra padding for rotated label
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
          <Text
            style={{
              textAlign: 'center',
              fontSize: 20,
              color: 'black',
              marginTop: -50,
            }}>
            Word
          </Text>
          <View style={{alignItems: 'center', marginTop: 20}}>
            <Button
              title="Word settings"
              onPress={() => setEditModalVisible(true)}
              color={Styles.MHMRBlue}
              radius={50}
              containerStyle={{width: 200}}
            />
          </View>
        </View>
        <Text
          style={{
            padding: 20,
            fontSize: 20,
            color: 'black',
            fontWeight: 'bold',
          }}>
          {currentVideoSet?.name} - Overall Sentiment Distribution
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
            data={sortedSentimentData}
            yAccessor={({index}) => sortedSentimentData[index].value}
            contentInset={{top: 10, bottom: 10}}
            spacing={0.2}
            formatLabel={value => value}
            min={0}
            max={
              Math.ceil(
                Math.max(...sortedSentimentData.map(d => d.value)) / 25,
              ) * 25 || 25 // Use 25 as minimum for 6 ticks
            }
            numberOfTicks={6}
            style={{height: Dimensions.get('window').height * 0.3}}
            svg={{fontSize: 16}}
          />
          <BarChart
            style={{
              height: Dimensions.get('window').height * 0.3,
              width: Dimensions.get('window').width - 90,
            }}
            data={sortedSentimentData.map((item, index) => ({
              ...item,
              svg: {
                fill:
                  index === 0
                    ? '#6633CC' // Very Negative
                    : index === 1
                    ? '#9966CC' // Negative
                    : index === 2
                    ? '#FFCC00' // Neutral
                    : index === 3
                    ? '#99CC00' // Positive
                    : '#00CC00', // Very Positive
                onPressIn: () => handleSentimentPress(item.label),
              },
            }))}
            yAccessor={({item}) => item.value}
            contentInset={{top: 10, bottom: 10}}
            spacing={0.2}
            gridMin={0}
            gridMax={
              Math.ceil(
                Math.max(...sortedSentimentData.map(d => d.value)) / 25,
              ) * 25 || 25 // Use 25 as minimum for 6 ticks
            }>
            <Grid direction={Grid.Direction.HORIZONTAL} numberOfTicks={6} />
          </BarChart>
        </View>
        <XAxis
          style={{marginHorizontal: -10, alignContent: 'center'}}
          data={sortedSentimentData.map((_, index) => index)}
          scale={scale.scaleBand}
          formatLabel={(value, index) => sortedSentimentData[index].label}
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
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              View videos with this sentiment
            </Text>
            <FlatList
              data={videoIDs}
              persistentScrollbar={true}
              keyExtractor={item => item._id.toString()}
              renderItem={({item}) => (
                <View>
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
        </Modal>

        {editModalVisible && (
          <WordRemovalModal
            setEditModalVisible={setEditModalVisible}
            filteredWords={wordList}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlayArrow: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 30,
    padding: 5,
    top: windowHeight > 800 ? '40%' : '45%', // Adjust for taller screens
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
  iconContainer: {
    flexDirection: 'row',

    // width: '100%',
  },
  iconButton: {
    padding: 5,
  },
});

export default DataAnalysisBarGraph;
