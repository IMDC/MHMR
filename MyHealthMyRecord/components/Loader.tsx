import React from 'react';
import {View, Text, ActivityIndicator, Modal, StyleSheet} from 'react-native';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = (props) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      statusBarTranslucent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.modalText}>{props.message ? props.message : 'Loading...'}</Text>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});
export default Loader;
