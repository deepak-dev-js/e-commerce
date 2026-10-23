import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();

  const response = await GoogleSignin.signIn();

  if (response.type !== 'success') {
    throw new Error('Google login was cancelled.');
  }

  const credential = response.data.idToken;

  if (!credential) {
    throw new Error('Unable to get Google ID token.');
  }

  return credential;
};
