import * as React from 'react';
import {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
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
import {getAuth} from './components/stt_api';
import {NetworkProvider} from './components/networkProvider';
import {VideoSetProvider} from './components/videoSetProvider';
import { LoaderProvider } from './components/loaderProvider';
import ManageVideoSet from './screens/manageVideoSet';
import Video from 'react-native-video';
import { WordListProvider } from './components/wordListProvider';

const Stack = createNativeStackNavigator();
const Tab: any = createBottomTabNavigator();

function StackNav() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerStyle: {backgroundColor: Styles.NavBarGrey}}}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Record Video" component={RecordVideo} />
    </Stack.Navigator>
  );
}

function DataAnalysisStack() {
  return (
    <Stack.Navigator
      initialRouteName="Analysis"
      screenOptions={{headerStyle: {backgroundColor: Styles.NavBarGrey}}}>
      <Stack.Screen name="Data Analysis" component={DataAnalysis} />
      <Stack.Screen name="Bar Graph" component={DataAnalysisBarGraph} />
      <Stack.Screen name="Line Graph" component={DataAnalysisLineGraph} />
      <Stack.Screen name="Text Report" component={DataAnalysisTextSummary} />
      <Stack.Screen name="Word Cloud" component={DataAnalysisWordCloud} />
      <Stack.Screen name="Fullscreen Video" component={FullscreenVideo}  />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{headerStyle: {backgroundColor: Styles.NavBarGrey}}}>
      <Stack.Screen name="Video Set Dashboard" component={Dashboard} />
      <Stack.Screen name="Manage Video Set" component={ManageVideoSet} />
      <Stack.Screen name="Fullscreen Video" component={FullscreenVideo} />
    </Stack.Navigator>
  );
}

function ManageVideosStack() {
  const [selected, setSelected] = useState(true);
  const [auth, setAuth] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  // useEffect(() => {
  //   console.log('View Recordings component mounted');
  //   setSelected(true);
  //   console.log('selected after reset:', selected);
  // }, []);

  const [lastAuthTime, setLastAuthTime] = useState(0);

  const handleAuth = async () => {
    const currentTime = Date.now();
    if (currentTime - lastAuthTime >= 60000) {
      // Check if 1 minute has passed since the last auth
      setSelected(!selected);
      // console.log('selected:', selected);
      // Call the getAuth function and store the return in a variable
      setAuth(await getAuth());
      setLastAuthTime(currentTime); // Update lastAuthTime
    } else {
      console.log('Auth already performed within the last minute.');
    }
  };
  return (
    <Stack.Navigator
      initialRouteName="Manage Videos"
      screenOptions={{headerStyle: {backgroundColor: Styles.NavBarGrey}}}>
      <Stack.Screen
        name="View Recordings"
        // component={ViewRecordings}
        options={{
          headerRight: () => (
            <View style={{flexDirection: 'row', alignContent: 'flex-start'}}>
              <View style={{marginRight: 20}}>
                <Button
                  buttonStyle={{
                    backgroundColor: Styles.MHMRBlue,
                  }}
                  style={{}}
                  radius={50}
                  title="Go to video set dashboard"
                  onPress={() =>
                    navigation.navigate('Dashboard', {
                      screen: 'Video Set Dashboard',
                    })
                  }
                />
              </View>
              <View>
                <Button
                  buttonStyle={{backgroundColor: Styles.MHMRBlue}}
                  radius={50}
                  onPress={() => {
                    setSelected(!selected);
                    // console.log('selected:', selected);
                    // handleAuth();
                  }}
                  // if selected = false, then change the button to say "Done"
                  // if selected = true, then change the button to say "Select Videos"
                  title={selected ? 'Select videos' : 'Done'}
                />
              </View>
            </View>
          ),
        }}>
        {() => <ViewRecordings selected={selected} setSelected={setSelected} />}
      </Stack.Screen>
      <Stack.Screen name="Add or Edit Markups" component={AnnotationMenu} />
      <Stack.Screen name="Review Video Markups" component={ReviewAnnotations} />
      <Stack.Screen name="Keywords" component={KeywordTagging} />
      <Stack.Screen name="Location" component={LocationTagging} />
      <Stack.Screen name="Emotion Tagging" component={EmotionTagging} />
      <Stack.Screen name="Text Comments" component={TextComments} />
      <Stack.Screen
        name="Fullscreen Video"
        component={FullscreenVideo}
        options={{headerShown: false}}
      />
      <Stack.Screen name="Painscale" component={Painscale} />
    </Stack.Navigator>
  );
}
function App() {
  return (
    <RealmProvider>
      <NetworkProvider>
        <LoaderProvider>
          <VideoSetProvider>
            <WordListProvider>
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
                      headerStyle: {backgroundColor: Styles.NavBarGrey},
                      tabBarIcon: () => (
                        <Icon
                          name="bar-chart-outline"
                          size={Styles.bottomNavIconSize}
                          type="ionicon"
                          color={Styles.MHMRBlue}
                          style={{width: Styles.bottomNavIconSize}}
                        />
                      ),
                    }}
                  />

                  <Tab.Screen
                    name="Dashboard"
                    component={DashboardStack}
                    options={{
                      headerShown: false,
                      tabBarLabel: 'Dashboard',
                      headerStyle: {backgroundColor: Styles.NavBarGrey},
                      tabBarIcon: () => (
                        <Icon
                          name="albums-outline"
                          size={Styles.bottomNavIconSize}
                          type="ionicon"
                          color={Styles.MHMRBlue}
                          style={{width: Styles.bottomNavIconSize}}
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
                          style={{width: Styles.bottomNavIconSize}}
                        />
                      ),
                    }}
                  />
                  <Tab.Screen
                    name="Manage Videos"
                    component={ManageVideosStack}
                    options={{
                      headerShown: false,
                      tabBarLabel: 'Manage Videos',
                      headerStyle: {backgroundColor: Styles.NavBarGrey},
                      tabBarIcon: () => (
                        <Icon
                          name="film-outline"
                          size={Styles.bottomNavIconSize}
                          type="ionicon"
                          color={Styles.MHMRBlue}
                          style={{width: Styles.bottomNavIconSize}}
                        />
                      ),
                    }}
                  />
                  <Tab.Screen
                    name="Help"
                    component={Help}
                    options={{
                      tabBarLabel: 'Help',
                      headerStyle: {backgroundColor: Styles.NavBarGrey},
                      tabBarIcon: () => (
                        <Icon
                          name="information-circle-outline"
                          size={Styles.bottomNavIconSize}
                          type="ionicon"
                          color={Styles.MHMRBlue}
                          style={{width: Styles.bottomNavIconSize}}
                        />
                      ),
                    }}
                  />
                </Tab.Navigator>
              </NavigationContainer>
            </WordListProvider>
          </VideoSetProvider>
        </LoaderProvider>
      </NetworkProvider>
    </RealmProvider>
  );
}

export default App;
