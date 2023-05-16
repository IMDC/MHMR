import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatHomePage from "./screens/chatHomePage";
import EmailRegistration from "./screens/emailRegistration";
import LandingLogin from "./screens/landingLogin";
import LandingPage from "./screens/landingPage";
import Login from "./screens/login";
import CameraScreen from "./screens/CameraScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {
            <Stack.Screen
              name="Landing"
              component={LandingPage}
              // @ts-expect-error
              headerShown={false}
            />
          }
          <Stack.Screen name="LandingLogin" component={LandingLogin} />
          <Stack.Screen
            name="EmailRegistration"
            component={EmailRegistration}
          />
          <Stack.Screen name="login" component={Login} />
          <Stack.Screen name="ChatHomePage" component={ChatHomePage} />
          <Stack.Screen name="CameraScreen" component={CameraScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
