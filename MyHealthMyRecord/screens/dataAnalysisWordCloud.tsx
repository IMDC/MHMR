import React, {useEffect, useState} from 'react';
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {Text, View, Dimensions} from 'react-native';
import WordCloud from 'rn-wordcloud';

const DataAnalysisWordCloud = () => {
  const route = useRoute();
  const barData = route.params?.data;
  const [wordFrequency, setWordFrequency] = useState(barData.data);
  const data = [
    {text: 'happy', value: 30},
    {text: 'joyful', value: 24},
    {text: 'sad', value: 12},
    {text: 'exciting', value: 28},
    {text: 'angry', value: 16},
    {text: 'hopeful', value: 32},
    {text: 'inspiring', value: 36},
    {text: 'dismal', value: 12},
    {text: 'gloomy', value: 16},
    {text: 'boring', value: 16},
    {text: 'ordinary', value: 20},
    {text: 'satisfied', value: 28},
    {text: 'pleasing', value: 32},
    // Add more words as needed
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
  };

  useEffect(() => {
    console.log('barData', barData.data);
    addPalette(data, IBM_palette);
    console.log('data', data);
  }, [barData.data, data]);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <WordCloud
        options={{
          words: data,
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
  );
};

export default DataAnalysisWordCloud;
