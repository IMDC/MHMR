import * as React from 'react';
import {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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
import Home from './screens/home/home';
import RecordVideo from './screens/home/recordVideo';
import ViewRecordings from './screens/manage_videos/videoDirectory';
import AnnotationMenu from './screens/manage_videos/annotationMenu';
import ReviewAnnotations from './screens/manage_videos/reviewAnnotations';
import KeywordTagging from './screens/manage_videos/keywordTagging';
import LocationTagging from './screens/manage_videos/locationTagging';
import EmotionTagging from './screens/manage_videos/emotionTagging';
import TextComments from './screens/manage_videos/textComments';
import FullscreenVideo from './screens/fullscreenVideo';
import Painscale from './screens/manage_videos/painscaleScreen';
import Help from './screens/home/help';
import Dashboard from './screens/dashboard/dashboard';
import ManageVideoSet from './screens/dashboard/manageVideoSet';
import DataAnalysis from './screens/data_analysis/dataAnalysis';
import DataAnalysisBarGraph from './screens/data_analysis/dataAnalysisBarGraph';
import DataAnalysisLineGraph from './screens/data_analysis/dataAnalysisLineGraph';
import DataAnalysisTextSummary from './screens/data_analysis/dataAnalysisTextSummary';
import DataAnalysisWordCloud from './screens/data_analysis/dataAnalysisWordCloud';
import * as Styles from './assets/util/styles';
import {Icon} from '@rneui/themed';
import {getAuth} from './services/stt_api';
import {NetworkProvider, useNetwork} from './providers/networkProvider';
import {LoaderProvider} from './providers/loaderProvider';
import {VideoSetProvider} from './providers/videoSetProvider';
import {WordListProvider} from './providers/wordListProvider';
import {
  VideoPresenceProvider,
  useVideoPresence,
} from './providers/VideoPresenceProvider';
import OfflineAlert from './components/offlineAlert';

const Stack = createNativeStackNavigator();
const Tab: any = createBottomTabNavigator();

function StackNav() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerStyle: {backgroundColor: Styles.NavBarGrey}}}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Record Video" component={RecordVideo} />
      <Stack.Screen name="Help" component={Help} />
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
      <Stack.Screen name="Fullscreen Video" component={FullscreenVideo} />
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
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

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
function AppContent() {
  const {hasVideos} = useVideoPresence();
  return (
    <NavigationContainer>
      <OfflineAlert />
      <Tab.Navigator
        initialRouteName="MyHealthMyRecord"
        screenOptions={{
          tabBarActiveTintColor: Styles.MHMRBlue,
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: false,
          tabBarStyle: {
            height: Styles.bottomNavBarHeight,
            backgroundColor: Styles.NavBarGrey,
          },
        }}>
        <Tab.Screen
          name="MyHealthMyRecord"
          component={StackNav}
          options={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarLabel: 'Home',
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: 'bold',
            },
            tabBarIcon: ({color}: {color: string}) => (
              <Icon
                name="home-outline"
                size={Styles.bottomNavIconSize}
                type="ionicon"
                color={color}
                style={{width: Styles.bottomNavIconSize}}
              />
            ),
          }}
        />
        {hasVideos && (
          <Tab.Screen
            name="Manage Videos"
            component={ManageVideosStack}
            options={{
              headerShown: false,
              tabBarShowLabel: true,
              tabBarLabel: 'Manage Videos',
              tabBarLabelStyle: {
                fontSize: 14,
                fontWeight: 'bold',
              },
              tabBarIcon: ({color}: {color: string}) => (
                <Icon
                  name="film-outline"
                  size={Styles.bottomNavIconSize}
                  type="ionicon"
                  color={color}
                  style={{width: Styles.bottomNavIconSize}}
                />
              ),
            }}
          />
        )}
        {hasVideos && (
          <Tab.Screen
            name="Dashboard"
            component={DashboardStack}
            options={{
              headerShown: false,
              tabBarShowLabel: true,
              tabBarLabel: 'Dashboard',
              tabBarLabelStyle: {
                fontSize: 14,
                fontWeight: 'bold',
              },
              tabBarIcon: ({color}: {color: string}) => (
                <Icon
                  name="albums-outline"
                  size={Styles.bottomNavIconSize}
                  type="ionicon"
                  color={color}
                  style={{width: Styles.bottomNavIconSize}}
                />
              ),
            }}
          />
        )}
        {hasVideos && (
          <Tab.Screen
            name="Analysis"
            component={DataAnalysisStack}
            tabBarShowLabel={false}
            options={{
              headerShown: false,
              tabBarShowLabel: true,
              tabBarLabel: 'Data Analysis',
              tabBarLabelStyle: {
                fontSize: 14,
                fontWeight: 'bold',
              },
              tabBarIcon: ({color}: {color: string}) => (
                <Icon
                  name="bar-chart-outline"
                  size={Styles.bottomNavIconSize}
                  type="ionicon"
                  color={color}
                  style={{width: Styles.bottomNavIconSize}}
                />
              ),
            }}
          />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function App() {
  const {online} = useNetwork();
  return (
    <RealmProvider>
      <NetworkProvider>
        <LoaderProvider>
          <VideoSetProvider>
            <WordListProvider>
              <VideoPresenceProvider>
                <AppContent />
              </VideoPresenceProvider>
            </WordListProvider>
          </VideoSetProvider>
        </LoaderProvider>
      </NetworkProvider>
    </RealmProvider>
  );
}

const styles = StyleSheet.create({
  customLabelStyle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default App;
