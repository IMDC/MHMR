/*import React from 'react';
import type { PropsWithChildren } from 'react';*/
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Button,
    Alert,
} from 'react-native';

const Home = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Home Screen</Text>
            <Button
                title="View Recordings"
                onPress={() => navigation.navigate('View Recordings')}
            />
            <Button
                title="Go to Record Video Page"
                onPress={() => navigation.navigate('Record Video')}
            />
        </View>
    );
}

export default Home;
