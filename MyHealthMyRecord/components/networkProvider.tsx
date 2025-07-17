import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import OnlineDialog from './onlineDialog';

interface NetworkContextType {
  online: boolean;
  onlineDialogVisible: boolean;
  toggleOnlineDialog: () => void;
}

const NetworkContext = createContext<NetworkContextType>({
  online: false,
  onlineDialogVisible: false,
  toggleOnlineDialog: () => {},
});

export const useNetwork = (): NetworkContextType => useContext(NetworkContext);

export const NetworkProvider = ({children}: {children: ReactNode}) => {
  const [online, setOnline] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [onlineDialogVisible, setOnlineDialogVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected;

      if (isOnline && !online) {
        setDialogMessage('You are back online!');
        setOnlineDialogVisible(true); // Show dialog only when coming back online
      }

      setOnline(isOnline);
    });

    return () => unsubscribe();
  }, [online]);

  const toggleOnlineDialog = () => {
    setOnlineDialogVisible(!onlineDialogVisible);
  };

  return (
    <NetworkContext.Provider
      value={{online, onlineDialogVisible, toggleOnlineDialog}}>
      {onlineDialogVisible && (
        <OnlineDialog
          message={dialogMessage}
          toggleOnlineDialog={toggleOnlineDialog}
        />
      )}
      {children}
    </NetworkContext.Provider>
  );
};
