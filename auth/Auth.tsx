import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  token: null,
  userId: null,
  login: (token: string, userId: number) => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const saved = await AsyncStorage.getItem("token");
      const savedUserId = await AsyncStorage.getItem("userId");
      if (saved) setToken(saved);
      if (savedUserId) setUserId(parseInt(savedUserId, 10));
      setLoading(false);
    };
    loadToken();
  }, []);

  const login = async (newToken: string, newUserId: number) => {
    await AsyncStorage.setItem("token", newToken);
    await AsyncStorage.setItem("userId", newUserId.toString());
    setToken(newToken);
    setUserId(newUserId);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
     await AsyncStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
