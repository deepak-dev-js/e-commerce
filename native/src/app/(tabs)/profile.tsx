import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="person-circle-outline" size={76} color="#2563eb" />

        <Text style={styles.heading}>My Profile</Text>

        <Text style={styles.description}>
          Login to manage your profile and orders.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 10,
    textAlign: 'center',
  },
});
