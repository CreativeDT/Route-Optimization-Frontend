import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Paper, Checkbox,TextField } from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';

import axios from 'axios';
import '../../markerCluster.css';
import L from 'leaflet';
import redIconImage from '../../Assets/images/red.png';
import greenIconImage from '../../Assets/images/green.png';
import blueicon from '../../Assets/images/blue.png';
import vehicleicon from '../../Assets/images/truck.png';
import arrowicon from '../../Assets/images/arrow.png';
import vehicleicon1 from '../../Assets/images/vehicle1.png';
import ambericon from '../../Assets/images/Amber.png';
import REDicon from '../../Assets/images/redicon.png';
import UseWebSocket from '../../WebSockets/UseWebSockets';  // Import WebSocket Hook
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs'; // Import your Breadcrumbs component
import config from '../../config'; // Import your config file
import debounce from "lodash.debounce";
import NavBar from '../../Components/NavBar';
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
const defaultCenter = [41.8781, -87.6298]; // Default center (Chicago)


const waypointIcon = new L.Icon({
    iconUrl: blueicon, // Blue dot icon URL
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

const MapView = React.memo(({ coordinates, routeWaypoints = [], route, multipleRoutes, vehiclePositions }) => {
    const map = useMap();
    const vehicleMarkerRef = useRef(null); // Ref for the vehicle marker

    useEffect(() => {
        if (coordinates.length > 0) {
            const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
            map.fitBounds(latLngs);
        }
    }, [coordinates, map]);
      // Get the vehicle position for this route
  const vehiclePosition = vehiclePositions[route.routeID];

  const hasCenteredRef = useRef(false);
    useEffect(() => {
        if (vehiclePosition && map && route.status === 'started') {
            console.log("Updating vehicle position on map:", vehiclePosition);

            // Update marker position directly using the ref
            if (vehicleMarkerRef.current) {
                vehicleMarkerRef.current.setLatLng([vehiclePosition.lat, vehiclePosition.lng]);
                vehicleMarkerRef.current.setIcon(getVehicleIcon(vehiclePosition.status)); // Update icon
            } else {
                const newMarker = L.marker(
                    [vehiclePosition.lat, vehiclePosition.lng],
                    { icon: getVehicleIcon(vehiclePosition.status) }
                ).addTo(map);
                vehicleMarkerRef.current = newMarker;
            }
            // map.flyTo([vehiclePosition.lat, vehiclePosition.lng], map.getZoom(), { animate: true, duration: 1.5 });
        // Center the map only once
    if (!hasCenteredRef.current) {
        map.flyTo([vehiclePosition.lat, vehiclePosition.lng], map.getZoom(), { animate: true, duration: 1.5 });
        hasCenteredRef.current = true;
      }
        
        }
    }, [vehiclePosition, map, route.status]);

   
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
                {/* {routeWaypoints.slice(1, -1).map((waypoint, index) => (
                    <Marker
                        key={index}
                        position={[waypoint.coordinates[1], waypoint.coordinates[0]]}
                        icon={waypointIcon}
                    >
                        <Popup>{waypoint.name}</Popup>
                    </Marker>
                ))} */}

                {vehiclePosition && route.status === 'started' && (
                    <Marker
                        ref={vehicleMarkerRef}
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

const ManagerRouteTracking = () => {
    const [consignments, setConsignments] = useState([]);
    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [selectedConsignments, setSelectedConsignments] = useState([]);
    const [shouldConnectWebSocket, setShouldConnectWebSocket] = useState(false);
    // const { vehiclePosition } = UseWebSocket("ws://localhost:8000/ws"); // Get WebSocket Data
    const { vehiclePositions } = UseWebSocket(config.WEBSOCKET_URL, shouldConnectWebSocket);





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
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Consignments:', response.data);

            const consignmentsWithStatusText = response.data.consignments.map(
              (consignment) => {
              const isAssigned = consignment.driver_id !== null && consignment.driver_id !== undefined; // Check if driver_id exists
              console.log("Consignment ID:", consignment.consignment_id, "Driver ID:", consignment.driver_id, "isAssigned:", isAssigned);
              return {
                ...consignment,
                statusText:
                    consignment.status === 'started'
                        ? 'Started'
                        : 'Not Started',
                assignedText: isAssigned ? 'Assigned' : 'Not Assigned',
                assignedColor: isAssigned ? 'green' : 'red', // Set color based on assignment
            };
        }
    );

            setConsignments(consignmentsWithStatusText);
        } catch (error) {
            console.error('Error fetching consignments:', error);
        }
    }, []);

    useEffect(() => {
        fetchConsignments();
    }, [fetchConsignments]);



    // useEffect(() => {
    //     if (vehiclePosition) {
    //         console.log("Updated vehicle position:", vehiclePosition);
    //         // Update the map with the new vehicle position
    //     }
    // }, [vehiclePosition]);

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

        // Check if any selected consignment is started
        const shouldConnect = updatedSelectedConsignments.some(id => {
            const selectedConsignment = consignments.find(c => c.routeID === id);
            return selectedConsignment && selectedConsignment.status === 'started';
        });
        setShouldConnectWebSocket(shouldConnect);
    };

    const [searchQuery, setSearchQuery] = useState("");

    const filteredConsignments = consignments.filter((consignment) =>
        `${consignment.origin} ➜ ${consignment.destination}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    return (
      <Box
      sx={{
        bgcolor: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      >
        <NavBar  />
        <Breadcrumbs />

     

        <Grid
          container
          spacing={2}
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            height: "80vh", // Adjust based on navbar height
            border: "1px solid #ccc",
    borderRadius: "2px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",overflow:"hidden",margin:"1px 0px 5px 0px!important",width:"100%!important"
    
          }}
        >
          {/* Left Column: Consignments and Route Details */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            <Paper
              elevation={3}
              sx={{
                flex: 1, // Makes it fill available space
                display: "flex",
                flexDirection: "column",
                gap: 2,
                overflowY: "auto", // Enables scrolling if content overflows
              }}
            >
              {/* Search Field */}
              <TextField
                label="Search Consignments"
                variant="outlined"
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
               
              />

              {/* Consignments List */}
              <Box sx={{ flex: "0 0 auto", height: "440px" }}>
                <Typography variant="h6" gutterBottom>
                  Consignments
                </Typography>
                <List sx={{ maxHeight: "400px", overflowY: "auto" }}>
                  {filteredConsignments.map((consignment) => (
                    <ListItem
                      key={consignment.routeID}
                      button="true"
                      onClick={() => handleConsignmentSelection(consignment)}
                      sx={{ border: "1px solid #ddd", mb: 1, borderRadius: 1 }}
                    >
                      <Checkbox
                        checked={selectedConsignments.includes(
                          consignment.routeID
                        )}
                        onChange={() => handleConsignmentSelection(consignment)}
                      />
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {/* Dot based on status */}
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                flexShrink: 0, // Prevents resizing
                                borderRadius: "50%",
                                backgroundColor:
                                  consignment.status === "started"
                                    ? "green"
                                    : "red",
                                marginRight: 2,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "12px" }}
                            >
                              {`${consignment.origin} ➜ ${consignment.destination}`}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Box sx={{display:"flex",gap :5}}>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "10px" }}
                            >
                            Status:  {consignment.statusText}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "10px" }}
                            >
                            Driver:  {consignment.assignedText}
                            </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "10px" }}
                            >
                              Predicted CO₂ Emission:{" "}
                              {consignment.carbon_emission || "N/A"} Kg
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Map */}
          {/* <Grid item xs={12} md={8} sx={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
                    {selectedRoutes.length > 0 && (
                        <Box sx={{ height: '100%', borderRadius: 2 }}>
                            <MapContainer
                                center={selectedRoutes[0].route_coordinates.length > 0 ? 
                                    [selectedRoutes[0].route_coordinates[0][1], selectedRoutes[0].route_coordinates[0][0]] 
                                    :    defaultCenter }
                                zoom={6}
                                style={{ height: '100%', width: '100%' }}
                            >
                                {selectedRoutes.map((route, index) => (
                                    <MapView
                                        key={index}
                                        coordinates={route.route_coordinates}
                                        routeWaypoints={route.route_waypoints || []}
                                        route={route}
                                        vehiclePosition={route.status === 'started' ? vehiclePosition : null}
                                        multipleRoutes={selectedRoutes.length > 1}
                                    />
                                ))}
                            </MapContainer>
                        </Box>
                    )}
                    
                </Grid> */}
          <Grid
             item
             xs={12}
             md={8}
             sx={{
               height: "100%",
               display: "flex",
               flexDirection: "column",
               overflow: "hidden",
             }}
           >
            <Box sx={{ flex:1, borderRadius: 2 }}>
              <MapContainer
                center={
                  selectedRoutes.length > 0 &&
                  selectedRoutes[0].route_coordinates.length > 0
                    ? [
                        selectedRoutes[0].route_coordinates[0][1],
                        selectedRoutes[0].route_coordinates[0][0],
                      ]
                    : defaultCenter // Use defaultCenter when no routes are selected
                }
                zoom={selectedRoutes.length > 0 ? 6 : 4} // Default zoom level, can be adjusted
                style={{ height: "100%", width: "100%" }}
              >
                {/* ... TileLayer and conditional MapView rendering ... */}
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {selectedRoutes.map((route, index) => (
                  <MapView
                    key={index}
                    coordinates={route.route_coordinates}
                    routeWaypoints={route.route_waypoints || []}
                    route={route}
                    vehiclePositions={vehiclePositions}  // Pass the object with positions
                    multipleRoutes={selectedRoutes.length > 1}
                  />
                ))}
              </MapContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
};

export default ManagerRouteTracking;