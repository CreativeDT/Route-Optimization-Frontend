import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Menu.css';
import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import routeIcon from '../Assets/images/road-map.png';
import trackingIcon from '../Assets/images/tracking.png';
import analyticsIcon from '../Assets/images/analysis.png';
import adminIcon from '../Assets/images/admin.png';
import userIcon from '../Assets/images/user_details.png';
import vehicleIcon from '../Assets/images/vehicle_detail.png';
import { FaTimes } from 'react-icons/fa'; // or FaArrowLeft
import { HiOutlineArrowLeft } from "react-icons/hi";
// import fleetIcon from '../Assets/images/fleet-icon.png';

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
 
const { user } = useContext(AuthContext);
const userRole = user?.user_role;

  return (
    <div className="menu-container">
      <div className="menu-button" onClick={handleMenuToggle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
          <g stroke="#fff">
            <path d="M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z"/>
          </g>
        </svg>
      </div>

      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
    <HiOutlineArrowLeft className="close-icon" onClick={handleMenuToggle} />
  </div>
        {/* <h2 className="menu-title" style={{ textAlign: '-webkit-auto', fontSize: '19px', fontWeight: 'bold', borderBottom: '2px  #34495e', color: '#34495e' }}>Menu</h2> */}

        {/* <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div> */}

        <div className="tile-container1">
          {/* <Link to="/route-planning" className="tile1">
            <img src={routeIcon} alt="Route Planning" className="icon-image" />
            <span>Route Planning</span>
          </Link> */}
          {userRole === "manager" && (
            <Link to="/route-planning" className="tile1">
              <img src={routeIcon} alt="Route Planning" className="icon-image" />
              <span>Route Planning</span>
            </Link>
          )}

          <Link to="/route-tracking" className="tile1">
            <img src={trackingIcon} alt="Route Tracking" className="icon-image" />
            <span>Route Tracking</span>
          </Link>

          <Link to="/analytics" className="tile1">
            <img src={analyticsIcon} alt="Analytics" className="icon-image" />
            <span>Analytics</span>
          </Link>

          <Link to="/userlist" className="tile1">
            <img src={adminIcon} alt="Userslist" className="icon-image" />
            <span>Administration</span>
          </Link>

         
          

          {/* <Link to="/fleet-management" className="tile1">
            <img src={fleetIcon} alt="Fleet Management" className="icon-image" />
            <span>Fleet Management</span>
          </Link> */}
        </div>
      </div>

      {isMenuOpen && <div className="overlay" onClick={handleMenuToggle}></div>}
    </div>
  );
};

export default Menu;
