import * as React from 'react';
import { Button, Text, View } from 'react-native';
import 'react-native-get-random-values';
import { RealmProvider } from './models/VideoData';
import {
  NavigationContainer,
  useNavigation,
  ParamListBase,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import Help from './screens/help';
import Dashboard from './screens/dashboard';
import { Icon } from '@rneui/themed';

const Stack = createNativeStackNavigator();
const Tab: any = createBottomTabNavigator();

function StackNav() {
  return (
  <Stack.Navigator initialRouteName="Home" screenOptions={{ headerStyle: { backgroundColor: '#dedee0' } }}>
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
  )
}

function App() {
  return (
    <RealmProvider>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ tabBarShowLabel: false, tabBarStyle: { height: 70 , backgroundColor: '#dedee0' }}}>
        <Tab.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            tabBarLabel: 'Dashboard',
            headerStyle: { backgroundColor: '#dedee0' },
            tabBarIcon: () => (
              <Icon
                    name="analytics-outline"
                    size={35}
                    type="ionicon"
                    color="#1C3EAA"
                    style={{ width: 35 }}
                  />
            ),
          }}
          />
          <Tab.Screen
          name="MyHealthMyRecord"
          component={StackNav}
          tabBarShowLabel={false}
          options={{
            headerShown: false,
            tabBarLabel: 'Home',
            tabBarIcon: () => (
              <Icon
                    name="home-outline"
                    size={35}
                    type="ionicon"
                    color="#1C3EAA"
                    style={{ width: 35 }}
                  />
            ),
          }}
          />
          <Tab.Screen
          name="Help"
          component={Help}
          options={{
            tabBarLabel: 'Help',
            headerStyle: { backgroundColor: '#dedee0' },
            tabBarIcon: () => (
              <Icon
                    name="information-circle-outline"
                    size={35}
                    type="ionicon"
                    color="#1C3EAA"
                    style={{ width: 35 }}
                  />
            ),
          }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </RealmProvider>
  );
}

export default App;