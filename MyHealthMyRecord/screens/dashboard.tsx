import {useNavigation, ParamListBase} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import * as React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import {Chip, Dialog, Text} from 'react-native-paper';
import {VideoData, useRealm, useQuery} from '../models/VideoData';
import {Button, Icon} from '@rneui/themed';
import RNFS from 'react-native-fs';
import {FFmpegKit, ReturnCode} from 'ffmpeg-kit-react-native';

function Dashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [videos, setVideos] = React.useState<any | null>(null);
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
  const deleteAllVideoDataObjects = async () => {
    //delete videos from storage
    const MHMRfiles = RNFS.readDir(MHMRfolderPath);
    (await MHMRfiles).map(f => {
      console.log(
        f.name,
        f.size,
        f.path,
        f.isFile(),
        f.isDirectory(),
        f.ctime,
        f.mtime,
      );
      if (f.isFile()) {
        var path = MHMRfolderPath + '/' + f.name;
        return (
          RNFS.unlink(path)
            .then(() => {
              console.log('FILE DELETED FROM STORAGE');
            })
            // `unlink` will throw an error, if the item to unlink does not exist
            .catch(err => {
              console.log(err.message);
            })
        );
      }
    });
    //delete from db
    realm.write(() => {
      realm.delete(videoData);
      console.log('FILES DELETED FROM DB');
    });
  };

  const convertToAudio = (video: VideoData) => {
    console.log('convert to audio');
    const mp3FileName =
      // 'file://' +
     audioFolderPath +
      '/' +
      video.filename.replace('.mp4', '') +
      '.mp3';
    console.log(mp3FileName);
    const mp4FileName = 
    // 'file://' + 
    MHMRfolderPath + '/' + video.filename;

    FFmpegKit.execute(
      '-i ' + mp4FileName + ' -b:a 192K -vn ' + mp3FileName,
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
  onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  return (
    <View>
      {/* <Button
        buttonStyle={styles.btnStyle}
        title="View Recordings"
        onPress={() => setVideos(videosByDate)}
      /> */}
      <ScrollView style={{marginTop: 5}} ref={scrollRef}>
        {videos !== null
          ? videos.map((video: VideoData) => {
              // const videoURI = require(MHMRfolderPath + '/' + video.filename);
              return (
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
                      <Button
                        buttonStyle={styles.btnStyle}
                        title="Convert to Audio"
                        onPress={() => convertToAudio(video)}
                      />
                      <View style={styles.space} />
                      <View style={styles.space} />
                    </View>
                  </View>
                </View>
              );
            })
          : null}
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
