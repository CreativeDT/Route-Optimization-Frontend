// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config"; // Ensure you have your API base URL here

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userObject = JSON.parse(storedUser);
          setUser(userObject);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    }
  }, []);
// Add this function to update user status
  const updateDriverStatus = (newStatus) => {
    setUser(prev => ({
      ...prev,
      driver_status: newStatus ? 'rested' : 'in_transit'
    }));
    localStorage.setItem('user', JSON.stringify({
      ...user,
      driver_status: newStatus ? 'rested' : 'in_transit'
    }));
  };

  const login = async (userData) => {
    try {
      setUser(userData);
      console.log("userData:",userData)
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Fetch user ID details from the API
      const response = await axios.get(`${config.API_BASE_URL}/current_user`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      });

      // Update user data with the fetched details
      const updatedUserData = { ...userData, ...response.data };
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));

    } catch (error) {
      console.error("Error fetching user details:", error);
      // Handle error (e.g., show a message to the user)
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};