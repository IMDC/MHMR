import React, {createContext, useState, useContext} from 'react';
import {useRealm, VideoSet} from '../models/VideoData';

export const VideoSetContext = createContext();

export interface DropdownContextType {
  currentVideoSet: any;  // or more specific type if available
  // ... other context properties
}

export const VideoSetProvider = ({children}) => {
  const realm = useRealm();
  const [videoSetValue, setVideoSetValue] = useState('');
  const [currentVideoSet, setCurrentVideoSet] = useState(null);
  const [videoSetVideoIDs, setVideoSetVideoIDs] = useState([]);
  const [currentSetID, setCurrentSetID] = useState('');
  const [currentVideos, setCurrentVideos] = useState([]);
  const [sendToVideoSet, setSendToVideoSet] = useState(0);
  const [isVideoSetSaved, setIsVideoSetSaved] = useState(Boolean);

  const handleChange = (value, videoSets) => {
    console.log('handleChange clicked')
    setSendToVideoSet(0);
    setVideoSetValue(value);
    const selectedSet = videoSets.find(set => set._id.toString() === value);
    if (selectedSet) {
      setIsVideoSetSaved(true);
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
      setIsVideoSetSaved(true);
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
    setIsVideoSetSaved(true);
  };

  const handleDeleteSet = (setToDelete: VideoSet) => {
      setCurrentVideoSet(null);
      setVideoSetValue('');
      setVideoSetVideoIDs([]);
      setCurrentVideos([]);
      
      setIsVideoSetSaved(false);
      if (setToDelete) {
        realm.write(() => {
          realm.delete(setToDelete);
        });
        console.log('SET DELETED FROM DB');
      }
  };

  const contextValues = {
    handleNewSet,
    handleChange,
    handleDeleteSet,
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
    isVideoSetSaved,
    setIsVideoSetSaved,
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
