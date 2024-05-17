import React, { useEffect, useState } from 'react';
import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { Text, View } from 'react-native';
import WordCloud from 'rn-wordcloud';

const DataAnalysisWordCloud = () => {
  const route = useRoute();
  const barData = route.params?.data;
  const [wordFrequency, setWordFrequency] = useState(barData.data);
  const data = [
    { text: 'happy', value: 30 },
    { text: 'joyful', value: 24 },
    { text: 'sad', value: 12 },
    { text: 'exciting', value: 28 },
    { text: 'angry', value: 16 },
    { text: 'hopeful', value: 32 },
    { text: 'inspiring', value: 36, color: 'green' },
    { text: 'dismal', value: 12 },
    { text: 'gloomy', value: 16 },
    { text: 'boring', value: 16 },
    { text: 'ordinary', value: 20 },
    { text: 'satisfied', value: 28 },
    { text: 'pleasing', value: 32 },
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
      }}>
      <WordCloud
        options={{
          words: barData.data,
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