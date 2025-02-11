import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import './Breadcrumbs.css'


const Breadcrumbs = ({ homeLabel = "Home" }) => {
    const location = useLocation();

    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
        const breadcrumbs = [];

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            let displayName = segment.replace(/-/g, ' '); // Replace hyphens

            // Customize display names for specific routes (Important!)
            switch (segment) {
                case 'route-planning':
                    displayName = 'Route Planning';
                    break;
                case 'route-tracking':
                    displayName = 'Route Tracking';
                    break;
                case 'analytics':
                    displayName = 'Analytics';
                    break;
                // Add more cases as needed for other routes
                default:
                    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1); // Capitalize
            }

            breadcrumbs.push(
                <Link key={index} underline="hover" color="inherit" href={currentPath}>
                    {displayName}
                </Link>
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
                <Link underline="hover" color="inherit" href="/dashboard">
                    {homeLabel}
                </Link>
                {generateBreadcrumbs()}
            </MuiBreadcrumbs>
        </Box>
    );
};

export default Breadcrumbs;