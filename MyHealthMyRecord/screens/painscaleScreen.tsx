import React, {useState, useEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  FlatList,
  LogBox,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Button} from '@rneui/themed';
import {RadioButton} from 'react-native-paper';
import {useObject, useRealm} from '../models/VideoData';

const Painscale = () => {
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id;
  const realm = useRealm();
  const video = useObject('VideoData', id);

  const parsedPainscaleWords = video.painScale.map(pain => JSON.parse(pain));
  const [category, setCategory] = useState(parsedPainscaleWords);

  const numericPainRatingScale = [
    {id: 1, name: 'Pain', severity_level: 'none'},
  ];

  const onPress = (index, severity_level, data) => {
    const newData = [...data];
    newData[index].severity_level = severity_level;
    setCategory(newData);
    setRefreshFlatList(!refreshFlatlist);
    savePainScale(newData);
  };

  const savePainScale = data => {
    const painscales = data.map(item => JSON.stringify(item));
    if (video) {
      realm.write(() => {
        video.painScale = painscales;
      });
    }
  };

  const renderItem = ({item, index, data}) => (
    <ScrollView style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <View style={{width: '35%'}}>
          <Text style={styles.textStyle}>{item.name}</Text>
        </View>
        <View style={{alignSelf: 'flex-end', justifyContent: 'flex-end'}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 280,
            }}>
            <RadioButton.Group>
              <View style={{flexDirection: 'row'}}>
                {['none', 'mild', 'moderate', 'severe'].map((level, idx) => (
                  <View key={idx} style={styles.singleRadioButtonContainer}>
                    <Text style={{fontSize: 24}}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                    <RadioButton
                      color="#5d86d7"
                      value={level}
                      status={
                        item.severity_level === level ? 'checked' : 'unchecked'
                      }
                      onPress={() => onPress(index, level, data)}
                    />
                  </View>
                ))}
              </View>
            </RadioButton.Group>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  return (
    <ScrollView style={[styles.container]}>
      <View style={{alignSelf: 'center', paddingTop: 30, flex: 1}}>
        <Text style={{fontSize: 36, color: 'black'}}>
          Numeric Pain Rating Scale
        </Text>
      </View>
      <View style={{paddingBottom: 30}}>
        <FlatList
          style={styles.container}
          extraData={refreshFlatlist}
          data={numericPainRatingScale}
          keyExtractor={(item, index) => index.toString()}
          renderItem={props =>
            renderItem({...props, data: numericPainRatingScale})
          }
        />
      </View>
      <View style={{alignSelf: 'center'}}>
        <Text style={{fontSize: 36, color: 'black'}}>
          McGill Pain Questionnaire
        </Text>
      </View>
      <FlatList
        style={styles.container}
        extraData={refreshFlatlist}
        data={category}
        keyExtractor={(item, index) => index.toString()}
        renderItem={props => renderItem({...props, data: category})}
      />
      <Button
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
  container: {
    paddingTop: 10,
  },
  textStyle: {
    marginHorizontal: 20,
    paddingTop: 20,
    color: 'black',
    fontWeight: '600',
    fontSize: 22,
    alignSelf: 'flex-start',
  },
  singleRadioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
});

export default Painscale;
