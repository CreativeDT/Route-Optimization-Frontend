import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material';
import { useLocation,useNavigate } from 'react-router-dom';
import './Breadcrumbs.css'


const Breadcrumbs2 = ({ homeLabel = "Home" }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
        const breadcrumbs = [];

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            let displayName = segment.replace(/-/g, ' '); // Replace hyphens

            // Customize display names for specific routes (Important!)
            switch (segment) {
                case 'driverfleetdetails':
                    displayName = 'Driver Fleetdetails';
                    break;
                case 'driverroutetracking':
                    displayName = 'Driver Route Tracking';
                    break;
                case 'driveranalytics':
                    displayName = 'DriverAnalytics';
                    break;
                
                        
                // Add more cases as needed for other routes
                default:
                    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1); // Capitalize
            }

            breadcrumbs.push(
                  <Typography
                    key={index}
                    onClick={() => navigate(currentPath)}
                    style={{ cursor: 'pointer', color: 'inherit', }}
                >
                    {displayName}
                </Typography>
            );

            if (index < pathSegments.length - 1) {
                breadcrumbs.push(<Typography key="separator" color="text.primary">{"/"}</Typography>);
            }
        });

        return breadcrumbs;
    };

    return (
        <Box className="breadcrumbs-container breadcrumbs-custom">
            <MuiBreadcrumbs className="breadcrumbs" aria-label="breadcrumb">
                
                <Typography 
                    onClick={() => navigate("/driverdashboard")}
                    style={{ cursor: 'pointer', color: 'inherit',textDecoration:'none' }}
                >
                    {homeLabel}
                </Typography>
                {generateBreadcrumbs()}
            </MuiBreadcrumbs>
        </Box>
    );
};

export default Breadcrumbs2;