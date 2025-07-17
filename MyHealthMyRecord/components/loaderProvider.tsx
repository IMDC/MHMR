import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import Loader from './Loader';

interface LoaderContextType {
  showLoader: (message: string) => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType>({
  showLoader: () => {},
  hideLoader: () => {},
});

export const LoaderProvider = ({children}: {children: ReactNode}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const showLoader = (message: string) => {
    console.log('showLoader');
    setMessage(message);
    setLoading(true);
  };

  const hideLoader = () => {
    console.log('hideLoader');
    setLoading(false);
  };

  return (
    <LoaderContext.Provider value={{showLoader, hideLoader}}>
      {loading && <Loader message={message} />}
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = (): LoaderContextType => useContext(LoaderContext);
