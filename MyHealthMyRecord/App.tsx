import * as React from 'react';
import {
  Text,
  View,
} from 'react-native';
import 'react-native-get-random-values'
import { RealmProvider } from './models/VideoData'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from "./screens/home";
import RecordVideo from "./screens/recordVideo";
import ViewRecordings from "./screens/videos"

const Stack = createNativeStackNavigator();

function App() {
  return (
    <RealmProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home}/>
      <Stack.Screen name="Record Video" component={RecordVideo}/>
      <Stack.Screen name="View Recordings" component={ViewRecordings}/>
      </Stack.Navigator>
    </NavigationContainer>
    </RealmProvider>
  );
}


export default App;