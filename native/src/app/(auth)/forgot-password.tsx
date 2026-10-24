import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { forgotPassword } from '@/services/authService';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setIsSuccess(false);
      setMessage('Please enter your email address.');
      return;
    }

    setMessage('');
    setIsSuccess(false);
    setLoading(true);

    try {
      const responseMessage = await forgotPassword(normalizedEmail);

      setIsSuccess(true);
      setMessage(responseMessage);
    } catch (error) {
      console.error('Forgot password failed:', error);

      setIsSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to process your request. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="lock-open-outline"
                size={36}
                color="#2563eb"
              />
            </View>

            <Text style={styles.title}>Forgot Password?</Text>

            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions
              to reset your password.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!loading}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {message ? (
              <Text
                accessibilityRole="alert"
                style={[
                  styles.message,
                  isSuccess ? styles.successMessage : styles.errorMessage,
                ]}
              >
                {message}
              </Text>
            ) : null}

            <Pressable
              style={[
                styles.submitButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Send Reset Link
                </Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Link href="/(auth)/login" asChild>
                <Pressable
                  style={styles.backButton}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color="#2563eb"
                  />
                  <Text style={styles.backText}>Back to Login</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  form: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  iconContainer: {
    width: 76,
    height: 76,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
    backgroundColor: '#eff6ff',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    marginBottom: 28,
    fontSize: 14,
    lineHeight: 22,
    color: '#6b7280',
    textAlign: 'center',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
  },
  message: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
  },
  submitButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  backText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});
