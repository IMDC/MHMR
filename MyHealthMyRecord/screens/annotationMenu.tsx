/*import React from 'react';
import type { PropsWithChildren } from 'react';*/
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
  NativeSyntheticEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  View,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import {Button, Icon, Input} from '@rneui/themed';
import {VideoData, useObject, useRealm} from '../models/VideoData';
import * as Styles from '../assets/util/styles';

const AnnotationMenu = () => {
  //is the current screen focused, used for state changes between navigation
  const isFocused = useIsFocused();

  const route: any = useRoute();
  const id = route.params?.id;

  const realm = useRealm();
  const video: any = useObject('VideoData', id);
  //console.log(video, id);

  const titleInput: any = useRef(null);

  const [title, setTitle] = React.useState(video.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [keywordButtonColour, setKeywordButtonColour] = React.useState(
    Styles.MHMRLightBlue,
  );
  const [keywordButtonType, setKeywordButtonType] =
    React.useState('add-outline');
  const [locationButtonColour, setLocationButtonColour] = React.useState(
    Styles.MHMRLightBlue,
  );
  const [locationButtonType, setLocationButtonType] =
    React.useState('add-outline');
  const [commentButtonColour, setCommentButtonColour] = React.useState(
    Styles.MHMRLightBlue,
  );
  const [commentButtonType, setCommentButtonType] =
    React.useState('add-outline');
  const [emotionButtonColour, setEmotionButtonColour] = React.useState(
    Styles.MHMRLightBlue,
  );
  const [emotionButtonType, setEmotionButtonType] =
    React.useState('add-outline');
  const [painButtonType, setPainButtonType] = React.useState('add-outline');
  const [painButtonColour, setPainButtonColour] = React.useState(
    Styles.MHMRLightBlue,
  );
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

  useEffect(() => {
    if (isFocused) {
      if (checkIfKeywordsAnnotated()) {
        setKeywordButtonColour(Styles.MHMRBlue);
        setKeywordButtonType('checkmark-outline');
      } else {
        setKeywordButtonColour(Styles.MHMRLightBlue);
        setKeywordButtonType('add-outline');
      }
      if (checkIfLocationsAnnotated()) {
        setLocationButtonColour(Styles.MHMRBlue);
        setLocationButtonType('checkmark-outline');
      } else {
        setLocationButtonColour(Styles.MHMRLightBlue);
        setLocationButtonType('add-outline');
      }
      if (checkIfCommentsAnnotated()) {
        setCommentButtonColour(Styles.MHMRBlue);
        setCommentButtonType('checkmark-outline');
      } else {
        setCommentButtonColour(Styles.MHMRLightBlue);
        setCommentButtonType('add-outline');
      }
      if (checkIfEmotionsAnnotated()) {
        setEmotionButtonColour(Styles.MHMRBlue);
        setEmotionButtonType('checkmark-outline');
      } else {
        setEmotionButtonColour(Styles.MHMRLightBlue);
        setEmotionButtonType('add-outline');
      }
      if (checkIfPainscaleAnnotated() || checkIfNumericPainScaleAnnotated()) {
        setPainButtonColour(Styles.MHMRBlue);
        setPainButtonType('checkmark-outline');
      } else {
        setPainButtonColour(Styles.MHMRLightBlue);
        setPainButtonType('add-outline');
      }
    }
  }, [
    keywordButtonColour,
    keywordButtonType,
    locationButtonColour,
    locationButtonType,
    commentButtonColour,
    commentButtonType,
    isFocused,
  ]);

  const windowHeight = useWindowDimensions().height;

  return (
    <SafeAreaView
      style={[
        styles.container,
        {minHeight: Math.round(windowHeight), paddingBottom: 275},
      ]}>
      {isEditingTitle ? (
        <View style={styles.editTitleContainer}>
          <TextInput
            ref={titleInput}
            style={styles.input}
            inputStyle={{fontSize: 35}}
            //value={text}
            defaultValue={title}
            onChangeText={value => setTitle(value)}
            onSubmitEditing={() => updateVideoTitle()}
          />
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
            buttonStyle={styles.cancelButton}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.titleContainer}
          onPress={() => setIsEditingTitle(true)}>
          <Text style={styles.videoTitle}>{title}</Text>
          <Icon
            name="edit"
            type="material"
            size={30}
            color={Styles.MHMRBlue}
            containerStyle={styles.iconStyle}
          />
        </TouchableOpacity>
      )}
      <Text style={styles.annotationText}>
        Select how you would like to start annotating your video:
      </Text>
      <View style={{paddingTop: 45}}>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name={painButtonType}
            size={40}
            type="ionicon"
            color={painButtonColour}
            onPress={() => navigation.navigate('Painscale', {id})}
          />
          <Text style={styles.textStyle}>Adjust painscale</Text>
        </View>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name={keywordButtonType}
            size={40}
            type={'ionicon'}
            color={keywordButtonColour}
            onPress={() => navigation.navigate('Keywords', {id})}
          />
          <Text style={styles.textStyle}>Add keywords</Text>
        </View>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name={locationButtonType}
            size={40}
            type="ionicon"
            color={locationButtonColour}
            onPress={() => navigation.navigate('Location', {id})}
          />
          <Text style={styles.textStyle}>Add location</Text>
        </View>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name={emotionButtonType}
            size={40}
            type="ionicon"
            color={emotionButtonColour}
            onPress={() => {
              navigation.navigate('Emotion Tagging', {
                id,
              });
            }}
          />
          <Text style={styles.textStyle}>Add emotion stickers</Text>
        </View>
        <View style={styles.selectionContainer}>
          <Icon
            reverse
            name={commentButtonType}
            size={40}
            type="ionicon"
            color={commentButtonColour}
            onPress={() =>
              navigation.navigate('Text Comments', {
                id,
              })
            }
          />
          <Text style={styles.textStyle}>Add text comments</Text>
        </View>
      </View>

      <Button
        containerStyle={{paddingTop: 100}}
        buttonStyle={{width: 220, height: 75, alignSelf: 'center'}}
        color="#1C3EAA"
        radius={50}
        title="Review markups"
        onPress={() =>
          navigation.navigate('Review Video Markups', {
            id,
          })
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 75,
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
  },
  selectionContainer: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  editTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },  
  saveButton: {
    backgroundColor: Styles.MHMRBlue,
    width: 100,
    marginLeft: 30,
  },
  cancelButton: {
    backgroundColor: Styles.MHMRBlue,
    width: 100,
    marginLeft: 30,
  },
  videoTitle: {
    fontSize: 35,
    fontWeight: 'bold',
    color: 'black',
  },
  iconStyle: {
    marginLeft: 30,
  },
  annotationText: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default AnnotationMenu;
