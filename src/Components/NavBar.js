// NavBar.js
import React, { useContext, useState, useRef, useEffect } from 'react';
import { FaUser, FaBell, FaCog, FaHome, FaTruckMoving,FaUserShield,FaUserTie,FaUserCog } from 'react-icons/fa';
import { GiSteeringWheel } from 'react-icons/gi';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Box, Typography ,Badge,Button} from "@mui/material";
import Menu from './Menu';
import './Navbar.css';
import config from "../config";
import logo from '../Assets/images/white_logo.png';
import useNotificationWebSocket from "../WebSockets/UseNotificationWebSockets";
import { AuthContext } from '../Context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import { Switch, Snackbar, Alert } from '@mui/material';

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [readNotifications, setReadNotifications] = useState([]); // Track read notifications
    const [isInTransit, setIsInTransit] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const userId = user?.user?.user_id;
    const userRole = user?.user_role;

    const { notifications, setNotifications } = useNotificationWebSocket(userId);
    // const { notifications} = useNotificationWebSocket(userId);
     const handleHomeClick = () => {
        if (userRole === "driver") {
            navigate("/driverdashboard");
        } else if (userRole === "admin") {
            navigate("/dashboard");
        } else if (userRole === "manager") {
            navigate("/managerdashboard");
        } else
            navigate("/dashboard");
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    // const toggleNotifications = () => {
    //     setShowNotifications(!showNotifications);
    //     setReadNotifications(notifications.map(n => n.notification_id)); // Mark all as read when opened
    // };
   
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };
    const markNotificationAsRead = async (notificationId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${config.API_BASE_URL}/notifications/read`,
                {
              
                    notification_id: notificationId
                },
                {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                }
                  
            );
           
    
            // Update read status locally
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notification_id === notificationId ? { ...n, read: true } : n
                )
            );
    
            setReadNotifications((prev) => [...prev, notificationId]);
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (showNotifications && !event.target.closest('.notifications')) {
                setShowNotifications(false);
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

    const unreadCount = notifications.filter(n => !readNotifications.includes(n.notification_id)).length;

    // const getRoleIcon = () => {
    //     switch (userRole) {
    //         case 'admin':
    //             return <FaUserCog className="icon" />;
    //         case 'manager':
    //             return <FaUser className="icon" />;
    //         case 'driver':
    //             return <FaTruckMoving className="icon" />;
    //         default:
    //             return <FaUser className="icon" />;
    //     }
    // };

    const getRoleData = () => {
      switch (userRole) {
          case 'admin':
              return {
                  icon: <FaUserShield className="role-icon" />,
                  label: "Administrator",
                  color: "#e74c3c",
                  bgColor: "rgba(231, 76, 60, 0.1)",
                  borderColor: "#c0392b"
              };
          case 'manager':
              return {
                  icon: <FaUserTie className="role-icon" />,
                  label: "Manager",
                  color: "#f39c12",
                  bgColor: "rgba(243, 156, 18, 0.1)",
                  borderColor: "#d35400"
              };
          case 'driver':
              return {
                  icon: <GiSteeringWheel   className="role-icon" />,
                  label: "Driver",
                  color: "#3498db",
                  bgColor: "rgba(52, 152, 219, 0.1)",
                  borderColor: "#2980b9"
              };
          default:
              return {
                  icon: <FaUser className="role-icon" />,
                  label: "User",
                  color: "#95a5a6",
                  bgColor: "rgba(149, 165, 166, 0.1)",
                  borderColor: "#7f8c8d"
              };
      }
  };

  const roleData = getRoleData();
  const getUserInitials = () => {
    const fullName = user?.username || '';
    const nameParts = fullName.trim().split(' ');
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || '';
    const secondInitial = nameParts[1]?.charAt(0).toUpperCase() || '';
    return firstInitial + secondInitial;
};

const handleToggle = (event) => {
    const newStatus = event.target.checked;
    setIsInTransit(newStatus);
    const token = localStorage.getItem('token');
    // Send updated status to backend  
    axios.post(
      `${config.API_BASE_URL}/driver/restPeriod?rest=${newStatus}`, // sending boolean true/false
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(() => {
        setSnackbar({ open: true, message: 'Driver status updated', severity: 'success' });
      })
      .catch(() => {
        setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
        setIsInTransit(!newStatus); // Revert toggle on failure
      });
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
                    <span className="tooltip">Dashboard</span>
                </div>
                <div className="notifications">
                <Badge badgeContent={unreadCount} color="error" overlap="circular" sx={{
                  "& .MuiBadge-badge": { 
                  right:"37%!important",
                },
                }}
                 >
                        <FaBell className="icon" onClick={() => toggleNotifications()} />
                    </Badge>
                   
                    
                    {showNotifications && (
                        <div className="notification-list">
                            <div className="notification-header">
                                <h4>Notifications</h4>
                                <small>{notifications.length} total</small>
                            </div>
                            {notifications.length > 0 ? (
                                notifications.map((msg, index) => (
                                    <div key={index} className="notification-item">
                                        <div className="notification-icon">
                                            <FaBell />
                                            
                                        </div>
                                        <div className="message">
                                            <div className="message-text">{msg.message}</div>
                                            {msg.creationDate && (
                                                <div className="timestamp">
                                                    {new Date(msg.creationDate).toLocaleString()}
                                                </div>
                                            )}
                                             {!readNotifications.includes(msg.notification_id) && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => markNotificationAsRead(msg.notification_id)}
                                                    sx={{
                                                        marginTop: "5px",
                                                        textTransform: "none",
                                                        backgroundColor: "#3498db",
                                                        "&:hover": { backgroundColor: "#2980b9" },
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    Mark as Read
                                                </Button>
                                            )}
                                              {readNotifications.includes(msg.notification_id) && (
                                                <div style={{ fontSize: "12px", marginTop: "5px", color: "gray" }}>
                                                    Read
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-notifications">
                                    No new notifications
                                </div>
                            )}
                        </div>
                    )}
          
                </div>
                {/* <div className="settings">
                    <FaCog className="icon" />
                    <span className="tooltip">Settings</span>
                </div> */}
                {/* <div className='status'>
                {userRole === "driver" && (
                    <Box display="flex" alignItems="center" className="driver-status-toggle" sx={{ marginRight: 2 }}>
                        <Typography variant="body2" sx={{ marginRight: 1 }}>
                        {isInTransit ? "In Transit" : "Rested"}
                        </Typography>
                        <Switch
                        checked={isInTransit}
                        onChange={handleToggle}
                        inputProps={{ 'aria-label': 'Driver status toggle' }}
                        color="primary"
                        />
                    </Box>
                    )}
<Snackbar
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={() => setSnackbar({ ...snackbar, open: false })}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
  <Alert
    onClose={() => setSnackbar({ ...snackbar, open: false })}
    severity={snackbar.severity}
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>

                </div> */}
                <div className="profile" ref={profileRef}>
                    <div className="profile-wrapper" onClick={toggleProfile}>
                        <div className="role-badge" style={{
                            backgroundColor: roleData.bgColor,
                            borderLeft: `4px solid ${roleData.borderColor}`
                        }}>
                            {roleData.icon}
                            <span className="role-label" style={{ color: roleData.color }}>
                                {roleData.label}
                            </span>
                        </div>
                        
                        {/* <div className="user-info">
                            <Typography className="username">
                                {user ? user.username : 'Guest'}
                            </Typography>
                            <Typography className="user-email">
                                {user?.email || ''}
                            </Typography>
                        </div> */}
                        
                        <div className="avatar">
                            {/* <FaUser className="avatar-icon" /> */}
                            <div className="avatar-initials">
                                        {getUserInitials()}
                                    </div>
                                                        </div>
                        
                        <ProfileDropdown isOpen={isProfileOpen} onClose={toggleProfile} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavBar;