import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

function Help() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Help</Text>

      <Section title="Video Sets?">
        <Subsection title="What?">
          <Text>Video sets are collections of related videos that you can group together for easier management and analysis.</Text>
        </Subsection>
        <Subsection title="How?">
          <Text>Adding/removing video sets:</Text>
          <Text>• Go to view recordings tab, then tap "Select Videos" button.</Text>
          <Text>• Tap the videos you want to add to a set.</Text>
          <Text>• Tap the "Create new video set" button and give your set a name.</Text>
          <Text>• To remove a video from the set, tap on "Manage Video Set" button and hit remove on the video you want to remove from set.</Text>
          <Text>• To delete a video set, tap on "Manage Video Set" button and hit delete.</Text>
        </Subsection>
      </Section>

      <Section title="How to See Data?">
        <Text>Your data is displayed in various formats, including graphs and raw numbers.</Text>
        <Subsection title="Why can't I see graphs?">
          <Text>If you can't see graphs:</Text>
          <Text>• Ensure you have enough data points (at least 2) for comparison.</Text>
          <Text>• Check your internet connection, as graphs may require online processing.</Text>
          <Text>• Try refreshing the page or restarting the app.</Text>
        </Subsection>
      </Section>

      <Section title="What Can I Add?">
        <Text>You can add various types of data to enhance your health records.</Text>
        <Subsection title="How to add annotations to your videos">
          <Text>To add annotations to your videos:</Text>
          <Text>1. Click on view recordings tab</Text>
          <Text>2. Tap the "Add or edit markups" button on the video you want to annotate.</Text>
          <Text>3. Use the on-screen tools to add annotations to the video.</Text>
          <Text>4. Save your annotation when finished.</Text>
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
});

export default Help;
