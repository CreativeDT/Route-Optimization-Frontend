import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Paper,Chip, Tab,Tabs,Checkbox,TextField } from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, Tooltip ,Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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

import config from '../../config'; // Import your config file
import debounce from "lodash.debounce";
import NavBar from '../../Components/NavBar';
import Breadcrumbs1 from './Breadcrumbs1';

  // const [filter, setFilter] = useState("All");
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
// const filteredUsers = users.filter(
//   (user) =>
//     (filter === "All" || user.role.includes(filter.toLowerCase())) &&
//     user.name.toLowerCase().includes(searchTerm.toLowerCase())
// );


const waypointIcon = new L.Icon({
    iconUrl: blueicon, // Blue dot icon URL
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

const MapView = React.memo(({ coordinates, routeWaypoints = [], route, multipleRoutes, vehiclePositions }) => {
  const map = useMap();
  const vehicleMarkerRef = useRef(null);
  const hasCenteredRef = useRef(false);

  // Fit map to planned route bounds
  useEffect(() => {
      if (coordinates.length > 0) {
          const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
          map.fitBounds(latLngs);
      }
  }, [coordinates, map]);

  // Get vehicle live position
  const vehiclePosition = vehiclePositions[route.routeID];

  // Handle vehicle position update
  useEffect(() => {
      if (vehiclePosition && map && route.status === 'started') {
          console.log("Updating vehicle position on map:", vehiclePosition);

          if (vehicleMarkerRef.current) {
              vehicleMarkerRef.current.setLatLng([vehiclePosition.lat, vehiclePosition.lng]);
              vehicleMarkerRef.current.setIcon(getVehicleIcon(vehiclePosition.status));
          } else {
              const newMarker = L.marker(
                  [vehiclePosition.lat, vehiclePosition.lng],
                  { icon: getVehicleIcon(vehiclePosition.status) }
              ).addTo(map);
              vehicleMarkerRef.current = newMarker;
          }

          if (!hasCenteredRef.current) {
              map.flyTo([vehiclePosition.lat, vehiclePosition.lng], map.getZoom(), { animate: true, duration: 1.5 });
              hasCenteredRef.current = true;
          }
      }
  }, [vehiclePosition, map, route.status]);

  // Safe parse for actual route coordinates
  const actualCoordinates = route.actual_coordinates || [];
  console.log("Using actual_coordinates from props:", actualCoordinates);
  

  const filteredWaypoints = routeWaypoints.slice(1, -1);
  useEffect(() => {
    if (actualCoordinates.length > 0 && map) {
      const bounds = actualCoordinates.map(coord => [coord[1], coord[0]]);
      map.fitBounds(bounds);
    }
  }, [actualCoordinates, map]);
  
  return (
      <>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <MarkerClusterGroup>
              {/* Start Marker (Planned) */}
              {coordinates.length > 0 && (
                  <Marker
                      key="start"
                      position={[coordinates[0][1], coordinates[0][0]]}
                      icon={redIcon}
                  >
                      <Popup>{route?.origin || "Origin"}</Popup>
                  </Marker>
              )}

              {/* End Marker (Planned) */}
              {coordinates.length > 1 && (
                  <Marker
                      key="end"
                      position={[coordinates[coordinates.length - 1][1], coordinates[coordinates.length - 1][0]]}
                      icon={greenIcon}
                  >
                      <Popup>{route?.destination || "Destination"}</Popup>
                  </Marker>
              )}

              {/* Waypoints */}
              {filteredWaypoints.map((waypoint, index) => (
                  <Marker
                      key={`waypoint-${index}`}
                      position={[waypoint.coordinates[1], waypoint.coordinates[0]]}
                      icon={waypointIcon}
                  >
                      <Popup>{waypoint.name}</Popup>
                  </Marker>
              ))}

              {/* Live Vehicle Position */}
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

              {/* Actual Route Start/End Markers */}
              {actualCoordinates.length > 0 && (
                  <>
                      <Marker
                          key="actualStart"
                          position={[actualCoordinates[0][1], actualCoordinates[0][0]]}
                          icon={redIcon}
                      >
                          <Popup>Actual Start</Popup>
                      </Marker>
                      <Marker
                          key="actualEnd"
                          position={[actualCoordinates[actualCoordinates.length - 1][1], actualCoordinates[actualCoordinates.length - 1][0]]}
                          icon={greenIcon}
                      >
                          <Popup>Actual End</Popup>
                      </Marker>
                  </>
              )}
          </MarkerClusterGroup>

          {/* Polyline for Planned Route */}
           {coordinates.length > 0 && (
              <Polyline
                  positions={coordinates.map(coord => [coord[1], coord[0]])}
                  color="blue"
                  weight={5}
                  eventHandlers={{
                      mouseover: (e) => e.target.setStyle({ weight: 1, color: "#1e3a8a" }),
                      mouseout: (e) => e.target.setStyle({ weight: 1, color: "#3b82f6" }),
                  }}
              >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                      <Typography variant="body2">
                          <strong>Planned Route</strong><br />
                          {/* Origin: {route?.origin}<br />
                          Destination: {route?.destination}<br /> */}
                            Origin: {typeof route?.origin === 'object' ? route.origin.name : route?.origin || "Origin"}<br />
                            Destination: {typeof route?.destination === 'object' ? route.destination.name : route?.destination || "Destination"}<br />
                          Distance: {route?.distance} miles<br />
                          Duration: {route?.duration} hrs<br />
                          Fuel: {route?.fuel_type || "N/A"}<br />
                          Vehicle: {route?.vehicle_type || "N/A"}<br />
                          CO₂: {route?.carbon_emission ? `${route.carbon_emission} lbs` : "N/A"}
                      </Typography>
                  </Tooltip>
              </Polyline>
          )} 

          {/* Polyline for Actual Route */}
          {actualCoordinates.length > 0 && (
              <Polyline
                  positions={actualCoordinates.map(coord => [coord[1], coord[0]])}
                  color="green"
                  dashArray="6"
                  weight={4}
              >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                      <Typography variant="body2">
                          <strong>Actual Route Taken</strong><br />
                          Start: {route?.origin}<br />
                          End: {route?.destination}
                      </Typography>
                  </Tooltip>
              </Polyline>
          )}
      </>
  );
});
const RouteTracking = () => {
    const [consignments, setConsignments] = useState([]);
    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [selectedConsignments, setSelectedConsignments] = useState([]);
    const [shouldConnectWebSocket, setShouldConnectWebSocket] = useState(false);
    const [geoFences, setGeoFences] = useState([]);
    const [trackedRoutes, setTrackedRoutes] = useState([]);

    // const { vehiclePosition } = UseWebSocket("ws://localhost:8000/ws"); // Get WebSocket Data
    const { vehiclePositions } = UseWebSocket(config.WEBSOCKET_URL, shouldConnectWebSocket);
    const [filter, setFilter] = useState("All"); // Added filter state
    const [searchQuery, setSearchQuery] = useState("");
    useEffect(() => {
      console.log("Selected Routes:", selectedRoutes); // Debugging log
      
      if (!selectedRoutes.length) {
        console.warn("No route selected, skipping geofence fetch.");
        return;
      }
    
      const fetchGeoFences = async () => {
        try {
          const routeID = selectedRoutes[0]?.routeID;
          if (!routeID) return;
      
          const response = await axios.get(
            `${config.API_BASE_URL}/geofence/getGeofences?routeID=${routeID}`
          );
      
          console.log("Full API Response:", response.data);
    
          if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            setGeoFences(response.data.data);
          } else {
            console.warn("No geofences found, attempting to create...");
            await createGeoFences(routeID); // Call function to create geofences
          }
        } catch (error) {
          console.error("Error fetching geofences:", error);
          setGeoFences([]);
        }
      };
    
      const createGeoFences = async (routeID) => {
        try {
          const createResponse = await axios.post(`${config.API_BASE_URL}/geofence/createGeofences?routeID=${routeID}`
           );
    
          console.log("Geofences Created Successfully:", createResponse.data);
    
          // Fetch geofences again after creating
          fetchGeoFences();
        } catch (error) {
          console.error("Error creating geofences:", error);
        }
      };
    
      fetchGeoFences();
    }, [selectedRoutes]); 
    
    useEffect(() => {
      console.log("Updated GeoFences State:", geoFences);
    }, [geoFences]);

    const getGeofenceCenter = (coordinates) => {
      let latSum = 0, lngSum = 0;
      coordinates.forEach(coord => {
        latSum += coord[1]; // Latitude
        lngSum += coord[0]; // Longitude
      });
      return [latSum / coordinates.length, lngSum / coordinates.length];
    };
    
    
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
                : consignment.status === 'completed'
                ? 'Completed'
                : consignment.status === 'rested'
                ? 'Rested'
                : 'Not Started',
                assignedText: isAssigned ? 'Assigned' : 'Not Assigned',
                assignedColor: isAssigned ? 'green' : 'red', // Set color based on assignment
                driverName: consignment.driver || 'Not Assigned', // Use the driver field from the API
            };
        });
        
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

    // const handleConsignmentSelection = async (consignment) => {
    //   console.log("Selected consignment:", consignment);
    //     const isSelected = selectedConsignments.includes(consignment.routeID);
    //     let updatedSelectedConsignments;
    //     if (isSelected) {
    //         updatedSelectedConsignments = selectedConsignments.filter(id => id !== consignment.routeID);
    //     } else {
    //         if (selectedConsignments.length >= 3) {
    //             alert('You can select up to 3 consignments.');
    //             return;
    //         }
    //         updatedSelectedConsignments = [...selectedConsignments, consignment.routeID];
    //     }
    //     setSelectedConsignments(updatedSelectedConsignments);

    //     const routes = [];
    //     for (const routeID of updatedSelectedConsignments) {
    //         const route = await fetchRouteData(routeID);
    //         routes.push(route);
    //     }
    //     setSelectedRoutes(routes);
    //     console.log("selectedRoutes1:",routes)

    //     // Check if any selected consignment is started
    //     const shouldConnect = updatedSelectedConsignments.some(id => {
    //         const selectedConsignment = consignments.find(c => c.routeID === id);
    //         return selectedConsignment && selectedConsignment.status === 'started';
    //     });
    //     setShouldConnectWebSocket(shouldConnect);
    // };
    const handleConsignmentSelection = async (consignment) => {
      console.log("Selected consignment:", consignment);
      const isSelected = selectedConsignments.includes(consignment.routeID);
      let updatedSelectedConsignments;
    
      if (isSelected) {
        updatedSelectedConsignments = selectedConsignments.filter(id => id !== consignment.routeID);
      } else {
        if (selectedConsignments.length >= 3) {
          // alert('You can select up to 3 consignments.');
          return;
        }
        updatedSelectedConsignments = [...selectedConsignments, consignment.routeID];
      }
    
      setSelectedConsignments(updatedSelectedConsignments);
    
      const routes = [];
      for (const routeID of updatedSelectedConsignments) {
        const route = await fetchRouteData(routeID);
        routes.push(route);
    
        //Fetch tracked route history per selected consignment
        const filters = {
          routeID:route.routeID,
          // origin: route.origin,
          // destination: route.destination,
          // stops: route.stops || [],
        };
       
        const trackedHistory = await fetchTrackedRouteHistory(filters);

        if (trackedHistory?.routes?.length > 0) {
          const coordsStr = trackedHistory.routes[0].route_coordinates;
          console.log("coordsStr:",coordsStr)
          try {
            route.actual_coordinates=coordsStr
          } catch (error) {
            console.error("Failed to parse actual coordinates:", error);
            route.actual_coordinates = [];
          }
        } else {
          route.actual_coordinates = [];
        }
        
        
      }
    
      setSelectedRoutes(routes);
      console.log("setselectedRoutes:", routes);
    
      const shouldConnect = updatedSelectedConsignments.some(id => {
        const selectedConsignment = consignments.find(c => c.routeID === id);
        return selectedConsignment && selectedConsignment.status === 'started';
      });
      setShouldConnectWebSocket(shouldConnect);
    };
    
   

    const filteredConsignments = consignments.filter((consignment) =>
        `${consignment.origin} ➜ ${consignment.destination}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );
  
     // Filter consignments based on selected tab
     const filteredByStatus = filter === "All"
     ? filteredConsignments
     : filteredConsignments.filter(consignment => {
         if (filter === "Completed") return consignment.status === "completed";
         if (filter === "Started") return consignment.status === "started";
         if (filter === "Not Started") return consignment.status !== "started" && consignment.status !== "completed";
         return true;
     });
     const fetchTrackedRouteHistory = async (filters) => {
      const token = localStorage.getItem('token');
      console.log("Sending filters to trackedRouteHistory API:", filters);

      try {
        const res = await axios.post(`${config.API_BASE_URL}/routeHistory/trackedRouteHistory`, filters,{ 
           headers: {
          'Authorization': `Bearer ${token}` // Include the token in the Authorization header
      }});
      console.log("Response from trackedRouteHistory API:", res);

        if (res.data.routes.length) {
          console.log("Fetched tracked routes:", res.data.routes);
          setTrackedRoutes(res.data.routes);
          return res.data; 
        } else {
          // alert("No tracked route history found.");
          return { routes: [] }; 
        }
      } catch (err) {
        console.error("Error fetching tracked route history", err);
        return { routes: [] }; 
      }
    };
    

   
    
    return (
      <Box id="main-box"
      sx={{
        bgcolor: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      >
        <NavBar  />
        <Breadcrumbs1 />

     

        <Grid id="main-grid"
          container
          spacing={2}
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            height: "80vh", // Adjust based on navbar height
            border: "1px solid #ccc",
    borderRadius: "2px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",overflow:"hidden",margin:"1px 0px 5px 0px!important",width:"100%!important",
 
          }}
        >
           
          {/* Left Column: Consignments and Route Details */}
          <Grid id="grid"
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
            <Paper id="paper"
              elevation={3}
              sx={{
                flex: 1, // Makes it fill available space
                display: "flex",
                flexDirection: "column",
                gap: 2,   padding:2,
                // overflowY: "auto", // Enables scrolling if content overflows
              }}
            >
              {/* Search Field */}
              <TextField  id="search"
                label="Search Consignments"
                variant="outlined"
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{marginTop: 1}}
               
              />
              <Tabs id="tabs"
                            value={filter}
                            
                size="small"
                            sx={{
                              '& .MuiTabs-indicator': {
                                display: 'none', // Hide the default indicator
                              },
                              // mb: 2,
                            }}
                            onChange={(e, newValue) => setFilter(newValue)}
                        >
                            <Tab  id="tab_all"
                            label=
                              
                              
                              {`All (${consignments.length})`} 
                              
                                 
                             value="All" 
                             sx={{backgroundColor:"rgba(255, 255, 255, 0.2) !important", border:"none!important",
                               "&.MuiButtonBase-root": { 
                              minHeight: "30px !important",fontSize:"10px",ppadding:"8px 0px!important"
                            },
                            "&.MuiButtonBase-root.Mui-selected": { // Increase specificity
                              backgroundColor:  "rgba(255, 255, 255, 0.2) !important", 
                              color: "#666666 !important",backdropFilter: "blur(8px)",borderBottom:"2px solid #666666!important"
                          },
                          }}
                             /> 
                           

                            <Tab id="tab_started"
                            label={ 
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  backgroundColor: "orange", // Started dot
                                  marginRight: 1,
                                }}
                              />
                              {`Started (${consignments.filter((c) => c.status === "started").length})`}
                              </Box>
  }
                            value="Started" 
                               sx={{ backgroundColor:"rgba(255, 255, 255, 0.2) !important", border:"none!important",  
                                 "&.MuiButtonBase-root.Mui-selected": { // Increase specificity
                                backgroundColor:  "rgba(255, 255, 255, 0.2) !important", 
                                color: "orange !important",borderBottom:"2px solid rgb(253, 230, 211)!important"
                            },
                            
                                 "&.MuiButtonBase-root": { 
                                minHeight: "30px !important",fontSize:"10px",padding:"8px 0px!important",border:"1px solid #beb7b7c9"
                              },}}/>
                            <Tab  id="tab-notstarted"
                            label={
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    backgroundColor: "red", // Not Started dot
                                    marginRight: 1,
                                  }}
                                />
                              {`Not Started (${consignments.filter((c) => c.status !== "started" && c.status !== "completed").length})`}
                              </Box>
                               }
                               value="Not Started" 
                             sx={{backgroundColor:"rgba(255, 255, 255, 0.2) !important", border:"none!important",
                              "&.MuiButtonBase-root.Mui-selected": { // Increase specificity
                              backgroundColor:  "rgba(255, 255, 255, 0.2) !important", 
                                  color: "red !important",borderBottom:"2px solid rgb(253, 211, 218)!important"
                              },
                                                "&.MuiButtonBase-root": { 
                              minHeight: "30px !important",fontSize:"10px",padding:"8px 0px!important",border:"1px solid #beb7b7c9"
                            },}} />
                             <Tab  id="tab_complted"
                             label={
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CheckCircleIcon sx={{ color: "green", fontSize: 13, marginRight: 1, fontWeight: "bold" }} />
                              {`Completed (${consignments.filter((c) => c.status === "completed").length})`}
                            </Box>
                          }
                              value="Completed" 
                             sx={{backgroundColor:"rgba(255, 255, 255, 0.2) !important", border:"none!important",  
                               "&.MuiButtonBase-root.Mui-selected": { // Increase specificity
                              backgroundColor:  "rgba(255, 255, 255, 0.2) !important", // Blue
                              color: "green  !important",borderBottom:"2px solid rgb(211, 253, 218)!important"
                          },
                               "&.MuiButtonBase-root": { 
                              minHeight: "30px !important",fontSize:"10px",padding:"8px 0px!important"
                            },}} />
                        </Tabs>

              {/* Consignments List */}
              <Box sx={{ flex: "0 0 auto" }} id="box2">
                <Typography variant="h6" gutterBottom id="box2-name">
                  Consignments
                </Typography>
                <List sx={{ maxHeight: "400px", overflowY: "auto" }}>
                  {filteredByStatus.map((consignment) => (
                    <ListItem id="consignments_list"
                      key={consignment.routeID}
                      button="true"
                      onClick={() => handleConsignmentSelection(consignment)}
                      sx={{ border: "1px solid #ddd", mb: 1, borderRadius: 1 }}
                    >
                      <Checkbox id="consignments-checkbox"
                        checked={selectedConsignments.includes(
                          consignment.routeID
                        )}
                        onChange={() => handleConsignmentSelection(consignment)}
                      />
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {/* Dot based on status */}
                            {consignment.status === "completed" ? (
                            <CheckCircleIcon sx={{ color: "green", fontSize: 13, marginRight: 2 }} />
                          ) : (
                            <Box id="consignment-status"
                              sx={{
                                width: 10,
                                height: 10,
                                flexShrink: 0,
                                borderRadius: "50%",
                                backgroundColor:
                                  consignment.status === "started"
                                    ? "orange"
                                    : "red",
                                marginRight: 2,
                              }}
                            />
                          )}
                            <Typography id="consignment-path"
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
                            <Typography id="consignment-drivername" variant="body2" sx={{ fontSize: "10px" }}>
    Driver Name:{" "}
    <span style={{ color: consignment.driverName !== "Not Assigned" ? "green" : "red" }}>
        {consignment.driverName}
    </span>
</Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "10px" }}
                            >
                              Predicted CO₂ Emission:{" "}
                              {consignment.carbon_emission || "N/A"} lbs
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
          <Grid id="grid2"
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
            <Box id="box_mapcontainer" sx={{ flex:1, borderRadius: 2 }}>
              <MapContainer id="mapcontainer" 
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
                  
                  <MapView id="mapview"
                    key={index}
                    coordinates={route.route_coordinates}
                    routeWaypoints={route.route_waypoints || []}
                    route={route}
                    vehiclePositions={vehiclePositions}  // Pass the object with positions
                    multipleRoutes={selectedRoutes.length > 1}
                  />
                ))}
          {geoFences.length > 0 &&
  geoFences.map((fence, index) => {
    // Check if route_waypoints exist before looping
    if (!fence.route_waypoints || fence.route_waypoints.length === 0) {
      console.warn("No waypoints found for fence:", fence);
      return null; // Skip rendering this fence if no waypoints exist
    }

    return fence.route_waypoints.map((stop, stopIndex) => {
      if (stop.coordinates && stop.coordinates.length === 2) {
        return (
          <Circle
            key={`${index}-${stopIndex}`}
            center={[stop.coordinates[1], stop.coordinates[0]]} // Ensure [lat, long]
            radius={500} // Adjust the radius as needed
            pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.3 }}
          />
        );
      } else {
        console.warn(`Invalid stop coordinates at index ${stopIndex}:`, stop);
        return null; // Skip invalid stops
      }
    });
  })}


              </MapContainer>
              {/* <div>
  <h3>GeoFences Data</h3>
  {geoFences.length === 0 ? <p>No Geofences Found</p> : (
    <ul>
      {geoFences.map((fence, index) => (
        <li key={index}>
          <strong>ID:</strong> {fence.geofence_id} | 
          <strong> Coordinates:</strong> {JSON.stringify(fence.geofence_coordinates)}
        </li>
      ))}
    </ul>
  )}
</div> */}

            </Box>
          </Grid>
        </Grid>
      </Box>
    );
};

export default RouteTracking;