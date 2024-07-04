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
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  CheckBox,
  Button,
  Icon,
  Image,
  Input,
  Dialog,
} from '@rneui/themed';
import {useRealm, useObject} from '../models/VideoData';

const LocationTagging = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [visible, setVisible] = useState(false);

  const toggleDialog = () => {
    setVisible(!visible);
  };

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  const [newLocation, setNewLocation] = useState('');

  const [location, setLocation] = useState(video.locations);
  let parsedLocations: string[] = [];
  location.map((loc: string) => parsedLocations.push(JSON.parse(loc)));

  const [category, setCategory] = useState(parsedLocations);

  const addLocation = () => {
    const locationSchema: any = {
      id: new Realm.BSON.ObjectId(),
      title: newLocation,
      checked: false,
    };
    parsedLocations.push(locationSchema);
    const newLocation_s: any[] = [];
    parsedLocations.map((loc: string) =>
      newLocation_s.push(JSON.stringify(loc)),
    );
    setCategory(parsedLocations);
    setLocation(newLocation_s);

    if (video) {
      realm.write(() => {
        video.locations! = newLocation_s;
      });
    }
  };

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
  }

  function checkBoxFunc(id: any) {
    const textTag: any = [...category];
    textTag.map((item: any) => {
      if (item.id === id) {
        item.checked = !item.checked;
        setCategory(textTag);
      }
    });
    saveLocations();
  }

  return (
    <ScrollView style={styles.container}>
      <Dialog isVisible={visible} onBackdropPress={toggleDialog}>
        <Dialog.Title title="Add a new location:" />
        <Input
          inputStyle={{fontSize: 35}}
          placeholder="Enter location here..."
          onChangeText={value => setNewLocation(value)}
        />
        <Dialog.Actions>
          <Dialog.Button
            title="CONFIRM"
            onPress={() => {
              addLocation();
              toggleDialog();
              console.log(newLocation);
            }}
          />
          <Dialog.Button title="CANCEL" onPress={() => toggleDialog()} />
        </Dialog.Actions>
      </Dialog>
      <Text style={{fontSize: 24}}>
        This video includes the following locations:
      </Text>
      <FlatList
        style={{paddingHorizontal: 40}}
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
              titleProps={{style: {paddingLeft: 4, fontSize: 20}}}
              onPress={() => {
                checkBoxFunc(item.id);
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
            <Text style={{fontSize: 20, height: 30}}> Add locations</Text>
          </View>
        </Card>
      </TouchableOpacity>
      <Button
        radius={50}
        buttonStyle={{
          width: 220,
          height: 75,
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

export default LocationTagging;
