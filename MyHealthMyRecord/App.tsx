import * as React from 'react';
import {Text, View} from 'react-native';
import 'react-native-get-random-values';
import {RealmProvider} from './models/VideoData';
import {
  NavigationContainer,
  useNavigation,
  ParamListBase,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import Home from './screens/home';
import RecordVideo from './screens/recordVideo';
import ViewRecordings from './screens/videoDirectory';
import AnnotationMenu from './screens/annotationMenu';
import ReviewAnnotations from './screens/reviewAnnotations';
import KeywordTagging from './screens/keywordTagging';
import LocationTagging from './screens/locationTagging';
import EmotionTagging from './screens/emotionTagging';
import TextComments from './screens/textComments';
import FullscreenVideo from './screens/fullscreenVideo';
import Painscale from './screens/painscaleScreen';
import {Icon} from '@rneui/themed';

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
          <Stack.Screen name="Keywords" component={KeywordTagging} />
          <Stack.Screen name="Location" component={LocationTagging} />
          <Stack.Screen name="Emotion Tagging" component={EmotionTagging} />
          <Stack.Screen name="Text Comments" component={TextComments} />
          <Stack.Screen name="Fullscreen Video" component={FullscreenVideo} />
          <Stack.Screen name="Painscale" component={Painscale} />
        </Stack.Navigator>
      </NavigationContainer>
    </RealmProvider>
  );
}

export default App;
