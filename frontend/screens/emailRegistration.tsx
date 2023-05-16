import { Input } from "@rneui/themed";
import { Formik } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { SERVER_URL } from "../helpers";

const EmailRegistration = ({ navigation }) => {
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
          <Formik
            validate={(values) => {
              const errors: any = {};
              // ensure firstname field isn't empty
              if (!values.firstName)
                errors.firstName = "First name cannot be empty";
              // ensure email field isn't empty
              if (
                !values.emailAddress ||
                // reg ex for validating emails
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                  values.emailAddress
                ) === false
              )
                errors.emailAddress = "Email address isn't correct format";

              // ensure username field isn't empty
              if (!values.username)
                errors.username = "Username cannot be empty";

              // ensure passsword field isn't empty
              if (values.password.length < 6)
                errors.password = "Password must be atleast 6 characters";

              // ensure passwords match
              if (values.password !== values.confirmPassword) {
                errors.confirmPassword = "Passwords don't match";
              }
              return errors;
              //
            }}
            initialValues={{
              firstName: "",
              lastName: "",
              emailAddress: "",
              username: "",
              password: "",
              confirmPassword: "",
            }}
            onSubmit={async (values) => {
              // register user on backend
              const saveUser = await fetch(`${SERVER_URL}/register`, {
                body: JSON.stringify(values),
                method: "POST",
              });
              // get success or fail response
              const response = await saveUser.json();
              // if we've sucessfully registered
              if (response.success == true) {
                // set jwt returned from backend in storage
                await AsyncStorage.setItem("jwt", response.jwt);
                // go to home page
                navigation.navigate("ChatHomePage");
              }
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View>
                <Input
                  onBlur={handleBlur("firstName")}
                  onChangeText={handleChange("firstName")}
                  style={{ backgroundColor: "#f7f7fc" }}
                  placeholder=" e.g. John"
                  label="First name *"
                  value={values.firstName}
                />
                <Text
                  style={{
                    color: "red",
                    paddingLeft: 10,
                    marginTop: -20,
                    marginBottom: 15,
                  }}
                >
                  {errors.firstName && touched.firstName
                    ? errors.firstName
                    : null}
                </Text>
                <Input
                  onBlur={handleBlur("lastName")}
                  onChangeText={handleChange("lastName")}
                  style={{ backgroundColor: "#f7f7fc" }}
                  label="Last name (optional)"
                  placeholder=" e.g. Doe"
                  value={values.lastName}
                />

                <Input
                  onBlur={handleBlur("emailAddress")}
                  onChangeText={handleChange("emailAddress")}
                  style={{ backgroundColor: "#f7f7fc" }}
                  label="Email Address *"
                  value={values.emailAddress}
                  placeholder=" e.g. johndoe123@gmail.com"
                />
                <Text
                  style={{
                    color: "red",
                    paddingLeft: 10,
                    marginTop: -20,
                    marginBottom: 15,
                  }}
                >
                  {errors.emailAddress && touched.emailAddress
                    ? errors.emailAddress
                    : null}
                </Text>
                <Input
                  onBlur={handleBlur("username")}
                  onChangeText={handleChange("username")}
                  style={{ backgroundColor: "#f7f7fc" }}
                  label="Username *"
                  value={values.username}
                  placeholder=" e.g. johndoe12345"
                />
                <Text
                  style={{
                    color: "red",
                    paddingLeft: 10,
                    marginTop: -20,
                    marginBottom: 15,
                  }}
                >
                  {errors.username && touched.username ? errors.username : null}
                </Text>
                <Input
                  onBlur={handleBlur("password")}
                  onChangeText={handleChange("password")}
                  style={{ backgroundColor: "#f7f7fc" }}
                  label="Password *"
                  value={values.password}
                  placeholder=" Password"
                />
                <Text
                  style={{
                    color: "red",
                    paddingLeft: 10,
                    marginTop: -20,
                    marginBottom: 15,
                  }}
                >
                  {errors.password && touched.password ? errors.password : null}
                </Text>
                <Input
                  onBlur={handleBlur("confirmPassword")}
                  onChangeText={handleChange("confirmPassword")}
                  style={{ backgroundColor: "#f7f7fc" }}
                  placeholder=" Confirm password"
                  value={values.confirmPassword}
                  label="Confirm password *"
                />
                <Text
                  style={{
                    color: "red",
                    paddingLeft: 10,
                    marginTop: -20,
                    marginBottom: 15,
                  }}
                >
                  {errors.confirmPassword && touched.confirmPassword
                    ? errors.confirmPassword
                    : null}
                </Text>
                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  style={{
                    paddingTop: 20,
                    paddingBottom: 20,
                    backgroundColor: "#7D3C98",
                    alignItems: "center",
                    borderRadius: 50,
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
                  >
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
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
