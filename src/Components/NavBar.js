// NavBar.js
import React, { useContext, useState, useRef, useEffect } from 'react';
import { FaUser, FaBell, FaCog, FaHome ,FaTruckMoving ,FaUserCog} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Box, Typography} from "@mui/material";
import Menu from './Menu';
import './Navbar.css';
import logo from '../Assets/images/white_logo.png';
import useNotificationWebSocket from "../WebSockets/UseNotificationWebSockets";
import { AuthContext } from '../Context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false); // Add state for showing/hiding notifications

  // Directly access user.user.user_id
  const userId = user?.user?.user_id;
  const userRole = user?.user_role; // Access user role from context

  const { notifications } = useNotificationWebSocket(userId); // Pass userId

  console.log("Navbar Rendered - Current User:", user);
  // const handleHomeClick = () => {
  //   navigate("/dashboard");
  // };
  const handleHomeClick = () => {
    if (userRole === "driver") {
      navigate("/driverdashboard");
    } else if (userRole === "admin") {
      navigate("/admindashboard");
    } else if (userRole === "manager") {
      navigate("/managerdashboard");
    } else 
      navigate("/dashboard");
    
  };
  

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications); // Toggle notification display
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (showNotifications && !event.target.closest('.notifications')) {
        setShowNotifications(false); // Hide notifications if clicked outside
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log("Current User in Navbar (After Fix):", storedUser);
  }, []);

  const unreadCount = notifications.length; // Count unread notifications
// Function to determine the icon based on the user role
const getRoleIcon = () => {
  console.log("Getting Role Icon for:", userRole);
  switch (userRole) {
    case 'admin':
      return <FaUserCog className="icon" />;
    case 'manager':
      return <FaUser className="icon" />;
    case 'driver':
      return <FaTruckMoving className="icon" />;
    default:
      return <FaUser className="icon" />;
  }
};
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
          <FaBell className="icon" onClick={toggleNotifications} />
          {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
          {showNotifications && (
            <div className="notification-list">
              {notifications.map((msg, index) => (
                <div key={index} className="notification-item">
                  {msg.message}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="settings">
          <FaCog className="icon" />
        </div>
        {/* <div className="profile" ref={profileRef}>
          <div className="profile-wrapper">
            <div className="profile-header" onClick={toggleProfile}>
              <FaUser className="icon" />
              <span>{user ? user.username : 'Guest'}</span>
            </div>
            <ProfileDropdown isOpen={isProfileOpen} onClose={toggleProfile} />
          </div>
        </div> */}
      
        <div className="profile" ref={profileRef}>
     
          <div className="profile-wrapper">
          <Box sx={{display:"flex" ,gap:1}}>
            <Typography className="profile-header" onClick={toggleProfile}>
              {getRoleIcon()}  
             
            </Typography>
            <Typography className="profile-header" onClick={toggleProfile}>
                {user ? user.username : 'Guest'}
             
            </Typography>
            <ProfileDropdown isOpen={isProfileOpen} onClose={toggleProfile} /> </Box>
          </div>
         

        </div>
      


      </div>
    </div>
  );
};

export default NavBar;