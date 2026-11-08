import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('iso_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('iso_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set default auth header for axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('iso_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('iso_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('iso_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('iso_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, userData);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Registration failed';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('iso_token');
    localStorage.removeItem('iso_user');
  };

  const updateConsent = async (marketingOptIn) => {
    try {
      const res = await axios.put(`${API_BASE}/auth/consent`, { marketingOptIn });
      setUser((prev) => (prev ? { ...prev, marketingOptIn: res.data.marketingOptIn } : null));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateConsent,
        isAuthenticated: !!token && !!user,
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

