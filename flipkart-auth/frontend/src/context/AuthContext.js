import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const API = axios.create({ baseURL: "/api/auth" });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fk_token");
    const savedUser = localStorage.getItem("fk_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const signup = async (name, email, password) => {
    const { data } = await API.post("/signup", { name, email, password });
    return data;
  };

  const verifyOTP = async (email, otp) => {
    const { data } = await API.post("/verify-otp", { email, otp });
    return data;
  };

  const resendOTP = async (email) => {
    const { data } = await API.post("/resend-otp", { email });
    return data;
  };

  const login = async (email, password) => {
    const { data } = await API.post("/login", { email, password });
    localStorage.setItem("fk_token", data.token);
    localStorage.setItem("fk_user", JSON.stringify(data.user));
    API.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("fk_token");
    localStorage.removeItem("fk_user");
    delete API.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, verifyOTP, resendOTP, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
