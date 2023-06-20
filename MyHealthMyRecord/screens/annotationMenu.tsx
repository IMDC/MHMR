/*import React from 'react';
import type { PropsWithChildren } from 'react';*/
import {ParamListBase, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  NativeSyntheticEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  View,
} from 'react-native';
import {Button, Icon, Input} from '@rneui/themed';
import {VideoData, useObject, useRealm} from '../models/VideoData';

const AnnotationMenu = () => {
  const route: any = useRoute();
  const title = route.params?.title;
  const location = route.params?.location;
  const id = route.params?.id;
  const filename = route.params?.filename;
  const painscale = route.params?.painscale;
  const keywords = route.params?.keywords;

  const titleInput: any = useRef(null);

  const [text, setText] = React.useState(title);

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const realm = useRealm();
  const video: any = useObject('VideoData', id);
  //console.log(video, id);

  const updateVideoTitle = () => {
    console.log('new:', text);
    if (video) {
      realm.write(() => {
        video.title! = text;
      });
    }
  };

  const focusTitle = () => {
    console.log('focus');
    //titleInput.current.setNativeProps({cursorColor: '#FFFFFF'});
    /* if (titleInput != null) {
    titleInput.current.setNativeProps({rightIcon: 
      <Icon
      ref={titleInputIcon}
        name="checkmark-outline"
        size={40}
        type="ionicon"
        color="#1C3EAA"
        onPress={() => updateVideoTitle()}
        //containerStyle={{ display: 'block' }}
      />});
    } */
  };

  return (
    <SafeAreaView style={styles.container}>
      <Input
        ref={titleInput}
        inputStyle={{fontSize: 35}}
        //value={text}
        defaultValue={title}
        onChangeText={value => setText(value)}
        onFocus={() => focusTitle()}
        onSubmitEditing={() => updateVideoTitle()}
        /* rightIcon={
          <Icon
            //ref={titleInputIcon}
            name="checkmark-outline"
            size={40}
            type="ionicon"
            color="#1C3EAA"
            onPress={() => updateVideoTitle()}
            //containerStyle={{ display: 'none' }}
          />} */
      />
      <Text style={{fontSize: 24}}>
        Select how you would like to start annotating your video:
      </Text>
      <View style={{paddingTop: 45}}>
        <View style={styles.selectionContainer}>
          {video.painScale.length == 0 ? (
            <Icon
              reverse
              name="add-outline"
              size={40}
              type="ionicon"
              color="#C7CBD1"
              onPress={() => navigation.navigate('Painscale')}
            />
          ) : (
            <Icon
              reverse
              name="checkmark-outline"
              size={40}
              type="ionicon"
              color="#1C3EAA"
              onPress={() => navigation.navigate('Painscale')}
            />
          )}
          <Text style={styles.textStyle}>Adjust Painscale</Text>
        </View>
        <View style={styles.selectionContainer}>
          {video.keywords.length == 0 ? (
            <Icon
              reverse
              name="add-outline"
              size={40}
              type="ionicon"
              color="#C7CBD1"
              onPress={() => navigation.navigate('Keywords')}
            />
          ) : (
            <Icon
              reverse
              name="checkmark-outline"
              size={40}
              type="ionicon"
              color="#1C3EAA"
              onPress={() => navigation.navigate('Keywords')}
            />
          )}

          <Text style={styles.textStyle}>Add Keywords</Text>
        </View>
        <View style={styles.selectionContainer}>
          {video.location == null ? (
            <Icon
              reverse
              name="add-outline"
              size={40}
              type="ionicon"
              color="#C7CBD1"
              onPress={() => navigation.navigate('Location')}
            />
          ) : (
            <Icon
              reverse
              name="checkmark-outline"
              size={40}
              type="ionicon"
              color="#1C3EAA"
              onPress={() => navigation.navigate('Location')}
            />
          )}

          <Text style={styles.textStyle}>Add Location</Text>
        </View>
        <View style={styles.selectionContainer}>
          {video.emotionStickers.length == 0 ? (
            <Icon
              reverse
              name="add-outline"
              size={40}
              type="ionicon"
              color="#C7CBD1"
              onPress={() => {
                navigation.navigate('Emotion Tagging', {
                  id,
                  title,
                  location,
                  filename,
                });
              }}
            />
          ) : (
            <Icon
              reverse
              name="checkmark-outline"
              size={40}
              type="ionicon"
              color="#1C3EAA"
              onPress={() => {
                navigation.navigate('Emotion Tagging', {
                  id,
                  title,
                  location,
                  filename,
                });
              }}
            />
          )}

          <Text style={styles.textStyle}>Add Emotion Stickers</Text>
        </View>
        <View style={styles.selectionContainer}>
          {video.textComments.length == 0 ? (
            <Icon
              reverse
              name="add-outline"
              size={40}
              type="ionicon"
              color="#C7CBD1"
              onPress={() =>
                navigation.navigate('Text Comments', {
                  id,
                  title,
                  location,
                  filename,
                })
              }
            />
          ) : (
            <Icon
              reverse
              name="checkmark-outline"
              size={40}
              type="ionicon"
              color="#1C3EAA"
              onPress={() =>
                navigation.navigate('Text Comments', {
                  id,
                  title,
                  location,
                  filename,
                })
              }
            />
          )}

          <Text style={styles.textStyle}>Add Text Comments</Text>
        </View>
      </View>

      <Button
        containerStyle={{paddingTop: 100}}
        buttonStyle={{width: 220, height: 75, alignSelf: 'center'}}
        color="#1C3EAA"
        title="Review Markups"
        onPress={() =>
          navigation.navigate('Review Annotations', {
            id,
            title,
            location,
            filename,
          })
        }
      />
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
});

export default AnnotationMenu;
