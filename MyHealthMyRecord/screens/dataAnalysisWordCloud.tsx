import React, {useEffect, useState} from 'react';
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {Text, View} from 'react-native';
import WordCloud from 'rn-wordcloud';

const DataAnalysisWordCloud = () => {
   const route: any = useRoute();
   const barData = route.params?.data;
   const [wordFrequency, setWordFrequency] = useState(barData.data);
  const data = [
    {text: 'happy', value: 8},
    {text: 'joyful', value: 6},
    {text: 'sad', value: 3},
    {text: 'exciting', value: 7},
    {text: 'angry', value: 4},
    {text: 'hopeful', value: 8},
    {text: 'inspiring', value: 9, color: 'green'},
    {text: 'dismal', value: 3},
    {text: 'gloomy', value: 4},
    {text: 'boring', value: 4},
    {text: 'ordinary', value: 5},
    {text: 'satisfied', value: 7},
    {text: 'pleasing', value: 8},
    // Add more words as needed
  ];

  useEffect(() => {
    console.log('barData', barData.data);
  }, [barData.data]);

  return (
    <View
      style={{
        paddingTop: '30%',
        flexDirection: 'row',
        justifyContent: 'center',
        // alignContent: 'center',
      }}>
      <WordCloud
        options={{
          words: barData.data,
          verticalEnabled: true,
          minFont: 20,
          maxFont: 60,
          fontOffset: 1,
          width: 400,
          height: 400,
          fontFamily: 'Arial',
        }}
      />
    </View>
  );
};
export default DataAnalysisWordCloud;
