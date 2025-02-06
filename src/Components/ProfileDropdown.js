// ProfileDropdown.js
import React, { useContext } from 'react';
import { FaUser, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './ProfileDropdown.css'; // Create a separate CSS file

import { AuthContext } from '../Context/AuthContext';

const ProfileDropdown = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose(); // Close the dropdown after logout
  };

  return (
    <div className={`profile-dropdown ${isOpen ? 'show' : ''}`}>
      {user && ( // Conditionally render profile option if user exists
        <div className="dropdown-item">
          <FaUser className="dropdown-icon" />
          <span>Profile</span>
        </div>
      )}
      <div className="dropdown-item" onClick={handleLogout}>
        <FaCog className="dropdown-icon" />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default ProfileDropdown;