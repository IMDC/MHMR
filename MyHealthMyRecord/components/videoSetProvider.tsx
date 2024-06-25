import React, {createContext, useState, useContext} from 'react';
import {useRealm} from '../models/VideoData';

export const VideoSetContext = createContext();

export const VideoSetProvider = ({children}) => {
  const realm = useRealm();
  // videoSetValue is the value of the selected video set in the dropdown
  const [videoSetValue, setVideoSetValue] = useState<any[]>([]);

  // selected video set is the selected video set according to the dropdown
  const [currentVideoSet, setCurrentVideoSet] = useState<any[]>([]);

  // videoSetVideoIDs is the array of videoIDs in the selected video set
  const [videoSetVideoIDs, setVideoSetVideoIDs] = useState<any[]>([]);
  const [currentSetID, setCurrentSetID] = useState<any[]>([]);

  const [currentVideos, setCurrentVideos] = useState<any[]>([]);

  const [sendToVideoSet, setSendToVideoSet] = useState(0);

  const handleChange = (value, videoSets) => {
    setSendToVideoSet(0);
    setVideoSetValue(value);
    const selectedSet = videoSets.find(set => set._id.toString() === value);
    if (selectedSet) {
      setCurrentVideoSet(selectedSet);
      setVideoSetVideoIDs(selectedSet.videoIDs);
      setCurrentSetID(selectedSet._id);
      const videos = selectedSet.videoIDs.map(id =>
        realm.objects('VideoData').find(video => video._id.toString() === id),
      );
      console.log('*'.repeat(50));
      console.log('currentSetID', currentSetID);
      setCurrentVideos(videos);
    } else {
      setCurrentVideoSet(null);
      setCurrentSetID(null);
      setVideoSetVideoIDs([]);
      setCurrentVideos([]);
      console.log('*'.repeat(50));
      console.log('currentSetID', currentSetID);
    }
  };

  const handleNewSet = (videoIDs, videoSets) => {
    setVideoSetVideoIDs(videoIDs);
    const selectedSet = videoSets.find(
      set => set._id.toString() === videoSetValue,
    );
    if (selectedSet) {
      setCurrentVideoSet(selectedSet);
      setCurrentSetID(selectedSet._id);
    } else {
      setCurrentVideoSet([]);
      setCurrentSetID([]);
    }
    console.log(
      '-----------------------------------------------New selectedSet:',
      selectedSet,
    );
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
    currentVideoSet,
    currentVideos,
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
