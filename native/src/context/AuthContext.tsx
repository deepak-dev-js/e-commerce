import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  getCurrentUser,
  loginUser as loginUserService,
  registerUser as registerUserService,
  logoutUser as logoutUserService,
  verifyEmail as verifyEmailService,
  type User,
  type RegisterResponse,
} from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<RegisterResponse>;
  login: (email: string, password: string) => Promise<User>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> => {
    const response = await registerUserService({
      name,
      email,
      password,
    });

    if (response.token && response.user) {
      setUser(response.user);
    }

    return response;
  };

  const login = async (email: string, password: string) => {
    const authenticatedUser = await loginUserService({
      email,
      password,
    });

    console.log(2,authenticatedUser)

    setUser(authenticatedUser);

    return authenticatedUser;
  };


  const verifyEmail = async (email: string, otp: string) => {
    const authenticatedUser = await verifyEmailService(email, otp);

    // Global authentication state update.
    setUser(authenticatedUser);
  };

  const logout = async () => {
    await logoutUserService();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, verifyEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
