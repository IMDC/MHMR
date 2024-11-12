import {Text, View} from 'react-native';
import {useNetwork} from './networkProvider';
import React from 'react';
import {Icon} from '@rneui/themed';
import * as Styles from '../assets/util/styles';

const OfflineAlert = () => {
    const {online} = useNetwork();
  return (
    <>
      {!online && (
        <View
          style={{
       
            paddingVertical: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:'center',
            backgroundColor: Styles.NavBarGrey,
          }}>
          <Icon
            name="alert-circle-outline"
            size={24}
            type="ionicon"
            color={Styles.MHMRBlue}
            // style={{width: Styles.bottomNavIconSize}}
          />
          <Text style={{fontSize: 18, color: Styles.MHMRBlue, fontWeight: 'bold'}}>
            You are offline.
          </Text>
        </View>
      )}
    </>
  );
};
export default OfflineAlert;
