import React, { createContext, useState, useEffect, useContext } from "react";

// Create Authentication Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const storedUser = localStorage.getItem("userInfo");

  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  // 2. Login function: Updates state and saves to LocalStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  // 3. Logout function: Clears state and LocalStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
  };

  //4.  Update user handler
  // Used for partial updates (e.g. profile or preference updates)
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem("userInfo", JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout,updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to easily use the AuthContext in other components
export const useAuth = () => useContext(AuthContext);
