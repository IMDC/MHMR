import React, {useCallback} from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Button, CheckBox} from '@rneui/themed';
import * as Styles from '../assets/util/styles';
import {useWordList} from '../components/wordListProvider';
import {Input} from '@rneui/base';

const MemoizedCheckBox = React.memo(({title, checked, onPress}) => (
  <CheckBox
    title={title}
    checked={checked}
    onPress={onPress}
    containerStyle={styles.checkboxContainer}
    textStyle={styles.checkboxText}
  />
));

const WordRemovalModal = ({setEditModalVisible, filteredWords}) => {
  const {
    selectedWords,
    toggleWordSelection,
    persistSelectedWords,
    minFrequency,
    setMinFrequency,
    updateWordList,
  } = useWordList();

  const handleToggleWordSelection = useCallback(
    word => {
      toggleWordSelection(word);
    },
    [toggleWordSelection],
  );

  const handleClose = () => {
    persistSelectedWords();
    updateWordList(minFrequency);
    setEditModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => setEditModalVisible(false)}>
      <View style={styles.modalView}>
        <View accessibilityLabel="Word Removal" style={{height: '65%'}}>
          <Text style={styles.modalText}>
            Select words to remove from visualization
          </Text>
          <FlatList
            persistentScrollbar={true}
            data={filteredWords}
            renderItem={({item}) => (
              <MemoizedCheckBox
                title={item.text}
                checked={selectedWords.has(item.text)}
                onPress={() => handleToggleWordSelection(item.text)}
              />
            )}
            keyExtractor={item => item.text}
            extraData={selectedWords}
            initialNumToRender={12}
            numColumns={3}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
        <View accessibilityLabel="Settings">
          <Text style={styles.modalText}>Word Settings</Text>
          <View style={{flexDirection: 'row', height: '20%'}}>
            <View style={{alignContent: 'center', justifyContent: 'center'}}>
              <Text
                style={{
                  textAlign: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}>
                Show words that appear more than or equal to:
              </Text>
            </View>

            <Input
              placeholder={minFrequency.toString()}
              keyboardType="numeric"
              onChangeText={text => {
                const frequency = parseInt(text, 10);
                if (!isNaN(frequency)) {
                  setMinFrequency(frequency);
                }
              }}
              inputStyle={{textAlign: 'center'}}
              containerStyle={{width: '30%', justifyContent: 'center'}}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Close"
            color={Styles.MHMRBlue}
            radius={50}
            onPress={handleClose}
            containerStyle={styles.buttonStyle}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  modalText: {
    marginBottom: 15,
    marginTop: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    width: '30%',
  },
  checkboxText: {
    fontSize: 14,
  },
  flatListContent: {
    flexGrow: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    width: '100%',
    marginBottom: 0,
  },
  buttonStyle: {
    flex: 1,
  },
});

export default WordRemovalModal;
