import React from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Card, CardContent, Typography } from "@mui/material";

import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import backgroundImage from "../../Assets/images/optimization image.jpg";
import adminIcon from '../../Assets/images/admin.png';
import '.././Dashboard.css';
// Import icons
import RouteIcon from "../../Assets/images/road-map.png";
import TrackingIcon from "../../Assets/images/tracking.png";
import AnalyticsIcon from "../../Assets/images/analysis.png";
import userIcon from '../../Assets/images/user_details.png';
import vehicleIcon from '../../Assets/images/vehicle_detail.png';
import NavBar from "../../Components/NavBar";
import Breadcrumbs1 from "./Breadcrumbs1";
// Import video
//import GlobeVideo from '../Assets/videos/globe.mp4';


const ManagerDashboard = () => {
  const navigate = useNavigate();

  const iconData = [
    {
        image: RouteIcon,
        alt: "Route Planning",
        label: "Route Planning",
        description:" Plan the most efficient routes with real-time traffic updates and optimized paths. Optimize routes for cost savings.",
        path: "/managersuggestroutes",
      },
      
    {
      image: TrackingIcon,
      alt: "Route Tracking",
      label: "Route Tracking",
      description: "Track your vehicles and shipments in real-time with advanced GPS technology. Monitor your fleet in real-time.",
      path: "/managerroutetracking",
    },
    
    {
      image: AnalyticsIcon,
      alt: "Analytics",
      label: "Analytics",
      description: "Gain insights into your operations with detailed analytics and reports. Analyze fuel consumption, driver performance, delivery times.",
      path: "/manageranalytics",
    },
   
    {
      image: adminIcon,
      alt: "Administration",
      label: "Administration",
      description:"  Manage user access and permissions. Add, edit and deactivate user accounts.",
      path: "/manageradministration",
    },
  ];

  return (
    <div id="dashboard-container" className="dashboard-container" style={{  minHeight: "100vh", position: "relative" }}>
       <NavBar />
       <Breadcrumbs1 />

      {/* Background Image */}
      <div id="background-image" className="relative bg-overlay-container"  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }}>
        <img src={backgroundImage} alt="Background" style={{ width: "100%",backgroundColor: "black", height: "100%", objectFit: "cover", opacity: 0.2 }} />
      </div>
      {/* <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          opacity: 0.2,
          zIndex: 0,
        }}
      ></div> */}
      {/* Dashboard Cards */}
     
       <div id="cards" style={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: "95%",
                margin: "auto",
                padding: "20px 0",
                flexWrap: 'wrap'
            }}>
              {iconData.map((icon, index) => (
            <Card  key={index} id="card"
              
              sx={{
                width: "180px",
                height: "270px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px",
                textAlign: "center",
                borderRadius: "10px",
                boxShadow: 3,
                transition: "transform 0.3s ease-in-out",
                margin: '10px',
                "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 6,
                    cursor: "pointer",
                },
            }}
              onClick={() => navigate(icon.path)}
            >
             <img src={icon.image} alt={icon.alt} style={{ width: "60px", height: "60px", marginBottom: "10px" }} />
             <CardContent sx={{display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
               
            }}>
             
                <Typography  fontWeight="bold" gutterBottom>
                  {icon.label}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{fontSize:"10px"}}>
                  {icon.description}
                </Typography>
              </CardContent>
            </Card>
            ))}
       </div>
        
     </div>
    
  );
};

export default ManagerDashboard;