import * as React from 'react';
import {Text, View} from 'react-native';
import 'react-native-get-random-values';
import {RealmProvider} from './models/VideoData';
import {NavigationContainer, useNavigation, ParamListBase} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import Home from './screens/home';
import RecordVideo from './screens/recordVideo';
import ViewRecordings from './screens/videoDirectory';
import AnnotationMenu from './screens/annotationMenu';
import ReviewAnnotations from './screens/reviewAnnotations';
import KeywordTagging from './screens/keywordTagging';
import LocationTagging from './screens/locationTagging';
import EmotionTagging from './screens/emotionTagging';
import TextComments from './screens/textComments';
import { Icon } from '@rneui/themed';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <RealmProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Record Video" component={RecordVideo} />
          <Stack.Screen
            name="View Recordings"
            component={ViewRecordings}></Stack.Screen>
          <Stack.Screen name="Annotation Menu" component={AnnotationMenu} />
          <Stack.Screen
            name="Review Annotations"
            component={ReviewAnnotations}
          />
          <Stack.Screen
            name="Keyword Tagging"
            component={KeywordTagging}
            options={({navigation}) => ({
              headerRight: () => (
                <Icon
                  name="checkmark-outline"
                  type="ionicon"
                  onPress={() => navigation.navigate('Annotation Menu')}
                />
              ),
            })}
          />
          <Stack.Screen
            name="Location Tagging"
            component={LocationTagging}
            options={({navigation}) => ({
              headerRight: () => (
                <Icon
                  name="checkmark-outline"
                  type="ionicon"
                  onPress={() => navigation.navigate('Annotation Menu')}
                />
              ),
            })}
          />
          <Stack.Screen
            name="Emotion Tagging"
            component={EmotionTagging}
            options={({navigation}) => ({
              headerRight: () => (
                <Icon
                  name="checkmark-outline"
                  type="ionicon"
                  onPress={() => navigation.navigate('Annotation Menu')}
                />
              ),
            })}
          />
          <Stack.Screen
            name="Text Comments"
            component={TextComments}
            options={({navigation}) => ({
              headerRight: () => (
                <Icon
                  name="checkmark-outline"
                  type="ionicon"
                  onPress={() => navigation.navigate('Annotation Menu')}
                />
              ),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </RealmProvider>
  );
}

export default App;
