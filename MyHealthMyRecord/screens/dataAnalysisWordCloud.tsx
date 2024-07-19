import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Alert, SafeAreaView, Text, View} from 'react-native';
import WordCloud from 'rn-wordcloud';
import {Dropdown} from 'react-native-element-dropdown';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { windowHeight, windowWidth } from '../assets/util/styles';

const DataAnalysisWordCloud = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route = useRoute();
  const barData = route.params?.data || {};

  const [updatedData, setUpdatedData] = useState(barData.dataNoStop || []);
  const [dropdownValue, setDropdownValue] = useState(null);

  const dropdownData = [
    {label: 'Palette 1', value: 'IBM'},
    {label: 'Palette 2', value: 'Wong'},
    {label: 'Palette 3', value: 'Tol'},
  ];

  const IBM_palette = [
    {color: '#648FFF'},
    {color: '#785EF0'},
    {color: '#DC267F'},
    {color: '#FE6100'},
    {color: '#FFB000'},
  ];

  const wong_palette = [
    {color: '#000000'},
    {color: '#E69F00'},
    {color: '#56B4E9'},
    {color: '#009E73'},
    {color: '#F0E442'},
    {color: '#0072B2'},
    {color: '#D55E00'},
    {color: '#CC79A7'},
  ];

  const tol_palette = [
    {color: '#332288'},
    {color: '#117733'},
    {color: '#44AA99'},
    {color: '#88CCEE'},
    {color: '#DDCC77'},
    {color: '#CC6677'},
    {color: '#AA4499'},
    {color: '#882255'},
  ];

  const addPalette = (data, palette) => {
    return data.map(item => ({
      ...item,
      color: palette[Math.floor(Math.random() * palette.length)].color,
    }));
  };

  const validateData = data => {
    const values = data.map(item => item.value);
    const allSame = values.every(value => value === values[0]);

    if (allSame) {
      data[0].value += 1; // increase the value of the first word by 1
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
    if (!(barData.dataNoStop.length > 0)) {
      Alert.alert(
        'Cannot create word cloud',
        'There are not enough words found in your videos to create a word cloud with. Try adding more videos with audio to your video set.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } else {
      const validatedData = validateData(barData.dataNoStop);
      console.log('validatedData:', validatedData);
      setUpdatedData(validatedData);

      if (dropdownValue) {
        console.log('dropdownValue true:', dropdownValue);
        let newPalette;
        if (dropdownValue === 'IBM') {
          newPalette = IBM_palette;
        } else if (dropdownValue === 'Wong') {
          newPalette = wong_palette;
        } else if (dropdownValue === 'Tol') {
          newPalette = tol_palette;
        }
        if (barData.dataNoStop) {
          setUpdatedData(addPalette(barData.dataNoStop, newPalette));
        }
      }
    }
  }, [dropdownValue, barData.dataNoStop]);

  return (
    <SafeAreaView>
      {barData.dataNoStop.length > 0 ? (
        <View>
          <View style={{flexDirection: 'column'}}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <WordCloud
                key={JSON.stringify(updatedData)}
                options={{
                  words: updatedData,
                  verticalEnabled: true,
                  rotateRatio: 0.5,
                  minFont: 40,
                  maxFont: 120,
                  fontOffset: 1,
                  width: windowWidth * 0.5,
                  height: windowHeight * 0.65,
                  fontFamily: 'Arial',
                }}
              />
            </View>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                color: 'black',
                paddingVertical: 10,
              }}>
              Select Color Palette:
            </Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Dropdown
                data={dropdownData}
                maxHeight={150}
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
                value={dropdownValue}
                onChange={item => setDropdownValue(item.value)}
              />
            </View>
          </View>
        </View>
      ) : (
        <View></View>
      )}
    </SafeAreaView>
  );
};

export default DataAnalysisWordCloud;
