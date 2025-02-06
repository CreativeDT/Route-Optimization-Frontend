import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar';
import './Dashboard.css';

// Import icons
import RouteIcon from '../Assets/images/road-map.png';
import TrackingIcon from '../Assets/images/tracking.png';
import AnalyticsIcon from '../Assets/images/analysis.png';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="icon-grid">
        <div className="icon-box" onClick={() => navigate('/route-planning')}>
          <img src={RouteIcon} alt="Route Planning" className="icon-image" />
          <span className="icon-label">Route Planning</span>
        </div>

        <div className="icon-box" onClick={() => navigate('/route-tracking')}>
          <img src={TrackingIcon} alt="Route Tracking" className="icon-image" />
          <span className="icon-label">Route Tracking</span>
        </div>

        <div className="icon-box" onClick={() => navigate('/analytics')}>
          <img src={AnalyticsIcon} alt="Analytics" className="icon-image" />
          <span className="icon-label">Analytics</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
