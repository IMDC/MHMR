import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import { SERVER_URL } from "../helpers";
import LandingPage from "./landingPage";

const LandingLogin = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={{ marginTop: 15, marginLeft: 20 }}
      //onPress={() => navigation.navigate("landingPage")}
>
        <FontAwesome5 size={30} name={"arrow-left"} />
      </Text>
      <View style={{ display: "flex", alignItems: "center" }}>
        <Image
          style={{ width: 200, height: 100, marginTop: 100}}
          source={require("../assets/MHMRLogo.png")}
        />
        <TouchableOpacity
          // onPress={() => Linking.openURL(`${SERVER_URL}/google`)}
          onPress={async () => {
            fetch(`${SERVER_URL}/google`).then(() => {
              navigation.navigate("ChatHomePage");
            });
          }}
          style={{
            paddingTop: 20,
            paddingBottom: 20,
            width: "85%",
            backgroundColor: "#7D3C98",
            alignItems: "center",
            borderRadius: 50,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: "white",
              }}
            >
              <FontAwesome5 size={24} name={"google"} color="white" />
              Login with Google Account
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={function () {
            navigation.navigate("login");
          }}
          style={{
            paddingTop: 20,
            paddingBottom: 20,
            width: "85%",
            alignItems: "center",
            backgroundColor: "#7D3C98",
            borderRadius: 50,
            marginTop: 10,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: "white",
              }}
            >
              Login with Email
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("EmailRegistration");
          }}
          style={{
            paddingTop: 20,
            paddingBottom: 20,
            width: "85%",
            backgroundColor: "#7D3C98",
            alignItems: "center",
            borderRadius: 50,
            marginTop: 10,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: "white",
              }}
            >
              Create New Account
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* <Text>hello, we're in the login page</Text> */}
    </View>
  );
};
export default LandingLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center",
    marginTop: 40,
    // justifyContent: "center",
  },
  landingPageBtn: {
    width: 300,
    height: 100,
    backgroundColor: "red",
  },
});
