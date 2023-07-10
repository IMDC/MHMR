import {
  ParamListBase,
  useNavigation,
  NavigationContainer,
} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import React, {useState, useMemo} from 'react';
import {FlatList, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ButtonGroup, Icon, Slider, Button } from '@rneui/themed';
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

  const onRadiochange = (index: string | number, value: any) => {
    const existing = {...cat};
    existing[index] = value;
    setCat(existing);
  };

  const renderItem = ({item}) => {
    let items = [];
    if (item.id) {
      items = item.severity_level.map((severity_level: { id: any; }) => {
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
                  style={{flexDirection: 'row', alignContent: 'space-around'}}>
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
        <Text style={styles.textStyle}>{item.name}</Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginHorizontal: 20,
          }}>
          <Text style={{alignSelf: 'center'}}>{items}</Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.container}
        // data={data}
        data={painscaleWords}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flex: 1,
    backgroundColor: 'white',
  },

  textStyle: {
    marginHorizontal: 20,
    marginTop: 10,
    color: 'black',
    fontWeight: '600',
    fontSize: 20,
  },
  singleRadioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
});