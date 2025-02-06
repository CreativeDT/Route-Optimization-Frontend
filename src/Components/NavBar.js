// Navbar.js
import React, { useContext, useState, useRef, useEffect } from 'react';
import { FaUser, FaBell, FaCog, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Menu from './Menu';
import './Navbar.css';
// import logo from '../Assets/images/creative-logo-main.png';
import logo from '../Assets/images/white_logo.png';

import { AuthContext } from '../Context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar">
      <Menu />
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="logo" onClick={handleHomeClick} style={{ cursor: 'pointer' }} />
      </div>
      <div className="navbar-right">
        <div className="home-button" onClick={handleHomeClick}>
          <FaHome className="icon" />
        </div>
        <div className="notifications">
          <FaBell className="icon" />
        </div>
        <div className="settings">
          <FaCog className="icon" />
        </div>
        <div className="profile" ref={profileRef}>
          <div className="profile-wrapper">
            <div className="profile-header" onClick={toggleProfile}>
              <FaUser className="icon" />
              <span>{user ? user.username : 'Guest'}</span>
            </div>
            <ProfileDropdown isOpen={isProfileOpen} onClose={toggleProfile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;