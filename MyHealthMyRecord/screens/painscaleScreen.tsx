import {
  ParamListBase,
  useNavigation,
  NavigationContainer,
} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {ButtonGroup, Icon, Slider} from '@rneui/themed';

const Painscale = () => {
  const painWords = [
    {id: 1, title: 'Throbbing', value: 0},
    {id: 2, title: 'Shooting', value: 0},
    {id: 3, title: 'Stabbing', value: 0},
    {id: 4, title: 'Sharp', value: 0},
    {id: 5, title: 'Cramping', value: 0},
    {id: 6, title: 'Gnawing', value: 0},
    {id: 7, title: 'Hot-burning', value: 0},
    {id: 8, title: 'Aching', value: 0},
    {id: 9, title: 'Heavy', value: 0},
    {id: 10, title: 'Tender', value: 0},
    {id: 11, title: 'Splitting', value: 0},
    {id: 12, title: 'Tired-Exhausting', value: 0},
    {id: 13, title: 'Sickening', value: 0},
    {id: 14, title: 'Fearful', value: 0},
    {id: 15, title: 'Cruel-Punishing', value: 0},
  ];
  const [value, setValue] = useState(0);

  const interpolate = (start: number, end: number) => {
    let k = (value - 0) / 3; // 0 =>min  && 10 => MAX
    return Math.ceil((1 - k) * start + k * end) % 256;
  };

  const color = () => {
    let r = interpolate(255, 0);
    let g = interpolate(0, 255);
    let b = interpolate(0, 0);
    return `rgb(${g},${r},${b})`;
  };

  const changeValue = (value: any) => {
    console.log(value);
    setValue(value);
  };

const [selectedIndex, setSelectedIndex] = useState(0);
const [selectedIndexes, setSelectedIndexes] = useState([0, 2, 3]);

  return (
    <>
      <SafeAreaView>
        <FlatList
          style={{padding: 40}}
          data={painWords}
          keyExtractor={(item: any, index: {toString: () => any}) =>
            index.toString()
          }
          renderItem={({item, index}) => (
            <View
              style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <Text style={styles.textContainer}>{item.title}</Text>
              <View style={styles.sliderContainer}>
                
                {/* <Slider
                  value={item.value}
                  onValueChange={setValue}
                  maximumValue={3}
                  minimumValue={0}
                  step={1}
                  allowTouchTrack
                  trackStyle={{height: 5, backgroundColor: 'transparent'}}
                  thumbStyle={{
                    height: 20,
                    width: 20,
                    backgroundColor: 'transparent',
                  }}
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
                /> */}
                {/* <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{fontSize: 22}}>None</Text>
                  <Text style={{fontSize: 22}}>Mild</Text>
                  <Text style={{fontSize: 22}}>Moderate</Text>
                  <Text style={{fontSize: 22}}>Severe</Text>
                </View> */}
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    textAlign: 'right',
    // alignSelf: 'center',
    fontSize: 28,

    fontWeight: 'bold',
  },
  sliderContainer: {width: '60%', height: '100%', alignSelf: 'flex-end'},
  //   container: {margin: 75},
  contentView: {
    padding: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  subHeader: {
    backgroundColor: '#2089dc',
    color: 'white',
    textAlign: 'center',
    paddingVertical: 5,
    marginBottom: 10,
  },
});

export default Painscale;
