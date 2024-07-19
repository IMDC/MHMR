import * as React from 'react';
import {Dimensions, StyleSheet, PixelRatio} from 'react-native';

/*---------- COLOURS ----------*/

export const MHMRBlue = '#1C3EAA';
export const MHMRLightBlue = '#5C78D1';
export const MHMRBlueRGB = '28, 62, 170';
export const buttonGrey = '#C7CBD1';
export const NavBarGrey = '#DEDEE0';

/*---------- SIZES ----------*/

// bottom navigation bar
export const bottomNavBarHeight = 70;
export const bottomNavIconSize = 35;

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;
export const screenWidth = Dimensions.get('screen').width;
export const screenHeight = Dimensions.get('screen').height;

function Styles() {
}
export default Styles;