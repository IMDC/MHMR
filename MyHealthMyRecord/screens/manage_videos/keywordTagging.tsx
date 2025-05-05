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
import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  LogBox,
} from 'react-native';
import {
  Icon,
  Image,
  Card,
  Button,
  CheckBox,
  Dialog,
  Input,
} from '@rneui/themed';
import {useRealm, useObject} from '../../models/VideoData';

const KeywordTagging = () => {
  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  // const validateKeyword = (keyword: string) => {
  //   var re = /^(?!\s*$).+;/;
  //   return re.test(keyword);
  // };

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [visible, setVisible] = useState(false);

  const toggleDialog = () => {
    setVisible(!visible);
  };

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  const [newKeyword, setNewKeyword] = useState('');

  const [keywords, setKeywords] = useState(video.keywords);
  let parsedKeywords: string[] = [];
  keywords.map((key: string) => parsedKeywords.push(JSON.parse(key)));

  console.log('show parsedKeywords:', parsedKeywords);

  const [category, setCategory] = useState(parsedKeywords);

  const addKeyword = () => {
    const keywordSchema: any = {
      id: new Realm.BSON.ObjectId(),
      title: newKeyword,
      checked: true,
    };
    parsedKeywords.push(keywordSchema);
    const newKeyword_s: any[] = [];
    parsedKeywords.map((key: string) => newKeyword_s.push(JSON.stringify(key)));

    setCategory(parsedKeywords);
    setKeywords(newKeyword_s);
    console.log('newkeyword_s', newKeyword_s);

    if (video) {
      realm.write(() => {
        video.keywords! = newKeyword_s;
      });
    }
  };


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
  }

  function checkBoxFunc(id: any) {
    const textTag: any = [...category];
    textTag.map((item: any) => {
      if (item.id === id) {
        item.checked = !item.checked;
        setCategory(textTag);
        console.log('texttag:', textTag);
      }

      console.log('item:', item);
      console.log('id:', id);
    });
    saveKeywords();
  }

  return (
    <ScrollView style={styles.container}>
      <Dialog isVisible={visible} onBackdropPress={toggleDialog}>
        <Dialog.Title title="Add a new keyword:" />
        <Input
          inputStyle={{fontSize: 35}}
          placeholder="Enter keyword here..."
          onChangeText={value => setNewKeyword(value)}
        />
        <Dialog.Actions>
          <Dialog.Button
            title="CONFIRM"
            onPress={() => {
              addKeyword();
              toggleDialog();
              console.log(newKeyword);
            }}
          />
          <Dialog.Button title="CANCEL" onPress={() => toggleDialog()} />
        </Dialog.Actions>
      </Dialog>
      <Text style={{fontSize: 24}}>Select tags that apply to your video:</Text>
      <FlatList
        style={{paddingHorizontal: 40}}
        data={category}
        keyExtractor={(item: any, index) => index.toString()}
        renderItem={({item}) => (
          <Card containerStyle={{padding: 10, margin: 10}}>
            <CheckBox
              center={false}
              title={item.title}
              titleProps={{style: {paddingLeft: 4, fontSize: 20}}}
              checked={item?.checked}
              onPress={() => {
                checkBoxFunc(item.id);
                console.log('itemtest:', item);
              }}
              size={30}
            />
          </Card>
        )}
      />
      <TouchableOpacity
        style={{paddingHorizontal: 40}}
        onPress={() => toggleDialog()}>
        <Card containerStyle={{marginHorizontal: 10, margin: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Icon style={{marginLeft: 8}} name="add-outline" type="ionicon" />
            <Text style={{fontSize: 20, height: 30}}> Add keyword</Text>
          </View>
        </Card>
      </TouchableOpacity>

      <Button
        radius={50}
        buttonStyle={{
          width: 200,
          height: 65,
          marginTop: 50,
          alignSelf: 'center',
        }}
        onPress={() => navigation.goBack()}
        title="Save"
        color="#1C3EAA"
      />
      <View style={{margin: 40, height: 75}} />
    </ScrollView>
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
function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
