import { ParamListBase, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useRealm } from '../models/VideoData';

const DataAnalysisBarGraph = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route: any = useRoute();
  const barData = route.params?.data;
  const [freqMaps, setFreqMaps] = useState(route.params?.freqMaps);
  const [wordFreqBarGraphData, setWordFreqBarGraphData] = useState(barData.data);
  const realm = useRealm();

  const [isEnabledStopWords, setIsEnabledStopWords] = useState(true);
  const toggleSwitchStopWords = () => setIsEnabledStopWords(prev => !prev);
  const [isEnabledMedWords, setIsEnabledMedWords] = useState(true);
  const toggleSwitchMedWords = () => setIsEnabledMedWords(prev => !prev);

  function updateData() {
    if (!isEnabledMedWords && !isEnabledStopWords) {
      setWordFreqBarGraphData(barData.dataNone);
    } else if (!isEnabledStopWords) {
      setWordFreqBarGraphData(barData.dataNoStop);
    } else if (!isEnabledMedWords) {
      setWordFreqBarGraphData(barData.dataNoMed);
    } else {
      setWordFreqBarGraphData(barData.data);
    }
  }

  useEffect(() => {
    updateData();
  }, [isEnabledStopWords, isEnabledMedWords]);

  return null;
};

export default DataAnalysisBarGraph;