import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
  FlatList,
} from 'react-native';
import {Card, CheckBox, Button, Icon, Image} from '@rneui/themed';
import {useRealm, useObject} from '../models/VideoData';

const LocationTagging = () => {
const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  let parsedLocations: string[] = [];

  const [location, setLocation] = useState(video.locations);

  location.map((loc: string) => parsedLocations.push(JSON.parse(loc)));

  const [category, setCategory] = useState(parsedLocations);

  function sliderFunc(index: any) {
    console.log(index);
    const locationTag: any = [...category];
    locationTag[index].checked = !locationTag[index].checked;
    setCategory(locationTag);
    saveLocations();
  }

  function saveLocations() {
    const locations: any = [];
    category.map((item: any) => {
      locations.push(JSON.stringify(item));
    });
    console.log('test:', locations);
    if (video) {
      realm.write(() => {
        video.locations! = locations;
      });
    }
    // navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{fontSize: 24}}>
        This video includes the following locations:
      </Text>
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
              onPress={() => sliderFunc(index)}
              size={30}
            />
          </Card>
        )}
      />
      {/* <Button
        buttonStyle={{width: 220, height: 75, alignSelf: 'center'}}
        onPress={saveLocations}
        title="Save"
        color="#1C3EAA"
      /> */}
      <View style={{margin:40, height: 75}}/>
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
