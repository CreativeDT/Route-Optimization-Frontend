import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Grid, List, ListItem, ListItemText, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import Navbar from '../../Components/NavBar';
import axios from 'axios';
import '../../markerCluster.css';
import L from 'leaflet';
import redIconImage from '../../Assets/images/red.svg';
import greenIconImage from '../../Assets/images/placeholder.svg';
import blueicon from '../../Assets/images/blue.png';

const redIcon = new L.Icon({
    iconUrl: redIconImage,
    iconSize: [30, 75],
    iconAnchor: [15, 37],
    popupAnchor: [0, -35]
});

const greenIcon = new L.Icon({
    iconUrl: greenIconImage,
    iconSize: [30, 75],
    iconAnchor: [15, 37],
    popupAnchor: [0, -35]
});

const waypointIcon = new L.Icon({
    iconUrl: blueicon, // Blue dot icon URL
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

const MapView = React.memo(({ coordinates, routeWaypoints }) => {
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

    return (
        <>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MarkerClusterGroup>
                {coordinates.filter((_, index) => index === 0 || index === coordinates.length - 1).map((coord, index) => (
                    <Marker
                        key={index}
                        position={[coord[1], coord[0]]}
                        icon={index === 0 ? redIcon : greenIcon}
                    >
                        <Popup>{index === 0 ? 'Start' : 'End'}</Popup>
                    </Marker>
                ))}

                {/* Check if routeWaypoints is available before mapping */}
                {routeWaypoints && routeWaypoints.length > 0 && routeWaypoints.map((waypoint, index) => (
                    <Marker key={index} position={[waypoint.coordinates[1], waypoint.coordinates[0]]} icon={waypointIcon}>
                        <Popup>{waypoint.name}</Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
            <Polyline positions={coordinates.map(coord => [coord[1], coord[0]])} color="#3b82f6" />
        </>
    );
});


const RouteTracking = () => {
    const [consignments, setConsignments] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);

    useEffect(() => {
        fetchConsignments();
    }, []);

    const fetchConsignments = useCallback(async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/getConsignments', {
                status: '',
                origin: '',
                destination: '',
                vehicle_id: '',
                routeID: ''
            });
            console.log('Consignments:', response.data);
            setConsignments(response.data.consignments);
        } catch (error) {
            console.error('Error fetching consignments:', error);
        }
    }, []);

    const fetchRouteData = useCallback(async (routeID) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/getRouteData', {
                routeID,
                vehicle_id: ''
            });
            console.log('Route data:', response.data.route);
            setSelectedRoute(response.data.route[0]);
        } catch (error) {
            console.error('Error fetching route data:', error);
        }
    }, []);

    return (
        <Box sx={{ bgcolor: '#f4f6f8', minHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Navbar />

            <Grid container spacing={2} sx={{ p: 2, flexGrow: 1, overflow: 'hidden' }}>

                {/* Left Column: Consignments and Route Details */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

                        {/* Consignments List */}
                        <Box sx={{ flex: '0 0 auto' }}>
                            <Typography variant="h6" gutterBottom>Consignments</Typography>
                            <List sx={{ maxHeight: '146px', overflowY: 'auto' }}>
                                {consignments.map((consignment) => (
                                    <ListItem
                                        key={consignment.routeID}
                                        button
                                        onClick={() => fetchRouteData(consignment.routeID)}
                                        sx={{ border: '1px solid #ddd', mb: 1, borderRadius: 1 }}
                                    >
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

                        {/* Route Details Card */}
                        {selectedRoute && (
                            <Box sx={{ flex: '0 0 auto' }}>
                                <Card elevation={3}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Route Details</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography><strong>Origin:</strong> {selectedRoute.origin}</Typography>
                                                <Typography><strong>Destination:</strong> {selectedRoute.destination}</Typography>
                                                <Typography><strong>Distance:</strong> {selectedRoute.distance} km</Typography>
                                                <Typography><strong>Duration:</strong> {selectedRoute.duration} hrs</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography><strong>Fuel Type:</strong> {selectedRoute.fuel_type}</Typography>
                                                <Typography><strong>Vehicle Type:</strong> {selectedRoute.vehicle_type}</Typography>
                                                <Typography><strong>CO₂ Emission:</strong> {selectedRoute.carbon_emission} kg</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                    </Paper>
                </Grid>

                {/* Right Column: Map */}
                <Grid item xs={12} md={8} sx={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
                    {selectedRoute && (
                        <Box sx={{ height: '100%', borderRadius: 2 }}>
                            <MapContainer
                                center={selectedRoute.route_coordinates.length > 0 ? [selectedRoute.route_coordinates[0][1], selectedRoute.route_coordinates[0][0]] : [41.8781, -87.6298]}
                                zoom={6}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <MapView coordinates={selectedRoute.route_coordinates} />
                            </MapContainer>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default RouteTracking;
