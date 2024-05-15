import React, {createContext, useState, useContext} from 'react';
import {useRealm} from '../models/VideoData';

export const VideoSetContext = createContext();

export const VideoSetProvider = ({children}) => {
  const realm = useRealm();
  const [videoSetValue, setVideoSetValue] = useState(null);
  const [selectedVideoSet, setSelectedVideoSet] = useState('');

  const handleChange = (value, videoSets) => {
    setVideoSetValue(value);
    const selectedSet = videoSets.find(set => set._id.toString() === value);
    setSelectedVideoSet(selectedSet);
    console.log('Selected VideoSet ID:', value);
    console.log('Selected VideoSet:', selectedSet);
  };

  const contextValues = {handleChange, videoSetValue, setVideoSetValue};

  return (
    <VideoSetContext.Provider value={contextValues}>
      {children}
    </VideoSetContext.Provider>
  );
};

export function useDropdownContext() {
  return useContext(VideoSetContext);
}
