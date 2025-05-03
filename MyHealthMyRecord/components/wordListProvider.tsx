import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRealm } from '../models/VideoData';
import { stopWords } from '../assets/util/words';

const WordListContext = createContext();

export const WordListProvider = ({ children }) => {
  const [wordList, setWordList] = useState([]);
  const [selectedWords, setSelectedWords] = useState(new Set());
  const realm = useRealm();

  const updateWordListFromFrequencyData = () => {
    const videoSet = realm.objects('VideoSet').filtered('isCurrent == true')[0];
    if (!videoSet || !videoSet.frequencyData) return;

    try {
      const parsedWords = videoSet.frequencyData
        .map(entry => {
          const parsed = JSON.parse(entry);
          return Object.entries(parsed.map).map(([word, count]) => ({
            text: word,
            value: count,
          }));
        })
        .flat();

      const mergedMap = new Map();
      for (const item of parsedWords) {
        if (mergedMap.has(item.text)) {
          mergedMap.set(item.text, mergedMap.get(item.text) + item.value);
        } else {
          mergedMap.set(item.text, item.value);
        }
      }

      const cleaned = Array.from(mergedMap.entries())
        .map(([text, value]) => ({ text, value }))
        .filter(
          word =>
            typeof word.text === 'string' &&
            typeof word.value === 'number' &&
            word.value > 2 &&
            !stopWords.includes(word.text.toLowerCase()) &&
            word.text.toLowerCase() !== 'hesitation'
        );

      setWordList(cleaned);
    } catch (err) {
      console.error('Failed to parse word frequency data:', err);
    }
  };

  const toggleWordSelection = word => {
    setSelectedWords(prev => {
      const next = new Set(prev);
      next.has(word) ? next.delete(word) : next.add(word);
      return next;
    });
  };

  const persistSelectedWords = () => {
    realm.write(() => {
      const videoSet = realm.objects('VideoSet').filtered('isCurrent == true')[0];
      if (videoSet) {
        videoSet.selectedWords = Array.from(selectedWords);
      }
    });
  };

  const resetSelectedWords = () => setSelectedWords(new Set());

  useEffect(() => {
    updateWordListFromFrequencyData();

    const videoSet = realm.objects('VideoSet').filtered('isCurrent == true')[0];
    if (videoSet?.selectedWords) {
      setSelectedWords(new Set(videoSet.selectedWords));
    }
  }, [realm]);

  return (
    <WordListContext.Provider
      value={{
        wordList,
        selectedWords,
        updateWordList: updateWordListFromFrequencyData,
        toggleWordSelection,
        persistSelectedWords,
        resetSelectedWords,
      }}
    >
      {children}
    </WordListContext.Provider>
  );
};

export const useWordList = () => useContext(WordListContext);
