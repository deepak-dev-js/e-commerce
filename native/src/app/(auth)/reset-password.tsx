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
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetPassword } from '@/services/authService';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    token?: string;
    email?: string;
  }>();

  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMessage('');
    setIsSuccess(false);

    if (!token || !email) {
      setMessage(
        'This password reset link is invalid. Please request a new link.',
      );
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const responseMessage = await resetPassword({
        token,
        email,
        password,
      });

      setIsSuccess(true);
      setMessage(responseMessage);

      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password failed:', error);

      setIsSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to reset your password. Please try again.',
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
                name="lock-closed-outline"
                size={36}
                color="#2563eb"
              />
            </View>

            <Text style={styles.title}>Reset Password</Text>

            <Text style={styles.subtitle}>
              Enter your new password below to regain access to your
              ApnaShop account.
            </Text>

            {email ? (
              <Text style={styles.emailText}>Account: {email}</Text>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!loading && !isSuccess}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm New Password</Text>

              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!loading && !isSuccess}
                returnKeyType="done"
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
                (loading || isSuccess) && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={loading || isSuccess}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Reset Password
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
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 22,
    color: '#6b7280',
    textAlign: 'center',
  },
  emailText: {
    marginBottom: 20,
    fontSize: 13,
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
