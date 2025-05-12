// src/hooks/useRouteOperations.js
import { useState, useEffect, useRef, useContext,useMemo } from 'react';
import axios from 'axios';
import config from "../../config";
import { AuthContext } from '../../Context/AuthContext';

export const useManagerEditRoutes = (initialRoute ) => {
  const { token } = useContext(AuthContext);
  const [initialState, setInitialState] = useState(null);
  const [routeData, setRouteData] = useState(initialRoute);
  const [duration, setDuration] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [expectedEndDate, setExpectedEndDate] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [preloadedDemand, setPreloadedDemand] = useState(0);
  const [stopsError, setStopsError] = useState('');
  const inputRefs = useRef({});
  const preloadedDemandRef = useRef(null);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [changesMade, setChangesMade] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [editedRoute, setEditedRoute] = useState({
    routeID: '',
    origin: { name: '', coordinates: [] },
    destination: { name: '', coordinates: [] },
    stop_demands: [],
    preload_demand: 0,
    duration: 0,
    start_date: new Date(),
    end_date: null,
    vehicle_type: ''
  });
  // Core API Operations
//   const fetchDuration = async (origin, destination, stops) => {
//     if (!origin?.coordinates || !destination?.coordinates) return;
  
//     // const requestData = {
//     //   origin: origin.coordinates,
//     //   destination: destination.coordinates,
//     //   stops: (stops || []).map(stop => stop.coordinates).filter(coords => coords?.length === 2)
//     // };
//     const requestData = {
//         origin: {
//           name: origin.name || "Origin",
//           coordinates: origin.coordinates
//         },
//         destination: {
//           name: destination.name || "Destination",
//           coordinates: destination.coordinates
//         },
//         stops: (stops || []).map(stop => ({
//           name: stop.name || "Stop",
//           coordinates: stop.coordinates
//         }))
//       };
  
//     try {
//       const response = await axios.post(
//         `${config.API_BASE_URL}/v2/getDuration`,
//         requestData,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const newDuration = response.data.duration;
//     setDuration(newDuration);
    
//     // Update both duration state and editedRoute
//     setEditedRoute(prev => ({
//       ...prev,
//       duration: newDuration,
//       end_date: calculateEndDate(prev.start_date, newDuration)
//     }));

//   } catch (error) {
//     console.error("Duration calculation failed:", error);
//     setSnackbar({
//       open: true,
//       message: "Failed to calculate duration",
//       severity: "error"
//     });
//   }
// };
// In useManagerEditRoutes.js
const fetchDuration = async (origin, destination, stops) => {
    try {
      // Handle both object and string formats for origin/destination
      const originName = typeof origin === 'object' ? origin.name : origin;
      const destinationName = typeof destination === 'object' ? destination.name : destination;
      
      // Ensure stops are properly formatted
      const stopNames = stops.map(stop => {
        if (typeof stop === 'string') return stop;
        return stop.name || '';
      }).filter(Boolean);
  
      const response = await axios.post(
        `${config.API_BASE_URL}/v2/getDuration`,
        {
          origin: originName,
          destination: destinationName,
          stops: stopNames
        }
      );
  
      const newDuration = response.data.duration;
      setDuration(newDuration);
      
      // Update both local state and editedRoute
      setEditedRoute(prev => ({
        ...prev,
        duration: newDuration,
        end_date: calculateEndDate(prev.start_date, newDuration)
      }));
  
    } catch (error) {
      console.error("Duration calculation failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to calculate duration",
        severity: "error"
      });
    }
  };
  const getAvailableVehicles = async () => {
    if (!startDate || preloadedDemand === null) return;

    try {
        console.log("Making API call to:", `${config.API_BASE_URL}/getAvailableVehicles`);
      const response = await axios.post(
        `${config.API_BASE_URL}/getAvailableVehicles`,
        {
          start_date: editedRoute.start_date.toISOString().split('T')[0],
          preloaded_demand: editedRoute.preload_demand
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("API response:", response.data);
      const uniqueVehicles = Array.from(
        new Map(response.data.vehicles.map(v => [v.VehicleID, v])).values()
      );

      console.log("Processed vehicles:", uniqueVehicles);
      setVehicles(uniqueVehicles);
    }  catch (error) {
        console.error("Error fetching vehicles:", error);
        setSnackbar({
          open: true,
          message: "Failed to load available vehicles",
          severity: "error"
        });
      } finally {
        setVehicleLoading(false);
      }
    };
    
  const filterVehiclesByDemand = (demand) => {
    const filtered = vehicles.filter(v => v.Quantity >= demand)
      .map(v => ({
        value: v.VehicleID,
        label: `${v.VehicleType} (${v.Quantity} tons)`,
        ...v
      }));
    setVehicleOptions(filtered);
  };
  // Validation Logic
  const validateStops = (stops) => {
    const invalidStops = stops.filter(stop => 
      (stop.drop_demand > 40) || (stop.pickup_demand > 40)
    );

    if (invalidStops.length > 0) {
      setStopsError("Demand cannot exceed 40 tons");
      return false;
    }

    const noDemandStops = stops.filter(stop => 
      stop.drop_demand <= 0 && stop.pickup_demand <= 0
    );

    if (noDemandStops.length > 0) {
      setStopsError("Each stop needs at least one demand");
      return false;
    }

    setStopsError('');
    return true;
  };

  // Date Calculations
  const calculateEndDate = async (startDate, duration) => {
    if (!startDate || !duration) return;

    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/getExpectedDate`,
        {
          start_date: startDate.toISOString().split('T')[0],
          duration: duration
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpectedEndDate(new Date(response.data.expectedDate));
    } catch (error) {
      console.error("End date calculation error:", error);
    }
  };

  // Vehicle Filtering
  const filterVehicles = (demand) => {
    return vehicles.filter(v => v.Quantity >= demand).map(v => ({
      value: v.VehicleID,
      label: `${v.VehicleType} → ${v.FuelType} → ${v.Quantity}`,
      vehicle_id: v.VehicleID
    }));
  };

  // Unified Handlers
  const handleStartDateChange = (date) => {
    setStartDate(date);
    setExpectedEndDate(null);
    if (duration) calculateEndDate(date, duration);
  };

  const handleDemandChange = (value) => {
    const numValue = Number(value);
    if (numValue < 3 || numValue > 40) {
      return { error: "Demand must be 3-40 tons" };
    }
    setPreloadedDemand(numValue);
    return { success: true };
    filterVehiclesByDemand(numValue);
    setChangesMade(true);
  };
  // Track vehicle changes
  const handleVehicleChange = (newValue) => {
    setSelectedVehicle(newValue);
    setChangesMade(true);
  };
  // Effect Hooks
  useEffect(() => {
    if (startDate && preloadedDemand !== null) {
      getAvailableVehicles();
    }
  }, [routeData?.startDate,routeData?.preloadedDemand]);

  useEffect(() => {
    if (routeData) fetchDuration();
  }, [routeData?.origin, routeData?.destination, routeData?.stops]);
  const durationChanged = useMemo(() => 
    initialState?.duration !== duration, 
    [duration, initialState]
  );

  const vehicleChanged = useMemo(() => 
    initialState?.routeData?.vehicle_id !== selectedVehicle?.vehicle_id,
    [selectedVehicle, initialState]
  );

  const stopsChanged = useMemo(() => 
    initialState?.stops?.length !== routeData?.stop_demands?.length,
    [routeData, initialState]
  );
   // Initialize state when route data loads
   useEffect(() => {
    if (routeData) {
      setInitialState({
        duration: routeData.duration,
        vehicle: routeData.vehicle_id,
        stops: routeData.stop_demands
      });
    }
  }, [routeData]);
 
  return {
    routeData,
    duration,
    startDate,
    expectedEndDate,
    vehicles,setVehicles,
    preloadedDemand,
    stopsError,
    inputRefs,
    preloadedDemandRef,
    vehicleOptions,
    selectedVehicle,
    confirmEditOpen,
    setConfirmEditOpen,
    changesMade,
    setChangesMade,
    setVehicleOptions,
    
   
    durationChanged,
    vehicleChanged,
    stopsChanged,
    operations: {
      fetchDuration,
      validateStops,
      calculateEndDate,
      getAvailableVehicles,
      handleStartDateChange,
      handleDemandChange,
      filterVehicles,
      handleVehicleChange,
      filterVehiclesByDemand, setSelectedVehicle
    }
  };
};