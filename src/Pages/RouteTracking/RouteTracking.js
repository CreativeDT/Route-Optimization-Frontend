import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Grid, List, ListItem, ListItemText, Paper, Checkbox } from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import Navbar from '../../Components/NavBar';
import axios from 'axios';
import '../../markerCluster.css';
import L from 'leaflet';
import redIconImage from '../../Assets/images/red.png';
import greenIconImage from '../../Assets/images/green.png';
import blueicon from '../../Assets/images/blue.png';

const redIcon = new L.Icon({
    iconUrl: redIconImage,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

const greenIcon = new L.Icon({
    iconUrl: greenIconImage,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

const waypointIcon = new L.Icon({
    iconUrl: blueicon, // Blue dot icon URL
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

const MapView = React.memo(({ coordinates, routeWaypoints = [], route, multipleRoutes }) => {
    const map = useMap();

    useEffect(() => {
        if (coordinates.length > 0) {
            const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
            map.fitBounds(latLngs);
        }
    }, [coordinates, map]);

    useEffect(() => {
        console.log('Route Waypoints in MapView:', routeWaypoints);
    }, [routeWaypoints]);

    const filteredWaypoints = routeWaypoints.slice(1, routeWaypoints.length - 1);

    return (
        <>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MarkerClusterGroup>
                {/* Start Point */}
                {coordinates.length > 0 && (
                    <Marker
                        key="start"
                        position={[coordinates[0][1], coordinates[0][0]]}
                        icon={redIcon}
                    >
                        <Popup>{route?.origin || "Origin"}</Popup>
                    </Marker>
                )}

                {/* End Point */}
                {coordinates.length > 1 && (
                    <Marker
                        key="end"
                        position={[coordinates[coordinates.length - 1][1], coordinates[coordinates.length - 1][0]]}
                        icon={greenIcon}
                    >
                        <Popup>{route?.destination || "Destination"}</Popup>
                    </Marker>
                )}

                {/* Render Filtered Waypoints (excluding first and last) */}
                {filteredWaypoints.length > 0 && filteredWaypoints.map((waypoint, index) => (
                    <Marker key={index} position={[waypoint.coordinates[1], waypoint.coordinates[0]]} icon={waypointIcon}>
                        <Popup>{waypoint.name}</Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>

            {/* Polyline with Hover Popup */}
            <Polyline
    positions={coordinates.map(coord => [coord[1], coord[0]])}
    color="#3b82f6"
    weight={5} // Increase weight to make hover easier
    eventHandlers={{
        mouseover: (e) => {
            e.target.setStyle({ weight: 8, color: "#1e3a8a" }); // Change style on hover
        },
        mouseout: (e) => {
            e.target.setStyle({ weight: 5, color: "#3b82f6" }); // Revert style on mouse out
        },
    }}
>
    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
        <Typography variant="body2">
            <strong>Route Details:</strong><br />
            Origin: {route?.origin}<br />
            Destination: {route?.destination}<br />
            Distance: {route?.distance} km<br />
            Duration: {route?.duration} hrs<br />
            {/* <br /> */}
            <strong>Vehicle Information:</strong><br />
            Fuel Type: {route?.fuel_type || "N/A"}<br />
            Vehicle Type: {route?.vehicle_type || "N/A"}<br />
            CO₂ Emission: {route?.carbon_emission ? `${route.carbon_emission} kg` : "N/A"}

            
        </Typography>
    </Tooltip>
</Polyline>

        </>
    );
});

const RouteTracking = () => {
    const [consignments, setConsignments] = useState([]);
    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [selectedConsignments, setSelectedConsignments] = useState([]);

    useEffect(() => {
        fetchConsignments();
    }, []);

    const fetchConsignments = useCallback(async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('http://127.0.0.1:8000/getConsignments', {
                status: '',
                origin: '',
                destination: '',
                vehicle_id: '',
                routeID: ''
            }, {
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                }
            });
            console.log('Consignments:', response.data);
            setConsignments(response.data.consignments);
        } catch (error) {
            console.error('Error fetching consignments:', error);
        }
    }, []);

    const fetchRouteData = useCallback(async (routeID) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://127.0.0.1:8000/getRouteData', {
                routeID,
                vehicle_id: ''
            }, {
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                }
            });
            console.log('Route data:', response.data.route);
            const route = response.data.route[0];
            // Ensure route_waypoints is defined
            route.route_waypoints = route.route_waypoints || [];
            return route;
        } catch (error) {
            console.error('Error fetching route data:', error);
        }
    }, []);

    const handleConsignmentSelection = async (consignment) => {
        const isSelected = selectedConsignments.includes(consignment.routeID);
        let updatedSelectedConsignments;
        if (isSelected) {
            updatedSelectedConsignments = selectedConsignments.filter(id => id !== consignment.routeID);
        } else {
            if (selectedConsignments.length >= 3) {
                alert('You can select up to 3 consignments.');
                return;
            }
            updatedSelectedConsignments = [...selectedConsignments, consignment.routeID];
        }
        setSelectedConsignments(updatedSelectedConsignments);

        const routes = [];
        for (const routeID of updatedSelectedConsignments) {
            const route = await fetchRouteData(routeID);
            routes.push(route);
        }
        setSelectedRoutes(routes);
    };

    return (
        <Box sx={{ bgcolor: '#f4f6f8', minHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Navbar />

            <Grid container spacing={2} sx={{ p: 2, flexGrow: 1, overflow: 'hidden' }}>

                {/* Left Column: Consignments and Route Details */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

                        {/* Consignments List */}
                        <Box sx={{ flex: '0 0 auto',height: '440px' }}>
                            <Typography variant="h6" gutterBottom>Consignments</Typography>
                            <List sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {consignments.map((consignment) => (
                                    <ListItem
                                        key={consignment.routeID}
                                        button
                                        onClick={() => handleConsignmentSelection(consignment)}
                                        sx={{ border: '1px solid #ddd', mb: 1, borderRadius: 1 }}
                                    >
                                        <Checkbox
                                            checked={selectedConsignments.includes(consignment.routeID)}
                                            onChange={() => handleConsignmentSelection(consignment)}
                                        />
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {/* Dot based on status */}
                                                    <Box
                                                        sx={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: '50%',
                                                            backgroundColor: consignment.status === 'started' ? 'green' : 'red',
                                                            marginRight: 2,
                                                        }}
                                                    />
                                                    {`${consignment.origin} ➜ ${consignment.destination}`}
                                                </Box>
                                            }
                                            secondary={`Vehicle ID: ${consignment.vehicle_id}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Column: Map */}
                <Grid item xs={12} md={8} sx={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
                    {selectedRoutes.length > 0 && (
                        <Box sx={{ height: '100%', borderRadius: 2 }}>
                            <MapContainer
                                center={selectedRoutes[0].route_coordinates.length > 0 ? [selectedRoutes[0].route_coordinates[0][1], selectedRoutes[0].route_coordinates[0][0]] : [41.8781, -87.6298]}
                                zoom={6}
                                style={{ height: '100%', width: '100%' }}
                            >
                                {selectedRoutes.map((route, index) => (
                                    <MapView
                                        key={index}
                                        coordinates={route.route_coordinates}
                                        routeWaypoints={route.route_waypoints || []}
                                        route={route}
                                        multipleRoutes={selectedRoutes.length > 1}
                                    />
                                ))}
                            </MapContainer>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default RouteTracking;