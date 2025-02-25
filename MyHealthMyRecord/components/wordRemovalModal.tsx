import React, { useCallback } from 'react';
import { Modal, View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Button, CheckBox } from '@rneui/themed';
import * as Styles from '../assets/util/styles';
import { useWordList } from '../components/wordListProvider';

// Memoized CheckBox component to prevent unnecessary re-renders
const MemoizedCheckBox = React.memo(({ title, checked, onPress }) => {
  return (
    <CheckBox
      title={title}
      checked={checked}
      onPress={onPress}
      containerStyle={styles.checkboxContainer}
      textStyle={styles.checkboxText}
    />
  );
});

const WordRemovalModal = ({ setEditModalVisible }) => {
  const { wordList, selectedWords, toggleWordSelection, persistSelectedWords } = useWordList();

  // Memoized toggle function to prevent re-creation on every render
  const handleToggleWordSelection = useCallback(
    (word) => {
      toggleWordSelection(word);
    },
    [toggleWordSelection]
  );

  // Handle "Close" button press
  const handleClose = () => {
    persistSelectedWords();
    setEditModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Select words to remove from visualization</Text>
        <FlatList
          data={wordList}
          renderItem={({ item }) => (
            <MemoizedCheckBox
              title={item.text}
              checked={selectedWords.has(item.text)} // Check if the word is in the selectedWords set
              onPress={() => handleToggleWordSelection(item.text)} // Toggle word in the provider
            />
          )}
          keyExtractor={(item) => item.text}
          extraData={selectedWords} // Ensure FlatList rerenders only when selectedWords changes
          numColumns={3}
          contentContainerStyle={styles.flatListContent}
        />
        <View style={styles.buttonContainer}>
          <Button
            title="Close"
            color={Styles.MHMRBlue}
            radius={50}
            onPress={handleClose} // Persist changes and close the modal
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  modalText: {
    marginBottom: 15,
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
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  buttonStyle: {
    flex: 1,
    marginHorizontal: 10,
  },
});

export default WordRemovalModal;
