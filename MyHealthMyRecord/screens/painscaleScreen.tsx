import {
  ParamListBase,
  useNavigation,
  NavigationContainer,
} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import React, {useState, useMemo, useEffect} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ButtonGroup, Icon, Slider, Button} from '@rneui/themed';
import {Card, TextInput, RadioButton} from 'react-native-paper';

const painscaleWords = [
  {
    id: 1,
    name: 'Throbbing',
    severity_level: [
      {
        id: 16,
        status: 'active',
      },
    ],
  },
  {
    id: 2,
    name: 'Shooting',
    status: 'active',
    severity_level: [
      {
        id: 17,
        status: 'active',
      },
    ],
  },
  {
    id: 3,
    name: 'Stabbing',
    severity_level: [
      {
        id: 18,
        status: 'active',
      },
    ],
  },
  {
    id: 4,
    name: 'Sharp',
    severity_level: [
      {
        id: 19,
        status: 'active',
      },
    ],
  },
  {
    id: 5,
    name: 'Cramping',
    severity_level: [
      {
        id: 20,
        status: 'active',
      },
    ],
  },
  {
    id: 6,
    name: 'Gnawing',
    severity_level: [
      {
        id: 21,
        status: 'active',
      },
    ],
  },
  {
    id: 7,
    name: 'Burning',
    severity_level: [
      {
        id: 22,
        status: 'active',
      },
    ],
  },
  {
    id: 8,
    name: 'Aching',
    severity_level: [
      {
        id: 23,
        status: 'active',
      },
    ],
  },
  {
    id: 9,
    name: 'Heavy',
    severity_level: [
      {
        id: 24,
        status: 'active',
      },
    ],
  },
  {
    id: 10,
    name: 'Tender',
    severity_level: [
      {
        id: 25,
        status: 'active',
      },
    ],
  },
  {
    id: 11,
    name: 'Splitting',
    severity_level: [
      {
        id: 26,
        status: 'active',
      },
    ],
  },
  {
    id: 12,
    name: 'Tiring/Exhausting',
    severity_level: [
      {
        id: 27,
        status: 'active',
      },
    ],
  },
  {
    id: 13,
    name: 'Sickening',
    severity_level: [
      {
        id: 28,
        status: 'active',
      },
    ],
  },
  {
    id: 14,
    name: 'Fearful',
    severity_level: [
      {
        id: 29,
        status: 'active',
      },
    ],
  },
  {
    id: 15,
    name: 'Cruel/Punishing',
    severity_level: [
      {
        id: 30,
        status: 'active',
      },
    ],
  },
];

export default function Painscale() {
  const getState = () => {
    let objData = {};
    painscaleWords.map(data => {
      objData[data.id] = null;
    });
    return objData;
  };

  const [cat, setCat] = useState(getState());

  const onPress = (index: string | number, value: number) => {
    const existing = {...cat};
    existing[index] = value;
    setCat(existing);

  };
  const [sliderValue, setSliderValue] = useState(0);

    const interpolate = (start: number, end: number) => {
      let k = (sliderValue - 0) / 10; // 0 =>min  && 10 => MAX
      return Math.ceil((1 - k) * start + k * end) % 256;
    };

    const color = () => {
      let r = interpolate(255, 0);
      let g = interpolate(0, 255);
      let b = interpolate(0, 0);
      return `rgb(${g},${r},${b})`;
    };

  const renderItem = ({item}) => {
    let items = [];
    if (item.id) {
      items = item.severity_level.map((severity_level: {id: any}) => {
        const index = severity_level.id;
        return (
          <>
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
                      status={cat[index] === 0 ? 'checked' : 'unchecked'}
                      onPress={() => {
                        onPress(index, 0);
                      }}
                    />
                  </View>
                  <View style={styles.singleRadioButtonContainer}>
                    <Text style={{fontSize: 24}}>Mild</Text>
                    <RadioButton
                      color="#5d86d7"
                      value="mild"
                      // key={index}
                      status={cat[index] === 1 ? 'checked' : 'unchecked'}
                      onPress={() => {
                        onPress(index, 1);
                      }}
                    />
                  </View>

                  <View style={styles.singleRadioButtonContainer}>
                    <Text style={{fontSize: 24}}>Moderate</Text>
                    <RadioButton
                      color="#5d86d7"
                      value="moderate"
                      key={index}
                      status={cat[index] === 2 ? 'checked' : 'unchecked'}
                      onPress={() => {
                        onPress(index, 2);
                      }}
                    />
                  </View>
                  <View style={styles.singleRadioButtonContainer}>
                    <Text style={{fontSize: 24}}>Severe</Text>
                    <RadioButton
                      color="#5d86d7"
                      value="severe"
                      key={index}
                      status={cat[index] === 3 ? 'checked' : 'unchecked'}
                      onPress={() => {
                        onPress(index, 3);
                      }}
                    />
                  </View>
                </View>
              </RadioButton.Group>
            </View>
            
          </>
        );
      });
    }
    return (
      <ScrollView style={styles.container}>
        <View style={{flexDirection: 'row'}}>
          <View style={{width: '40%'}}>
            <Text style={styles.textStyle}>{item.name}</Text>
          </View>

          <View style={{alignSelf: 'flex-end', justifyContent: 'flex-end'}}>
            <Text>{items}</Text>
          </View>
        </View>


      </ScrollView>
    );
  };

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
        data={painscaleWords}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
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
                color={color()}
              />
            ),
          }}
        />
      </View>
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
    paddingLeft: 50,
    alignSelf: 'flex-start',
  },
  singleRadioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
});
