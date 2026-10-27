import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is not configured in your .env file.');
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  code?: string;
  token?: string;
  user?: User;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  code?: string;
  email?: string;
  token?: string;
  user?: User;
}


const TOKEN_KEY = 'apnashop_token';

export const getToken = async () => {
  return SecureStore.getItemAsync(TOKEN_KEY);
};

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};



export const registerUser = async (formData: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResponse> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const data: RegisterResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Registration failed.');
  }

  return data;
};

export const verifyEmail = async (
  email: string,
  otp: string
): Promise<User> => {
  const response = await fetch(`${API_URL}/api/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      otp,
    }),
  });

  const data: VerifyEmailResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Email verification failed.');
  }

  // OTP verification ke baad backend ko JWT aur user return karna hoga.
  if (!data.token || !data.user) {
    throw new Error(
      'Email verified, but authentication token or user was not returned by the server.'
    );
  }

  // Token persist karo.
  await saveToken(data.token);

  return data.user;
};

export const resendVerificationOtp = async (email: string) => {
  const response = await fetch(
    `${API_URL}/api/auth/resend-verification-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || 'Unable to send verification OTP.',
    );
  }

  return data;
};


export const loginUser = async (formData: {
  email: string;
  password: string;
}) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const data: AuthResponse = await response.json();

  if (!response.ok || !data.success || !data.token || !data.user) {
    const error = new Error(
      data.message || 'Login failed. Please try again.',
    ) as Error & { code?: string };

    error.code = data.code;

    throw error;
  }

  await saveToken(data.token);

  return data.user;
};


export const getCurrentUser = async () => {
  const token = await getToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    await removeToken();
    return null;
  }

  const data = await response.json();

  if (!response.ok || !data.success || !data.user) {
    throw new Error(data.message || 'Failed to fetch current user.');
  }

  return data.user as User;
};





export const logoutUser = async () => {
  await removeToken();
};

export const forgotPassword = async (
  email: string,
): Promise<string> => {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || 'Unable to process your request. Please try again.',
    );
  }

  return data.message || 'If an account exists with this email, you will receive password reset instructions.';
};


type ResetPasswordData = {
  token: string;
  email: string;
  password: string;
};

export const resetPassword = async ({
  token,
  email,
  password,
}: ResetPasswordData): Promise<string> => {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || 'Unable to reset your password. Please try again.'
    );
  }

  return data.message || 'Password reset successful.';
};