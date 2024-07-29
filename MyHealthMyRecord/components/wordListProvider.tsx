import React, { createContext, useContext, useState } from 'react';

const WordListContext = createContext();

export const WordListProvider = ({ children }) => {
  const [wordList, setWordList] = useState([]);

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
