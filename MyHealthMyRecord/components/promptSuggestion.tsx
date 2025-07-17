import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Icon} from '@rneui/themed';

interface PromptSection {
  title: string;
  prompts: string[];
}

const promptData: PromptSection[] = [
  {
    title: 'General Wellbeing',
    prompts: [
      'How are you feeling today, emotionally and physically?',
      "What's one thing you're grateful for right now?",
      'Did anything make you smile or laugh today?',
      "What's been the highlight of your day so far?",
      "Is there something you're looking forward to?",
    ],
  },
  {
    title: 'Emotional Check-in',
    prompts: [
      'Describe your mood in three words.',
      "What's been weighing on your mind lately?",
      'Is there something you wish you could change about today?',
      "What's one thing that's been challenging for you recently?",
      'How are you coping with stress or anxiety?',
    ],
  },
  {
    title: 'Health & Symptoms',
    prompts: [
      'Are you experiencing any pain or discomfort? Where and how intense is it?',
      'Did you notice any changes in your symptoms today?',
      'How did your energy levels feel throughout the day?',
      'Did you take any medication or treatments today? How did they make you feel?',
      'Did you get enough rest or sleep last night?',
    ],
  },
  {
    title: 'Daily Activities',
    prompts: [
      'What activities did you enjoy today?',
      'Did you spend time outdoors or with others?',
      'Did you try something new or different today?',
      "What's one thing you accomplished today, big or small?",
      'Is there something you wish you had done differently?',
    ],
  },
  {
    title: 'Reflection & Growth',
    prompts: [
      "What's something you learned about yourself recently?",
      "Is there a goal you're working towards? How is it going?",
      "What's one thing you want to remember about today?",
      'If you could give advice to your future self, what would it be?',
      'What are you proud of today?',
    ],
  },
  {
    title: 'Looking Ahead',
    prompts: [
      'What are your hopes for tomorrow?',
      'Is there something you want to focus on or improve?',
      "What's one thing you want to try or experience soon?",
      'How can you take care of yourself better tomorrow?',
    ],
  },
];

interface PromptSuggestionProps {
  onPromptSelect?: (prompt: string) => void;
}

const PromptSuggestion: React.FC<PromptSuggestionProps> = ({
  onPromptSelect,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {promptData.map(section => {
          const isExpanded = expandedSections.has(section.title);
          return (
            <View key={section.title} style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.title)}
                activeOpacity={0.7}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Icon
                  name={
                    isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                  }
                  type="material"
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.promptsContainer}>
                  {section.prompts.map((prompt, index) => (
                    <View
                      key={index}
                      style={styles.promptItem}
                     
                   >
                      <Text style={styles.promptText}>• {prompt}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionHeader: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  promptsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  promptItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  promptText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default PromptSuggestion;
