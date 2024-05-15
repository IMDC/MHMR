import React, {createContext, useState, useContext} from 'react';
import {useRealm} from '../models/VideoData';

export const VideoSetContext = createContext();

export const VideoSetProvider = ({children}) => {
  const realm = useRealm();
  const [videoSetValue, setVideoSetValue] = useState<any[]>([]);
  const [selectedVideoSet, setSelectedVideoSet] = useState<any[]>([]);
  const [videoSetVideoIDs, setVideoSetVideoIDs] = useState<any[]>([]);

  const handleChange = (value, videoSets) => {
    setVideoSetValue(value);
    const selectedSet = videoSets.find(set => set._id.toString() === value);
    setSelectedVideoSet(selectedSet);
    setVideoSetVideoIDs(selectedSet.videoIDs);
    console.log('*'.repeat(40));
    console.log('Selected Video Set:', selectedSet);
    console.log('Selected Video Set Video IDs:', selectedSet.videoIDs);
    console.log('*'.repeat(40));
  };

  const contextValues = {handleChange, videoSetVideoIDs, videoSetValue, setVideoSetValue};

  return (
    <VideoSetContext.Provider value={contextValues}>
      {children}
    </VideoSetContext.Provider>
  );
};

export function useDropdownContext() {
  return useContext(VideoSetContext);
}
