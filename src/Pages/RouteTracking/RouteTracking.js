import React, { useEffect, useState, useCallback,useRef } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Paper, Checkbox } from '@mui/material';
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
import vehicleicon from  '../../Assets/images/truck.png';
import arrowicon from  '../../Assets/images/arrow.png';
import vehicleicon1 from  '../../Assets/images/vehicle1.png';
import ambericon from  '../../Assets/images/Amber.png';
import REDicon from  '../../Assets/images/redicon.png';
import UseWebSocket from '../../WebSockets/UseWebSockets';  // Import WebSocket Hook
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'; // Import your Breadcrumbs component
import config from '../../config'; // Import your config file
const redIcon = new L.Icon({
    iconUrl: redIconImage,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});
const REDIcon = new L.Icon({
    iconUrl: REDicon,
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
const amberIcon = new L.Icon({
    iconUrl: ambericon,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});
const vehicleIcon = new L.Icon({
    iconUrl: vehicleicon1,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});
const ArrowIcon = new L.Icon({
    iconUrl: arrowicon,
    iconSize: [25, 25],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});
const getVehicleIcon = (status) => {
    switch (status) {
        case "moving":
            return vehicleIcon;
        case "stopped_short":
            return amberIcon;
        case "stopped_long":
            return REDIcon;
        default:
            return vehicleIcon; // Default icon if status is unknown
    }
};


const waypointIcon = new L.Icon({
    iconUrl: blueicon, // Blue dot icon URL
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

const MapView = React.memo(({ coordinates, routeWaypoints = [], route, multipleRoutes,vehiclePosition }) => {
    const map = useMap();
    const vehicleMarkerRef = useRef(null); // Ref for the vehicle marker
    const isFirstRender = useRef(true); // Ref to track the first render
    useEffect(() => {
        if (coordinates.length > 0) {
            const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
            map.fitBounds(latLngs);
        }
    }, [coordinates, map]);
    useEffect(() => {
        if (vehiclePosition && map && vehiclePosition.status === "started") {
            console.log("Updating vehicle position on map:", vehiclePosition);
            console.log("map:", map)

             // Update marker position directly using the ref
             if (vehicleMarkerRef.current) {
                vehicleMarkerRef.current.setLatLng([vehiclePosition.lat, vehiclePosition.lng]);
                vehicleMarkerRef.current.setIcon(getVehicleIcon(vehiclePosition.status)); // Update icon
            } else {
                const newMarker = L.marker(
                    [vehiclePosition.lat, vehiclePosition.lng],
                    { icon: getVehicleIcon(vehiclePosition.status) }
                ).addTo(map);
               // VehicleMarkerRef(newMarker);
            }
            map.flyTo([vehiclePosition.lat, vehiclePosition.lng], map.getZoom(), { animate: true, duration: 1.5 });
        }
    }, [vehiclePosition, map]);
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
          {routeWaypoints.slice(1, -1).map((waypoint, index) => (
                    <Marker
                        key={index}
                        position={[waypoint.coordinates[1], waypoint.coordinates[0]]}
                        icon={waypointIcon}
                    >
                        <Popup>{waypoint.name}</Popup>
                    </Marker>
                ))}

                {vehiclePosition && (
                    <Marker
                         ref={vehicleMarkerRef} // Assign the ref to the Marker
                        position={[vehiclePosition.lat, vehiclePosition.lng]}
                        icon={getVehicleIcon(vehiclePosition.status)}
                        
                        
                    >
                        <Popup>
                            <Typography>Vehicle Status: {vehiclePosition.status}</Typography>
                            <Typography>Location: {vehiclePosition.placeName}</Typography>
                        </Popup>
                    </Marker>
                )}  
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
    // const { vehiclePosition } = UseWebSocket("ws://localhost:8000/ws"); // Get WebSocket Data
    const { vehiclePosition } = UseWebSocket(config.WEBSOCKET_URL); // Use the configured URL

    

    
    const fetchRouteData = useCallback(async (routeID) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${config.API_BASE_URL}/getRouteData`, {
                routeID,
                vehicle_id: ''
            }, {
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                }
            });
            console.log('Route Data API Response:', response.data);
            console.log('Route data:', response.data.route);
            const route = response.data.route[0];
            // Ensure route_waypoints is defined
            route.route_waypoints = route.route_waypoints || [];
            return {
                ...route,
                co2Emission: route.carbon_emission || "N/A" // Add CO₂ emission to the returned object
            };
        } catch (error) {
            console.error('Error fetching route data:', error);
        }
    }, []);



    const fetchConsignments = useCallback(async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(`${config.API_BASE_URL}/getConsignments`, {
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
            const consignmentsWithCO2 = await Promise.all(response.data.consignments.map(async (consignment) => {
                const routeData = await fetchRouteData(consignment.routeID);
                return {
                    ...consignment,
                    co2Emission: routeData.co2Emission || "N/A" // Add CO₂ emission to each consignment
                };
            }));
            const consignmentsWithStatusText = consignmentsWithCO2.map(consignment => ({
                ...consignment,
                statusText: consignment.status === 'started' ? 'Started' : 'Not Started'
            }));
            setConsignments(consignmentsWithStatusText);        } catch (error) {
            console.error('Error fetching consignments:', error);
        }
    }, [fetchRouteData]);

    useEffect(() => {
        fetchConsignments();
    }, [fetchConsignments]);

    

    useEffect(() => {
        if (vehiclePosition) {
            console.log("Updated vehicle position:", vehiclePosition);
            // Update the map with the new vehicle position
        }
    }, [vehiclePosition]);

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
        <Box sx={{ bgcolor: '#f4f6f8', minHeight: '90vh', padding: '3px!important', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Navbar />
            <Breadcrumbs />

            <Grid container spacing={2} sx={{ p: 2, flexGrow: 1, overflow: 'hidden', padding: '1px!important' }}>

                {/* Left Column: Consignments and Route Details */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

                        {/* Consignments List */}
                        <Box sx={{ flex: '0 0 auto', height: '440px' }}>
                            <Typography variant="h6" gutterBottom>Consignments</Typography>
                            <List sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {consignments.map((consignment) => (
                                    <ListItem
                                        key={consignment.routeID}
                                        button="true"
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
                                            secondary={
                                                <React.Fragment>
                                                    <div>{consignment.statusText}</div> {/* Display status text */}
                                                    <div>Predicted CO₂ Emission: {consignment.co2Emission || "N/A"} Kg</div>
                                                </React.Fragment>
                                            }                                        />
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
                                        vehiclePosition={vehiclePosition}
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