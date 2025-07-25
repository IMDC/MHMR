import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import WordCloud from 'rn-wordcloud';
import {Dropdown} from 'react-native-element-dropdown';
import * as Styles from '../../assets/util/styles';
import {useDropdownContext} from '../../providers/videoSetProvider';
import {useWordList} from '../../providers/wordListProvider';
import {Button} from '@rneui/themed';
import WordRemovalModal from '../../components/wordRemovalModal';
import {useSetLineGraphData} from '../../components/lineGraphData';

const DataAnalysisWordCloud = () => {
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const {wordList, selectedWords, updateWordList} = useWordList();
  const {currentVideoSet} = useDropdownContext();

  const [updatedData, setUpdatedData] = useState([]);
  const [filteredWordList, setFilteredWordList] = useState([]);
  const [dropdownValue, setDropdownValue] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const setLineGraphData = useSetLineGraphData();

  const dropdownData = [
    {
      label: 'Palette 1',
      value: 'IBM',
      colors: ['#648FFF', '#785EF0', '#DC267F', '#FE6100', '#FFB000'],
    },
    {
      label: 'Palette 2',
      value: 'Wong',
      colors: [
        '#000000',
        '#E69F00',
        '#56B4E9',
        '#009E73',
        '#F0E442',
        '#0072B2',
        '#D55E00',
        '#CC79A7',
      ],
    },
    {
      label: 'Palette 3',
      value: 'Tol',
      colors: [
        '#332288',
        '#117733',
        '#44AA99',
        '#88CCEE',
        '#DDCC77',
        '#CC6677',
        '#AA4499',
        '#882255',
      ],
    },
  ];

  useEffect(() => {
    if (!currentVideoSet?.frequencyData) return;

    try {
      const parsed = currentVideoSet.frequencyData
        .map(entry => {
          const parsedEntry = JSON.parse(entry);
          return Object.entries(parsedEntry.map).map(([word, count]) => ({
            text: word,
            value: count,
          }));
        })
        .flat();

      const mergedMap = new Map();
      for (const item of parsed) {
        if (mergedMap.has(item.text)) {
          mergedMap.set(item.text, mergedMap.get(item.text) + item.value);
        } else {
          mergedMap.set(item.text, item.value);
        }
      }

      // Log multi-word phrases
      console.log('Multi-word phrases found:');
      Array.from(mergedMap.entries())
        .filter(([text]) => text.includes(' '))
        .sort((a, b) => b[1] - a[1])
        .forEach(([text, count]) => {
          console.log(`"${text}" (frequency: ${count})`);
        });

      const cleaned = Array.from(mergedMap.entries())
        .map(([text, value]) => ({text, value}))
        .filter(
          item =>
            item.text &&
            item.text.toLowerCase() !== 'hesitation' &&
            item.value > 2 &&
            !selectedWords.has(item.text),
        );

      updateWordList(cleaned);
    } catch (err) {
      console.error('Error parsing word data for word cloud:', err);
    }
  }, [currentVideoSet]);

  useEffect(() => {
    if (!editModalVisible) {
      const cleaned = (wordList || [])
        .filter(
          word =>
            typeof word.text === 'string' && typeof word.value === 'number',
        )
        .filter(word => !selectedWords.has(word.text))
        .sort((a, b) => b.value - a.value);

      setFilteredWordList(cleaned);
      setUpdatedData(cleaned);
    }
  }, [editModalVisible, wordList, selectedWords]);

  useEffect(() => {
    if (dropdownValue && filteredWordList.length > 0) {
      const validated = validateData(filteredWordList);
      const selectedPalette =
        dropdownData
          .find(item => item.value === dropdownValue)
          ?.colors.map(color => ({color})) || [];
      setUpdatedData(addPalette(validated, selectedPalette));
    }
  }, [dropdownValue]);

  const validateData = data => {
    if (data.length === 0) return [];

    const values = data.map(item => item.value);
    const allSame = values.every(value => value === values[0]);

    const safeData = data.map(item => ({
      ...item,
      value: isNaN(item.value)
        ? Math.floor(Math.random() * 10) + 1
        : item.value,
      text: item.text || 'default',
    }));

    if (allSame && safeData[0]) {
      safeData[0].value += 1;
    }

    return safeData;
  };

  const addPalette = (data, palette) => {
    if (!palette || palette.length === 0) {
      return data.map(item => ({...item, color: '#000000'}));
    }

    const formatted = palette.map(color =>
      typeof color === 'string' ? {color} : color,
    );

    return data.map(item => ({
      ...item,
      color: formatted[Math.floor(Math.random() * formatted.length)].color,
    }));
  };

  const renderDropdownItem = item => (
    <View style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
      <Text style={{marginRight: 10}}>{item.label}</Text>
      {item.colors.map((color, index) => (
        <View
          key={index}
          style={{
            width: 20,
            height: 20,
            backgroundColor: color,
            marginHorizontal: 2,
            borderRadius: 2,
          }}
        />
      ))}
    </View>
  );

  const handleWordClick = wordObj => {
    const word = wordObj.text;

    const parsed = currentVideoSet.frequencyData
      .filter(item => typeof item === 'string')
      .map(item => JSON.parse(item));

    console.log('Clicked word:', word);
    console.log('First parsed map:', parsed[0]?.map);

    const result = setLineGraphData(parsed, word);
    navigation.navigate('Line Graph', {
      word,
      data: result,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {updatedData.length > 1 ? (
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.dropdownContainer}>
              <Text style={styles.headerText}>Select Color Palette:</Text>

              <Dropdown
                data={dropdownData}
                dropdownPosition="bottom"
                maxHeight={150}
                style={[styles.dropdown, {width: windowWidth / 2.5}]}
                itemTextStyle={{textAlign: 'center'}}
                labelField="label"
                valueField="value"
                value={dropdownValue}
                renderItem={renderDropdownItem}
                onChange={item => setDropdownValue(item.value)}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Word settings"
                onPress={() => setEditModalVisible(true)}
                color={Styles.MHMRBlue}
                radius={50}
                containerStyle={styles.settingsButton}
              />
            </View>
          </View>

          <View style={styles.wordCloudContainer}>
            <WordCloud
              key={JSON.stringify(updatedData)}
              options={{
                words: updatedData,
                verticalEnabled: true,
                minFont: Math.max(
                  windowHeight * (filteredWordList.length < 20 ? 0.05 : 0.025),
                  16,
                ),
                maxFont: Math.min(
                  windowHeight * (filteredWordList.length < 20 ? 0.12 : 0.06),
                  windowWidth * (filteredWordList.length < 20 ? 0.2 : 0.1),
                ),
                fontOffset: filteredWordList.length < 20 ? 1 : 0.7,
                width: windowWidth,
                height: windowHeight * 0.8,
                padding: filteredWordList.length < 20 ? 3 : 1,
                fontFamily: 'Arial',
              }}
              onWordPress={handleWordClick}
            />
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>
          Not enough data to display a word cloud.
        </Text>
      )}
      {editModalVisible && (
        <WordRemovalModal
          setEditModalVisible={setEditModalVisible}
          filteredWords={wordList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    marginTop: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  dropdown: {
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: '#DBDBDB',
    borderRadius: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    width: 150,
  },
  wordCloudContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  modalView: {
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
});

export default DataAnalysisWordCloud;
