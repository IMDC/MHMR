import React, {createContext, useState, useContext} from 'react';
import {useRealm} from '../models/VideoData';

export const VideoSetContext = createContext();

export const VideoSetProvider = ({children}) => {
  const realm = useRealm();
  const [videoSetValue, setVideoSetValue] = useState('');
  const [currentVideoSet, setCurrentVideoSet] = useState(null);
  const [videoSetVideoIDs, setVideoSetVideoIDs] = useState([]);
  const [currentSetID, setCurrentSetID] = useState('');
  const [currentVideos, setCurrentVideos] = useState([]);
  const [sendToVideoSet, setSendToVideoSet] = useState(0);

  const handleChange = (value, videoSets) => {
    setSendToVideoSet(0);
    setVideoSetValue(value);
    const selectedSet = videoSets.find(set => set._id.toString() === value);
    if (selectedSet) {
      setCurrentVideoSet(selectedSet);
      setVideoSetVideoIDs(selectedSet.videoIDs);
      setCurrentSetID(selectedSet._id.toString());
      const videos = selectedSet.videoIDs.map(id =>
        realm.objects('VideoData').find(video => video._id.toString() === id),
      );
      setCurrentVideos(videos);
    } else {
      setCurrentVideoSet(null);
      setCurrentSetID('');
      setVideoSetVideoIDs([]);
      setCurrentVideos([]);
    }
  };

  const handleNewSet = newSet => {
    setVideoSetValue(newSet._id.toString());
    setCurrentVideoSet(newSet);
    setVideoSetVideoIDs(newSet.videoIDs);
    setCurrentSetID(newSet._id.toString());
    const videos = newSet.videoIDs.map(id =>
      realm.objects('VideoData').find(video => video._id.toString() === id),
    );
    setCurrentVideos(videos);
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
    setCurrentVideos,
    setCurrentVideoSet,
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
