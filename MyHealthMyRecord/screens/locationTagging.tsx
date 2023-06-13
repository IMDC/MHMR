import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Alert,
  FlatList,
} from 'react-native';
import {Card, CheckBox, Icon, Image} from '@rneui/themed';

const LocationTagging = () => {

  const locations = [
    {id: 0, title: 'Home', checked: false},
    {id: 1, title: 'Work', checked: false},
    {id: 2, title: 'School', checked: false},
    {id: 3, title: 'Park', checked: false},
    {id: 4, title: 'Indoors', checked: false},
    {id: 5, title: 'Outdoors', checked: false},
    {id: 6, title: 'Other', checked: false},
  ];

  const [category, setCategory] = useState(locations);

  function sliderFunc(index: any) {
    console.log(index);
    const locationTag = [...category];
    locationTag[index].checked = !locationTag[index].checked;
    setCategory(locationTag);
  }


  return (
    <SafeAreaView style={styles.container}>
      <Text style={{fontSize: 24}}>
        This video includes the following locations:
      </Text>
      <FlatList
        style={{padding: 40}}
        data={category}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <Card containerStyle={{padding: 10, margin: 10}}>
            <CheckBox
              center={false}
              title={item.title}
              // titleProps={{color: 'black', fontWeight: 'bold'}}
              checked={item?.checked}
              // value={item?.checked}
              onPress={() => sliderFunc(index)}
              size={30}
            />
          </Card>
        )}
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
});

export default LocationTagging;
