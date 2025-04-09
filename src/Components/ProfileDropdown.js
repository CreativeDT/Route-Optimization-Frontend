import React, { useContext, useEffect, useState } from 'react';
import { 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaEdit,
  FaCalendarAlt,
  FaEnvelope,
  FaUserCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import axios from 'axios';
import config from "../config";
import './ProfileDropdown.css';

const ProfileDropdown = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen && token) {
      setLoading(true);
      axios.get(`${config.API_BASE_URL}/users/userProfile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        setProfile(res.data.profile);
      })
      .catch(err => {
        console.error("Failed to fetch profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen]);

  const handleEditProfile = () => {
    navigate('/updateprofile', { state: { profile } });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`profile-dropdown ${isOpen ? 'show' : ''}`}>
      <div className="dropdown-header">
        <div className="profile-avatar">
          {loading ? (
            <div className="avatar-loader"></div>
          ) : (
            <FaUserCircle size={40} />
          )}
        </div>
        
        <div className="profile-info">
          <h4>{profile?.driver_name || user?.username || 'Guest'}</h4>
          
          {profile?.email || user?.email ? (
            <div className="profile-detail">
              <FaEnvelope size={12} />
              <span>{profile?.email || user?.email}</span>
            </div>
          ) : null}
          
          {profile?.joining_date && (
            <div className="profile-detail">
              <FaCalendarAlt size={12} />
              <span>Joined {new Date(profile.joining_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="dropdown-divider"></div>

      <button className="dropdown-item" onClick={handleEditProfile}>
        <FaEdit className="dropdown-icon" />
        <span>Edit Profile</span>
      </button>

      {/* <button className="dropdown-item" onClick={() => navigate('/settings')}>
        <FaCog className="dropdown-icon" />
        <span>Settings</span>
      </button> */}

      <div className="dropdown-divider"></div>

      <button className="dropdown-item logout" onClick={handleLogout}>
        <FaSignOutAlt className="dropdown-icon" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default ProfileDropdown;