import React, {createContext, useState, useContext} from 'react';

export const VideoSetContext = createContext();

export const VideoSetProvider = ({children}) => {
  const [videoSetValue, setVideoSetValue] = useState(null);
  const [selectedVideoSet, setSelectedVideoSet] = useState(null);

  // Function to update both states
  const handleChange = (item, videoSets) => {
    setVideoSetValue(item.value);
    setSelectedVideoSet(videoSets[item.value].name);
    console.log('************ selected videoSet ID', videoSets[item.value]._id);
  };

  return (
    <VideoSetContext.Provider
      value={{videoSetValue, selectedVideoSet, handleChange}}>
      {children}
    </VideoSetContext.Provider>
  );
};

