import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
    Box, Stack, Card, FormControl, InputLabel, Select, MenuItem,
    Button, Typography, TextField, Grid, Container, styled,
    Grid2
} from '@mui/material';
import Select1 from 'react-select';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap } from "react-leaflet";
import NavBar from "../../Components/NavBar";
import redIconImage from '../../Assets/images/red.png'; // Import the red icon image
import greenIconImage from '../../Assets/images/green.png';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import blueicon from '../../Assets/images/blue.png';
import { CircularProgress } from '@mui/material';



const SuggestRoutes = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [countries, setCountries] = useState([]);
    const [origins, setOrigins] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [stops, setStops] = useState([]);
    const [selectedStops, setSelectedStops] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedOrigin, setSelectedOrigin] = useState("");
    const [selectedDestination, setSelectedDestination] = useState("");
    const [duration, setDuration] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [riskFactors, setRiskFactors] = useState({});
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [preloadedDemand, setPreloadedDemand] = useState(0);
    const [suggestedRoutes, setSuggestedRoutes] = useState([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0); // Track the selected route    
    const [routeIDS, setRouteIDS] = useState(null); // Store route details from API
    const [mapInstance, setMapInstance] = useState(null); // Store the map instance
    const mapRef = useRef(null);
    const [mapInitialized, setMapInitialized] = useState(false); // Track map initialization
    const [isLoading, setIsLoading] = useState(false); // Add this line

    const navigate = useNavigate();

    const lightblue = '#318CE7'; // Define your lightblue color

    const StyledTextField = styled(TextField)(({ theme }) => ({
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: lightblue,
                borderWidth: '1px',
            },
            '&:hover fieldset': {
                borderColor: lightblue,
                borderWidth: '1px',
            },
            '&.Mui-focused fieldset': {
                borderColor: lightblue,
                borderWidth: '1px',
            },
        },
        '& > .MuiInputLabel-root': {  // > selects direct child
            color: 'black', // Or your preferred black color
        },
        '& .MuiInputLabel-shrink': { // style for shrink label
            color: 'black'
        }
    }));


    // Style the FormControl (including the InputLabel and Select)
    const StyledFormControl = styled(FormControl)(({ theme }) => ({
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: lightblue,
                borderWidth: '1px',
            },
            '&:hover fieldset': {
                borderColor: lightblue,
                borderWidth: '1px',
            },
            '&.Mui-focused fieldset': {
                borderColor: lightblue,
                borderWidth: '1px',
            },
        },
        '& .MuiSelect-root': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: lightblue,
                borderWidth: '1px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: lightblue,
                borderWidth: '1px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: lightblue,
                borderWidth: '1px',
            },
        },
        // This is the key change: target the label directly inside the FormControl
        '& > .MuiInputLabel-root': {  // > selects direct child
            color: 'black', // Or your preferred black color
        },
        '& .MuiInputLabel-shrink': { // style for shrink label
            color: 'black'
        }
    }));



    const handleMapRef = useCallback((node) => {
        if (mapRef.current) {
            // Map already exists, just update the ref. Do not create a new map.
            mapRef.current = node;
            return; // Important: Exit early to prevent creating a new map
        }

        mapRef.current = node; // Set the ref

        if (node && !mapInstance && selectedOrigin && selectedDestination) {
            const originCoords = selectedOrigin.split(",").map(Number);
            const destinationCoords = selectedDestination.split(",").map(Number);

            let initialCenter = [51.505, -0.09];

            if (originCoords.length === 2 && !isNaN(originCoords[0]) && !isNaN(originCoords[1]) &&
                destinationCoords.length === 2 && !isNaN(destinationCoords[0]) && !isNaN(destinationCoords[1])) {
                initialCenter = [(originCoords[0] + destinationCoords[0]) / 2, (originCoords[1] + destinationCoords[1]) / 2];
            } else {
                console.warn("Invalid origin or destination coordinates. Using default center.");
            }

            const map = L.map(node, { // Now 'node' is guaranteed to be the correct map div
                center: initialCenter,
                zoom: 7,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            setMapInstance(map);
            setMapInitialized(true);

        } else if (!node && mapInstance) { // Handle unmounting
            mapInstance.remove(); // Remove the map instance
            setMapInstance(null);  // Clear the map instance
            setMapInitialized(false);
            mapRef.current = null; // Clear the ref
        }
    }, [selectedOrigin, selectedDestination, mapInstance]); // Correct dependencies
    const coordinates = useMemo(() => {
        return routeIDS?.routes?.[0]?.route_coordinates?.length > 0 // Access route_coordinates
            ? routeIDS.routes[0].route_coordinates.map((coord) => [coord[1], coord[0]]) // Correct order
            : [];
    }, [routeIDS]);

    // const redSVG = `<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><ellipse cx="64" cy="94.379" rx="54.5" ry="13.333" style="fill:#feded6"/><ellipse cx="64" cy="94.379" rx="33.613" ry="7.176" style="fill:#f6c6bb"/><path d="M64 20.288a29.333 29.333 0 0 0-29.333 29.333C34.667 71.288 64 95.871 64 95.871s29.333-23.917 29.333-46.25A29.333 29.333 0 0 0 64 20.288zm0 42.289a12.956 12.956 0 1 1 12.956-12.956A12.956 12.956 0 0 1 64 62.577z" style="fill:#ec4d85"/><path d="M59.75 20.6a29.337 29.337 0 0 0-25.083 29.021c0 16.51 17.023 34.7 25.13 42.432 8.144-7.624 25.037-25.479 25.037-42.432A29.337 29.337 0 0 0 59.75 20.6zM64 62.577h-8.5a12.956 12.956 0 1 1 0-25.912H64a12.956 12.956 0 1 1 0 25.912z" style="fill:#fd748c"/></svg>`; // Your red SVG code


    const redIcon = new L.Icon({
        iconUrl: redIconImage, // Or your red icon URL
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
    });

    const greenIcon = new L.Icon({
        iconUrl: greenIconImage, // Or your green icon URL
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

    const origin = coordinates[0];
    const destination = coordinates[coordinates.length - 1];

    const bounds = coordinates.length > 0 ? L.latLngBounds(coordinates) : null;
    const mapCenter = coordinates.length > 0 ? coordinates[Math.floor(coordinates.length / 2)] : [51.505, -0.09];

    const CenterMap = ({ center }) => {
        const map = useMap();
        useEffect(() => {
            if (center) {
                map.setView(center, 5);
            }
        }, [center, map]);
        return null;
    };

    useEffect(() => {
        axios.get("http://localhost:8000/countries")
            .then((response) => setCountries(response.data.countries || []))
            .catch((error) => {
                console.error("Error fetching countries:", error);
                setCountries([]);
            });
    }, []);

    useEffect(() => {
        if (selectedCountry) {
            axios.post("http://localhost:8000/origins", { country: selectedCountry })
                .then((response) => setOrigins(response.data.origin || []))
                .catch((error) => {
                    console.error("Error fetching origins:", error);
                    setOrigins([]);
                });
        } else {
            setOrigins([]);
        }
    }, [selectedCountry]);

    useEffect(() => {
        if (selectedCountry && selectedOrigin) {
            axios.post("http://localhost:8000/destinations", { country: selectedCountry, origin: selectedOrigin })
                .then((response) => setDestinations(response.data.destination || []))
                .catch((error) => {
                    console.error("Error fetching destinations:", error);
                    setDestinations([]);
                });
        } else {
            setDestinations([]);
        }
    }, [selectedCountry, selectedOrigin]);

    useEffect(() => {
        if (selectedOrigin && selectedDestination && startDate && endDate) { // Add date checks
            getDuration();
            getAvailableVehicles();
        }
    }, [selectedOrigin, selectedDestination, startDate, endDate]); // Add startDate and endDate to the dependency array

    useEffect(() => {
        if (selectedOrigin && selectedDestination) {
            fetchStops(); // Ensure this is only triggered when origin and destination are selected
        }
    }, [selectedOrigin, selectedDestination]);

    const fetchStops = () => {
        axios.post("http://localhost:8000/stops", { origin: selectedOrigin, destination: selectedDestination })
            .then((response) => {
                setStops(response.data.stops || []);
            })
            .catch(error => {
                console.error("Error fetching stops:", error);
                setStops([]);
            });
    };

    const getDuration = () => {
        axios.post("http://localhost:8000/getDuration", {
            country: selectedCountry,
            origin: selectedOrigin,
            destination: selectedDestination,
            stops: selectedStops.map(stop => stop.value)
        })
            .then((response) => setDuration(response.data.duration))
            .catch((error) => {
                console.error("Error fetching duration:", error);
                setDuration(null);
            });
    };

    const getAvailableVehicles = () => {
        axios.post("http://localhost:8000/getAvailableVehicles", {
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
        })
            .then((response) => {
                console.log("Available Vehicles:", response.data.vehicles);  // Log the vehicles array
                setVehicles(response.data.vehicles || []);
            })
            .catch((error) => {
                console.error("Error fetching vehicles:", error);
                setVehicles([]);
            });
    };


    const getRiskFactors = () => {
        axios.post("http://localhost:8000/riskFactors", {
            origin: selectedOrigin,
            destination: selectedDestination
        })
            .then((response) => {
                setRiskFactors(response.data.riskFactors || {});
                console.log("Risk Factors:", response.data.riskFactors);  // Log the risk factors
            })
            .catch((error) => {
                console.error("Error fetching risk factors:", error);
                setRiskFactors({}); // Set to empty object on error
            });
    };

    const handleStopsChange = (selectedOptions) => {
        setSelectedStops(selectedOptions || []);
    };

    // const handleStopDemandChange = (index, field, value) => {
    //     setSelectedStops(prevStops => {
    //         const updatedStops = [...prevStops];
    //         updatedStops[index] = { ...updatedStops[index], [field]: Number(value) }; // Convert to number
    //         return updatedStops;
    //     });
    // };

    const inputRefs = useRef({}); // Use an object to store multiple refs

    const handleStopDemandChange = (index, field, value) => {
        setSelectedStops((prevStops) =>
            prevStops.map((stop, i) =>
                i === index ? { ...stop, [field]: value } : stop
            )
        );

        // Retain focus for the specific input field
        setTimeout(() => {
            if (inputRefs.current[`${index}-${field}`]) {
                inputRefs.current[`${index}-${field}`].focus();
            }
        }, 0);
    };

    const preloadedDemandRef = useRef(null);

    const handlePreloadedDemandChange = (e) => {
        setPreloadedDemand(e.target.value);

        // Preserve focus after state update
        setTimeout(() => {
            if (preloadedDemandRef.current) {
                preloadedDemandRef.current.focus();
            }
        }, 0);
    };




    const handleVehicleSelection = (event) => {
        const selectedVehicle = event.target.value;
        console.log("Selected Vehicle:", selectedVehicle);  // Log the selected vehicle
        setSelectedVehicle(selectedVehicle);  // Set selected vehicle
        getRiskFactors();
    };

    const drawRouteOnMap = (route) => {
        if (!mapInstance || !route || !route.route_coordinates || !route.route_waypoints) return;

        const coordinates = route.route_coordinates.map((coord) => {
            const lat = Number(coord[1]);
            const lng = Number(coord[0]);

            if (isNaN(lat) || isNaN(lng)) {
                console.error("Invalid coordinates:", coord);
                return null;
            }
            return [lat, lng];
        }).filter(coord => coord !== null);

        // Remove existing route layers before adding a new one
        mapInstance.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                mapInstance.removeLayer(layer);
            }
        });

        // Draw the route as a polyline
        L.polyline(coordinates, { color: "blue", weight: 3 }).addTo(mapInstance);

        // Add markers for each waypoint
        route.route_waypoints.forEach((waypoint) => {
            const lat = waypoint.coordinates[1];
            const lng = waypoint.coordinates[0];

            if (!isNaN(lat) && !isNaN(lng)) {
                L.marker([lat, lng], { icon: waypointIcon })
                    .addTo(mapInstance)
                    .bindPopup(waypoint.name || "Waypoint");
            } else {
                console.error("Invalid waypoint coordinates:", waypoint.coordinates);
            }
        });

        // Add markers for the origin and destination
        if (coordinates.length > 0) {
            L.marker([coordinates[0][0], coordinates[0][1]], { icon: redIcon })
                .addTo(mapInstance)
                .bindPopup(route.origin || "Origin");

            L.marker([coordinates[coordinates.length - 1][0], coordinates[coordinates.length - 1][1]], { icon: greenIcon })
                .addTo(mapInstance)
                .bindPopup(route.destination || "Destination");
        }

        // Fit the map bounds to the route
        const bounds = L.latLngBounds(coordinates);
        mapInstance.fitBounds(bounds);
    };



    const submitRouteSelection = () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to submit the route selection.");
            return;
        }

        if (!selectedVehicle) {
            alert("Please select a vehicle.");
            return;
        }

        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];

        // Passing risk factors without displaying in UI
        axios.post("http://localhost:8000/suggestRoutes", {
            accident: riskFactors.accident,
            delay: riskFactors.delay,
            reroute: riskFactors.reroute,
            srm: riskFactors.srm,
            stop_demands: selectedStops.map(stop => ({
                name: stop.value,
                drop_demand: Number(stop.drop_demand), // Ensure it's a number
                pickup_demand: Number(stop.pickup_demand), // Ensure it's a number
                priority: Number(stop.priority) // Ensure it's a number
            })),
            country: selectedCountry,
            origin: selectedOrigin,
            destination: selectedDestination,
            preloaded_demand: Number(preloadedDemand), // Ensure it's a number
            vehicle_type: selectedVehicle.VehicleType,
            vehicle_id: selectedVehicle.VehicleID,
            fuel_type: selectedVehicle.FuelType,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            vehicle_capacity: Number(selectedVehicle.Quantity) // Ensure it's a number
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                console.log("Response from suggestRoutes API:", response.data);
                setSuggestedRoutes(response.data.routes); // Store all routes
                setSelectedRouteIndex(0); // Set the first route as default

                if (mapInstance && response.data.routes && response.data.routes.length > 0) {
                    drawRouteOnMap(response.data.routes[0]); // Draw the first route
                }
            })
            .catch(error => {
                console.error("Error fetching suggested routes:", error);
                alert("Error suggesting routes. Please check the console for details.");
            }).finally(() => {
                setIsLoading(false); // Hide overlay when the API call is complete
            });
    };

    const saveRoute = async (routeID) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to save a route.");
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/selectRoute",
                { routeID },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Response from saveRoute API:", response.data);

            if (response.data.detail === "Successfully selected route.") {
                alert("Route saved successfully!");

                // Reset the form:
                setSelectedCountry("");
                setSelectedOrigin("");
                setSelectedDestination("");
                setSelectedStops([]);
                setPreloadedDemand(0);
                setStartDate(null);
                setEndDate(null);
                setSelectedVehicle(null);
                setSuggestedRoutes([]); // Clear suggested routes
                setRouteIDS(null) //clear routeIDS
                if (mapInstance) {
                    mapInstance.eachLayer((layer) => {
                        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                            mapInstance.removeLayer(layer);
                        }
                    });
                    const initialCenter = [51.505, -0.09];
                    mapInstance.setView(initialCenter, 7);
                }
                // Redirect to Route Tracking page:
                navigate('/route-tracking'); // Replace '/route-tracking' with your actual route path
            } else {
                alert("Failed to save the route. Please try again.");
            }
        } catch (error) {
            console.error("Error saving route:", error);
            alert("An error occurred while saving the route. Please check the console for details.");
        }
    };


    return (
        <div>

            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: isLoading ? 'flex' : 'none',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                }}
            >
                <CircularProgress sx={{ color: 'white' }} /> {/* Spinner */}
                <Typography variant="h6" sx={{ color: 'white', ml: 2 }}>
                    Loading...
                </Typography>
            </Box>
            <NavBar />
            {/* <Container fluid className="mt-5 px-5 " > */}
            <Box sx={{ bgcolor: '#f4f6f8', minHeight: '86vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}> {/* Added flex and overflow hidden */}

                <Stack direction="row" spacing={3}>
                    <Box sx={{ flex: '0 0 35%', /* Takes 35% of the width */ height: '100%', overflowY: 'auto' }}> {/* Increased flex, added height, overflow for scrolling */}
                        <Card
                            className="p-4 shadow-lg rounded-xl bg-gradient-to-r from-blue-50 via-blue-100 to-white"
                            style={{
                                height: "calc(86vh - 48px)", // Adjust height to account for app bar/header if any
                                borderRadius: "16px",
                                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                                padding: '24px',// Added padding for better spacing
                                overflowY: 'auto',
                            }}
                        >
                            <Grid2 container spacing={2} sx={{ paddingTop: '1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'nowrap' }}>
                                <Grid2 item xs={4} sx={{ minWidth: '30%' }}>
                                    <StyledFormControl fullWidth margin="dense">
                                        <InputLabel>Country</InputLabel>
                                        <Select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} label="Country">
                                            {countries.map((country, index) => (
                                                <MenuItem key={index} value={country}>{country}</MenuItem>
                                            ))}
                                        </Select>
                                    </StyledFormControl>
                                </Grid2>
                                <Grid2 item xs={4} sx={{ minWidth: '30%' }}>
                                    <StyledFormControl fullWidth margin="dense">
                                        <InputLabel>Origin</InputLabel>
                                        <Select value={selectedOrigin} onChange={(e) => setSelectedOrigin(e.target.value)} label="Origin">
                                            {origins.map((origin, index) => (
                                                <MenuItem key={index} value={origin}>{origin}</MenuItem>
                                            ))}
                                        </Select>
                                    </StyledFormControl>
                                </Grid2>
                                <Grid2 item xs={4} sx={{ minWidth: '30%' }}>
                                    <StyledFormControl fullWidth margin="dense">
                                        <InputLabel>Destination</InputLabel>
                                        <Select value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)} label="Destination">
                                            {destinations.map((destination, index) => (
                                                <MenuItem key={index} value={destination}>{destination}</MenuItem>
                                            ))}
                                        </Select>
                                    </StyledFormControl>
                                </Grid2>
                            </Grid2>


                            {/* Stops Selection */}
                            <StyledFormControl fullWidth className="mb-3 mt-4" sx={{ padding: '0 1rem', marginBottom: '1rem' }}>
                                <Typography className="text-md font-semibold mb-1" style={{ color: 'black' }}>Select Stops</Typography>
                                <Select1
                                    options={stops.map((stop) => ({
                                        value: stop,
                                        label: stop,
                                        drop_demand: 0,
                                        pickup_demand: 0,
                                        priority: 1,
                                    }))}
                                    onChange={handleStopsChange}
                                    isMulti
                                    placeholder="Select Stops"
                                    value={selectedStops}
                                    className="shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            width: '80%',
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            zIndex: 9999, // Ensure the dropdown appears above all content
                                            position: 'absolute', // Prevent overlapping issues
                                        }),
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999, // Add high z-index for the portal if needed
                                        }),
                                    }}
                                    menuPortalTarget={document.body} // Render the dropdown outside the parent container
                                />
                            </StyledFormControl>


                            {selectedStops.map((stop, index) => (
                                <Box key={stop.id} sx={{ mb: 2, width: '70%', padding: '0 1rem', marginBottom: '1rem' }}>
                                    <Typography style={{ color: 'black' }}>{stop.label}</Typography>
                                    <StyledTextField
                                        inputRef={(el) => (inputRefs.current[`${index}-drop_demand`] = el)}
                                        label="Drop Demand"
                                        type="number"
                                        value={stop.drop_demand}
                                        onChange={(e) => handleStopDemandChange(index, 'drop_demand', e.target.value)}
                                        size="small"
                                        fullWidth
                                        margin="dense"
                                        sx={{ height: '40px' }} // Fixed height for consistent input box sizes
                                    />
                                    <StyledTextField
                                        inputRef={(el) => (inputRefs.current[`${index}-pickup_demand`] = el)}
                                        label="Pickup Demand"
                                        type="number"
                                        value={stop.pickup_demand}
                                        onChange={(e) => handleStopDemandChange(index, 'pickup_demand', e.target.value)}
                                        size="small"
                                        fullWidth
                                        margin="dense"
                                        sx={{ height: '40px' }}
                                    />
                                    <StyledTextField
                                        inputRef={(el) => (inputRefs.current[`${index}-priority`] = el)}
                                        label="Priority"
                                        type="number"
                                        value={stop.priority}
                                        onChange={(e) => handleStopDemandChange(index, 'priority', e.target.value)}
                                        size="small"
                                        fullWidth
                                        margin="dense"
                                        sx={{ height: '40px' }}
                                    />
                                </Box>
                            ))}

                            <StyledTextField
                                inputRef={preloadedDemandRef}
                                label="Preloaded Demand"
                                type="number"
                                value={preloadedDemand}
                                onChange={handlePreloadedDemandChange}
                                fullWidth
                                size="small"
                                margin="dense"
                                className="mb-3"
                                sx={{ width: '80%', marginTop: '16px', padding: '0 1rem', marginBottom: '1rem' }}
                            />


                            <div style={{ width: "80%", display: "flex", gap: "2.5rem", marginBottom: '1rem' }}> {/* Added gap between date pickers */}
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Start Date"
                                    customInput={
                                        <StyledTextField
                                            label="Start Date"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton>
                                                            <CalendarTodayIcon fontSize="small" />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                borderRadius: '8px',
                                                '& .MuiInputLabel-root': { // Target the label
                                                    paddingLeft: '1rem', // Add left padding
                                                }, padding: '0 1rem'
                                            }}
                                        />
                                    }
                                />

                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="End Date"
                                    customInput={
                                        <StyledTextField
                                            label="End Date"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton>
                                                            <CalendarTodayIcon fontSize="small" />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                borderRadius: '8px',
                                                '& .MuiInputLabel-root': { // Target the label
                                                    paddingLeft: '1rem', // Add left padding
                                                }, padding: '0 1rem'
                                            }}
                                        />
                                    }
                                />
                            </div>

                            {/* Estimated Duration */}
                            <Typography className="mb-2" style={{ color: 'black' }} sx={{ padding: '0 1rem', marginBottom: '1rem' }}>Estimated Duration: {duration} Hours</Typography>

                            {/* Vehicle Selection */}
                            <StyledFormControl fullWidth margin="dense" className="mb-3" sx={{ width: '80%', padding: '0 1rem', marginBottom: '1rem' }}>
                                <InputLabel sx={{ padding: '0 1.2rem' }}>Available Vehicles</InputLabel>
                                <Select
                                    value={selectedVehicle}
                                    onChange={handleVehicleSelection}
                                    label="Available Vehicles"
                                    sx={{
                                        height: '40px', // Adjust the height
                                        padding: '0.5rem', // Adjust padding if needed
                                    }}
                                >
                                    {vehicles.map((vehicle, index) => (
                                        <MenuItem key={index} value={vehicle}>{vehicle.VehicleType} → <strong>{vehicle.FuelType}</strong>  →  {vehicle.Quantity}</MenuItem>
                                    ))}
                                </Select>
                            </StyledFormControl>


                            {/* Submit Button */}
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={submitRouteSelection}
                                sx={{
                                    mt: 2,
                                    width: '50%',
                                    mx: 'auto',
                                    display: 'block',
                                    backgroundColor: 'primary.light', // Use theme's light primary color
                                    color: 'white', // Text color (adjust as needed)
                                    '&:hover': {
                                        backgroundColor: 'primary.main', // Use theme's main primary color on hover
                                    },
                                }}
                            >
                                Submit
                            </Button>
                        </Card>
                    </Box>



                    {/* Map and Routes Side Panel */}
                    <Box sx={{ flex: '0 0 65%', height: '100%' }}> {/* Takes 65% of the width, added height */}
                        <Card
                            className="p-4 shadow-lg rounded-xl"
                            style={{
                                height: "calc(86vh - 48px)", // Adjust height to account for app bar/header if any
                                paddingTop: "25px",
                                borderRadius: "16px",
                                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                                paddingRight: "24px"
                            }}
                        >
                            {/* Side Panel for Routes */}
                            <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>

                                {/* Map */}
                                <Box sx={{ flex: 1 }}>
                                    <div ref={handleMapRef} style={{ height: "100%", width: "100%" }}></div>
                                    {!mapInitialized && <Typography variant="body1">Loading Map...</Typography>}
                                </Box>

                                {suggestedRoutes?.length > 0 && (
                                    <Box sx={{ width: '167px', overflowY: 'auto', borderRight: '1px solid #e0e0e0', padding: '10px' }}>
                                        <Typography variant="h6" sx={{ mb: 2 }} style={{ color: 'black' }}>
                                            Suggested Routes
                                        </Typography>

                                        {/* Dropdown for selecting a route */}
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel id="route-select-label">Select Route</InputLabel>
                                            <Select
                                                labelId="route-select-label"
                                                value={selectedRouteIndex}
                                                onChange={(e) => {
                                                    setSelectedRouteIndex(e.target.value);
                                                    drawRouteOnMap(suggestedRoutes[e.target.value]);
                                                }}
                                                label="Select Route"
                                            >
                                                {suggestedRoutes.map((route, index) => (
                                                    <MenuItem key={index} value={index}>
                                                        {/* {route.origin} to {route.destination} */}
                                                        Route {index + 1}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Display the selected route card below the dropdown */}
                                        {selectedRouteIndex !== null && selectedRouteIndex >= 0 && selectedRouteIndex < suggestedRoutes.length && (
                                            <Card
                                                sx={{
                                                    mb: 2,
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    backgroundColor: '#f8f9fa', // Highlight the selected route card
                                                }}
                                            >
                                                <Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box>
                                                            <Typography variant="body1" color="black">Route {selectedRouteIndex + 1}</Typography>
                                                            <Typography variant="body2" color="black">
                                                                {suggestedRoutes[selectedRouteIndex].origin} to {suggestedRoutes[selectedRouteIndex].destination}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'block', margin: '10px auto 0' }}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                saveRoute(suggestedRoutes[selectedRouteIndex].routeID);
                                                            }}
                                                            sx={{
                                                                backgroundColor: '#318CE7',
                                                                color: 'white',
                                                                '&:hover': {
                                                                    // backgroundColor: '#e0e0e0',
                                                                },
                                                                width: '50%',
                                                                mx: 'auto',

                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        )}
                                    </Box>
                                )}

                            </Box>
                        </Card>
                    </Box>
                </Stack>
                {/* </Container> */}
            </Box>
        </div>

    );
};

export default SuggestRoutes;