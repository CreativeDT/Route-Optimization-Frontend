// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";  // Ensure you have your API base URL here

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Retrieve the token and user data from localStorage on component mount
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     // Assuming you store user data as a stringified object in localStorage
  //     const storedUser = JSON.parse(localStorage.getItem('user'));
  //     setUser(storedUser);
  //   }
  // }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const userObject = JSON.parse(storedUser);
            setUser(userObject);
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            localStorage.removeItem('user'); // Clear corrupted data
        }
    }
}, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    // localStorage.setItem('user', JSON.stringify(userData)); // Save user data
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
