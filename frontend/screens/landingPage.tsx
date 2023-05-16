import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";

import { RNCamera } from 'react-native-camera';


const LandingPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/MHMRLogo.png")}
        style={{ width: 400, height: 375, left: 0, top: 0 }}
      />
      <Text
        style={{
          width: 300,
          textAlign: "center",
          fontSize: 24,
          fontWeight: "600",
        }}
      >
        Begin your journey to recovery today!
      </Text>
      <View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("LandingLogin");
          }}
          style={{
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 100,
            paddingRight: 100,
            backgroundColor: "#7D3C98",
            borderRadius: 30,
            marginTop: 200,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>
            Start
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  landingPageBtn: {
    width: 327,
    height: 52,
    backgroundColor: "#CC242E",
  },
});
export default LandingPage;
