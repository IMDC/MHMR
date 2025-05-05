import {
  ParamListBase,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  LogBox,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TextInputFocusEventData,
} from 'react-native';
import {Button, Icon, Input} from '@rneui/themed';
import {useObject, useRealm} from '../../models/VideoData';
import * as Styles from '../../assets/util/styles';

const AnnotationMenu = () => {
  //is the current screen focused, used for state changes between navigation
  const isFocused = useIsFocused();

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);
  //console.log(video, id);

  const titleInput: any = useRef(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [title, setTitle] = React.useState(video.title);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const updateVideoTitle = () => {
    console.log('new:', title);
    if (video) {
      realm.write(() => {
        video.title! = title;
      });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setTitle(video.title);
    setIsEditingTitle(false);
  };

  const checkIfKeywordsAnnotated = () => {
    let isAnnotated = false;
    const keywords = video.keywords;
    keywords.map((key: string) => {
      if (JSON.parse(key).checked) isAnnotated = true;
    });
    return isAnnotated;
  };

  const checkIfLocationsAnnotated = () => {
    let isAnnotated = false;
    const locations = video.locations;
    locations.map((loc: string) => {
      if (JSON.parse(loc).checked) isAnnotated = true;
    });
    return isAnnotated;
  };

  const checkIfCommentsAnnotated = () => {
    let isAnnotated = false;
    const comments = video.textComments;
    if (comments.length != 0) isAnnotated = true;
    return isAnnotated;
  };

  const checkIfEmotionsAnnotated = () => {
    let isAnnotated = false;
    const emotions = video.emotionStickers;
    if (emotions.length != 0) isAnnotated = true;
    return isAnnotated;
  };

  const checkIfPainscaleAnnotated = () => {
    let isAnnotated = false;
    const painscale = video.painScale;
    painscale.map((pain: string) => {
      if (JSON.parse(pain).severity_level != 'none') isAnnotated = true;
    });
    return isAnnotated;
  };

  const checkIfNumericPainScaleAnnotated = () => {
    let isAnnotated = false;
    const numeric = video.numericScale;
    if (numeric != 0) isAnnotated = true;

    return isAnnotated;
  };

  useEffect(() => {
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state.',
    ]);
  });

  const windowHeight = useWindowDimensions().height;

  return (
    <View
      style={[
        styles.container,
        {
          // minHeight: Math.round(windowHeight),
          // paddingBottom: 200,
          // paddingTop: 10,
          justifyContent: 'space-around',
        },
      ]}>
      <View
        style={{
          flexDirection: 'column',
          paddingHorizontal: '8%',
        }}>
        {isEditingTitle ? (
          <View style={styles.editTitleContainer}>
            <TextInput
              ref={titleInput}
              style={styles.input}
              //value={text}
              defaultValue={title}
              onChangeText={value => setTitle(value)}
              onSubmitEditing={() => updateVideoTitle()}
            />
            <View style={{flexDirection: 'column'}}>
              <Button
                radius={50}
                title="Save"
                onPress={updateVideoTitle}
                buttonStyle={styles.saveButton}
              />
              <Button
                radius={50}
                title="Cancel"
                onPress={handleCancelEditTitle}
                buttonStyle={styles.saveButton}
              />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => setIsEditingTitle(true)}>
            <ScrollView horizontal style={{width: 20}}>
              <Text style={styles.videoTitle}> {title} </Text>
            </ScrollView>
            <Icon
              name="edit"
              type="material"
              size={30}
              color={Styles.MHMRBlue}
              containerStyle={styles.iconStyle}
            />
          </TouchableOpacity>
        )}
        <Text
          style={{
            fontSize: Styles.windowWidth > 768 ? 26 : 18,
            marginBottom: '2%',
          }}>
          Select how you would like to start annotating your video:
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingLeft: '20%',
        }}>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name={
              checkIfPainscaleAnnotated() || checkIfNumericPainScaleAnnotated()
                ? 'checkmark-outline'
                : 'add-outline'
            }
            size={Styles.windowHeight * 0.033}
            type="ionicon"
            color={
              checkIfPainscaleAnnotated() || checkIfNumericPainScaleAnnotated()
                ? Styles.MHMRBlue
                : Styles.MHMRLightBlue
            }
            onPress={() =>
              navigation.navigate('Painscale', {
                id,
              })
            }
          />
          <Text style={styles.textStyle}> Adjust painscale </Text>
        </View>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name={
              checkIfKeywordsAnnotated() ? 'checkmark-outline' : 'add-outline'
            }
            size={Styles.windowHeight * 0.033}
            type={'ionicon'}
            color={
              checkIfKeywordsAnnotated()
                ? Styles.MHMRBlue
                : Styles.MHMRLightBlue
            }
            onPress={() =>
              navigation.navigate('Keywords', {
                id,
              })
            }
          />
          <Text style={styles.textStyle}> Add keywords </Text>
        </View>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name={
              checkIfLocationsAnnotated() ? 'checkmark-outline' : 'add-outline'
            }
            size={Styles.windowHeight * 0.033}
            type="ionicon"
            color={
              checkIfLocationsAnnotated()
                ? Styles.MHMRBlue
                : Styles.MHMRLightBlue
            }
            onPress={() =>
              navigation.navigate('Location', {
                id,
              })
            }
          />
          <Text style={styles.textStyle}> Add location </Text>
        </View>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name={
              checkIfEmotionsAnnotated() ? 'checkmark-outline' : 'add-outline'
            }
            size={Styles.windowHeight * 0.033}
            type="ionicon"
            color={
              checkIfEmotionsAnnotated()
                ? Styles.MHMRBlue
                : Styles.MHMRLightBlue
            }
            onPress={() => {
              navigation.navigate('Emotion Tagging', {
                id,
              });
            }}
          />
          <Text style={styles.textStyle}> Add emotion stickers </Text>
        </View>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name={
              checkIfCommentsAnnotated() ? 'checkmark-outline' : 'add-outline'
            }
            size={Styles.windowHeight * 0.033}
            type="ionicon"
            color={
              checkIfCommentsAnnotated()
                ? Styles.MHMRBlue
                : Styles.MHMRLightBlue
            }
            onPress={() =>
              navigation.navigate('Text Comments', {
                id,
              })
            }
          />
          <Text style={styles.textStyle}> Add text comments </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          buttonStyle={styles.btnStyle}
          size="lg"
          radius={50}
          title="Annotate later"
          onPress={() => navigation.navigate('View Recordings')}
        />
        <Button
          buttonStyle={styles.btnStyle}
          size="lg"
          radius={50}
          title="Review markups"
          onPress={() =>
            navigation.navigate('Review Video Markups', {
              id,
            })
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textStyle: {
    alignSelf: 'center',
    fontSize: 24,
    paddingLeft: 10,
  },
  input: {
    height: 60,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: 30,
    flex: 1,
  },
  selectionContainer: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2%',
    flexWrap: 'wrap',
    
  },
  editTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  saveButton: {
    backgroundColor: Styles.MHMRBlue,
    marginLeft: '1%',
    marginVertical: 1,
  },
  cancelButton: {
    backgroundColor: Styles.MHMRBlue,
    width: 100,
    marginLeft: 10,
  },
  videoTitle: {
    fontSize: Styles.windowWidth > 768 ? 35 : 24,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: 'black',
    flexShrink: 1,
    textAlign: 'center',
  },
  iconStyle: {
    marginLeft: 10,
  },
  annotationText: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  btnStyle: {
    backgroundColor: '#1C3EAA',
    width: 200,
    height: 65,
  },
});

export default AnnotationMenu;
