import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Box,
  Stack,
  Card,
  FormControl,
  InputLabel,
  
  MenuItem,
  Button,
  Typography,
  TextField,
  styled,
  Grid2,
  Snackbar,
  Alert,
  Autocomplete,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,Radio, RadioGroup, FormControlLabel
} from "@mui/material";
import { Chip } from "@mui/material"; // Material-UI for styling
import { SearchBox } from "@mapbox/search-js-react";

import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
//import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap } from "react-leaflet";
import { useMap } from "react-leaflet";
import NavBar from "../../Components/NavBar";
import redIconImage from "../../Assets/images/red.png"; // Import the red icon image
import greenIconImage from "../../Assets/images/green.png";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import blueicon from "../../Assets/images/blue.png";
import { CircularProgress } from "@mui/material";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import config from "../../config";
//import { ExpandMore, Close } from "@mui/icons-material";
import debounce from "lodash.debounce";
import { v4 as uuidv4 } from "uuid";
import Select from "react-select";

import "../../App.css";
const SuggestRoutes = () => {
  // const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
  const [startDate, setStartDate] = useState(new Date()); // Set a default current date
  const [endDate, setEndDate] = useState(new Date()); // Set a default current date
  const [searchBoxValue, setSearchBoxValue] = useState('');
  const [countries, setCountries] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState(null); //  store origin name
  const [originCoords, setOriginCoords] = useState(null); // Store Origin coordinates
  const [selectedDestination, setSelectedDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState(null); // Store Destination coordinates
  const [duration, setDuration] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [riskFactors, setRiskFactors] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [preloadedDemand, setPreloadedDemand] = useState(2000);
  const [suggestedRoutes, setSuggestedRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null); // Track the selected route
  const [routeIDS, setRouteIDS] = useState(null); // Store route details from API
  const [mapInstance, setMapInstance] = useState(null); // Store the map instance
  const mapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false); // Track map initialization
  const [isLoading, setIsLoading] = useState(false); // Add this line
  const [errorFields, setErrorFields] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for the overall error message
  const[label,setLabel] =useState([]);
  const [stopsError, setStopsError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
    autoHideDuration: null,
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [errors, setErrors] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [predictEmission, setPredictEmission] = useState([]);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [message, setMessage] = useState("");
  const lightblue = "#318CE7"; // Define your lightblue color
  const [expectedDate, setExpectedDate] = useState(null);
  const [expectedEndDate, setExpectedEndDate] = useState(null);
  const [preload, setPreload] = useState("");
  const inputRef = useRef(null);
  const searchBoxRef = useRef(null);
  const StyledTextField = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: lightblue,
        borderWidth: "1px",
      },
      "&:hover fieldset": {
        borderColor: lightblue,
        borderWidth: "1px",
      },
      "&.Mui-focused fieldset": {
        borderColor: lightblue,
        borderWidth: "1px",
      },
    },
    "& > .MuiInputLabel-root": {
      // > selects direct child
      color: "black", // Or your preferred black color
    },
    "& .MuiInputLabel-shrink": {
      // style for shrink label
      color: "black",
    },
  }));

  // Style the FormControl (including the InputLabel and Select)
  const StyledFormControl = styled(FormControl)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: lightblue,
        borderWidth: "1px",
      },
      "&:hover fieldset": {
        borderColor: lightblue,
        borderWidth: "1px",
      },
      "&.Mui-focused fieldset": {
        borderColor: lightblue,
        borderWidth: "1px",
      },
    },
    "& .MuiSelect-root": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: lightblue,
        borderWidth: "1px",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: lightblue,
        borderWidth: "1px",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: lightblue,
        borderWidth: "1px",
      },
    },
    // This is the key change: target the label directly inside the FormControl
    "& > .MuiInputLabel-root": {
      // > selects direct child
      color: "black", // Or your preferred black color
    },
    "& .MuiInputLabel-shrink": {
      // style for shrink label
      color: "black",
    },
  }));

  // const handleMapRef = useCallback((node) => {
  //     if (mapRef.current) {
  //         mapRef.current = node; // Update ref
  //         return; // Prevent re-initialization
  //     }

  //     mapRef.current = node; // Set the ref

  //     if (node && !mapInstance) {
  //         let initialCenter = [39.8, -98.5]; // Default to London if no coordinates provided

  //         if (selectedOrigin && selectedDestination) {
  //             const originCoords = selectedOrigin.split(",").map(Number);
  //             const destinationCoords = selectedDestination.split(",").map(Number);

  //             if (
  //                 originCoords.length === 2 && !isNaN(originCoords[0]) && !isNaN(originCoords[1]) &&
  //                 destinationCoords.length === 2 && !isNaN(destinationCoords[0]) && !isNaN(destinationCoords[1])
  //             ) {
  //                 initialCenter = [
  //                     (originCoords[0] + destinationCoords[0]) / 2,
  //                     (originCoords[1] + destinationCoords[1]) / 2
  //                 ];
  //             } else {
  //                 console.warn("Invalid coordinates. Using default center.");
  //             }
  //         }

  //         const map = L.map(node, {
  //             center: initialCenter,
  //             zoom: 7,
  //         });

  //         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  //             //   {
  //             //     attribution: '&copy;
  //             // <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //             // }
  //         ).addTo(map);

  //         setMapInstance(map);
  //         setMapInitialized(true);
  //     } else if (!node && mapInstance) {
  //        mapInstance.remove();
  //         setMapInstance(null);
  //         setMapInitialized(false);
  //         mapRef.current = null;
  //     }
  // }, [selectedOrigin, selectedDestination, mapInstance]);
  const handleMapRef = useCallback(
    (node) => {
      if (node && !mapInstance) {
        let initialCenter = [39.8283, -98.5795]; // Geographic center of the US

        const map = L.map(node, {
          center: initialCenter,
          zoom: 4, // Adjust zoom as needed
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
          map
        );
        setMapInstance(map); // Set the mapInstance state here
        setMapInitialized(true); // Set mapInitialized to true here
      }
    },
    [mapInstance]
  );
  // useEffect(() => {
  //     console.log("mapInitialized:", mapInitialized); // Check mapInitialized value
  // }, [mapInitialized]);

  // Memoized coordinates to prevent unnecessary re-renders
  const coordinates = useMemo(() => {
    return routeIDS?.routes?.[0]?.route_coordinates?.length > 0
      ? routeIDS.routes[0].route_coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]) // Correct order
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
  const mapCenter =
    coordinates.length > 0
      ? coordinates[Math.floor(coordinates.length / 2)]
      : [39.8, -98.5];

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
    axios
      .get(`${config.API_BASE_URL}/countries`)
      .then((response) => setCountries(response.data.countries || []))
      .catch((error) => {
        console.error("Error fetching countries:", error);
        setCountries([]);
      });
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      axios
        .post(`${config.API_BASE_URL}/origins`, { country: selectedCountry })
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
      axios
        .post(`${config.API_BASE_URL}/destinations`, {
          country: selectedCountry,
          origin: selectedOrigin,
        })
        .then((response) => setDestinations(response.data.destination || []))
        .catch((error) => {
          console.error("Error fetching destinations:", error);
          setDestinations([]);
        });
    } else {
      setDestinations([]);
    }
  }, [selectedCountry, selectedOrigin]);

  // useEffect(() => {
  //     if (selectedOrigin && selectedDestination && selectedStops ) {
  //         getDuration();

  //     }
  // }, [selectedOrigin, selectedDestination, selectedStops]); // Add startDate and endDate to the dependency array

  //     useEffect(() => {
  //     if (selectedOrigin && selectedDestination && selectedStops && startDate && endDate) {

  //         getAvailableVehicles();
  //     }
  // }, [selectedOrigin, selectedDestination,selectedStops, startDate, endDate]); // Add startDate and endDate to the dependency array

  useEffect(() => {
    if (selectedOrigin && selectedDestination && selectedStops.length > 0&& startDate && endDate && preloadedDemand) {
      getDuration();
      getAvailableVehicles();
    }
  }, [selectedOrigin, selectedDestination, startDate, endDate,selectedStops,preloadedDemand]); // Add startDate and endDate to the dependency array
  

  // useEffect(() => {
  //     if (selectedOrigin && selectedDestination) {
  //         fetchStops(); // Ensure this is only triggered when origin and destination are selected
  //     }
  // }, [selectedOrigin, selectedDestination]);

  // const fetchStops = () => {
  //     axios.post(`${config.API_BASE_URL}/stops`, {
  //          origin: selectedOrigin,
  //          destination: selectedDestination
  //         })
  //         .then((response) => {
  //             setStops(response.data.stops || []);
  //         })
  //         .catch(error => {
  //             console.error("Error fetching stops:", error);
  //             setStops([]);
  //         });
  // };

  // const getDuration = () => {
  //     axios.post(`${config.API_BASE_URL}/v2/getDuration`, {
  //         // country: selectedCountry,
  //         origin: selectedOrigin,
  //         destination: selectedDestination,
  //         stops: selectedStops.map(stop => stop.value)
  //     })
  //     .then(response => {
  //         console.log(response.data); // Check if response includes the "duration"
  //         if (response.data && response.data.duration) {
  //           setDuration(response.data.duration); // Assuming you have a state to store the duration
  //         } else {
  //           console.log("Duration is missing in the response.");
  //         }
  //       })
  //       .catch(error => {
  //         console.error("Error fetching duration:", error);
  //       });

  // };
   // Fetch Duration on Origin, Destination, or Stops change
   useEffect(() => {
    if (selectedOrigin && selectedDestination) {
      getDuration();
    }
  }, [selectedOrigin, selectedDestination, selectedStops]); // Recalculate duration when stops are added/removed


  const getDuration = () => {
    if (
      !selectedOrigin?.coordinates ||
      selectedOrigin.coordinates.length !== 2 ||
      selectedOrigin.coordinates.includes(null)
    ) {
      console.error("Invalid Origin Coordinates:", selectedOrigin.coordinates);
      return;
    }

    if (
      !selectedDestination?.coordinates ||
      selectedDestination.coordinates.length !== 2 ||
      selectedDestination.coordinates.includes(null)
    ) {
      console.error(
        "Invalid Destination Coordinates:",
        selectedDestination.coordinates
      );
      return;
    }

    // axios
    //   .post(`${config.API_BASE_URL}/v2/getDuration`, {
    //     origin: {
    //       name: selectedOrigin.name,
    //       coordinates: selectedOrigin.coordinates,
    //     },
    //     destination: {
    //       name: selectedDestination.name,
    //       coordinates: selectedDestination.coordinates,
    //     },
    //     stops: selectedStops.map((stop) => ({
    //       name: stop.label || "Unnamed Stop",
    //       coordinates: stop.coordinates || [],
    //     })),
    //   })
    //   .then((response) => {
    //     console.log("Duration API Response:", response.data);
    //     if (response.data?.duration) {
    //       setDuration(response.data.duration);
    //     } else {
    //       console.warn("Duration is missing in the response:", response.data);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching duration:", error);
    //   });



    const fetchDuration = () => {
      // Prepare the request payload
     const requestData = {
      origin: {
        name: selectedOrigin.name,
        coordinates: selectedOrigin.coordinates,
      },
      destination: {
        name: selectedDestination.name,
        coordinates: selectedDestination.coordinates,
      },
      stops: selectedStops
        .filter((stop) => stop.coordinates && stop.coordinates.length === 2) // Ensure valid coordinates
        .map((stop) => ({
          name: stop.label || "Unnamed Stop",
          coordinates: stop.coordinates,
        })),
    };
    
     // Remove stops key if there are no stops to avoid unnecessary data
     if (requestData.stops.length === 0) {
      delete requestData.stops;
    }
      // Call the API
      axios
        .post(`${config.API_BASE_URL}/v2/getDuration`, requestData)
        .then((response) => {
          console.log("Duration API Response:", response.data);
    
          if (response.data?.duration) {
            setDuration(response.data.duration);
          } else {
            console.warn("Duration is missing in the response:", response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching duration:", error);
        });
    };
     //Call the function to actually fetch duration
  fetchDuration();
  };

  const validateStops = () => {
    const invalidStops = selectedStops.filter(
      (stop) => (!stop.drop_demand || stop.drop_demand === 0) &&
                (!stop.pickup_demand || stop.pickup_demand === 0)
    );
  
    if (invalidStops.length > 0) {
      setStopsError("Each selected stop must have at least one demand (Drop or Pickup).");
      return false; // Validation failed
    }
  
    setStopsError(""); // Clear error if validation passes
    return true; // Validation passed
  };
  

  // Function to get expected end date
  const getExpectedEndDate = async (startDate, duration) => {
    if (!startDate || !duration) return;

    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/getExpectedDate`,
        {
          start_date: startDate.toISOString().split("T")[0], // Convert to YYYY-MM-DD
          duration: duration,
        }
      );
      setExpectedEndDate(response.data.expectedDate);
    } catch (error) {
      console.error("Error fetching expected end date:", error);
    }
  };

  // Handle changes in the start date
  const handleStartDateChange = (date) => {
    setStartDate(date);
    setExpectedEndDate(null); // Reset expected end date when start date changes

    // Fetch expected end date if duration is already calculated
    if (duration) {
      getExpectedEndDate(date, duration);
    }
  };

  useEffect(() => {
    if (startDate && duration) {
      getExpectedEndDate(startDate, duration);
    }
  }, [startDate, duration]);

  // const getDuration = () => {
  //     const payload = {
  //         origin: selectedOrigin,
  //         destination: selectedDestination,
  //         stops: selectedStops
  //         .map(stop => stop.value || stop.label || stop.name || stop) // Ensure valid value
  //         .filter(stop => stop) // Remove null/undefined stops

  //     };

  //     console.log("Payload Sent to API:", JSON.stringify(payload, null, 2));

  //     axios.post(`${config.API_BASE_URL}/getDuration`, payload)
  //         .then((response) => {
  //             console.log("API Response:", response);
  //             setDuration(response.data.duration);
  //         })
  //         .catch((error) => {
  //             console.error("Error fetching duration:", error);
  //             setDuration(null);
  //         });
  // };
  // useEffect(() => {
  //     axios.post('http://localhost:8000/getDuration', { origin: 'Dallas', destination: 'Chicago' })
  //       .then(response => {
  //         console.log("API Response:", response.data);  // Log the full response
  //         setDuration(response.data.duration);
  //       })
  //       .catch(error => {
  //         console.error('Error fetching duration:', error);
  //       });
  //   }, []);

  const getAvailableVehicles = () => {
   
    axios
      .post(`${config.API_BASE_URL}/getAvailableVehicles`, {
        start_date: startDate.toISOString().split("T")[0],
        // end_date: endDate.toISOString().split("T")[0],
        preloaded_demand: preloadedDemand, // dynamic value
      })
      .then((response) => {
        console.log("Available Vehicles:", response.data.vehicles); // Log the vehicles array
        setVehicles(response.data.vehicles || []);
      })
      .catch((error) => {
        console.error("Error fetching vehicles:", error);
        setVehicles([]);
      });
  };
  useEffect(() => {
    
      getAvailableVehicles();
   
  }, []);

  const getRiskFactors = () => {
    axios
      .post(`${config.API_BASE_URL}/riskFactors`, {
        origin: selectedOrigin.name,
        destination: selectedDestination.name,
      })
      .then((response) => {
        setRiskFactors(response.data.riskFactors || {});
        console.log("Risk Factors:", response.data.riskFactors); // Log the risk factors
      })
      .catch((error) => {
        console.error("Error fetching risk factors:", error);
        setRiskFactors({}); // Set to empty object on error
      });
  };
  const getpredictedEmission = () => {
    axios
      .post(`${config.API_BASE_URL}/predictEmission`, {
        origin: selectedOrigin,
        destination: selectedDestination,
      })
      .then((response) => {
        setPredictEmission(response.data.predictEmission || {});
        console.log("predictEmission:", response.data.predictEmission); // Log the risk factors
      })
      .catch((error) => {
        console.error("Error fetching predictEmission:", error);
        setPredictEmission({}); // Set to empty object on error
      });
  };

  const handleStopsChange = (selectedOptions) => {
    setSelectedStops(selectedOptions || []);
  };

  // const handleRetrieveStops = (res) => {
  //     console.log("Full SearchBox Result:", res);

  //     if (res && res.features && res.features.length > 0) {
  //         const feature = res.features[0]; // Get the first feature
  //         console.log("First Feature:", JSON.stringify(feature, null, 2)); // Log detailed feature data

  //         // Attempt to extract the stop name
  //         const stop = feature.place_name || feature.text || feature.properties?.name || "Unknown Location";
  //         console.log("Extracted Stop Name:", stop);

  //         // Prevent duplicates and update state
  //         if (stop && !selectedStops.includes(stop)) {
  //             setSelectedStops((prev) => {
  //                 console.log("selectedStops:", selectedStops);
  //                 const updatedStops = [...prev, stop];
  //                 console.log("Updated Stops State:", updatedStops);
  //                 return updatedStops;
  //             });
  //         }
  //     } else {
  //         console.error("Invalid or empty response from SearchBox.");
  //     }
  // };

  const handleRetrieveStops = (res) => {
    console.log("Full SearchBox Result:", res);

    if (res && res.features && res.features.length > 0) {
      const feature = res.features[0]; // Get the first feature
      console.log("First Feature:", JSON.stringify(feature, null, 2)); // Log detailed feature data

      // Extract the stop name
      const stopName =
        feature.place_name ||
        feature.text ||
        feature.properties?.name ||
        "Unknown Location";

      // Extract coordinates (assuming it's in the format of [longitude, latitude])
      const coordinates = feature.geometry?.coordinates || [null, null]; // Default to [null, null] if no coordinates found

      // Add stop as an object with default properties
      if (stopName && !selectedStops.some((stop) => stop.label === stopName)) {
        setSelectedStops((prev) => [
          ...prev,
          {
            label: stopName,
            drop_demand: 0,
            pickup_demand: 0,
            priority: 0,
            coordinates: coordinates,
          },
        ]);
      }
    } else {
      console.error("Invalid or empty response from SearchBox.");
    }

    // Reset the SearchBox value
    setSearchValue("");
    console.log("setSearchValue:",searchValue)
  };

  // Handle the removal of a stop
  const handleRemoveStop = (stopToRemove) => {
    setSelectedStops((prevStops) =>
      prevStops.filter((stop) => stop.label !== stopToRemove.label)
    );
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
      const inputEl = inputRefs.current[`${index}-${field}`];
      if (inputEl && document.activeElement !== inputEl) {
        inputEl.focus();
      }
    }, 0);
  };

  const preloadedDemandRef = useRef(null);

//   const handlePreloadedDemandChange = (e) => {
//     const value = e.target.value ? Number(e.target.value) : 0; // Ensure number format
//     setPreloadedDemand(e.target.value);
//     handleVehicleSelection(value); // Update vehicles based on demand change
//     // Preserve focus after state update
// requestAnimationFrame(() => {
//       if (preloadedDemandRef.current) {
//         preloadedDemandRef.current.focus();
//       }
//     });
//   };


  const handlePreloadedDemandChange = (e) => {
    const value = e.target.value ? Number(e.target.value) : 0; // Ensure number format
    console.log("Preloaded Demand Value:", value); // Log the formatted value
    
    setPreloadedDemand(e.target.value); // Update the preloaded demand state
    console.log("Updated Preloaded Demand:", e.target.value); // Log the updated preloaded demand
    
    if(selectedOrigin && selectedDestination) {
      handleVehicleSelection(value);
      console.log("Vehicle selection triggered with preloaded demand:", value);
    } else {
      console.warn("Origin/Destination not selected. Skipping vehicle selection update.");
    }
    
  requestAnimationFrame(() => {
    if (preloadedDemandRef.current) {
      preloadedDemandRef.current.focus();
    }
  });
};


  // const handleVehicleSelection = (event) => {
  //   const selectedVehicle = vehicles.find(vehicle => vehicle.capacity === event.target.value);
  //   console.log("Selected Vehicle:", selectedVehicle);
  //   setSelectedVehicle(selectedVehicle);
  //   getRiskFactors();
  // };

  
  
  // Convert vehicles array to options for react-select
const vehicleOptions = vehicles.map(vehicle => ({
  value: vehicle.VehicleID,
  label: `${vehicle.VehicleType} → ${vehicle.FuelType} → ${vehicle.Quantity}`,
  vehicleData: vehicle // Store full vehicle data for reference
  
}));
console.log("vehicles:",vehicles);

// // Handle vehicle selection
// const handleVehicleSelection = (selectedOptionOrEvent) => {
//   let selectedVehicle;
  
//   // If it's a DOM event (from <select>), get the selected vehicle
//   if (selectedOptionOrEvent.target) {
//     selectedVehicle = vehicles.find(vehicle => vehicle.capacity === selectedOptionOrEvent.target.value);
//     console.log("Selected Vehicle:", selectedVehicle);
//   } 
//   // If it's the selectedOption from react-select
//   else {
//     selectedVehicle = selectedOptionOrEvent;
//   }

//   console.log("Selected Vehicle1:", selectedVehicle);
//   setSelectedVehicle(selectedVehicle);
//   setLabel((selectedVehicle.label).split("→").map(item => item.trim()));
//   console.log("Selected Vehicle2:", selectedVehicle);
//   getRiskFactors();
// };

const handleVehicleSelection = (selectedOptionOrEvent) => {
  let selectedVehicle;
  
  // ✅ Check if event comes from a select dropdown (DOM event)
  if (selectedOptionOrEvent.target) {
    selectedVehicle = vehicleOptions.find(
      vehicle => vehicle.value === selectedOptionOrEvent.target.value
    );
  } else {
    selectedVehicle = selectedOptionOrEvent; // ✅ Otherwise, it's a react-select option
  }

  if (!selectedVehicle) {
    console.error("Invalid vehicle selection:", selectedOptionOrEvent);
    return;
  }

  console.log("Selected Vehicle:", selectedVehicle);
  setSelectedVehicle(selectedVehicle);

  // ✅ Check if `label` exists before splitting
  if (selectedVehicle.label) {
    setLabel(selectedVehicle.label.split(" → ").map(item => item.trim()));
  } else {
    setLabel([]); // Reset label if no valid selection
  }

  getRiskFactors();
};

// Log the vehicleOptions to the console
console.log("Vehicle Options:", vehicleOptions);


  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.VehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.FuelType.toLowerCase().includes(searchTerm.toLowerCase())
  );


  
  useEffect(() => {
    if (mapInstance && selectedRouteIndex) {
      console.log("Drawing route:", selectedRouteIndex);
      drawRouteOnMap(selectedRouteIndex);
    } else if (mapInstance) {
      drawRouteOnMap(null); //clear the map if no route is selected
    }
  }, [mapInstance, selectedRouteIndex]);
  // const drawRouteOnMap = (route) => {
  //     if (!mapInstance )
  //     return;

  //     const coordinates = route.route_coordinates.map((coord) => {
  //         const lat = Number(coord[1]);
  //         const lng = Number(coord[0]);

  //         if (isNaN(lat) || isNaN(lng)) {
  //             console.error("Invalid coordinates:", coord);
  //             return null;
  //         }
  //         return [lat, lng];
  //     }).filter(coord => coord !== null);

  //     // Remove existing route layers before adding a new one
  //     mapInstance.eachLayer((layer) => {
  //         if (layer instanceof L.Marker || layer instanceof L.Polyline) {
  //             mapInstance.removeLayer(layer);
  //         }
  //     });
  //     if (!route || !route.route_coordinates || !route.route_waypoints) {
  //         console.log("Missing route data:", route);
  //         return;
  //     }

  //     // Draw the route as a polyline
  //     L.polyline(coordinates, { color: "blue", weight: 3 }).addTo(mapInstance);

  //     // Add markers for each waypoint
  //     route.route_waypoints.forEach((waypoint) => {
  //         const lat = waypoint.coordinates[1];
  //         const lng = waypoint.coordinates[0];

  //         if (!isNaN(lat) && !isNaN(lng)) {
  //             L.marker([lat, lng], { icon: waypointIcon })
  //                 .addTo(mapInstance)
  //                 .bindPopup(waypoint.name || "Waypoint");
  //         } else {
  //             console.error("Invalid waypoint coordinates:", waypoint.coordinates);
  //         }
  //     });

  //     // Add markers for the origin and destination
  //     if (coordinates.length > 0) {
  //         L.marker([coordinates[0][0], coordinates[0][1]], { icon: redIcon })
  //             .addTo(mapInstance)
  //             .bindPopup(route.origin || "Origin");

  //         L.marker([coordinates[coordinates.length - 1][0], coordinates[coordinates.length - 1][1]], { icon: greenIcon })
  //             .addTo(mapInstance)
  //             .bindPopup(route.destination || "Destination");
  //     }

  //     // Fit the map bounds to the route
  //     const bounds = L.latLngBounds(coordinates);
  //     mapInstance.fitBounds(bounds);
  // };
  const drawRouteOnMap = (route) => {
    if (!mapInstance) {
      console.log("Map instance not available yet.");
      return;
    }

    // Clear existing route layers
    mapInstance.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstance.removeLayer(layer);
      }
    });

    if (!route || !route.route_coordinates || !route.route_waypoints) {
      console.log("Missing route data:", route);
      return; // Show default map if no route data
    }

    const coordinates = route.route_coordinates
      .map((coord) => {
        const lat = Number(coord[1]);
        const lng = Number(coord[0]);

        if (isNaN(lat) || isNaN(lng)) {
          console.error("Invalid coordinates:", coord);
          return null;
        }
        return [lat, lng];
      })
      .filter((coord) => coord !== null);

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

      L.marker(
        [
          coordinates[coordinates.length - 1][0],
          coordinates[coordinates.length - 1][1],
        ],
        { icon: greenIcon }
      )
        .addTo(mapInstance)
        .bindPopup(route.destination || "Destination");
    }

    // Fit the map bounds to the route
    const bounds = L.latLngBounds(coordinates);
    mapInstance.fitBounds(bounds);
  };

  useEffect(() => {
    // Enable button only if all required fields are filled
    setIsButtonDisabled(
      !selectedVehicle ||
        !selectedOrigin ||
        !selectedDestination ||
        // !selectedStops.length ||
        !preloadedDemand
    );
  }, [
    selectedVehicle,
    selectedOrigin,
    selectedDestination,
    // selectedStops,
    preloadedDemand,
  ]);

  // const validateFields = () => {
  //   const newErrors = {};
  //   if (!selectedVehicle) newErrors.selectedVehicle = true;
  //   // if (!selectedCountry) newErrors.selectedCountry = true;
  //   if (!selectedOrigin) newErrors.selectedOrigin = true;
  //   if (!selectedDestination) newErrors.selectedDestination = true;
  //   if (!startDate) newErrors.startDate = true;
  //   // if (!endDate) newErrors.endDate = true;
  //   if (!preloadedDemand) newErrors.preloadedDemand = true;
  //   if (selectedStops.length === 0) newErrors.selectedStops = true;

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0; // Returns true if no errors
  // };

  const validateFields = () => {
    const newErrors = {};
  
    if (!selectedVehicle) newErrors.selectedVehicle = "Please select a vehicle.";
    // if (!selectedCountry) newErrors.selectedCountry = "Please select a country.";
    if (!selectedOrigin) newErrors.selectedOrigin = "Please select an origin.";
    if (!selectedDestination) newErrors.selectedDestination = "Please select a destination.";
    if (!startDate) newErrors.startDate = "Please select a start date.";
    // if (!endDate) newErrors.endDate = "Please select an end date.";
    if (!preloadedDemand) newErrors.preloadedDemand = "Preloaded demand is required.";
    // if (selectedStops.length === 0) newErrors.selectedStops = "Please add at least one stop.";
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length > 0) {
      setErrorMessage("Please fill in all required fields before submitting.");
      return false; // Validation failed
    }
  
    setErrorMessage(""); // Clear error message if no errors
    return true;
  };
  
  const submitRouteSelection = () => {
    if (!validateFields() || !validateStops()) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields.",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");
    console.log("token:", token);

    if (!token) {
      setSnackbar({
        open: true,
        message: "You must be logged in to submit the route selection.",
        severity: "error",
      });
      setIsLoading(false);
      return;
    }

    setSnackbar({ open: true, message: "Submitting route selection..." });

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];
    // Check formatted dates in the console
    console.log("Formatted Start Date: ", formattedStartDate);
    console.log("Formatted End Date: ", formattedEndDate);


// Log the payload before sending it
// const label = selectedVehicle.label;
// setLabel(selectedVehicle.label);
console.log("label", label);
// const  vehicaletype = label.split("→").map(item => item.trim());
// console.log("Selected Vehicle:", vehicaletype);
// console.log("Selected Vehicle:", vehicaletype[0]);
console.log("Sending Payload:", {
  accident: riskFactors.accident,
  delay: riskFactors.delay,
  reroute: riskFactors.reroute,
  srm: riskFactors.srm,
  country: "United States",
  origin: selectedOrigin,
  destination: selectedDestination,
  preloaded_demand: Number(preloadedDemand) || 0, // Ensure it's a valid number
  vehicle_type: label[0],
  vehicle_id: selectedVehicle.value,
  fuel_type: label[1],
  start_date: formattedStartDate,
  end_date: formattedEndDate,
  vehicle_capacity: label[2], // Ensure it's a valid number
  stop_demands: selectedStops.map((stop) => ({
    drop_demand: Number(stop.drop_demand) || 0, // Handle invalid drop_demand
    pickup_demand: Number(stop.pickup_demand) || 0, // Handle invalid pickup_demand
    priority: Number(stop.priority) || 0, // Handle invalid priority
    name: stop.label,
    coordinates: stop.coordinates,
  })),
});



    axios
      .post(
        `${config.API_BASE_URL}/v2/suggestRoutes`,
        {
          accident: riskFactors.accident,
          delay: riskFactors.delay,
          reroute: riskFactors.reroute,
          srm: riskFactors.srm,
          country: "United States",
          origin: selectedOrigin,
          destination: selectedDestination,
          preloaded_demand: Number(preloadedDemand),
          vehicle_type: label[0],
          vehicle_id:  selectedVehicle.value,
          fuel_type: label[1],
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          vehicle_capacity:  label[2],
          stop_demands: selectedStops.map((stop) => ({
            drop_demand: Number(stop.drop_demand),
            pickup_demand: Number(stop.pickup_demand),
            priority: Number(stop.priority),
            name: stop.label,
            coordinates: stop.coordinates,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        console.log("Response from suggestRoutes API:", response.data);
        setSuggestedRoutes(response.data.routes);
        setSelectedRouteIndex(0);

        if (mapInstance && response.data.routes.length > 0) {
          drawRouteOnMap(response.data.routes[0]);
        }

        setSnackbar({
          open: true,
          message: "Route selection submitted successfully!",
          severity: "success",
        });
      })
      .catch((error) => {
        console.error("Error fetching suggested routes:", error);
        setSnackbar({
          open: true,
          message: "Error submitting route selection. Try again.",
          severity: "error",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
// Disable submit button if fields are not filled correctly
const isSubmitDisabled = useMemo(() => {
  return !validateFields() || !validateStops();
}, [selectedVehicle, selectedOrigin, selectedDestination, startDate, endDate, preloadedDemand, selectedStops]);



  useEffect(() => {
    setMessage("");
  }, [selectedRouteIndex]);
  
  
  // const isSubmitDisabled =
  //   !selectedVehicle ||
  //   !selectedOrigin ||
  //   !selectedDestination ||
  //   !startDate ||
  //   !endDate ||
  //   !preloadedDemand ;
  //   // selectedStops.length === 0;



  //   const handleSelectRoute = (route) => {
  //     if (selectedRouteIndex && selectedRouteIndex.routeID !== route.routeID) {
  //       setMessage("Only one route can be saved at a time.");
  //     } else {
  //       setSelectedRouteIndex(route);
  //     }
  //   };

  const handleSelectRoute = (route) => {
    if (selectedRouteIndex && selectedRouteIndex.routeID === route.routeID) {
      // Deselect the route
      setSelectedRouteIndex(null);
    } else {
      // Select the new route
      setSelectedRouteIndex(route);
    }
  };

  const saveRoute = async (routeID) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to save a route.");
      return;
    }

    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/selectRoute`,
        { routeID },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response from saveRoute API:", response.data);

      if (response.data.detail === "Successfully selected route.") {
        // alert("Route saved successfully!");
        setSnackbar({
          open: true,
          message: "Route saved. Redirecting to tracking. ",
        });

        // Redirect to Route Tracking page:
        setTimeout(() => {
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
          setRouteIDS(null); //clear routeIDS

          if (mapInstance) {
            mapInstance.eachLayer((layer) => {
              if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                mapInstance.removeLayer(layer);
              }
            });
            const initialCenter = [39.8, -98.5];
            mapInstance.setView(initialCenter, 4);
          }

          navigate("/route-tracking"); // Replace '/route-tracking' with your actual route path
        }, 4000);
      } else {
        alert("Failed to save the route. Please try again.");
      }
    } catch (error) {
      console.error("Error saving route:", error);
      alert(
        "An error occurred while saving the route. Please check the console for details."
      );
    }
  };

  return (
    <div>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: isLoading ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "3px!important",
        }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: isLoading ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress sx={{ color: "white" }} />
          <Typography variant="h6" sx={{ color: "white", ml: 2 }}>
            Loading...
          </Typography>
        </Box>
      </Box>
      <NavBar />
      <Breadcrumbs />

      {/* <Container fluid className="mt-5 px-5 " > */}
      <Box
        sx={{
          bgcolor: "#f4f6f8",
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* {" "} */}
        {/* Added flex and overflow hidden */}
        <Stack direction="row" spacing={2}>
          <Box
            sx={{
              flex: "0 0 25%",
              /* Takes 35% of the width */ height: "100%",
              overflowY: "auto",
            }}
          >
            {" "}
            {/* Increased flex, added height, overflow for scrolling */}
            <Card
              className="p-4 shadow-lg rounded-xl bg-gradient-to-r from-blue-50 via-blue-100 to-white"
              style={{
                // height: "calc(86vh - 48px)", // Adjust height to account for app bar/header if any
                borderRadius: "5px",
                height: "85vh",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                padding: "10px", // Added padding for better spacing
                overflowY: "auto",
              }}
            >
              <Grid2
                container
                spacing={2}
                sx={{
                  paddingTop: "1rem",
                  marginBottom: "1rem",
                  display: "flex",
                  flexWrap: "nowrap",
                }}
              >
                {/*  <Grid2 item xs={4} sx={{ minWidth: '30%' }}>
                                    <StyledFormControl fullWidth margin="dense">
                                        <InputLabel sx={{ fontSize: '0.9rem' }}>Country</InputLabel>
                                        <Select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} label="Country"sx={{ fontSize: '0.9rem' }}>
                                            {countries.map((country, index) => (
                                                <MenuItem key={index} value={country}>{country}</MenuItem>
                                            ))}
                                        </Select>
                                    </StyledFormControl>
                                </Grid2>
                                <Grid2 item xs={6} sx={{ minWidth: '30%' }}>
                                    <StyledFormControl fullWidth margin="dense">
                                        <InputLabel sx={{ fontSize: '0.9rem' }}>Origin</InputLabel>
                                        <Select value={selectedOrigin} onChange={(e) => setSelectedOrigin(e.target.value)} label="Origin"sx={{ fontSize: '0.9rem' }}>
                                            {origins.map((origin, index) => (
                                                <MenuItem key={index} value={origin}>{origin}</MenuItem>
                                            ))}
                                        </Select>
                                    </StyledFormControl>
                                </Grid2> */}

                <Grid2 item xs={6} sx={{ minWidth: "30%" }}>
                  {/* <Typography variant="subtitle1">Origin</Typography> */}
                  {/* <SearchBox
 accessToken={config.MAPBOX_ACCESS_TOKEN} // Use token from config
  value={selectedOrigin?.name || ""}
  onRetrieve={(res) => {
    console.log("Mapbox Response for Origin:", res);

    if (res?.features?.length > 0) {
      const feature = res.features[0];
      const name = feature.place_name || "Unknown Location";
      const coordinates = feature.geometry?.coordinates ?? [];

      if (coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
        setSelectedOrigin({ name, coordinates });
        console.log("Selected Origin:", { name, coordinates });
      } else {
        console.error("Invalid coordinates for origin:", coordinates);
        setSelectedOrigin({ name: "Location Not Found", coordinates: [] });
      }
    } else {
      console.error("No features found in Mapbox response for origin:", res);
      setSelectedOrigin({ name: "Location Not Found", coordinates: [] });
    }
  }}
  options={{ language: "en", country: "us" }}
  placeholder="Origin"
/> */}

                  {/* <SearchBox
  accessToken="pk.eyJ1IjoicmVudWthZ2FkZGFtIiwiYSI6ImNtN3F4NGk4YTBkemUyaXBoaWV2aWVxdHMifQ.uk2lmxSHLMbQWi3giwDPHw"
  value={selectedOrigin?.name || ""}
  onRetrieve={(res) => {
    console.log("Full SearchBox Result (res):", res);

    if (res?.features?.length > 0) {
      const feature = res.features[0];
      const name =
        feature.properties?.place_formatted ||
        feature.properties?.name ||
        "Unknown Location";
      const coordinates = feature.geometry?.coordinates ?? [];

      if (coordinates.length === 2) {
        setSelectedOrigin({ name, coordinates });
        console.log("Selected Origin:", { name, coordinates });
      } else {
        console.error("Invalid coordinates:", coordinates);
        setSelectedOrigin({ name: "Location Not Found", coordinates: [] });
      }
    } else {
      console.error("Invalid or missing data in Mapbox response:", res);
      setSelectedOrigin({ name: "Location Not Found", coordinates: [] });
    }
  }}
  options={{ language: "en", country: "us" }}
  placeholder="Origin"
/> */}

<SearchBox
                     accessToken={config.MAPBOX_ACCESS_TOKEN} // Use token from config
                    value={selectedOrigin?.name || ""}
                  

                    onRetrieve={(res) => {
                      console.log("Full SearchBox Result (res):", res);

                      if (res && res.features && res.features.length > 0) {
                        const feature = res.features[0];
                        console.log("First Feature:", JSON.stringify(feature, null, 2)); // Log detailed feature data
                        const name =
                          // feature.properties?.context?.place?.name ||
                          // feature.properties?.place_formatted ||
                          // feature.properties?.name ||
                          feature.place_name ||
                          feature.text ||
                          feature.properties?.name ||
                          "Unknown Location";
                        const coordinates = feature.geometry?.coordinates ?? [];

                        if (coordinates.length === 2) {
                          setSelectedOrigin({ name, coordinates });
                          console.log("Selected Destination:", {
                            name,
                            coordinates,
                          });
                        } else {
                          console.error("Invalid coordinates:", coordinates);
                          setSelectedOrigin({ name, coordinates: [] });
                        }
                      } else {
                        console.error(
                          "Invalid or missing data in Mapbox response:",
                          res
                        );
                        setSelectedOrigin({
                          name: "Location Not Found",
                          coordinates: [],
                        });
                      }
                    }}
                    options={{ language: "en", country: "us" }}
                    placeholder="Origin"
                  />
                </Grid2>
                {/* <Grid2 item xs={6} sx={{ minWidth: '30%' }}>
                                    <StyledFormControl fullWidth margin="dense">
                                        <InputLabel sx={{ fontSize: '0.9rem' }}>Destination</InputLabel>
                                        <Select value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)} label="Destination"sx={{ fontSize: '0.9rem' }}>
                                            {destinations.map((destination, index) => (
                                                <MenuItem key={index} value={destination}>{destination}</MenuItem>
                                            ))}
                                        </Select>
                                    </StyledFormControl>
                                </Grid2> */}
                <Grid2 item xs={4} sx={{ minWidth: "30%" }}>
                  {/* <Typography variant="subtitle1">Destination</Typography> */}
                <SearchBox sx={{
                  "& .mbx09a18d42--SearchIcon svg": {
                    width: "14px",
                    height: "14px",color:"#ddd",
                  },
                }}
                                  accessToken={config.MAPBOX_ACCESS_TOKEN} // Use token from config
                    value={selectedDestination?.name || ""}
                    // onRetrieve={(res) => setSelectedDestination(res.features[0]?.place_name)}

                    onRetrieve={(res) => {
                      console.log("Full SearchBox Result (res):", res);

                      if (res && res.features && res.features.length > 0) {
                        const feature = res.features[0];
                        console.log("First Feature:", JSON.stringify(feature, null, 2)); // Log detailed feature data
                        const name =
                          // feature.properties?.context?.place?.name ||
                          // feature.properties?.place_formatted ||
                          // feature.properties?.name ||
                          feature.place_name ||
                          feature.text ||
                          feature.properties?.name ||
                          "Unknown Location";
                        const coordinates = feature.geometry?.coordinates ?? [];

                        if (coordinates.length === 2) {
                          setSelectedDestination({ name, coordinates });
                          console.log("Selected Destination:", {
                            name,
                            coordinates,
                          });
                        } else {
                          console.error("Invalid coordinates:", coordinates);
                          setSelectedDestination({ name, coordinates: [] });
                        }
                      } else {
                        console.error(
                          "Invalid or missing data in Mapbox response:",
                          res
                        );
                        setSelectedDestination({
                          name: "Location Not Found",
                          coordinates: [],
                        });
                      }
                    }}
                    options={{ language: "en", country: "us" }}
                    placeholder="Destination"
                  />
                </Grid2>
              </Grid2>

              {/* Stops Selection */}
              {/* <StyledFormControl fullWidth className="mb-3 mt-4" sx={{ padding: '0 1rem', marginBottom: '1rem' }}>
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
                            </StyledFormControl> */}
              {/* Render selected stops as chips */}
              {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: 2 }}>
                {selectedStops.length > 0 ? (
        selectedStops.map((stop, index) => (
            <Chip
                key={index}
                label={stop.label}
                onDelete={() => handleRemoveStop(stop)}
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                   
                    
                    minHeight: '20px',
                    border: '1px solid black', // Temporary to debug
                    padding: '4px',
                }}
            />
        ))
    ) : (
        <Typography variant="body2" color="textSecondary">
            No stops selected.
        </Typography>
    )}
                </Box> */}

              

              {/* Stops */}
              <Grid2 item xs={6} sx={{ minWidth: "30%", marginBottom: "25px" }}>
                {/* <Typography variant="subtitle1">Stops</Typography> */}

                {/* {selectedStops.map((stop, index) => (
                  <Chip
                    key={index}
                    label={stop.label}
                    onDelete={() => handleRemoveStop(stop)}
                    sx={{
                      padding: "4px",
                    }}
                  />
                ))} */}
                <SearchBox
                    accessToken={config.MAPBOX_ACCESS_TOKEN} // Use token from config
                  onRetrieve={handleRetrieveStops} // Handle stops retrieval
                  options={{ language: "en", country: "us" }}
                  placeholder="Search stops"
                  value={searchValue} //  Ensure UI reflects state
                  onChange={(value) => {
                    console.log("SearchBox onChange event:", value); // Debugging
                    setSearchValue(value); // ✅ Set value directly
                  }}
 
                />
              </Grid2>

              {selectedStops.map((stop, index) => (
                <Box
                  key={index}
                  sx={{
                   
                    width: "100%",backgroundColor:"#dfdfdf",borderRadius:"5px",padding:"5px"
                    //   padding: "0 1rem",
                    //   marginBottom: "1rem",
                  }}
                >
                  <Box sx={{display:"flex",position:"relative"}}>
                  <Typography style={{ color: "black", fontSize: "12px",fontWeight:"600" }}>
                    {stop.label || "Unknown Stop"}
                    
                  </Typography>
                  {/* Delete Button */}
    <Button
      
      
      size="small"
      onClick={() => handleRemoveStop(stop)} // Remove stop on click
      sx={{ minWidth: "8px", height: "8px", ml: 12,color:'black',fontWeight:"600",mt:1 ,position:"absolute",top:"-8px", 
        right: "5px", minWidth: "15px",
        height: "20px",
        fontSize: "8px",
        backgroundColor: "#ddd",border:"1px solid #8b8b8b",
        color: "black",
        borderRadius: "50%" }}
    >
      X
    </Button>
    </Box>

    {/* Validation Error Message */}
    {(!stop.drop_demand || stop.drop_demand === 0) && (!stop.pickup_demand || stop.pickup_demand === 0) && (
      <Typography sx={{ color: "red", fontSize: "8px"}}>
        At least one demand (Drop or Pickup) must be provided.
      </Typography>
    )}

{/* {stopsError && (
  <Typography color="error" sx={{ fontSize: "8px", marginTop: "1px" }}>
    {stopsError}
  </Typography>
)} */}

                  <Grid2
                    container
                    spacing={2}
                    sx={{
                      // paddingTop: "1rem",
                      // marginBottom: "1rem",
                      display: "flex",
                      flexWrap: "nowrap",
                    }}
                  >
                    <Grid2 item xs={4} sx={{ minWidth: "30%" }}>
                      <StyledTextField
                        inputRef={(el) =>
                          (inputRefs.current[`${index}-drop_demand`] = el)
                        }
                        label="Drop Demand"
                        type="number"
                        value={stop.drop_demand || 0}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value)); // Ensure value is not negative
                          handleStopDemandChange(index, "drop_demand", value);
                        }}
                        size="small"
                        fullWidth
                        margin="dense"
                        sx={{"& .MuiFormLabel-root": {
                                fontSize: "10px", // Adjust input text size
                              },
                          
                            "& .MuiInputBase-input": {
                              fontSize: "12px", // Reduce input text size
                            }
                        }}
                        onBlur={() => {
                          
                        }}
                      />
                    </Grid2>

                    <Grid2 item xs={4} sx={{ minWidth: "30%" }}>
                      <StyledTextField
                        inputRef={(el) =>
                          (inputRefs.current[`${index}-pickup_demand`] = el)
                        }
                        label="Pickup Demand kgs"
                        type="number"
                        value={stop.pickup_demand || 0}
                        onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value)); // Ensure value is not negative
                          handleStopDemandChange(index, "pickup_demand", value);
                        }}
                        size="small"
                        fullWidth
                        margin="dense"
                        sx={{ height: "20px","& .MuiFormLabel-root": {
                          fontSize: "10px", // Adjust input text size
                        },
                    
                      "& .MuiInputBase-input": {
                        fontSize: "12px", // Reduce input text size
                      },
                    }}
                    onBlur={() => {
                      
                    }}
                      />
                    </Grid2>
                    <Grid2 item xs={4} sx={{ minWidth: "30%" }}>
                      <StyledTextField
                        inputRef={(el) =>
                          (inputRefs.current[`${index}-priority`] = el)
                        }
                        label="Priority"
                        type="number"
                        value={stop.priority || 3}
                        onChange={(e) => {
                          const value = Math.max(
                            0,
                            Math.min(Number(e.target.value), 3)
                          );
                          handleStopDemandChange(index, "priority", value);
                        }}
                        size="small"
                        fullWidth
                        margin="dense"
                        sx={{ height: "20px","& .MuiFormLabel-root": {
                          fontSize: "10px", // Adjust input text size
                        },
                    
                      "& .MuiInputBase-input": {
                        fontSize: "12px", // Reduce input text size
                      },
                    }}
                      />
                    </Grid2>
                  </Grid2>
                </Box>
              ))}
{/* Estimated Duration */}
<Typography
                className="mb-2"
                style={{
                  color: "black",
                  backgroundColor: "#dfdfdf",
                  borderRadius: "5px",
                  padding: "8px",
                  margin: "15px 0px",
                }}
                sx={{ padding: "0 1rem", marginBottom: "1rem",fontSize:"12px" }}
              >
                Estimated Duration: {duration} Hours
              </Typography>
              <div
                style={{
                  width: "100%",
                  display: "flex",justifyContent:"center",
                  gap: ".5rem",
                  marginBottom: "1rem",
                  fontSize: "10px",
                }}
              >
                {/* {" "} */}
                {/* Added gap between date pickers */}
                <DatePicker
                  selected={startDate}
                  // onChange={(date) => {
                  //   setStartDate(date);
                  //   setEndDate(null); // Reset end date when start date changes
                  // }}
                  onChange={handleStartDateChange}
                  dateFormat="M/d/yyy"
                  placeholderText="Start Date"
                  minDate={new Date()} // Disable past dates including yesterday
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
                        borderRadius: "8px",
                        "& .MuiInputLabel-root": {},
                        "& .MuiInputBase-input": { fontSize: "0.65rem" },
                        //   padding: "0 1rem",
                      }}
                    />
                  }
                  popperPlacement="bottom-start" // Adjust placement as needed
                  popperProps={{
                    style: {
                      zIndex: 1000, // Increase zIndex
                    },
                  }}
                />

                {/* <DatePicker
                    selected={endDate}
                    onChange={(date) => {if (date && startDate && date < startDate) {
                        alert("End date cannot be before the start date.");
                        return; // Don't update the end date if it's before the start date
                      }setEndDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="End Date"
                    minDate={startDate || new Date()} // Ensure end date cannot be before start date
                    disabled={!startDate} // Disable until a start date is selected
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
                          borderRadius: "8px",
                          "& .MuiInputLabel-root": {
                            // Target the label
                            paddingLeft: "1rem", // Add left padding
                          },
                          "& .MuiInputBase-input": { fontSize: "0.65rem" },
                          padding: "0 1rem",
                        }}
                      />
                    }
                  /> */}

                {/* Display Expected End Date */}
                {/* {expectedEndDate && (
                            <Typography sx={{ padding: "0 1rem", marginBottom: "1rem" }}>
                            Expected End Date: {new Date(expectedEndDate).toLocaleDateString()}
                            </Typography>
                        )} */}

                {expectedEndDate && (
                  <StyledTextField
                    label="Expected End"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={new Date(expectedEndDate).toLocaleDateString()} // Set the value here
                    InputProps={{
                      readOnly: true, // Make it read-only
                    }}
                    sx={{
                      borderRadius: "8px",
                      "& .MuiInputLabel-root": {
                        // Add any label styles here if needed
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "0.65rem",
                        padding: "16px",
                        backgroundColor: "#dfdfdf",
                        fontWeight: "bold",
                      },
                      //  padding: "0 1rem",
                    }}
                  />
                )}
              </div>
              <StyledTextField
                inputRef={preloadedDemandRef}
                label="Preloaded Demand kgs "
                type="number"
                value={preloadedDemand}
                onChange={handlePreloadedDemandChange}
                fullWidth
                size="small"
                margin="dense"
                className="mb-3"
                sx={{
                  width: "100%",
                  marginTop: "16px",
                  // padding: "0 1rem",
                  marginBottom: "1rem",
                  "& .MuiInputBase-input": { padding: "16px" },
                }}
              />

              {/* <Typography className="mb-2" style={{ color: 'black' }} sx={{ padding: '0 1rem', marginBottom: '1rem' }}>
  {duration > 0 ? `${duration} Hours` : 'Duration not available'}
</Typography> */}
              {/* Vehicle Selection */}
              {/* <StyledFormControl fullWidth margin="dense" className="select-container" sx={{ width: '80%', padding: '0 1rem', marginBottom: '1rem' }}>
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
                                    {[...new Map(vehicles.map(v => [v.VehicleID, v])).values()].map((vehicle, index) => (
                                        <MenuItem key={index} value={vehicle}>
                                            {vehicle.VehicleType} → <strong>{vehicle.FuelType}</strong> → {vehicle.Quantity}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </StyledFormControl>  */}
                            <StyledFormControl
  fullWidth
  margin="dense"
  className="select-container"
  sx={{ width: "100%", marginBottom: "1rem" }}
>
  <Select
    options={vehicleOptions.map(vehicle => ({
      value: vehicle.value,
      label: `${vehicle.label} → ID: ${vehicle.value.slice(-5)}`, // Include vehicle_id in label
      vehicle_id: vehicle.vehicle_id, // Add vehicle_id for further use
    }))}
    value={selectedVehicle}
    onChange={handleVehicleSelection}
     placeholder="Search Available Vehicles..."
     
    isSearchable
    menuPlacement="top" 
    styles={{
      control: (base) => ({
        ...base,
        height: "20px",
        fontSize: "12px", 
      }),
      menu: (base) => ({
        ...base,
        marginTop: "-4px",fontSize: "12px", 
        zIndex: 9999, // Ensures dropdown appears above other elements
      }),
      menuList: (base) => ({
        ...base,
        paddingTop: "0px",  
        paddingBottom: "0px", 
        fontSize: "12px", 
      }),
      option: (base) => ({
        ...base,
        fontSize: "12px",
         padding: "8px 12px", // Adjust padding if needed
      }),
    
    }}
  />
</StyledFormControl>
                            {/* <FormControl fullWidth margin="dense" sx={{ width: "80%", padding: "0 1rem", marginBottom: "1rem" }}>
      <InputLabel sx={{ padding: "0 1.2rem" }}>Available Vehicles</InputLabel>
      <Select
        value={selectedVehicle?.VehicleID || ""}
        onChange={handleVehicleSelection}
        displayEmpty
        sx={{ height: "40px", padding: "0.5rem" }}
      >
        
        <MenuItem disabled>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search vehicle..."
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </MenuItem>

        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle, index) => (
            <MenuItem key={index} value={vehicle.VehicleID}>
              {vehicle.VehicleType} → <strong>{vehicle.FuelType}</strong> → {vehicle.Quantity}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No vehicles found</MenuItem>
        )}
      </Select>
    </FormControl> */}
              {/* <StyledFormControl fullWidth margin="dense" className="mb-3" sx={{ width: "80%", padding: "0 1rem", marginBottom: "1rem" }}>
                                <Autocomplete
                                    freeSolo
                                    clearOnEscape
                                    options={vehicles} // Use the vehicles array directly
                                    getOptionLabel={(option) =>
                                        typeof option === "string"
                                            ? option
                                            : `${option.VehicleType} → ${option.FuelType} → ${option.Quantity}`
                                    }
                                    value={selectedVehicle}
                                    onChange={(event, newValue) => {
                                        setSelectedVehicle(newValue);
                                        setInputValue(newValue ? `${newValue.VehicleType} → ${newValue.FuelType} → ${newValue.Quantity}` : "");
                                        console.log("Selected Vehicle:", newValue);
                                        getRiskFactors();
                                    }}
                                    inputValue={inputValue}
                                    onInputChange={(event, newInputValue) => {
                                        if (newInputValue === "") {
                                            setSelectedVehicle(null); // Allow clearing
                                        }
                                        setInputValue(newInputValue);
                                    }}
                                    filterOptions={(options, state) =>
                                        state.inputValue.length > 0
                                            ? options.filter((option) =>
                                                option.VehicleType.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                                                option.FuelType.toLowerCase().includes(state.inputValue.toLowerCase())
                                            )
                                            : [] // Show options only after typing
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search Available Vehicles"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    )}
                                />
                            </StyledFormControl>
              {/* <StyledFormControl
                fullWidth
                margin="dense"
                className="mb-3"
                sx={{
                  width: "100%",
                  // padding: "0 1rem",
                  marginBottom: "1rem",
                }}
              >
                <Autocomplete
                  freeSolo
                  clearOnEscape
                  options={vehicles} // Use the vehicles array directly
                  getOptionLabel={(option) =>
                    typeof option === "string"
                        ? option
                        : `${option.VehicleType} → ${option.FuelType} → ${option.Quantity}`
                }
                value={selectedVehicle}
                inputRef={inputRef} // Assign the ref to the input
                onChange={(event, newValue) => {
                    setSelectedVehicle(newValue);
                    setInputValue(newValue ? `${newValue.VehicleType} → ${newValue.FuelType} → ${newValue.Quantity}` : "");
                    console.log("Selected Vehicle:", newValue);
                    getRiskFactors();
                    inputRef.current.focus(); // Force focus back on the input
                }}
                  // inputValue={inputValue}
                  onInputChange={(event, newInputValue) => {
                    // if (newInputValue === "") {
                    //   setSelectedVehicle(null); // Allow clearing
                    // }
                    if (inputRef.current) {
                      inputRef.current.focus(); // Force focus back on the input
                  }
                    setInputValue(newInputValue);
                  }}
                  filterOptions={(options, state) =>
                    state.inputValue.length > 0
                        ? options.filter((option) =>
                            option.VehicleType.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                            option.FuelType.toLowerCase().includes(state.inputValue.toLowerCase())
                        )
                        : [] // Show options only after typing
                }
               
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Available Vehicles"
                      variant="outlined"
                     
                      fullWidth
                    />
                  )}
                  // Add a key prop here, assuming `option.id` is available

                  renderOption={(props, option) => (
                    <li {...props} key={option.VehicleID}>
                      {`${option.VehicleType} → ${option.FuelType} → ${option.Quantity}`}
                    </li>
                  )}
                />
              </StyledFormControl> */}

              {/* Snackbar Notification */}
              <Snackbar
                open={snackbar.open}
                autoHideDuration={10000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                sx={{ boxShadow: 3, borderRadius: 2 }}
              >
                <Alert
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                  severity={snackbar.severity}
                  sx={{ fontSize: "1rem", fontWeight: "bold" }}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>

              {/* Submit Button */}
              <Button
                variant="contained"
                fullWidth
                onClick={submitRouteSelection}
                disabled={isSubmitDisabled || isLoading} // Disable when fields are empty or API is loading
                sx={{
                  mt: 2,
                  width: "50%",
                  mx: "auto",
                  display: "block",
                  backgroundColor: isSubmitDisabled ? "gray" : "primary.light",
                  color: "white",
                  "&:hover": {
                    backgroundColor: isSubmitDisabled ? "gray" : "primary.main",
                  },
                }}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </Card>
          </Box>

          {/* Map and Routes Side Panel */}

          {/* Map and Routes Side Panel */}
          <Box
            sx={{
              height: "85vh", // Full viewport height
              display: "flex",
              flex: "0 0 75%",
              flexDirection: "column",
            }}
          >
            {" "}
            {/* Takes 65% of the width, added height */}
            {/* <Card
                className="p-4 shadow-lg rounded-xl"
                style={{
                  height: "calc(86vh - 48px)", // Adjust height to account for app bar/header if any
                  //paddingTop: "25px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  paddingRight: "24px",
                }}
              > */}
            {/* Side Panel for Routes */}
            {/* <Box
                  sx={{ display: "flex", flexDirection: "row", height: "100%" }}
                > */}
            {/* Map */}
            <Box sx={{ flex: 2 }}>
              <div
                ref={handleMapRef}
                style={{ height: "100%", width: "100%" }}
              ></div>
              {!mapInitialized && (
                <Typography variant="body1">Loading Map...</Typography>
              )}
            </Box>
            {suggestedRoutes?.length > 0 && (
              <Box
                sx={{
                  flex: 2,
                  borderTop: "1px solid #ccc",
                  overflowY: "auto",
                  //   padding: 2,
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 1 }}
                  style={{ color: "black" }}
                >
                  Suggested Routes
                </Typography>

                <TableContainer component={Paper}sx={{ maxHeight: 250, overflowY: "auto", "&::-webkit-scrollbar": {
                 width: "6px",  // Width of the scrollbar
                 height: "6px",
               },
               "&::-webkit-scrollbar-track": {
                 background: "#f1f1f1", // Track color
                 borderRadius: "10px",
               },
               "&::-webkit-scrollbar-thumb": {
                 background: "#888", // Scrollbar color
                 borderRadius: "10px",
               },
               "&::-webkit-scrollbar-thumb:hover": {
                 background: "#555", // Scrollbar color on hover
               }, }} >
                 
                 <Table size="small" sx={{ minWidth: 650, borderCollapse: "collapse" }}>
                    <TableHead sx={{ position: "sticky", top: 0, backgroundColor: "#ddd", zIndex: 1 }}>
                      <TableRow
                        sx={{
                          "& th": {
                            color: "black",
                            fontSize: "10px",
                            fontWeight: "bold",
                            lineHeight: "15px",
                          },
                        }}
                      >
                        <TableCell>Select</TableCell>
                        <TableCell>Route </TableCell>
                        <TableCell>Waypoints</TableCell>
                        <TableCell>Distance (km)</TableCell>
                        <TableCell>Duration (hrs)</TableCell>
                        <TableCell>Carbon Emission (kg)</TableCell>
                        <TableCell>Fuel Consumption (liters)</TableCell>
                        <TableCell>Vehicle Type</TableCell>
                        <TableCell>Fuel Type</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody
                      sx={{
                        "& td": {
                          color: "black",
                          fontSize: "10px",
                          overflow: "auto",
                         
                        },
                      }}
                    >
                      {suggestedRoutes.map((route, index) => (
                        <TableRow key={route.routeID}>
                          <TableCell>
                            {/* <Checkbox
                              checked={
                                selectedRouteIndex &&
                                selectedRouteIndex.routeID === route.routeID
                              } // Corrected check
                              onChange={(e) => {
                                handleSelectRoute(route);
                                drawRouteOnMap(route); // corrected drawRouteOnMap call
                              }}
                            /> */}
                            <Radio
                              value={route.routeID}
                              checked={selectedRouteIndex?.routeID === route.routeID}
                              onChange={() => {
                                handleSelectRoute(route);
                                drawRouteOnMap(route);
                              }}
                            />
                          </TableCell>

                          <TableCell>{`${index + 1}`}</TableCell>
                          <TableCell>
                            {route.route_waypoints
                              .map((stop) => stop.name)
                              .join(" → ")}
                          </TableCell>
                          <TableCell>{route.distance}</TableCell>
                          <TableCell>{route.duration}</TableCell>
                          <TableCell>{route.carbon_emission}</TableCell>
                          <TableCell>{route.fuel_consumption}</TableCell>
                          <TableCell>{route.vehicle_type}</TableCell>
                          <TableCell>{route.fuel_type}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => saveRoute(route.routeID)}
                              sx={{
                                backgroundColor: "#318CE7",
                                color: "white",
                                fontSize: "8px",
                              }}
                            >
                              Save & Track
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </Stack>
        {/* </Container> */}
      </Box>
    </div>
  );
};

export default SuggestRoutes;
