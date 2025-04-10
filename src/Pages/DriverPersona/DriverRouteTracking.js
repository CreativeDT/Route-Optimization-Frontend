import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, Card, CardContent, Grid, List, Tab,Tabs,ListItem, ListItemText, Paper, Checkbox,TextField } from '@mui/material';
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
import Breadcrumbs2 from './Breadcrumbs2';
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
  const animationFrameRef = useRef(null);
  const previousPositionRef = useRef(null);
  const movementStartTimeRef = useRef(null);
  const movementDuration = 1500; // Duration for smooth movement in ms

  // Custom vehicle icons with different orientations
  const vehicleIcons = {
      default: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/2799/2799490.png',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20]
      }),
      moving: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/2799/2799490.png',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20]
      }),
      arrived: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/2799/2799490.png',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20]
      }),
      // Add more status-specific icons as needed
  };

  // Function to get rotated icon based on movement direction
  const getRotatedIcon = (fromPos, toPos) => {
      if (!fromPos || !toPos) return vehicleIcons.default;
      
      // Calculate angle between positions
      const angle = Math.atan2(toPos.lng - fromPos.lng, toPos.lat - fromPos.lat) * 180 / Math.PI;
      
      // Create rotated icon
      return L.divIcon({
          html: `<div style="transform: rotate(${angle}deg);">
                   <img src="https://cdn-icons-png.flaticon.com/512/2799/2799490.png" width="40" height="40" />
                 </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          className: 'rotated-vehicle-icon'
      });
  };

  // Smooth movement function
  const animateVehicleMovement = (fromPos, toPos, startTime) => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / movementDuration, 1);
      
      // Calculate intermediate position
      const currentLat = fromPos.lat + (toPos.lat - fromPos.lat) * progress;
      const currentLng = fromPos.lng + (toPos.lng - fromPos.lng) * progress;
      
      // Update marker position and rotation
      if (vehicleMarkerRef.current) {
          vehicleMarkerRef.current.setLatLng([currentLat, currentLng]);
          
          // Only update rotation if we have both positions
          if (fromPos && toPos) {
              const icon = getRotatedIcon(fromPos, toPos);
              vehicleMarkerRef.current.setIcon(icon);
          }
      }
      
      // Continue animation if not finished
      if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(() => 
              animateVehicleMovement(fromPos, toPos, startTime)
          );
      } else {
          previousPositionRef.current = toPos;
      }
  };

  useEffect(() => {
      if (coordinates.length > 0) {
          const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
          map.fitBounds(latLngs);
      }
  }, [coordinates, map]);

  const vehiclePosition = vehiclePositions[route.routeID];

  useEffect(() => {
      if (vehiclePosition && map && route.status === 'started') {
          // Cancel any ongoing animation
          if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
          }

          const newPos = {
              lat: vehiclePosition.lat,
              lng: vehiclePosition.lng
          };

          // Initialize marker if it doesn't exist
          if (!vehicleMarkerRef.current) {
              const icon = previousPositionRef.current 
                  ? getRotatedIcon(previousPositionRef.current, newPos)
                  : vehicleIcons.default;
              
              vehicleMarkerRef.current = L.marker([newPos.lat, newPos.lng], { icon }).addTo(map);
              previousPositionRef.current = newPos;
          } 
          // Animate movement if position changed
          else if (
              previousPositionRef.current && 
              (previousPositionRef.current.lat !== newPos.lat || 
               previousPositionRef.current.lng !== newPos.lng)
          ) {
              movementStartTimeRef.current = Date.now();
              animateVehicleMovement(previousPositionRef.current, newPos, movementStartTimeRef.current);
          }
          // Just update icon if position didn't change but status might have
          else {
              const icon = vehicleIcons[vehiclePosition.status] || vehicleIcons.default;
              vehicleMarkerRef.current.setIcon(icon);
          }
      }

      return () => {
          if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
          }
      };
  }, [vehiclePosition, map, route.status]);

  // Custom icons for markers
  const redIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
  });

  const greenIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
  });

  const waypointIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28]
  });

  const filteredWaypoints = routeWaypoints.slice(1, routeWaypoints.length - 1);

// Add some CSS for the enhanced UI
const styles = `
  .map-popup {
      min-width: 150px;
  }
  
  .map-popup h4 {
      margin: 0 0 5px 0;
      color: #3b82f6;
  }
  
  .route-tooltip {
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid #3b82f6;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }
  
  .route-tooltip-content {
      padding: 5px;
  }
  
  .route-tooltip-content h3 {
      margin: 0 0 10px 0;
      color: #1e3a8a;
      font-size: 14px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
  }
  
  .route-details {
      display: flex;
      gap: 15px;
      margin-bottom: 10px;
  }
  
  .vehicle-details h4 {
      margin: 10px 0 5px 0;
      color: #1e3a8a;
      font-size: 13px;
  }
  
  .rotated-vehicle-icon {
      background: transparent !important;
      border: none !important;
  }
`;
// Add styles to the document head
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);
  return (
      <>
          <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MarkerClusterGroup>
              {/* Start Point */}
              {coordinates.length > 0 && (
                  <Marker
                      key="start"
                      position={[coordinates[0][1], coordinates[0][0]]}
                      icon={redIcon}
                  >
                      <Popup>
                          <div className="map-popup">
                              <h4>Origin</h4>
                              <p>{route?.origin || "Starting Point"}</p>
                          </div>
                      </Popup>
                  </Marker>
              )}

              {/* End Point */}
              {coordinates.length > 1 && (
                  <Marker
                      key="end"
                      position={[coordinates[coordinates.length - 1][1], coordinates[coordinates.length - 1][0]]}
                      icon={greenIcon}
                  >
                      <Popup>
                          <div className="map-popup">
                              <h4>Destination</h4>
                              <p>{route?.destination || "End Point"}</p>
                          </div>
                      </Popup>
                  </Marker>
              )}

              {/* Waypoints */}
              {filteredWaypoints.map((waypoint, index) => (
                  <Marker 
                      key={`waypoint-${index}`} 
                      position={[waypoint.coordinates[1], waypoint.coordinates[0]]} 
                      icon={waypointIcon}
                  >
                      <Popup>
                          <div className="map-popup">
                              <h4>Waypoint {index + 1}</h4>
                              <p>{waypoint.name}</p>
                          </div>
                      </Popup>
                  </Marker>
              ))}
          </MarkerClusterGroup>

          {/* Route Polyline with enhanced tooltip */}
          <Polyline
              positions={coordinates.map(coord => [coord[1], coord[0]])}
              color="#3b82f6"
              weight={5}
              opacity={0.7}
              dashArray="5, 5"
              eventHandlers={{
                  mouseover: (e) => {
                      e.target.setStyle({
                          weight: 8,
                          color: "#1e3a8a",
                          opacity: 1,
                          dashArray: ""
                      });
                  },
                  mouseout: (e) => {
                      e.target.setStyle({
                          weight: 5,
                          color: "#3b82f6",
                          opacity: 0.7,
                          dashArray: "5, 5"
                      });
                  },
              }}
          >
              <Tooltip 
                  direction="top" 
                  offset={[0, -10]} 
                  opacity={1}
                  permanent={false}
                  className="route-tooltip"
              >
                  <div className="route-tooltip-content">
                      <h3>Route Information</h3>
                      <div className="route-details">
                          <div>
                              <strong>Origin:</strong> {route?.origin}<br />
                              <strong>Destination:</strong> {route?.destination}<br />
                          </div>
                          <div>
                              <strong>Distance:</strong> {route?.distance} km<br />
                              <strong>Duration:</strong> {route?.duration} hrs<br />
                          </div>
                      </div>
                      <div className="vehicle-details">
                          <h4>Vehicle Information</h4>
                          <div>
                              <strong>Type:</strong> {route?.vehicle_type || "N/A"}<br />
                              <strong>Fuel:</strong> {route?.fuel_type || "N/A"}<br />
                              <strong>CO₂:</strong> {route?.carbon_emission ? `${route.carbon_emission} kg` : "N/A"}
                          </div>
                      </div>
                  </div>
              </Tooltip>
          </Polyline>
      </>
  );
});




const RouteTracking = () => {
    const [consignments, setConsignments] = useState([]);
    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [selectedConsignments, setSelectedConsignments] = useState([]);
    const [shouldConnectWebSocket, setShouldConnectWebSocket] = useState(false);
     const [filter, setFilter] = useState("All"); // Added filter state
    const [geoFences, setGeoFences] = useState([]);
    // const { vehiclePosition } = UseWebSocket("ws://localhost:8000/ws"); // Get WebSocket Data
    const { vehiclePositions } = UseWebSocket(config.WEBSOCKET_URL, shouldConnectWebSocket);

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
          const createResponse = await axios.post(`${config.API_BASE_URL}/geofence/createGeofences`, {
            routeID: routeID, 
            // Add other required fields like geofence coordinates
          });
    
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

    const handleConsignmentSelection = async (consignment) => {
      console.log("Selected consignment:", consignment);
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
        console.log("selectedRoutes:",selectedRoutes)

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
  
    
 
     // Filter consignments based on selected tab
     const filteredByStatus = filter === "All"
     ? filteredConsignments
     : filteredConsignments.filter(consignment => {
         if (filter === "Completed") return consignment.status === "completed";
         if (filter === "Started") return consignment.status === "started";
         if (filter === "Not Started") return consignment.status !== "started" && consignment.status !== "completed";
         return true;
     });
 

   
    
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
        <Breadcrumbs2 />

     

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
           {/* <Tabs
            value={filter}
            onChange={(e, newValue) => setFilter(newValue)}
           
            >
            <Tab label={`All (${users.length})`} value="All"  className="tab"
              sx={{
                backgroundColor: filter === "All" ? "#388e3c" : "transparent", // Change the background color of active tab
                color: filter === "All" ? "white" : "#1976d2", // Change text color for active tab
                border:"1px solid #ddd",padding:"5px 15px",
                 
              }}
             />
              <Tab label={`Completed (${users.length})`} value="Completed"  className="tab"
              sx={{
                backgroundColor: filter === "Completed" ? "#388e3c" : "transparent", // Change the background color of active tab
                color: filter === "Completed" ? "white" : "#1976d2", // Change text color for active tab
                border:"1px solid #ddd",padding:"5px 15px",
                 
              }}
             />
            
            <Tab
              label={`Started (${
                users.filter((u) => u.role === "Started").length
              })`}
              className="tab"
              value="Started"
              sx={{
                backgroundColor: filter === "Started" ? "#388e3c" : "transparent", // Change the background color of active tab
                color: filter === "Started" ? "white" : "#1976d2", // Change text color for active tab
                border:"1px solid #ddd",padding:"5px 15px",
                 
              }}
            />
            <Tab
              label={`Not Started (${
                users.filter((u) => u.role === "Not Started").length
              })`}
              value="Not Started"
              className="tab"
              sx={{
                backgroundColor: filter === "Not Started" ? "#388e3c" : "transparent", // Change the background color of active tab
                color: filter === "Not Started" ? "white" : "#1976d2", // Change text color for active tab
                border:"1px solid #ddd",padding:"5px 15px",
                
              }}
            />
          </Tabs>  */}
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
               <Tabs
                            value={filter}
                            sx={{
                              '& .MuiTabs-indicator': {
                                display: 'none', // Hide the default indicator
                              },
                              mb: 2,
                            }}
                            onChange={(e, newValue) => setFilter(newValue)}
                        >
                            <Tab 
                            label=
                              
                              
                              {`All (${consignments.length})`} 
                              
                                 
                             value="All" 
                             sx={{backgroundColor:"rgba(255, 255, 255, 0.2) !important", border:"none!important",
                               "&.MuiButtonBase-root": { 
                              minHeight: "30px !important",fontSize:"10px",padding:"8px 13px"
                            },
                            "&.MuiButtonBase-root.Mui-selected": { // Increase specificity
                              backgroundColor:  "rgba(255, 255, 255, 0.2) !important", 
                              color: "#666666 !important",backdropFilter: "blur(8px)",borderBottom:"2px solid #666666!important"
                          },
                          }}
                             /> 
                           

                            <Tab
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
                                minHeight: "30px !important",fontSize:"10px",padding:"8px 13px",border:"1px solid #beb7b7c9"
                              },}}/>
                            <Tab 
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
                              minHeight: "30px !important",fontSize:"10px",padding:"8px 13px",border:"1px solid #beb7b7c9"
                            },}} />
                             <Tab 
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
                              minHeight: "30px !important",fontSize:"10px",padding:"8px 13px"
                            },}} />
                        </Tabs>

              {/* Consignments List */}
              <Box sx={{ flex: "0 0 auto", height: "440px" }}>
                <Typography variant="h6" gutterBottom>
                  Consignments
                </Typography>
                <List sx={{ maxHeight: "400px", overflowY: "auto" }}>
                {filteredByStatus.map((consignment) => (
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
                            {consignment.status === "completed" ? (
                            <CheckCircleIcon sx={{ color: "green", fontSize: 13, marginRight: 2 }} />
                          ) : (
                            <Box
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
                            <Typography variant="body2" sx={{ fontSize: "10px" }}>
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