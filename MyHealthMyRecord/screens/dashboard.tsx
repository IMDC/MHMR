import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as React from 'react';
import axios from "axios";
import { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import { Chip, Dialog, Text, } from 'react-native-paper';
import { VideoData, useRealm, useQuery } from '../models/VideoData';
import { Button, Icon, CheckBox } from '@rneui/themed';
import RNFS from 'react-native-fs';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { base64 } from "rfc4648";


function Dashboard() {

   const [checked, setChecked] = React.useState(false);

  const [auth, setAuth] = useState('');

  /**
   * Set auth state with a Bearer type authorization token
   */
  const getAuth = async () => {
    let headersList = {
      "Content-Type": "application/x-www-form-urlencoded"
    }

    let bodyContent = "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey="+Config.API_KEY_SPEECH_TO_TEXT;

    let reqOptions = {
      url: "https://iam.cloud.ibm.com/identity/token",
      method: "POST",
      headers: headersList,
      data: bodyContent,
    }

    let response = await axios.request(reqOptions);
    setAuth(response.data.token_type + ' ' + response.data.access_token);
    console.log("new auth token set");
  }

  /**
   * Get binary version of audio file and call transcribeAudio on all files in MHMR/audio folder on device
   */
  const getBinaryAudio = async () => {
    const audioFolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';
    const audioFiles = RNFS.readDir(audioFolderPath);

    const getPath = RNFS.DocumentDirectoryPath + '/MHMR/audio/audio-file.flac';
    const savePath = RNFS.DocumentDirectoryPath + '/MHMR/audio/test.flac';
    const testPath = RNFS.DocumentDirectoryPath + '/MHMR/audio/VisionCamera-20230801_0812341816270566387200576.wav';

    const wav = RNFS.DocumentDirectoryPath + '/MHMR/audio/VisionCamera-20230801_1251014444004142223593130.wav';
    ///data/data/com.myhealthmyrecord/files/MHMR/audio/VisionCamera-20230801_1251014444004142223593130.wav
/*     RNFS.readFile(wav, 'base64').then(data => {
      console.log(data.substring(0, 45), ', ', data.substring(data.length - 5));
      transcribeAudio(base64.parse(data));
      //RNFS.writeFile(savePath, data, 'base64');
    }); */

    (await audioFiles).map(f => {
      if (f.isFile()) {
        //var path = audioFolderPath + '/' + f.name;
        console.log(f.name, f.path, f.size);
        RNFS.readFile(f.path, 'base64').then(data => {
          console.log(data.substring(0,5), ', ', data.substring(data.length - 5));
          transcribeAudio(base64.parse(data));
          //RNFS.writeFile(savePath, data, 'base64');
        });
    console.log('done');
  }
});
  }

  /**
   * Transcribe an audio file by sending request to IBM speech-to-text service
   * @param body - The audio file to transcribe
   */
  const transcribeAudio = async (body: any) => {
    axios
      .post(
        'https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/08735c5f-70ad-44a9-8cae-dc286520aa53/v1/recognize',
        body,
        {
          headers: {
            Authorization: auth,
            "Content-Type": "audio/wav",
          },
        },
      )
      .then((data: any) => {
        console.log(data);
        console.log(data.data.results);
      })
      .catch((err: any) => {
        console.log(err.response.data);
        console.log(err.response.headers);
        if (err.response.status == 401) {
          console.log('need to get new auth token');
        }
      });
  }

  const cognosSession = async () => {
    var bodyFormData = new FormData();
    bodyFormData.append('expiresIn', 3600);
    bodyFormData.append('webDomain', 'http://127.0.0.1:5500/connectWatson.html');
    axios
      .post(
        'https://dde-us-south.analytics.ibm.com/daas/v1/session',
        {
          headers: {
            "authorization": "Basic <base64 158e9446-f8b4-4b7d-a909-1b3635ddb8f1:9d61b8972454239901863057b753424994391b0e>",
            "accept": "application/json",
            "Content-Type": "application/json"
          },
          data: bodyFormData,
        },
      )
      .then((data: any) => {
        console.log(data);
        //console.log(data.data.results);
      })
      .catch((err: any) => {
        console.log(err.response);
        console.log(err.response.data);
        //console.log(err.response.headers);
        if (err.response.status == 401) {
          console.log('need to get new auth token');
        }
      });
  }


  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [videos, setVideos] = React.useState<any | null>(null);
  const [buttonPressed, setButtonPressed] = React.useState(false);
  const MHMRfolderPath = RNFS.DocumentDirectoryPath + '/MHMR';
  const audioFolderPath = RNFS.DocumentDirectoryPath + '/MHMR/audio';
  const scrollRef: any = React.useRef();
  let onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  const realm = useRealm();
  const videoData: any = useQuery('VideoData');
  const videosByDate = videoData.sorted('datetimeRecorded', true);

  /**
   * Convert a video to a .wav type audio file and save it in the MHMR/audio folder on the device
   * @param video VideoData object
   */
  const convertToAudio = (video: VideoData) => {
    console.log('convert to audio');
    const mp3FileName =
      // 'file://' +
      audioFolderPath +
      '/' +
      video.filename.replace('.mp4', '') +
      '.mp3';
      const wavFileName =
      // 'file://' +
      audioFolderPath +
      '/' +
      video.filename.replace('.mp4', '') +
      '.wav';
    console.log(mp3FileName);
    const mp4FileName =
      // 'file://' + 
      MHMRfolderPath + '/' + video.filename;

    FFmpegKit.execute(
      '-i ' + mp4FileName + ' -vn -acodec pcm_s16le -ar 44100 -ac 2 ' + wavFileName,
    ).then(async session => {
      const returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        console.log('success');
      } else if (ReturnCode.isCancel(returnCode)) {
        console.log('canceled');
      } else {
        console.log('error');
      }
    });
  };

  React.useEffect(() => {
    {
      setVideos(videosByDate);
    }
  }, []);
  //check file space
  /*
  const FSInfoResult = RNFS.getFSInfo();
  console.log("space: ", (await FSInfoResult).totalSpace, (await FSInfoResult).freeSpace);
  */
  
  const [checkedVideos, setCheckedVideos] = React.useState(new Set());
  
   const toggleVideoChecked = videoId => {
     const updatedCheckedVideos = new Set(checkedVideos);

     if (updatedCheckedVideos.has(videoId)) {
       updatedCheckedVideos.delete(videoId);
     } else {
       updatedCheckedVideos.add(videoId);
     }

     setCheckedVideos(updatedCheckedVideos);
   };

  onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  return (
    <View>
      {buttonPressed ? (
        <Button
          onPress={() => {
            setButtonPressed(!buttonPressed);
            console.log(buttonPressed);
          }}>
          Done
        </Button>
      ) : (
        <Button
          onPress={() => {
            setButtonPressed(!buttonPressed);
            // console.log(buttonPressed);
          }}>
          Select Videos
        </Button>
      )}

      {/* <Button onPress={getAuth}>get auth</Button>
      <Button onPress={getBinaryAudio}>get binary</Button>
      <Button onPress={transcribeAudio}>transcribe audio</Button>
      <Button onPress={cognosSession}>cognos session</Button> */}
      <ScrollView style={{marginTop: 5}} ref={scrollRef}>
        
        {videos !== null ? videos.map((video: VideoData) => {
          const isChecked = checkedVideos.has(video._id.toString());
          return (
            <View>
              {buttonPressed ? (
                <View style={styles.container} key={video._id.toString()}>
                  <View style={{justifyContent: 'center', alignContent: 'center',}}>
                    <CheckBox
                      checked={isChecked}
                      onPress={() => {
                        toggleVideoChecked(video._id.toString());
                        convertToAudio(video);
                      }}
                    />
                  </View>

                  <View style={styles.thumbnail}>
                    <ImageBackground
                      style={{height: '100%', width: '100%'}}
                      source={{
                        uri: 'file://' + MHMRfolderPath + '/' + video.filename,
                      }}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('Fullscreen Video', {
                            id: video._id,
                          })
                        }>
                        <Icon
                          style={{height: 240, justifyContent: 'center'}}
                          name="play-sharp"
                          type="ionicon"
                          color="black"
                          size={40}
                        />
                      </TouchableOpacity>
                    </ImageBackground>
                    {/* <VideoPlayer
                      style={{}}
                      source={{
                        uri: MHMRfolderPath + '/' + video.filename,
                      }}
                      paused={true}
                      disableBack={true}
                      // toggleResizeModeOnFullscreen={true}
                      showOnStart={true}
                      disableSeekButtons={true}
                      isFullscreen={false}
                      onEnterFullscreen={() =>
                        navigation.navigate('Fullscreen Video', {
                          id: video._id,
                        })
                      }
                    /> */}
                  </View>
                  <View style={styles.rightContainer}>
                    <View>
                      <Text
                        style={{
                          fontSize: 24,
                          color: 'black',
                          fontWeight: 'bold',
                        }}>
                        {video.title}
                        {video.textComments.length !== 0 ? (
                          <Icon
                            name="chatbox-ellipses"
                            type="ionicon"
                            color="black"
                            size={22}
                            style={{alignSelf: 'flex-start', paddingLeft: 5}}
                          />
                        ) : null}
                      </Text>
                      <Text style={{fontSize: 20}}>
                        {video.datetimeRecorded?.toLocaleString()}
                      </Text>
                      {/* map temparray and display the keywords here */}
                      <View style={{flexDirection: 'row'}}>
                        {video.keywords.map((key: string) => {
                          if (JSON.parse(key).checked) {
                            return (
                              <Chip
                                key={JSON.parse(key).title}
                                style={{margin: 2}}
                                textStyle={{fontSize: 16}}
                                mode="outlined"
                                compact={true}>
                                {JSON.parse(key).title}
                              </Chip>
                            );
                          }
                        })}
                        {video.locations.map((key: string) => {
                          if (JSON.parse(key).checked) {
                            return (
                              <Chip
                                key={JSON.parse(key).title}
                                textStyle={{fontSize: 16}}
                                style={{margin: 2}}
                                mode="outlined"
                                compact={true}>
                                {JSON.parse(key).title}
                              </Chip>
                            );
                          }
                        })}
                      </View>
                    </View>
                    <Text>{video.filename}</Text>
                    <View style={styles.buttonContainer}>
                      {/* <Button
                        buttonStyle={styles.btnStyle}
                        title="Convert to Audio"
                        onPress={() => convertToAudio(video)}
                      /> */}
                      <View style={styles.space} />
                      <View style={styles.space} />
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.container} key={video._id.toString()}>
                  <View style={styles.thumbnail}>
                    <ImageBackground
                      style={{height: '100%', width: '100%'}}
                      source={{
                        uri: 'file://' + MHMRfolderPath + '/' + video.filename,
                      }}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('Fullscreen Video', {
                            id: video._id,
                          })
                        }>
                        <Icon
                          style={{height: 240, justifyContent: 'center'}}
                          name="play-sharp"
                          type="ionicon"
                          color="black"
                          size={40}
                        />
                      </TouchableOpacity>
                    </ImageBackground>
                    {/* <VideoPlayer
                      style={{}}
                      source={{
                        uri: MHMRfolderPath + '/' + video.filename,
                      }}
                      paused={true}
                      disableBack={true}
                      // toggleResizeModeOnFullscreen={true}
                      showOnStart={true}
                      disableSeekButtons={true}
                      isFullscreen={false}
                      onEnterFullscreen={() =>
                        navigation.navigate('Fullscreen Video', {
                          id: video._id,
                        })
                      }
                    /> */}
                  </View>
                  <View style={styles.rightContainer}>
                    <View>
                      <Text
                        style={{
                          fontSize: 24,
                          color: 'black',
                          fontWeight: 'bold',
                        }}>
                        {video.title}
                        {video.textComments.length !== 0 ? (
                          <Icon
                            name="chatbox-ellipses"
                            type="ionicon"
                            color="black"
                            size={22}
                            style={{alignSelf: 'flex-start', paddingLeft: 5}}
                          />
                        ) : null}
                      </Text>
                      <Text style={{fontSize: 20}}>
                        {video.datetimeRecorded?.toLocaleString()}
                      </Text>
                      {/* map temparray and display the keywords here */}
                      <View style={{flexDirection: 'row'}}>
                        {video.keywords.map((key: string) => {
                          if (JSON.parse(key).checked) {
                            return (
                              <Chip
                                key={JSON.parse(key).title}
                                style={{margin: 2}}
                                textStyle={{fontSize: 16}}
                                mode="outlined"
                                compact={true}>
                                {JSON.parse(key).title}
                              </Chip>
                            );
                          }
                        })}
                        {video.locations.map((key: string) => {
                          if (JSON.parse(key).checked) {
                            return (
                              <Chip
                                key={JSON.parse(key).title}
                                textStyle={{fontSize: 16}}
                                style={{margin: 2}}
                                mode="outlined"
                                compact={true}>
                                {JSON.parse(key).title}
                              </Chip>
                            );
                          }
                        })}
                      </View>
                    </View>
                    <Text>{video.filename}</Text>
                    <View style={styles.buttonContainer}>
                      {/* <Button
                        buttonStyle={styles.btnStyle}
                        title="Convert to Audio"
                        onPress={() => convertToAudio(video)}
                      /> */}
                      <View style={styles.space} />
                      <View style={styles.space} />
                    </View>
                  </View>
                </View>
              )}
            </View>
          ); }) : null}
          {/* {
            buttonPressed
          ? videos.map((video: VideoData) => {
              // const videoURI = require(MHMRfolderPath + '/' + video.filename);
            return (
                
              
              );
            })
          : null} */}
        <TouchableOpacity style={{alignItems: 'center'}} onPress={onPressTouch}>
          <Text style={{padding: 5, fontSize: 16, color: 'black'}}>
            Scroll to Top
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  btnStyle: {
    backgroundColor: '#1C3EAA',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
    // paddingLeft: 8,
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardLeft: {
    marginVertical: 8,
    width: '100%',
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  thumbnail: {
    height: 240,
    width: '40%',
    padding: 4,
  },
  space: {
    width: 50,
  },
});
export default Dashboard;
