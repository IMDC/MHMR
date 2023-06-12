import {ParamListBase, useNavigation, NavigationContainer} from '@react-navigation/native';
import {NativeStackNavigationProp, createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
} from 'react-native';
import {Icon, Image, Card, Button, CheckBox} from '@rneui/themed';

const KeywordTagging = () => {

  const keyword = [
    {id: 0, title: 'None', checked: false},
    {id: 1, title: 'Chronic', checked: false},
    {id: 2, title: 'Weak', checked: false},
    {id: 3, title: 'Depression', checked: false},
    {id: 4, title: 'Pain', checked: false},
    {id: 5, title: 'Fever', checked: false},
    {id: 6, title: 'Wellness', checked: false},
  ];

  const [category, setCategory] = useState(keyword);

  function checkBoxFunc(index: any) {
    console.log(index);
    const textTag = [...category];
    textTag[index].checked = !textTag[index].checked;
    setCategory(textTag);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{fontSize: 24}}>Select tags that apply to your video:</Text>
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
              onPress={() => checkBoxFunc(index)}
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

export default KeywordTagging;


