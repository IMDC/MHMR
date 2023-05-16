// import React, { useRef } from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { RNCamera } from "react-native-camera";

// const CameraScreen = () => {
//   const cameraRef = useRef(null);

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       try {
//         const options = { quality: 0.5, base64: true };
//         const data = await cameraRef.current.takePictureAsync(options);
//         console.log(data.uri);
//       } catch (error) {
//         console.log("Error taking picture: ", error);
//       }
//     } else {
//       console.log("Camera not ready yet.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <RNCamera
//         ref={cameraRef}
//         style={styles.preview}
//         type={RNCamera.Constants.Type.back}
//         flashMode={RNCamera.Constants.FlashMode.on}
//       />
//       <View style={{ flex: 0, flexDirection: "row", justifyContent: "center" }}>
//         <TouchableOpacity onPress={takePicture} style={styles.capture}>
//           <Text style={{ fontSize: 14 }}> SNAP </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: "column",
//     backgroundColor: "black",
//   },
//   preview: {
//     flex: 1,
//     justifyContent: "flex-end",
//     alignItems: "center",
//   },
//   capture: {
//     flex: 0,
//     backgroundColor: "#fff",
//     borderRadius: 5,
//     padding: 15,
//     paddingHorizontal: 20,
//     alignSelf: "center",
//     margin: 20,
//   },
// });

// export default CameraScreen;

// import React, { Component } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { RNCamera } from 'react-native-camera';

// export default class CameraScreen extends Component {
//   state = {
//     isRecording: false,
//   };

//   takeVideo = async () => {
//     if (this.camera && !this.state.isRecording) {
//       try {
//         const options = {
//           quality: RNCamera.Constants.VideoQuality["720p"],
//           maxDuration: 30, // seconds
//         };
//         const { uri } = await this.camera.recordAsync(options);
//         console.log(uri);
//       } catch (error) {
//         console.error(error);
//       }
//     } else if (this.state.isRecording) {
//       this.camera.stopRecording();
//     }
//     this.setState({ isRecording: !this.state.isRecording });
//   };

//   render() {
//     return (
//       <View style={styles.container}>
//         <RNCamera
//           ref={ref => {
//             this.camera = ref;
//           }}
//           style={styles.preview}
//           type={RNCamera.Constants.Type.back}
//           captureAudio={true}
//         />
//         <TouchableOpacity onPress={this.takeVideo}>
//           <Text style={styles.capture}>{this.state.isRecording ? 'Stop' : 'Record'}</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column',
//     backgroundColor: 'black',
//   },
//   preview: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   capture: {
//     flex: 0,
//     backgroundColor: '#fff',
//     borderRadius: 5,
//     padding: 15,
//     paddingHorizontal: 20,
//     alignSelf: 'center',
//     margin: 20,
//   },
// });

// import VideoRecorder from 'react-native-beautiful-video-recorder';

// start = () => {
// 	// 30 seconds
// 	this.videoRecorder.open({ maxLength: 30 },(data) => {
// 		console.log('captured data', data);
// 	});
// }

// render() {
// 	return (
// 		<View>
// 			......
// 		  <TouchableOpacity onPress={this.start}>
// 		  	<Text>Start</Text>
// 		  </TouchableOpacity>
// 		  <VideoRecorder ref={(ref) => { this.videoRecorder = ref; }} />
// 		</View>
// 	);
// }

// import VideoRecorder from 'react-native-beautiful-video-recorder';
// const CameraScreen = () => {
//  const cameraRef = useRef(null);
//  const videoRecord = async () => {
//     if( cameraRef && cameraRef.current ) {
//       cameraRef.current.open({ maxLength: 30 },(data) => {
//         console.log('captured data', data); // data.uri is the file path
//       });
//     }
//  }
//  return (
//  <View>
//   <VideoRecorder ref={cameraRef} />
//   <Button onPress={ () => videoRecord() }>Open Recorder</Button>
//  </View>
//  );
// }

// import { Camera } from 'expo-camera';
// <Camera style={{ flex: 1 }} type={Camera.Constants.Type.back} />

// const [isRecording, setIsRecording] = useState(false);
// const cameraRef = useRef(null);

// const handleRecordButtonPress = async () => {
//   if (isRecording) {
//     cameraRef.current.stopRecording();
//     setIsRecording(false);
//   } else {
//     setIsRecording(true);
//     const videoRecording = await cameraRef.current.recordAsync();
//     console.log('Video recording', videoRecording);
//   }
// };

// import React, { useState, useRef } from 'react';
// import { Button, View } from 'react-native';
// import { Camera } from 'expo-camera';

// const CameraScreen: React.FC = () => {
//   const [isRecording, setIsRecording] = useState<boolean>(false);
//   const cameraRef = useRef<Camera | null>(null);

//   const handleRecordButtonPress = async () => {
//     if (isRecording) {
//       cameraRef.current?.stopRecording();
//       setIsRecording(false);
//     } else {
//       setIsRecording(true);
//       const videoRecording = await cameraRef.current?.recordAsync({
//         quality: Camera.Constants.VideoQuality['720p'],
//         maxDuration: 30,
//       });
//       console.log('Video recording', videoRecording);
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Camera style={{ flex: 1, width: '100%' }} type={Camera.Constants.Type.back} ref={cameraRef}>
//         <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20 }}>
//           <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={handleRecordButtonPress} />
//         </View>
//       </Camera>
//     </View>
//   );
// };


// export default CameraScreen;
