import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRealm } from '../models/VideoData';

const WordListContext = createContext();

export const WordListProvider = ({ children }) => {
  const [wordList, setWordList] = useState([]); // Shared word list
  const [selectedWords, setSelectedWords] = useState(new Set()); // Selected words for removal
  const realm = useRealm();

  // Update the word list
  const updateWordList = (newWordList) => {
    // Filter out words with value <= 2
    const filteredWordList = newWordList.filter((word) => word.value > 2);
    setWordList(filteredWordList);

    // Persist changes in Realm
    realm.write(() => {
      const videoSet = realm.objects('VideoSet').filtered('isCurrent == true')[0]; // Replace 'isCurrent' with your actual property
      if (videoSet) {
        videoSet.wordList = filteredWordList; // Save the updated word list
      }
    });
  };

  // Toggle selection for a word (only updates state, does not write to Realm)
  const toggleWordSelection = (word) => {
    setSelectedWords((prev) => {
      const updatedSelection = new Set(prev);
      if (updatedSelection.has(word)) {
        updatedSelection.delete(word);
      } else {
        updatedSelection.add(word);
      }
      return updatedSelection;
    });
  };

  // Persist selected words to Realm
  const persistSelectedWords = () => {
    realm.write(() => {
      const videoSet = realm.objects('VideoSet').filtered('isCurrent == true')[0];
      if (videoSet) {
        videoSet.selectedWords = Array.from(selectedWords); // Save the updated selected words
      }
    });
  };

  // Reset selected words (e.g., when switching video sets)
  const resetSelectedWords = () => {
    setSelectedWords(new Set());
  };

  useEffect(() => {
    // Load initial data from Realm on mount
    const videoSet = realm.objects('VideoSet').filtered('isCurrent == true')[0];
    if (videoSet) {
      // Filter out words with value <= 2
      const filteredWordList = (videoSet.wordList || []).filter(
        (word) => word.value > 2
      );
      setWordList(filteredWordList);
      setSelectedWords(new Set(videoSet.selectedWords || []));
    }
  }, [realm]);

  return (
    <WordListContext.Provider
      value={{
        wordList,
        selectedWords,
        updateWordList,
        toggleWordSelection,
        persistSelectedWords,
        resetSelectedWords,
      }}
    >
      {children}
    </WordListContext.Provider>
  );
};

export const useWordList = () => {
  return useContext(WordListContext);
};
