import * as React from 'react';
import {useLoader} from '../components/loaderProvider';
import {View, Text, Button} from 'react-native';

function Help() {
  const {showLoader, hideLoader} = useLoader();
  return (
    <View>
      <Text>This is the help page</Text>
      <Button title="Show loader" onPress={() => showLoader('Please wait!')} />
      <Button title="Hide Loader" onPress={hideLoader} />
    </View>
  );
}

export default Help;
