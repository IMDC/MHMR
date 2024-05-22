import React, {createContext, useState, useContext} from 'react';
import {useRealm} from '../models/VideoData';

export const VideoSetContext = createContext();

export const VideoSetProvider = ({children}) => {
  const realm = useRealm();
  const [videoSetValue, setVideoSetValue] = useState<any[]>([]);
  // selected video set is the selected video set accoring to the dropdown
  const [selectedVideoSet, setSelectedVideoSet] = useState<any[]>([]);
  const [videoSetVideoIDs, setVideoSetVideoIDs] = useState<any[]>([]);
  const [sendToVideoSet, setSendToVideoSet] = useState(0);

  const handleChange = (value, videoSets) => {
    setSendToVideoSet(0);
    setVideoSetValue(value);
    const selectedSet = videoSets.find(set => set._id.toString() === value);
    setSelectedVideoSet(selectedSet);
    setVideoSetVideoIDs(selectedSet.videoIDs);
    console.log('*'.repeat(40));
    console.log('Selected Video Set:', selectedSet);
    console.log('*'.repeat(40));
  };

  const handleNewSet = videoIDs => {
    setVideoSetVideoIDs(videoIDs);
  };

  const contextValues = {
    handleNewSet,
    handleChange,
    videoSetVideoIDs,
    setVideoSetVideoIDs,
    videoSetValue,
    setVideoSetValue,
    sendToVideoSet,
    setSendToVideoSet,
  };

  return (
    <VideoSetContext.Provider value={contextValues}>
      {children}
    </VideoSetContext.Provider>
  );
};

export function useDropdownContext() {
  return useContext(VideoSetContext);
}
