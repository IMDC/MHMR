/*import React from 'react';
import type { PropsWithChildren } from 'react';*/
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, TextInput, View} from 'react-native';
import {Button, Icon, Input} from '@rneui/themed';

const AnnotationMenu = () => {
  const [text, onChangeText] = React.useState('Enter Video Title');

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <SafeAreaView style={styles.container}>
      <Input inputStyle={{fontSize: 35}} placeholder="Enter Video Title" />
      <Text style={{fontSize: 24}}>
        Select how you would like to start annotating your video:
      </Text>
      <View style={{paddingTop: 45}}>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name="add-outline"
            size={40}
            type="ionicon"
            color="#1C3EAA"
            onPress={() => {
              navigation.navigate('Emotion Tagging');
            }}
          />
          <Text style={styles.textStyle}>Add Emotion Tagging</Text>
        </View>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name="add-outline"
            size={40}
            type="ionicon"
            color="#1C3EAA"
            onPress={() => navigation.navigate('Keyword Tagging')}
          />
          <Text style={styles.textStyle}>Add Keyword Tagging</Text>
        </View>

        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name="add-outline"
            size={40}
            type="ionicon"
            color="#1C3EAA"
            onPress={() => navigation.navigate('Location Tagging')}
          />
          <Text style={styles.textStyle}>Add Location</Text>
        </View>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name="add-outline"
            size={40}
            type="ionicon"
            color="#1C3EAA"
            onPress={() => navigation.navigate('Text Comments')}
          />
          <Text style={styles.textStyle}>Add Text Comments</Text>
        </View>
      </View>

      <Button
        containerStyle={{paddingTop: 275}}
        buttonStyle={{width: 220, height: 75, alignSelf: 'center'}}
        color="#1C3EAA"
        title="Review Annotations"
        onPress={() => navigation.navigate('Review Annotations')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 75},
  textStyle: {
    alignSelf: 'center',
    fontSize: 24,
    paddingLeft: 10,
  },

  input: {
    height: 60,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: 30,
  },
  selectionContainer: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
});

export default AnnotationMenu;
