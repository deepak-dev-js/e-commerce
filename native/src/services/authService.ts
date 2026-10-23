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
}) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const data: AuthResponse = await response.json();

  console.log(data)

  if (!response.ok || !data.success || !data.token || !data.user) {
    throw new Error(data.message || 'Registration failed.');
  }

  await saveToken(data.token);

  return data.user;
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
    throw new Error(data.message || 'Login failed.');
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