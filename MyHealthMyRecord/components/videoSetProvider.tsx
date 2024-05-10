import React, {createContext, useState, useContext} from 'react';
import {VideoData, useRealm} from '../models/VideoData';

export const VideoSetContext = createContext();

export const VideoSetProvider = ({children}) => {
  const realm = useRealm();
  const [videoSetValue, setVideoSetValue] = useState(null);
  const [selectedVideoSet, setSelectedVideoSet] = useState('');

  // Function to update both states
  const handleChange = (item, videoSets) => {
    setVideoSetValue(item.value);
    setSelectedVideoSet(videoSets[item.value]);
    console.log('************ selected videoSet ID', videoSets[item]);
    console.log('************ selected videoSets ', videoSets);
  };

  const contextValues = {handleChange, videoSetValue, setVideoSetValue};

  // Iterate through videoIDs and update them to is selected


  return (
    <VideoSetContext.Provider
      value={contextValues}>
      {children}
    </VideoSetContext.Provider>
  );
};


export function useDropdownContext() {
  return useContext(VideoSetContext);
}