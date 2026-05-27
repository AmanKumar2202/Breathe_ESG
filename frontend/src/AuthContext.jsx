import React, { createContext, useContext, useState, useEffect } from "react";
import { post } from "./utils/client";
import { ENDPOINTS } from "./utils/endpoints";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Utility to parse JWT safely
const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const payload = decodeJwt(token);
      // Check if token is expired (optional but recommended)
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({ id: payload.user_id, role: payload.role || "analyst" });
      } else {
        // Clear expired token
        localStorage.removeItem("accessToken");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // API call to Django
      const data = await post(ENDPOINTS.TOKEN, { username, password });
      
      // Save tokens
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      
      // Update state
      const payload = decodeJwt(data.access);
      setUser({
        id: payload.user_id,
        role:
          username === "auditor@acme.com"
            ? "auditor"
            : username === "admin@acme.com"
            ? "admin"
            : "analyst",
      });
      
      return data; // Return success to the component
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to be caught by LoginPage.jsx
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  if (loading) return null;
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};