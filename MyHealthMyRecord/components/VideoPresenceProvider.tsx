import React, {createContext, useContext} from 'react';
import {useQuery} from '../models/VideoData';

const VideoPresenceContext = createContext<{hasVideos: boolean}>({
  hasVideos: false,
});

export const VideoPresenceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const videoData = useQuery('VideoData');
  const hasVideos = videoData.length > 0;

  return (
    <VideoPresenceContext.Provider value={{hasVideos}}>
      {children}
    </VideoPresenceContext.Provider>
  );
};

export const useVideoPresence = () => useContext(VideoPresenceContext);
