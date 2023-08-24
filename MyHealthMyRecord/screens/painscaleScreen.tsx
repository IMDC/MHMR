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
import React, {useState, useMemo, useEffect} from 'react';
import {
  FlatList,
  LogBox,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ButtonGroup, Icon, Slider, Button} from '@rneui/themed';
import {Card, TextInput, RadioButton} from 'react-native-paper';
import {useObject, useRealm} from '../models/VideoData';

export default function Painscale() {
  const [refreshFlatlist, setRefreshFlatList] = useState(false);

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);

  let parsedPainscaleWords: any[] = [];

  const [painscaleWords, setPainscaleWords] = useState(video.painScale);

  painscaleWords.map((pain: string) =>
    parsedPainscaleWords.push(JSON.parse(pain)),
  );

  const [category, setCategory] = useState(parsedPainscaleWords);

  const onPress = (index: any, value: any, severity_level: any) => {
    const existing: any = {...category};
    existing[index].severity_level = severity_level;
    setRefreshFlatList(!refreshFlatlist);
    console.log(existing[index].name, 'status set to', severity_level);
    savePainScale();
  };

  function savePainScale() {
    const painscales: any = [];
    category.map((item: any) => {
      painscales.push(JSON.stringify(item));
    });
    if (video) {
      realm.write(() => {
        video.painScale! = painscales;
      });
    }
  }

  const [sliderValue, setSliderValue] = useState(0);

  // const interpolate = (start: number, end: number) => {
  //   let k = (sliderValue - 0) / 10; // 0 =>min  && 10 => MAX
  //   return Math.ceil((1 - k) * start + k * end) % 256;
  // };

  const renderItem = ({item, index}) => {
    return (
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
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <View style={styles.singleRadioButtonContainer}>
                    <Text style={{fontSize: 24}}>None</Text>
                    <RadioButton
                      color="#5d86d7"
                      value="none"
                      // key={index}
                      status={
                        item.severity_level == 'none' ? 'checked' : 'unchecked'
                      }
                      onPress={() => {
                        onPress(index, 0, 'none');
                      }}
                    />
                  </View>
                  <View style={styles.singleRadioButtonContainer}>
                    <Text style={{fontSize: 24}}>Mild</Text>
                    <RadioButton
                      color="#5d86d7"
                      value="mild"
                      // key={index}
                      status={
                        item.severity_level == 'mild' ? 'checked' : 'unchecked'
                      }
                      onPress={() => {
                        onPress(index, 1, 'mild');
                      }}
                    />
                  </View>

                  <View style={styles.singleRadioButtonContainer}>
                    <Text style={{fontSize: 24}}>Moderate</Text>
                    <RadioButton
                      color="#5d86d7"
                      value="moderate"
                      key={item.id}
                      status={
                        item.severity_level == 'moderate'
                          ? 'checked'
                          : 'unchecked'
                      }
                      onPress={() => {
                        onPress(index, 2, 'moderate');
                      }}
                    />
                  </View>
                  <View style={styles.singleRadioButtonContainer}>
                    <Text style={{fontSize: 24}}>Severe</Text>
                    <RadioButton
                      color="#5d86d7"
                      value="severe"
                      key={item.id}
                      status={
                        item.severity_level == 'severe'
                          ? 'checked'
                          : 'unchecked'
                      }
                      onPress={() => {
                        onPress(index, 3, 'severe');
                      }}
                    />
                  </View>
                </View>
              </RadioButton.Group>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  return (
    <ScrollView style={[styles.container]}>
      <View style={{alignSelf: 'center'}}>
        <Text style={{fontSize: 36, color: 'black'}}>
          McGill Pain Questionnaire
        </Text>
      </View>
      <FlatList
        style={styles.container}
        // data={data}
        extraData={refreshFlatlist}
        data={category}
        keyExtractor={(item: any, index) => index.toString()}
        renderItem={renderItem}
      />
      <View style={{alignSelf: 'center', paddingTop: 30}}>
        <Text style={{fontSize: 36, color: 'black'}}>
          Numeric Pain Rating Scale
        </Text>
      </View>
      <View style={{marginHorizontal: 40, paddingBottom: 50}}>
        <Text style={{paddingTop: 20}}>Value: {sliderValue}</Text>
        <Slider
          value={sliderValue}
          onValueChange={setSliderValue}
          maximumValue={10}
          minimumValue={0}
          step={1}
          allowTouchTrack
          trackStyle={{height: 5, backgroundColor: 'transparent'}}
          thumbStyle={{height: 20, width: 20, backgroundColor: 'transparent'}}
          thumbProps={{
            children: (
              <Icon
                name="heartbeat"
                type="font-awesome"
                size={20}
                reverse
                containerStyle={{bottom: 20, right: 20}}
                // color={color()}
              />
            ),
          }}
        />
      </View>
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
}

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
