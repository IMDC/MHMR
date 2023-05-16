import AsyncStorage from "@react-native-async-storage/async-storage";

import { Input } from "@rneui/themed";
import { Formik } from "formik";

import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

// import { Back } from "react-native-vector-icons-directory";
import Icon from "react-native-vector-icons/AntDesign";
import React, { useState } from "react";
import { SERVER_URL, showToast } from "../helpers";

const EmailRegistration = ({ navigation }) => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      style={styles.container}
    >
      {/* <Button title="hello"></Button> */}
      <Text
        style={{ marginTop: 15, marginLeft: 20 }}
        //onPress={navigation.navigate("Landing")}
      >
        <FontAwesome5
          onPress={() => {
            navigation.navigate("LandingLogin");
          }}
          size={30}
          name={"arrow-left"}
        />
      </Text>
      <Image
        style={{ width: "100%", height: 200, marginTop: 20 }}
        source={require("../assets/MHMRLogo.png")}
      />
      <View style={{ display: "flex", alignItems: "center", width: "100%" }}>
        <View style={{ width: "90%" }}>
          <Input
            onChangeText={(value) => {
              setEmailAddress(value);
            }}
            label="Email address"
            placeholder=" e.g. johndoe123@gmail.com"
            style={{ backgroundColor: "#f7f7fc" }}
          />
          <Input
            onChangeText={(value) => {
              setPassword(value);
            }}
            label="Password"
            placeholder=" Password"
            style={{ backgroundColor: "#f7f7fc" }}
          />
          <TouchableOpacity
            onPress={async () => {
              // validate user
              const validateUser = await fetch(`${SERVER_URL}/login`, {
                method: "POST",
                body: JSON.stringify({ email: emailAddress, password }),
              });
              // get back user's data
              const validatedUser = await validateUser.json();

              // check if we've successfully validated
              if (validatedUser.success === true) {
                // store jwt in storage
                await AsyncStorage.setItem("jwt", validatedUser.jwt);
                // redirect to app
                navigation.navigate("ChatHomePage");
              } else {
                showToast("error", `Failed to login 😟`, validatedUser.message);
              }
            }}
            // disabled={true}
            style={{
              paddingTop: 10,
              paddingBottom: 10,
              backgroundColor: "#7D3C98",
              alignItems: "center",
              borderRadius: 50,
              marginTop: 10,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* <Text>hello, we're in the login page</Text> */}
    </ScrollView>
  );
};
export default EmailRegistration;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 40,

    // paddingBottom: 200,
  },
});
