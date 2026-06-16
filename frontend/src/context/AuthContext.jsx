import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (identifier, password) => {
    try {
      const res = await authAPI.login(identifier, password);
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') throw detail;
      if (typeof detail === 'object' && detail !== null) throw JSON.stringify(detail);
      if (err.message) throw err.message;
      throw 'Login failed. Please check your credentials.';
    }
  };

  const register = async (fullName, email, username, password, confirmPassword) => {
    try {
      const res = await authAPI.register(fullName, email, username, password, confirmPassword);
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') throw detail;
      if (typeof detail === 'object' && detail !== null) throw JSON.stringify(detail);
      if (err.message) throw err.message;
      throw 'Registration failed. Please try again.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (fullName, email) => {
    try {
      const res = await authAPI.updateProfile(fullName, email);
      const updatedUser = { ...user, ...res.data.user };
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      throw err.response?.data?.detail || 'Failed to update profile';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!token,
        isAdmin: !!user?.is_admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
