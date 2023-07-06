import {
  ParamListBase,
  useNavigation,
  NavigationContainer,
  useRoute,
} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, FlatList} from 'react-native';
import {Icon, Image, Card, Button, CheckBox} from '@rneui/themed';
import {useRealm, useObject} from '../models/VideoData';

const KeywordTagging = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  let parsedKeywords: string[] = [];

  const [keyword, setKeyword] = useState(video.keywords);

  keyword.map((key: string) => parsedKeywords.push(JSON.parse(key)));

  console.log(parsedKeywords);

  // const updateKeywords = () => {
  //   console.log('new:', keyword);
  //   if (video) {
  //     realm.write(() => {
  //       video.keywords! = JSON.stringify(keyword);
  //     });
  //   }
  // };

  const [category, setCategory] = useState(parsedKeywords);

  function checkBoxFunc(index: any) {
    console.log(index);
    const textTag: any = [...category];
    textTag[index].checked = !textTag[index].checked;
    setCategory(textTag);
  }

  function saveKeywords() {
    const keywords: any = [];
    category.map((item: any) => {
      keywords.push(JSON.stringify(item));
    });
    console.log('test:', keywords);
    if (video) {
      realm.write(() => {
        video.keywords! = keywords;
      });
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{fontSize: 24}}>Select tags that apply to your video:</Text>
      <FlatList
        style={{padding: 40}}
        data={category}
        keyExtractor={(item: any, index) => index.toString()}
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
      <Card containerStyle={{padding: 10, margin: 10}}>
<Text> Add Keyword</Text>
      </Card>
      <Button
        buttonStyle={{width: 220, height: 75, alignSelf: 'center'}}
        onPress={saveKeywords}
        title="Save"
        color="#1C3EAA"
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
