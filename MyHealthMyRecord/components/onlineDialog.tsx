import { Dialog, Text } from "@rneui/themed";
import React from "react";
import { View } from "react-native";

const OnlineDialog = ({onlineDialogVisible, toggleOnlineDialog}) => {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        marginBottom: 10,
        zIndex: 100,
      }}>
      <Dialog
        isVisible={onlineDialogVisible}
        onBackdropPress={toggleOnlineDialog}>
        <Dialog.Title title="Connected!"></Dialog.Title>
        <Text>
          You are now connected to the internet! Would you like to analyze Video
          Set videos?
        </Text>
        <View style={{paddingHorizontal: 20}}>
          <Dialog.Actions>
            <Dialog.Button
              title="NO"
              onPress={() => {
                console.log('NO clicked!');
                toggleOnlineDialog();
              }}
            />
            <Dialog.Button
              title="YES"
              onPress={() => {
                console.log('YES clicked!');
                toggleOnlineDialog();
              }}
            />
          </Dialog.Actions>
        </View>
      </Dialog>
    </View>
  );
};

export default OnlineDialog;