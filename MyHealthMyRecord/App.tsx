import * as React from 'react';
import {useEffect} from 'react';
import {Text, View} from 'react-native';
import {Button} from '@rneui/themed';
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
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
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
import DataAnalysis from './screens/dataAnalysis';
import DataAnalysisBarGraph from './screens/dataAnalysisBarGraph';
import DataAnalysisLineGraph from './screens/dataAnalysisLineGraph';
import DataAnalysisTextSummary from './screens/dataAnalysisTextSummary';
import DataAnalysisWordCloud from './screens/dataAnalysisWordCloud';
import * as Styles from './assets/util/styles';
import {Icon} from '@rneui/themed';

const Stack = createNativeStackNavigator();
const Tab: any = createBottomTabNavigator();

function StackNav() {
  const [selected, setSelected] = React.useState(true);

  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerStyle: { backgroundColor: Styles.NavBarGrey } }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Record Video" component={RecordVideo} />
      <Stack.Screen
        name="View Recordings"
        // component={ViewRecordings}
        options={{
          headerRight: () => (
            <Button
              buttonStyle={{backgroundColor: Styles.MHMRBlue}}
              onPress={() => {
                setSelected(!selected);
                console.log('selected:', selected);
              }}
              // if selected = false, then change the button to say "Done"
              // if selected = true, then change the button to say "Select Videos"
              title={selected ? 'Select Videos' : 'Done'}
            />
          ),
        }}>
        {props => <ViewRecordings {...props} selected={selected} />}
      </Stack.Screen>
      <Stack.Screen name="Annotation Menu" component={AnnotationMenu} />
      <Stack.Screen name="Review Annotations" component={ReviewAnnotations} />
      <Stack.Screen name="Keywords" component={KeywordTagging} />
      <Stack.Screen name="Location" component={LocationTagging} />
      <Stack.Screen name="Emotion Tagging" component={EmotionTagging} />
      <Stack.Screen name="Text Comments" component={TextComments} />
      <Stack.Screen name="Fullscreen Video" component={FullscreenVideo} />
      <Stack.Screen name="Painscale" component={Painscale} />
    </Stack.Navigator>
  )
}

function DataAnalysisStack() {
  return (
    <Stack.Navigator initialRouteName="Analysis" screenOptions={{ headerStyle: { backgroundColor: Styles.NavBarGrey } }}>
      <Stack.Screen name="Data Analysis" component={DataAnalysis} />
      <Stack.Screen name="Bar Graph" component={DataAnalysisBarGraph} />
      <Stack.Screen name="Line Graph" component={DataAnalysisLineGraph} />
      <Stack.Screen name="Text Summary" component={DataAnalysisTextSummary} />
      <Stack.Screen name="Word Cloud" component={DataAnalysisWordCloud} />
    </Stack.Navigator>
  )
}

function App() {
  return (
    <RealmProvider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="MyHealthMyRecord"
          screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
              height: Styles.bottomNavBarHeight,
              backgroundColor: Styles.NavBarGrey,
            },
          }}>
          <Tab.Screen
            name="Analysis"
            component={DataAnalysisStack}
            tabBarShowLabel={false}
            options={{
              headerShown: false,
              tabBarLabel: 'Analysis',
              headerStyle: { backgroundColor: Styles.NavBarGrey },
              tabBarIcon: () => (
                <Icon
                  name="bar-chart-outline"
                  size={Styles.bottomNavIconSize}
                  type="ionicon"
                  color={Styles.MHMRBlue}
                  style={{ width: Styles.bottomNavIconSize }}
                />
              ),
            }}
          />

          <Tab.Screen
            name="Dashboard"
            component={Dashboard}
            options={{
              tabBarLabel: 'Dashboard',
              headerStyle: { backgroundColor: Styles.NavBarGrey },
              tabBarIcon: () => (
                <Icon
                  name="analytics-outline"
                  size={Styles.bottomNavIconSize}
                  type="ionicon"
                  color={Styles.MHMRBlue}
                  style={{ width: Styles.bottomNavIconSize }}
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
              tabBarLabel: 'MyHealthMyRecord',
              tabBarIcon: () => (
                <Icon
                  name="home-outline"
                  size={Styles.bottomNavIconSize}
                  type="ionicon"
                  color={Styles.MHMRBlue}
                  style={{ width: Styles.bottomNavIconSize }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Help"
            component={Help}
            options={{
              tabBarLabel: 'Help',
              headerStyle: { backgroundColor: Styles.NavBarGrey },
              tabBarIcon: () => (
                <Icon
                  name="information-circle-outline"
                  size={Styles.bottomNavIconSize}
                  type="ionicon"
                  color={Styles.MHMRBlue}
                  style={{ width: Styles.bottomNavIconSize }}
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
