import {
  ParamListBase,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {VideoData, useRealm, useQuery} from '../../models/VideoData';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Button, Icon} from '@rneui/themed';

import {Dropdown} from 'react-native-element-dropdown';
import * as Styles from '../../assets/util/styles';
import VideoSetDropdown from '../../components/videoSetDropdown';
import {useDropdownContext} from '../../components/videoSetProvider';
import {useSetLineGraphData} from '../../components/lineGraphData';
import {useWordList} from '../../components/wordListProvider';
import TranscriptUploader from '../../components/TranscriptUploader';
import DataTransfer from '../../components/dataTransfer';

const DataAnalysis = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [lineGraphNavigationVisible, setLineGraphNavigationVisible] =
    useState(false);
  const {currentVideos, currentVideoSet} = useDropdownContext();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const isFocused = useIsFocused();
  const setLineGraphData = useSetLineGraphData();
  const [lineGraphData, setLineGraphDataState] = useState(null);
  const [wordLabel, setWordLabel] = useState('');
  const [selectedWord, setSelectedWord] = useState('');
  const [barData, setBarData] = useState<any>([]);
  const [noStopWords, setNoStopWords] = useState<any>([]);
  const [viewValue, setViewValue] = useState(1);
  const [videoSetDropdown, setVideoSetDropdown] = useState([]);
  const [selectedVideoSet, setSelectedVideoSet] = useState<any>(null);
  const videoSets = useQuery<any>('VideoSet');
  const {updateWordList, wordList, selectedWords} = useWordList();
  const realm = useRealm();
  const [sentimentBarData, setSentimentBarData] = useState<any>([]);

  const allVideos = useQuery<VideoData>('VideoData');

  const handleVideoSelectionChange = (selectedId: string) => {
    const selectedSet = videoSets.find(
      set => set._id.toString() === selectedId,
    );
    setSelectedVideoSet(selectedSet);
  };

  useEffect(() => {
    if (isFocused && currentVideoSet) {
      loadFrequencyData();
      processSentimentData();
    }
  }, [isFocused, currentVideoSet]);

  const loadFrequencyData = () => {
    if (!currentVideoSet?.frequencyData) return;

    const colonEntries = currentVideoSet.frequencyData.filter(
      entry => typeof entry === 'string' && entry.includes(':'),
    );

    const parsed = colonEntries
      .map(entry => {
        const [word, count] = entry.split(':');
        return {text: word, value: parseInt(count)};
      })
      .filter(item => item.text && item.text.toLowerCase() !== 'hesitation');

    setBarData({data: parsed});

    const sortedWords = parsed
      .map(item => item.text)
      .sort((a, b) => a.localeCompare(b));

    const dropdownItems = sortedWords.map(word => ({
      label: word,
      value: word,
    }));

    setNoStopWords(dropdownItems);
    updateWordList(parsed);

    // For initial preview data
    const jsonEntries = currentVideoSet.frequencyData
      .filter(item => typeof item === 'string' && item.includes('{'))
      .map(item => {
        try {
          return JSON.parse(item);
        } catch {
          return null;
        }
      })
      .filter(entry => entry?.map && typeof entry.map === 'object');

    if (parsed.length > 0) {
      const result = setLineGraphData(jsonEntries, parsed[0].text);
      setLineGraphDataState(result);
    }
  };

  const processSentimentData = () => {
    const sentimentCounts = {
      'Very Negative': 0,
      Negative: 0,
      Neutral: 0,
      Positive: 0,
      'Very Positive': 0,
    };

    const validSentiments = Object.keys(sentimentCounts);
    const selectedVideoIDs = new Set(currentVideoSet?.videoIDs ?? []);
    const videos = allVideos.filter(video =>
      selectedVideoIDs.has(video._id.toString()),
    );

    videos.forEach(video => {
      if (validSentiments.includes(video.sentiment)) {
        sentimentCounts[video.sentiment]++;
      }
    });

    const formattedData = validSentiments.map((sentiment, index) => ({
      label: sentiment,
      value: sentimentCounts[sentiment],
      svg: {
        fill: ['#4CAF50', '#8BC34A', '#FFC107', '#FF5722', '#F44336'][index],
      },
    }));

    setSentimentBarData(formattedData);
    console.log('Filtered sentiment data:', formattedData);
  };

  const isButtonDisabled = () => {
    return !currentVideoSet || currentVideoSet.videoIDs.length === 0;
  };

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <View style={{marginTop: 5, height: '30%', width: '100%'}}>
        <VideoSetDropdown
          videoSetDropdown={videoSetDropdown}
          videoSets={videoSets}
          saveVideoSetBtn={false}
          clearVideoSetBtn={false}
          manageSetBtn={false}
          keepViewBtn={true}
          onVideoSetChange={handleVideoSelectionChange}
          plainDropdown={false}
        />
      </View>

      <View
        style={{height: '50%', justifyContent: 'center', alignItems: 'center'}}>
        <Button
          disabled={isButtonDisabled()}
          onPress={() => navigation.navigate('Text Report')}
          titleStyle={{fontSize: 40}}
          containerStyle={{
            width: Styles.windowHeight * 0.4,
            marginVertical: 10,
          }}
          iconRight
          icon={{
            name: 'file-alt',
            type: 'font-awesome-5',
            size: 40,
            color: 'white',
          }}
          color={Styles.MHMRBlue}
          radius={50}>
          Text Report
        </Button>

        <Button
          disabled={isButtonDisabled()}
          onPress={() =>
            navigation.navigate('Bar Graph', {
              data: barData,
              sentimentData: sentimentBarData,
            })
          }
          titleStyle={{fontSize: 40}}
          containerStyle={{
            width: Styles.windowHeight * 0.4,
            marginVertical: 10,
          }}
          iconRight
          icon={{
            name: 'chart-bar',
            type: 'font-awesome-5',
            size: 40,
            color: 'white',
          }}
          color={Styles.MHMRBlue}
          radius={50}>
          Bar Graph
        </Button>

        <Button
          disabled={isButtonDisabled()}
          onPress={() => setModalVisible(true)}
          titleStyle={{fontSize: 40}}
          containerStyle={{
            width: Styles.windowHeight * 0.4,
            marginVertical: 10,
          }}
          iconRight
          icon={{
            name: 'chart-line',
            type: 'font-awesome-5',
            size: 40,
            color: 'white',
          }}
          color={Styles.MHMRBlue}
          radius={50}>
          Line Graph
        </Button>

        <Button
          disabled={isButtonDisabled()}
          onPress={() => navigation.navigate('Word Cloud', {data: barData})}
          titleStyle={{fontSize: 40}}
          containerStyle={{
            width: Styles.windowHeight * 0.4,
            marginVertical: 10,
          }}
          iconRight
          icon={{name: 'cloud', type: 'font-awesome', size: 40, color: 'white'}}
          color={Styles.MHMRBlue}
          radius={50}>
          Word Cloud
        </Button>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 10,
          left: Styles.screenWidth / 3,
        }}>
        {isButtonDisabled() && (
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() =>
              Alert.alert(
                'No Video Set Selected',
                'Please select or create a video set first.',
              )
            }>
            <Icon
              name="alert-circle-outline"
              size={24}
              type="ionicon"
              color="gray"
            />
            <Text style={{fontSize: 20, color: 'gray', textAlign: 'center'}}>
              Why can't I click anything?
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Select a word to view in line graph:
          </Text>
          <Dropdown
            data={wordList
              .filter(
                item =>
                  item.text &&
                  item.text.toLowerCase() !== 'hesitation' &&
                  !selectedWords.has(item.text),
              )
              .sort((a, b) => a.text.localeCompare(b.text))
              .map(item => ({
                label: item.text,
                value: item.text,
              }))}
            value={selectedWord}
            maxHeight={400}
            style={{
              height: 50,
              width: '80%',
              paddingHorizontal: 20,
              backgroundColor: '#DBDBDB',
              borderRadius: 22,
            }}
            itemTextStyle={{textAlign: 'center'}}
            labelField="label"
            valueField="value"
            onChange={item => {
              setSelectedWord(item.value);
              setViewValue(item.value);
              setLineGraphNavigationVisible(true);
            }}
          />

          <View style={{flexDirection: 'row'}}>
            <Button
              containerStyle={{marginTop: 20}}
              title="Close"
              color={Styles.MHMRBlue}
              radius={50}
              onPress={() => setModalVisible(false)}
            />
            {lineGraphNavigationVisible && (
              <Button
                containerStyle={{marginTop: 20, marginLeft: 10}}
                title="View line graph"
                color={Styles.MHMRBlue}
                radius={50}
                onPress={() => {
                  const fullMapData = currentVideoSet.frequencyData
                    .map(item => {
                      if (typeof item === 'string') return JSON.parse(item);
                      return item;
                    })
                    .filter(
                      entry => entry?.map && typeof entry.map === 'object',
                    );

                  const result = setLineGraphData(fullMapData, selectedWord);
                  setModalVisible(false);
                  navigation.navigate('Line Graph', {
                    word: selectedWord,
                    data: result,
                  });
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      <TranscriptUploader
        onUploadComplete={() => {
          if (currentVideoSet) {
            realm.write(() => {
              currentVideoSet.isAnalyzed = true;
            });
          }
        }}
      />

      <DataTransfer />
    </View>
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
    shadowOffset: {width: 0, height: 2},
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
});

export default DataAnalysis;
