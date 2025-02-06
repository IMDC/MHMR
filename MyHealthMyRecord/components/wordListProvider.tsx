import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRealm } from '../models/VideoData';

const WordListContext = createContext();

export const WordListProvider = ({ children }) => {
  const [wordList, setWordList] = useState([]); // Shared word list
  const [selectedWords, setSelectedWords] = useState(new Set()); // Selected words for removal
  const realm = useRealm();

  // Update the word list
  const updateWordList = (newWordList) => {
    setWordList(newWordList);

    // Persist changes in Realm
    realm.write(() => {
      const videoSet = realm.objects('VideoSet').filtered('isCurrent == true')[0]; // Replace 'isCurrent' with your actual property
      if (videoSet) {
        videoSet.wordList = newWordList; // Save the updated word list
      }
    });
  };

  // Toggle selection for a word
  const toggleWordSelection = (word) => {
    setSelectedWords((prev) => {
      const updatedSelection = new Set(prev);
      if (updatedSelection.has(word)) {
        updatedSelection.delete(word);
      } else {
        updatedSelection.add(word);
      }

      // Persist selected words in Realm
      realm.write(() => {
        const videoSet = realm.objects('VideoSet').filtered('isCurrent == true')[0];
        if (videoSet) {
          videoSet.selectedWords = Array.from(updatedSelection); // Save the updated selected words
        }
      });

      return updatedSelection;
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
      setWordList(videoSet.wordList || []);
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
