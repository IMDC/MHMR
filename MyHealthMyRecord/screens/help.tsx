import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const sections = [
  { title: "Video Sets Creation/Management " },
  { title: "How To View Your Data" },
  { title: "Adding Markups To My Videos" }
];

function Help() {
  const [openSections, setOpenSections] = React.useState<string[]>([]);

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections((prevOpenSections) =>
      prevOpenSections.includes(section)
        ? prevOpenSections.filter((s) => s !== section)
        : [...prevOpenSections, section]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Help Center</Text>
      <View style={styles.titleUnderline} />

      <View style={styles.toc}>
        {sections.map((section, index) => (
          <View key={section.title}>
            <TouchableOpacity onPress={() => toggleSection(section.title)}>
              <View style={styles.tocItemContainer}>
                <Text style={styles.arrow}>
                  {openSections.includes(section.title) ? '▼' : '▶'}
                </Text>
                <Text style={styles.tocItem}>{section.title}</Text>
              </View>
            </TouchableOpacity>
            {openSections.includes(section.title) && (
              <Section title={section.title}>
                {index === 0 && (
                  <>
                    <Subsection title="What are Video Sets?">
                      <Text>Video sets are collections of related videos that you can group together for easier management and analysis.</Text>
                    </Subsection>
                    <Subsection title="How to Create and Add Videos to a Set">
                      <Text>To create a new video set and add videos:</Text>
                      <Text>1. Go to the "Manage Videos" tab.</Text>
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
                      <Text>1. Go to the "Manage Videos" tab.</Text>
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
                  </>
                )}
                {index === 1 && (
                  <Subsection title="How to See Data?">
                    <Text>Your data is displayed in various formats, including graphs and texts.</Text>
                    <Subsection title="Why can't I see graphs?">
                      <Text>If you can't see graphs:</Text>
                      <Text>• Connect with our researchers during the weekly in-person meetings to view the data for your video sets.</Text>
                      <Text>• Check your internet connection, as graphs require online processing.</Text>
                      <Text>• Try restarting the app.</Text>
                    </Subsection>
                  </Subsection>
                )}
                {index === 2 && (
                  <Subsection title="What Can I Add?">
                    <Text>You can add various types of data to enhance your videos.</Text>
                    <Subsection title="How to add or edit markups to your videos?">
                      <Text>To add markups to your videos:</Text>
                      <Text>1. Tap on Manage Videos tab</Text>
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
                      <Text>4. Markups are saved automatically but you should review it to make sure it is correct.</Text>
                    </Subsection>
                  </Subsection>
                )}
              </Section>
            )}
          </View>
        ))}
      </View>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  titleUnderline: {
    height: 2,
    backgroundColor: '#ccc',
    marginBottom: 16,
    marginHorizontal: 50,
  },
  toc: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tocItem: {
    fontSize: 18,
    color: '#007BFF',
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subsection: {
    marginLeft: 16,
    marginTop: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
  },
  screenshot: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 10,
    borderRadius: 8,
  },
  screenshotLarge: {
    width: '100%',
    height: 240,
    resizeMode: 'contain',
    marginVertical: 15,
    borderRadius: 8,
  },
  screenshotTall: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginVertical: 10,
    borderRadius: 8,
  },
  tocItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  arrow: {
    fontSize: 18,
    color: '#007BFF',
    marginRight: 8,
    width: 20,
    textAlign: 'center',
  },
});

export default Help;
