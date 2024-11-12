import React, { createContext, useContext, useState } from 'react';
import { useRealm } from '../models/VideoData';
const WordListContext = createContext();

export const WordListProvider = ({ children }) => {
  const [wordList, setWordList] = useState([]);
  const realm = useRealm();
  const updateWordList = (newWordList) => {
    setWordList(newWordList);
  };

  return (
    <WordListContext.Provider value={{ wordList, updateWordList }}>
      {children}
    </WordListContext.Provider>
  );
};

export const useWordList = () => {
  return useContext(WordListContext);
};
