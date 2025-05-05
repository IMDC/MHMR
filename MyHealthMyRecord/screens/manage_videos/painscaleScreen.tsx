import React, {useState, useEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  FlatList,
  LogBox,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, Icon, Slider} from '@rneui/themed';
import {RadioButton} from 'react-native-paper';
import {useObject, useRealm} from '../../models/VideoData';

const Painscale = () => {
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id;
  const realm = useRealm();
  const video = useObject('VideoData', id);

  const parsedPainscaleWords = video.painScale.map(pain => JSON.parse(pain));

  const [category, setCategory] = useState(parsedPainscaleWords);
  const [mcGillIsVisible, setMcGillIsVisible] = useState(false);

  const [value, setValue] = useState(video.numericScale);
  // const [numericScale, setNumericScale] = video.numericScale;

  const onPress = (index, severity_level, data, setData) => {
    const newData = [...data];
    newData[index].severity_level = severity_level;
    setData(newData);
    setRefreshFlatList(!refreshFlatlist);
    if (data === category) {
      savePainScale(newData);
      console.log(newData);
    }
  };

  const saveNumericScale = data => {
    if (video) {
      realm.write(() => {
        video.numericScale = data;
      }
    );
  }
}

  const savePainScale = data => {
    const painscales = data.map(item => JSON.stringify(item));
    if (video) {
      realm.write(() => {
        video.painScale = painscales;
      });
    }
  };

  const renderItem = ({item, index, data, setData}) => (
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
                      onPress={() => onPress(index, level, data, setData)}
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
          Numeric pain rating scale
        </Text>
      </View>
      <View style={[styles.contentView]}>
        <Slider
          value={value}
          onValueChange={setValue}
          maximumValue={3}
          minimumValue={0}
          allowTouchTrack
          trackStyle={{height: 5, backgroundColor: 'transparent'}}
          thumbStyle={{height: 20, width: 20, backgroundColor: 'transparent'}}
          thumbProps={{
            children: (
              <Icon
                name="circle"
                type="font-awesome"
                size={20}
                reverse
                containerStyle={{bottom: 20, right: 20}}
                // color={color()}
              />
            ),
          }}
          onSlidingComplete={value => {
            console.log(value.toFixed(1));
            
            saveNumericScale(Number(value.toFixed(1)));
          }}
        />
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 20, color: 'black'}}>0</Text>
          <Text style={{fontSize: 20, color: 'black'}}>1</Text>
          <Text style={{fontSize: 20, color: 'black'}}>2</Text>
          <Text style={{fontSize: 20, color: 'black'}}>3</Text>
        </View>
        <View>
          <Text style={{fontSize: 20, color: 'black', alignSelf: 'center'}}>
          {value.toFixed(1)} -{' '}
            {value < 0.5
              ? 'No pain'
              : value < 1.5
              ? 'Mild pain'
              : value < 2.5
              ? 'Moderate pain'
              : 'Severe pain'}
          </Text>
        </View>
      </View>

      {/* <View style={{paddingBottom: 30}}>
        <FlatList
          style={styles.container}
          extraData={refreshFlatlist}
          data={numericScale}
          keyExtractor={(item, index) => index.toString()}
          renderItem={props =>
            renderItem({...props, data: numericScale, setData: setNumericScale})
          }
        />
      </View> */}
      <View style={{alignSelf: 'center'}}>
        <Text style={{fontSize: 36, color: 'black'}}>
          McGill pain questionnaire
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          padding: 10,
          backgroundColor: '#d1d1d1',
        }}>
        <TouchableOpacity onPress={() => setMcGillIsVisible(!mcGillIsVisible)}>
          <View>
            <TouchableOpacity
              style={{flexDirection: 'row'}}
              onPress={() => setMcGillIsVisible(!mcGillIsVisible)}>
              <Text>{mcGillIsVisible ? 'Hide' : 'Show'}</Text>

              {/* <Text style={{fontSize: 20, fontWeight: 'bold'}}>Show +</Text> */}
              <Icon
                name={
                  mcGillIsVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                }
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
      {mcGillIsVisible ? (
        <View style={{backgroundColor: '#e8e8e8', paddingBottom: 40}}>
          <FlatList
            style={styles.container}
            extraData={refreshFlatlist}
            data={category}
            keyExtractor={(item, index) => index.toString()}
            renderItem={props =>
              renderItem({...props, data: category, setData: setCategory})
            }
          />
        </View>
      ) : (
        <View></View>
      )}
      <Button
        radius={50}
        buttonStyle={{
          width: 200,
          height: 65,
          marginTop: 50,
          alignSelf: 'center',
        }}
        onPress={() => {
          navigation.goBack();
          // saveNumericScale(value);
        }}
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
  contentView: {
    padding: 20,
    paddingHorizontal: 100,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  singleRadioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
});



export default Painscale;
