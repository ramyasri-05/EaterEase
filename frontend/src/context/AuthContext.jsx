import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfileImage = async (profileImage) => {
    const { data } = await api.put('/auth/profile/photo', { profileImage });
    localStorage.setItem('userInfo', JSON.stringify(data));
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setUser((currentUser) => ({
      ...currentUser,
      ...data,
    }));
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  );
};
