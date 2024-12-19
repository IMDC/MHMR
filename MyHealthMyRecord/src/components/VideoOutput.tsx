import { generateTranscriptionSummary } from '../utils/transcriptionUtils';

// ... existing imports

interface VideoOutputProps {
  transcription: string;
}

const VideoOutput: React.FC<VideoOutputProps> = ({ transcription }) => {
  const summary = generateTranscriptionSummary(transcription);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summaryText}>{summary}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Full Transcription</Text>
        <Text style={styles.transcriptionText}>{transcription}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  transcriptionText: {
    fontSize: 14,
    color: '#34495e',
  },
});

export default VideoOutput; 