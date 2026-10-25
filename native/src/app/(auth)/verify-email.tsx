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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function VerifyEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{
    email?: string;
  }>();

  const email = typeof emailParam === 'string' ? emailParam : '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { verifyEmail } = useAuth();

  const handleVerifyEmail = async () => {
    if (!email || !otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await verifyEmail(email, otp.trim());

      setSuccess('Email verified successfully!');

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Email verification failed:', error);

      setError(
        error instanceof Error
          ? error.message
          : 'Email verification failed.'
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
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.emailIcon}>✉</Text>
              </View>

              <Text style={styles.title}>Verify Your Email</Text>

              <Text style={styles.subtitle}>
                We sent a 6-digit verification code to
              </Text>

              <Text style={styles.email}>{email || 'Email unavailable'}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Enter OTP</Text>

              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                placeholderTextColor="#9ca3af"
                value={otp}
                onChangeText={(value) => {
                  setOtp(value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                  setSuccess('');
                }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={6}
                editable={!loading}
                accessibilityLabel="Six-digit email verification code"
              />
            </View>

            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}

            {success ? (
              <Text style={styles.success}>{success}</Text>
            ) : null}

            <Pressable
              style={[
                styles.button,
                (loading || otp.length !== 6) && styles.disabledButton,
              ]}
              onPress={handleVerifyEmail}
              disabled={loading || otp.length !== 6}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Verify Email</Text>
              )}
            </Pressable>

            <Text style={styles.info}>
              Enter the code sent to your email. The code expires in 10
              minutes.
            </Text>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Wrong email? </Text>

              <Link href="/(auth)/register" asChild>
                <Pressable disabled={loading}>
                  <Text style={styles.link}>Register again</Text>
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
    backgroundColor: '#f9fafb',
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
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emailIcon: {
    fontSize: 38,
    color: '#2563eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  email: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  otpInput: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: 10,
    textAlign: 'center',
    color: '#111827',
  },
  error: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
  },
  success: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    marginTop: 20,
    fontSize: 13,
    lineHeight: 20,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#4b5563',
    fontSize: 13,
  },
  link: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
});
