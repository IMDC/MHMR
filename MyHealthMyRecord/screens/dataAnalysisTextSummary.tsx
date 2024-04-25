import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {VideoData, useRealm, useQuery, useObject} from '../models/VideoData';

const DataAnalysisTextSummary = () => {
  const [videos, setVideos] = React.useState<any | null>(null);
  const realm = useRealm();
  const videoData: any = useQuery('VideoData');
  const videosByIsSelected = videoData.filtered('isSelected == true');

  useEffect(() => {
    {
      setVideos(videosByIsSelected);
    }
  }, []);

  return (
    <ScrollView id="textsummary">
      {videos !== null
        ? videos.map((video: VideoData) => {
            const checkedTitles = video.keywords
              .map(key => JSON.parse(key))
              .filter(obj => obj.checked)
              .map(obj => obj.title)
              .join(', ');

            const checkedLocations = video.locations
              .map(key => JSON.parse(key))
              .filter(obj => obj.checked)
              .map(obj => obj.title)
              .join(', ');

            return (
              <View key={video._id.toString()} style={styles.container}>
                <View style={{padding: 5}}>
                  <Text
                    style={{fontWeight: 'bold', fontSize: 32, color: 'black'}}>
                    {video.title}
                  </Text>
                  <Text style={{fontSize: 20, color: 'black'}}>
                    {`Input: "Summarize this video transcript (${video.transcript}) and include the summary of the keywords (${checkedTitles}) and locations (${checkedLocations}) tagged."`}
                  </Text>
                  <Text
                    style={{fontSize: 20, color: 'black'}}>{`Output: `}</Text>
                </View>
              </View>
            );
          })
        : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        flexWrap: 'wrap',
        padding: 8,
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'black',
        borderTopWidth: StyleSheet.hairlineWidth,
    },
});

export default DataAnalysisTextSummary;
