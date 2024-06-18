import React, {useEffect, useState} from 'react';
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {Text, View, Dimensions} from 'react-native';
import WordCloud from 'rn-wordcloud';
import {Dropdown} from 'react-native-element-dropdown';

const DataAnalysisWordCloud = () => {
  const route = useRoute();
  const barData = route.params?.data;
  const [wordFrequency, setWordFrequency] = useState(barData.data);
  let [updatedData, setUpdatedData] = useState(barData.dataNoStop);
  const [dropdownValue, setDropdownValue] = useState(0);
  const dropdownData = [
    {label: 'IBM', value: 'IBM'},
    {label: 'Wong', value: 'Wong'},
    {label: 'Tol', value: 'Tol'},
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

  // create a function to add selected palette to the objects color in data using random selection
  const addPalette = (data: string | any[], palette: string | any[]) => {
    for (let i = 0; i < data.length; i++) {
      data[i].color = palette[Math.floor(Math.random() * palette.length)].color;
    }
    return data;
  };
  // useEffect(() => {
  //   addPalette(updatedData, IBM_palette);
  // }, [updatedData]);

  // const renderWordCloud = data => {
  //   return (
      
  //   );
  // };

  return (
    <View style={{flexDirection: 'column'}}>
      <View>
        <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <WordCloud
          options={{
            words: updatedData,
            verticalEnabled: true,
            rotateRatio: 0.5,
            minFont: 40,
            maxFont: 120,
            fontOffset: 5,
            width: 700,
            height: 800,
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
            maxHeight={400}
            style={{
              height: 50,

              width: 600,
              paddingHorizontal: 20,
              backgroundColor: '#DBDBDB',
              borderRadius: 22,
            }}
            itemTextStyle={{textAlign: 'center'}}
            labelField="label"
            valueField="value"
            value={dropdownData[dropdownValue]}
            onChange={item => {
              console.log('item', item);
              if (item.value === 'IBM') {
                setUpdatedData(addPalette(barData.dataNoStop, IBM_palette));
                setDropdownValue(0);
                console.log('IBM_palette', updatedData);
              } else if (item.value === 'Wong') {
                setUpdatedData(addPalette(barData.dataNoStop, wong_palette));
                addPalette(barData.dataNoStop, wong_palette);
                setDropdownValue(1);
                console.log('wong_palette', updatedData);
              } else if (item.value === 'Tol') {
                setUpdatedData(addPalette(barData.dataNoStop, tol_palette));
                setDropdownValue(2);
                console.log('tol_palette', updatedData);
              }
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default DataAnalysisWordCloud;
