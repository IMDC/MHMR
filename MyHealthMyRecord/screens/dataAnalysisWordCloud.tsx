import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import WordCloud from 'rn-wordcloud';
import {Dropdown} from 'react-native-element-dropdown';
import * as Styles from '../assets/util/styles';
import {useWordList} from '../components/wordListProvider';
import {Button} from '@rneui/themed';
import WordRemovalModal from '../components/wordRemovalModal';

const DataAnalysisWordCloud = () => {
  const {wordList, selectedWords} = useWordList();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [updatedData, setUpdatedData] = useState(wordList || []);
  const [filteredWordList, setFilteredWordList] = useState(wordList || []);
  const [dropdownValue, setDropdownValue] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

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

  const IBM_palette = [
    {color: '#648FFF'},
    {color: '#785EF0'},
    {color: '#DC267F'},
    {color: '#FE6100'},
    {color: '#FFB000'},
  ];

  const addPalette = (data, palette) => {
    if (!palette || palette.length === 0) {
      console.error('Palette is empty or undefined');
      return data.map(item => ({
        ...item,
        color: '#000000', // Default color if palette is invalid
      }));
    }

    const formattedPalette = palette.map(color =>
      typeof color === 'string' ? {color} : color,
    );

    return data.map(item => ({
      ...item,
      color:
        formattedPalette[Math.floor(Math.random() * formattedPalette.length)]
          .color,
    }));
  };

  const validateData = data => {
    const values = data.map(item => item.value);
    const allSame = values.every(value => value === values[0]);

    if (allSame) {
      data[0].value += 1; // Increase the value of the first word by 1
    }

    return data.map(item => ({
      ...item,
      value: isNaN(item.value)
        ? Math.floor(Math.random() * 10) + 1
        : item.value,
      text: item.text || 'default',
    }));
  };

  useEffect(() => {
    if (filteredWordList.length < 2) {
      Alert.alert(
        'Cannot create word cloud',
        'There are not enough words found in your videos to create a word cloud with. Try adding more videos with audio to your video set.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } else {
      const validatedData = validateData(filteredWordList);

      if (dropdownValue) {
        const selectedPalette =
          dropdownData
            .find(item => item.value === dropdownValue)
            ?.colors.map(color => ({color})) || [];
        setUpdatedData(addPalette(validatedData, selectedPalette));
      } else {
        setUpdatedData(validatedData);
      }
    }
  }, [dropdownValue, filteredWordList]);

  // Sync filtered words with the word list from the provider
  useEffect(() => {
    const filteredData = wordList.filter(word => !selectedWords.has(word.text));
    setFilteredWordList(filteredData);
    setUpdatedData(filteredData);
  }, [wordList, editModalVisible]);

  const renderDropdownItem = item => {
    return (
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
  };

  return (
    <SafeAreaView>
      {filteredWordList.length > 1 ? (
        <View style={{flexDirection: 'column'}}>
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 10,
              justifyContent: 'center',
            }}>
            <View style={{flexDirection: 'row', paddingHorizontal: 2}}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: 'black',
                  paddingVertical: 10,
                  paddingHorizontal: 2,
                }}>
                Select Color Palette:
              </Text>

              <Dropdown
                data={dropdownData}
                dropdownPosition="bottom"
                maxHeight={150}
                style={{
                  height: 50,
                  width: Styles.windowWidth / 3,
                  paddingHorizontal: 20,
                  backgroundColor: '#DBDBDB',
                  borderRadius: 22,
                }}
                itemTextStyle={{textAlign: 'center'}}
                labelField="label"
                valueField="value"
                value={dropdownValue}
                renderItem={renderDropdownItem}
                onChange={item => setDropdownValue(item.value)}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Button
                title="Remove words"
                onPress={() => setEditModalVisible(true)}
                color={Styles.MHMRBlue}
                radius={50}
                containerStyle={{
                  width: 200,
                  // marginHorizontal: 30,
                }}
              />
            </View>
          </View>

          <View
            style={{
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            <WordCloud
              key={JSON.stringify(updatedData)}
              options={{
                words: updatedData,
                verticalEnabled: true,
                rotateRatio: 0.8,
                minFont: Styles.windowHeight * 0.0225,
                maxFont: Styles.windowHeight * 0.05,
                fontOffset: 0.6,
                width: Styles.windowWidth,
                height: Styles.windowHeight * 0.8,
                padding: 1,
                fontFamily: 'Arial',
              }}
            />
          </View>
        </View>
      ) : (
        <View></View>
      )}
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
