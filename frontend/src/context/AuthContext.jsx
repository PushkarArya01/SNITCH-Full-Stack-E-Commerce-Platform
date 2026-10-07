import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // --------------------------------------------------
  // User
  // --------------------------------------------------
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('snitch_user');

      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Failed to load saved user:', error);
      return null;
    }
  });

  // --------------------------------------------------
  // Access Token
  // --------------------------------------------------
  const [token, setToken] = useState(
    () => localStorage.getItem('snitch_token') || null
  );

  // --------------------------------------------------
  // Save / Remove User
  // --------------------------------------------------
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        'snitch_user',
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem('snitch_user');
    }
  }, [user]);

  // --------------------------------------------------
  // Save / Remove Token
  // --------------------------------------------------
  useEffect(() => {
    if (token) {
      localStorage.setItem('snitch_token', token);
    } else {
      localStorage.removeItem('snitch_token');
    }
  }, [token]);

  // --------------------------------------------------
  // Load Current User
  // --------------------------------------------------
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!token) return;

      try {
        const data = await authApi.getProfile();

        setUser(data.data.user);
      } catch (error) {
        console.error(
          'Failed to load current user:',
          error
        );
      }
    };

    loadCurrentUser();
  }, [token]);

  // --------------------------------------------------
  // Login
  // --------------------------------------------------
  const login = async (credentials) => {
    const data = await authApi.login(credentials);

    setUser(data.user);
    setToken(data.token);

    return data;
  };

  // --------------------------------------------------
  // Register
  // --------------------------------------------------
  const register = async (userData) => {
    const data = await authApi.register(userData);

    setUser(data.user);
    setToken(data.token);

    return data;
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      setUser(null);
      setToken(null);

      localStorage.removeItem('snitch_user');
      localStorage.removeItem('snitch_token');
    }
  };

  // --------------------------------------------------
  // Context
  // --------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// --------------------------------------------------
// useAuth Hook
// --------------------------------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};