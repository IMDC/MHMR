import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const ManageVideoSet = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Video Set</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  }
});

export default ManageVideoSet;
