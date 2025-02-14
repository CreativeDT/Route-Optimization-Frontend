import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar';
import './Dashboard.css';

// Import icons
import RouteIcon from '../Assets/images/road-map.png';
import TrackingIcon from '../Assets/images/tracking.png';
import AnalyticsIcon from '../Assets/images/analysis.png';
import Breadcrumbs from './Breadcrumbs/Breadcrumbs';

// Import video
import GlobeVideo from '../Assets/videos/globe.mp4';
import backgroundImage from '../Assets/images/61758.jpg';

const Dashboard = () => {
  const navigate = useNavigate();

  const iconData = [
    {
      image: RouteIcon,
      alt: "Route Planning",
      label: "Route Planning",
      description: (
        <>
          <p>Plan the most efficient routes with real-time traffic updates and optimized paths. Optimize routes for cost savings.</p>
        </>
      ),
      path: '/route-planning',
    },
    {
      image: TrackingIcon,
      alt: "Route Tracking",
      label: "Route Tracking",
      description: (
        <>
          <p>Track your vehicles and shipments in real-time with advanced GPS technology. Monitor your fleet in real-time.</p>
        </>
      ),
      path: '/route-tracking',
    },
    {
      image: AnalyticsIcon,
      alt: "Analytics",
      label: "Analytics",
      description: (
        <>
          <p>Gain insights into your operations with detailed analytics and reports. Analyze fuel consumption, driver performance, delivery times.</p>
        </>
      ),
      path: '/analytics',
    },
  ];


  return (
    <div className="dashboard-container">
      <Navbar />
      <Breadcrumbs />

      {/* <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src={GlobeVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div> */}

<div className="image-background"> {/* Use image-background class */}
        <img src={backgroundImage} alt="Background" />
      </div>

      <div className="icon-grid">
        {iconData.map((icon, index) => (
          <div
            key={index}
            className="icon-box"
            onClick={() => navigate(icon.path)}
          >
            <div className="icon-content"> {/* Added a wrapper for content */}
              <img src={icon.image} alt={icon.alt} className="icon-image" />
              <span className="icon-label">{icon.label}</span>
              <p className="icon-description">{icon.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;