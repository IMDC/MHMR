import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';

function Help() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Help</Text>

      <Section title="Video Sets">
        <Subsection title="What are Video Sets?">
          <Text>Video sets are collections of related videos that you can group together for easier management and analysis.</Text>
        </Subsection>
        <Subsection title="How to Create and Add Videos to a Set">
          <Text>To create a new video set and add videos:</Text>
          <Text>1. Go to the "View Recordings" tab.</Text>
          <Text>2. Tap the "Select Videos" button.</Text>
          <Image 
            source={require('../assets/images/add1.png')}
            style={styles.screenshot}
          />
          <Text>3. Tap the videos you want to add to a set.</Text>
          <Image 
            source={require('../assets/images/add2.png')}
            style={styles.screenshot}
          />
          <Text>4. Tap the "Create new video set" button.</Text>
          <Image 
            source={require('../assets/images/add3.png')}
            style={styles.screenshot}
          />
          <Image 
            source={require('../assets/images/add4.png')}
            style={styles.screenshotLarge}
          />
          <Text>5. Give your set a name and confirm.</Text>
        </Subsection>
        <Subsection title="How to Manage Video Sets">
          <Text>To remove videos or delete a set:</Text>
          <Text>1. Go to the "View Recordings" tab.</Text>
          <Text>2. Tap the "Manage Video Set" button.</Text>
          <Image 
            source={require('../assets/images/removing1.png')}
            style={styles.screenshot}
          />
          <Text>3. To remove a video: Tap "Remove" on the video you want to remove from the set.</Text>
          <Text>4. To delete the entire set: Tap the "Delete Set" button.</Text>
          <Image 
            source={require('../assets/images/removing2.png')}
            style={styles.screenshot}
          />
        </Subsection>
      </Section>

      <Section title="How to See Data?">
        <Text>Your data is displayed in various formats, including graphs and texts.</Text>
        <Subsection title="Why can't I see graphs?">
          <Text>If you can't see graphs:</Text>
          <Text>• Check your internet connection, as graphs require online processing.</Text>
          <Text>• Try refreshing the page or restarting the app.</Text>
        </Subsection>
      </Section>

      <Section title="What Can I Add?">
        <Text>You can add various types of data to enhance your health records.</Text>
        <Subsection title="How to add or edit markups to your videos?">
          <Text>To add markups to your videos:</Text>
          <Text>1. Click on view recordings tab</Text>
          <Text>2. Tap the "Add or edit markups" button on the video you want to annotate.</Text>
          <Image 
            source={require('../assets/images/markups1.png')}
            style={styles.screenshot}
          />
          <Text>3. Use the on-screen tools to add markups to the video.</Text>
          <Image 
            source={require('../assets/images/markups2.png')}
            style={styles.screenshotTall}
          />
          <Text>4. Save your annotations when finished.</Text>
        </Subsection>
      </Section>
    </ScrollView>
  );
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Subsection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.subsection}>
    <Text style={styles.subsectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subsection: {
    marginLeft: 16,
    marginTop: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  screenshot: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  screenshotLarge: {
    width: '100%',
    height: 240,
    resizeMode: 'contain',
    marginVertical: 15,
  },
  screenshotTall: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginVertical: 10,
  },
});

export default Help;
