import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { useAuth } from '@/context/AuthContext';
import { saveToken } from '@/services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();
  const params = useLocalSearchParams<{ redirect?: string }>();

  // const handleGoogleSuccess = async () => {
  //   setMessage('');
  //   setLoading(true);

  //   try {
  //     const authenticatedUser = await loginWithGoogle();

  //     if (authenticatedUser.role === 'admin') {
  //       // router.replace('/admin');
  //     } else {
  //       router.replace('/(tabs)');
  //     }
  //   } catch (error) {
  //     console.error('Google login failed:', error);

  //     setMessage(
  //       error instanceof Error
  //         ? error.message
  //         : 'Google login failed'
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const redirectByRole = (role?: string) => {
    if (params.redirect === '/checkout') {
      router.replace('/checkout' as never);
    } else if (role === 'admin') {
      router.replace('/admin' as never);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    setMessage('');
    setLoading(true);

    try {
      await login(email.trim(), password);

      // AuthContext updates the user after successful login.
      // Fetching the role separately is unnecessary if login returns it.
      const currentUser = user;

      redirectByRole(currentUser?.role);
    } catch (error) {
      console.error('Login failed:', error);
      setMessage(
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.',
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
            <View style={styles.header}>
              <View style={styles.logo}>
                <Image
                  source={require('../../../assets/images/logo2.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Login to continue shopping
              </Text>
            </View>

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
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  editable={!loading}
                />

                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#6b7280"
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.forgotPasswordContainer}>
              <Link href="/(auth)/forgot-password" asChild>
                <Text style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </Link>
            </View>

            {message ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {message}
              </Text>
            ) : null}

            <Pressable
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* <Pressable
              onPress={handleGoogleSuccess}
              disabled={loading}
              style={styles.googleButton}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.googleButtonText}>
                Continue with Google
              </Text>
            </Pressable> */}

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account?{' '}
              </Text>

              <Link href="/(auth)/register" asChild>
                <Text style={styles.registerLink}>Create Account</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
    marginBottom: 20,
  },

  forgotPasswordText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
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
  passwordContainer: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  error: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 13,
  },
  loginButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  orText: {
    fontSize: 13,
    color: '#6b7280',
  },
  registerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 28,
  },
  registerText: {
    color: '#4b5563',
    fontSize: 13,
  },
  registerLink: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  googleButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },

  googleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
});
