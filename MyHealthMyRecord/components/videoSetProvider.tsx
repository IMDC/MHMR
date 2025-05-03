import React, {createContext, useState, useContext} from 'react';
import {useRealm, VideoSet} from '../models/VideoData';

export const VideoSetContext = createContext();

export interface DropdownContextType {
  currentVideoSet: any; // or more specific type if available
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
    console.log('handleChange clicked');
    setSendToVideoSet(0);
    setVideoSetValue(value);

    const selectedSet = videoSets.find(set => set._id.toString() === value);

    let updatedVideos = [];
    let selectedSetCopy = null;

    realm.write(() => {
      const allSets = realm.objects('VideoSet');
      allSets.forEach(set => (set.isCurrent = false));

      if (selectedSet) {
        selectedSet.isCurrent = true;
        selectedSetCopy = {
          _id: selectedSet._id,
          videoIDs: [...selectedSet.videoIDs],
          name: selectedSet.name,
        };
        updatedVideos = selectedSet.videoIDs.map(id =>
          realm.objects('VideoData').find(video => video._id.toString() === id),
        );
      }
    });

    if (selectedSetCopy) {
      setIsVideoSetSaved(true);
      setCurrentVideoSet(selectedSet);
      setVideoSetVideoIDs(selectedSetCopy.videoIDs);
      setCurrentSetID(selectedSetCopy._id.toString());
      setCurrentVideos(updatedVideos);
    } else {
      setCurrentVideoSet(null);
      setCurrentSetID('');
      setVideoSetVideoIDs([]);
      setCurrentVideos([]);
      setIsVideoSetSaved(true);
    }
  };

  const handleNewSet = newSet => {
    let updatedVideos = [];
    let newSetCopy = null;

    realm.write(() => {
      const allSets = realm.objects('VideoSet');
      allSets.forEach(set => (set.isCurrent = false));
      newSet.isCurrent = true;

      newSetCopy = {
        _id: newSet._id,
        videoIDs: [...newSet.videoIDs],
        name: newSet.name,
      };

      updatedVideos = newSet.videoIDs.map(id =>
        realm.objects('VideoData').find(video => video._id.toString() === id),
      );
    });

    setVideoSetValue(newSetCopy._id.toString());
    setCurrentVideoSet(newSet); // safe to store realm object
    setVideoSetVideoIDs(newSetCopy.videoIDs);
    setCurrentSetID(newSetCopy._id.toString());
    setCurrentVideos(updatedVideos);
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
