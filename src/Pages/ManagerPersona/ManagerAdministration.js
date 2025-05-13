import React, { useEffect, useState ,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaBell, FaCog, FaHome, FaTruckMoving, FaUserShield,FaUserTie,FaUserCog } from 'react-icons/fa';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Alert ,DialogContentText,
    Typography, CircularProgress, Box, Tabs, Tab, Tooltip, Button, Dialog,TablePagination,Snackbar,
    DialogTitle, DialogContent, DialogActions, InputLabel, Select, MenuItem,TextField, Autocomplete, IconButton,
    InputAdornment,Grid, styled
} from "@mui/material";
import { FormControl } from "@mui/material";
import { faMapMarkerAlt, faFlagCheckered } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import WhereToVoteIcon from '@mui/icons-material/WhereToVote';
import { NavLink } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import SearchIcon from "@mui/icons-material/Search";
import config from "../../config";
import "./../Form.css";  
import Breadcrumbs1 from "./Breadcrumbs1";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PlaceIcon from '@mui/icons-material/Place';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import SaveIcon from '@mui/icons-material/Save';
import { useManagerEditRoutes } from "./ManagerEditRoutes";
// Add this import at the top of ManagerAdministration.js
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DatePicker from "react-datepicker";
const Dashboard = ({ initialRoute }) => {
  const {
    routeData,
  duration,
  startDate,
  expectedEndDate,
  vehicles,setVehicles,
  preloadedDemand,
  stopsError,setStopsError,
  inputRefs,
  preloadedDemandRef,
  changesMade,  setChangesMade,
  confirmEditOpen,setConfirmEditOpen,
  vehicleOptions,setVehicleOptions,
  selectedVehicle,
  durationChanged,
  vehicleChanged,
  stopsChanged,operations,
  operations: {
    fetchDuration,
    validateStops,
    calculateEndDate,
    getAvailableVehicles,
    handleStartDateChange,
    handleDemandChange,
    filterVehicles,
    setSelectedVehicle,
    
  }
  } = useManagerEditRoutes(initialRoute);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
 
const [availableDrivers, setAvailableDrivers] = useState([]);
 const [selectedDriver, setSelectedDriver] = useState("");
const [selectedDrivers, setSelectedDrivers] = useState(() => {
  const storedDrivers = localStorage.getItem("selectedDrivers");
  return storedDrivers ? JSON.parse(storedDrivers) : {};
}); // Store selected driver IDs per route
const [selectedRoute, setSelectedRoute] = useState("");
const [isManager, setIsManager] = useState(false);
const [consignments, setConsignments] = useState([]);
const [searchQuery, setSearchQuery] = useState("");
const [isReassigning, setIsReassigning] = useState(false); // Track if it's a reassignment
const [vehicleLoading, setVehicleLoading] = useState(false);
const [confirmReassign, setConfirmReassign] = useState(false);
const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
const [openDialog, setOpenDialog] = React.useState(false);

const [selectedRouteID, setSelectedRouteID] = React.useState(null);
// const [editRouteOpen, setEditRouteOpen] = useState(false);
// const [routeToEdit, setRouteToEdit] = useState(null);
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [editedRoute, setEditedRoute] = useState(null);
const [confirmOpen, setConfirmOpen] = useState(false);
const [deleteIndex, setDeleteIndex] = useState(null);

const [stopToDelete, setStopToDelete] = useState({ index: null, name: '' });
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#318CE7",
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: "#318CE7",
      borderWidth: "1px",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#318CE7",
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

const token = localStorage.getItem("token");
const navigate = useNavigate();
const handleDriverChange = (newValue, routeID) => {
  if (newValue) {
    const isReassigning = !!selectedDrivers[routeID]; // Check if a driver was already assigned

    // Update the assigned driver for this route
    setSelectedDrivers((prev) => ({ ...prev, [routeID]: newValue.driver_name }));

    handleAssignDriver(newValue.driver_id, routeID); // API call to assign driver

    // Show success snackbar (removes any alerts)
    setSnackbar({
      open: true,
      message: isReassigning ? "Driver reassigned successfully!" : "Driver assigned successfully!",
      severity: "success",
    });
  }
};
const handleConfirmAssignment = async () => {
  setOpenDialog(false);
  if (selectedDriver && selectedRouteID) {
    try {
      await handleAssignDriver(selectedDriver.driver_id, selectedRouteID);
      setSelectedDrivers((prev) => ({
        ...prev,
        [selectedRouteID]: selectedDriver.driver_name,
      }));
      setSnackbar({
        open: true,
        message: "Driver assigned successfully!",
        severity: "success",
        
      });
      setIsReassigning(false); // Reset reassigning flag
    } catch (error) {
      console.error("Error assigning driver:", error);
      setSnackbar({
        open: true,
        message: "Failed to assign driver.",
        severity: "error"});
      }finally {
 setSelectedDriver(null);
 setSelectedRouteID(null);
 }
}

};

const assignDriver = (newDriver, routeID, successMessage) => {
  if (newDriver) {
    handleAssignDriver(newDriver.driver_id, routeID);
    
    // Reset dropdown selection
    setSelectedDrivers((prev) => ({ ...prev, [routeID]: null }));

    // Show success snackbar
    setSnackbar({ open: true, message: successMessage, severity: "success" });
  }
};




const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [summary, setSummary] = useState({
    delayFactor: "",
    rerouteFactor: "",
    accidentFactor: "",
    stockMismatchFactor: ""
  });
//   useEffect(() => {
//     fetchData();
//   }, [tabIndex]); // Fetch data when tab changes

  
//   useEffect(() => {
//     if (tabIndex === 2) {
//         fetchDrivers();
//     }
// }, [tabIndex]);


useEffect(() => {
  fetchData();
 if (tabIndex === 2) {
    fetchDrivers();
  }
}, [tabIndex]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    let apiUrl = "";
    let method = "get"; 
    let payload = {};   
  
    if (tabIndex === 0) {
      apiUrl = `${config.API_BASE_URL}/getDrivers`;
    } else if (tabIndex === 1) {
      apiUrl = `${config.API_BASE_URL}/getVehicles`;
    } else if (tabIndex === 2) {
      apiUrl = `${config.API_BASE_URL}/getConsignments`;
      method = "post"; 
      payload = {  status: '',
        origin: '',
        destination: '',
        vehicle_id: '',
        routeID: '' }; 
    }
    console.log("Payload Sent:", payload);

    const token = localStorage.getItem("token");
    // if (!token) {
    //   navigate("/sessionexpired");
    //   setLoading(false);
    //   return;
    // }
  
    try {
      const response =
        method === "get"
          ? await axios.get(apiUrl, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : await axios.post(apiUrl, payload, {
              headers: { Authorization: `Bearer ${token}` },
            });
  
      console.log("Fetched Data:", response.data);
     // Ensure data is an array
     let responseData = [];
        if (tabIndex === 2 && Array.isArray(response.data.consignments)) {
            responseData = response.data.consignments;
        } else if (Array.isArray(response.data.drivers)) {
            responseData = response.data.drivers;
        } else if (Array.isArray(response.data.vehicles)) {
            responseData = response.data.vehicles;
        } else if (Array.isArray(response.data.results)) {
            responseData = response.data.results;
        } else if (Array.isArray(response.data)) {
            responseData = response.data;
        } else {
            responseData = [];
        }

        setData(responseData);
    } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.detail || "Failed to load data.");
    } finally {
        setLoading(false);
    }
};
  const handleOpenSummary = (consignment) => {
    setSelectedConsignment(consignment);
    setSummary({
      delayFactor: consignment.summary?.delayFactor || "",
      rerouteFactor: consignment.summary?.rerouteFactor || "",
      accidentFactor: consignment.summary?.accidentFactor || "",
      stockMismatchFactor: consignment.summary?.stockMismatchFactor || "",
      // editedDate: consignment.summary?.editedDate || new Date().toISOString().split("T")[0], // Default to today if no date exists
    });
  
    // Check if the user is a manager
    const role = localStorage.getItem("user_role");
    setIsManager(role === "manager");
  
    setOpen(true);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSummary((prevSummary) => ({
      ...prevSummary,
      [name]: value,
      // editedDate: new Date().toISOString().split("T")[0], // Update date on edit
    }));
  };
  
  // const handleSubmit = async () => {
  //   if (!selectedConsignment) return;
  
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.post(
  //       `${config.API_BASE_URL}/updateSummary`,
  //       {
  //         consignmentId: selectedConsignment.id,
  //         summary,
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  
  //     alert("Summary updated successfully.");
  //     setOpen(false);
  //     fetchData(); // Refresh data after update
  //   } catch (error) {
  //     console.error("Error updating summary:", error);
  //     alert("Failed to update summary.");
  //   }
  // };
  const handleSubmit = async () => {
    if (!selectedConsignment) return;
  
    const payload = {
      routeID: selectedConsignment.routeID,
      status: selectedConsignment.status,
      summary: summary   // this is your [{ summary, impact }, …] array
    };
  
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${config.API_BASE_URL}/updateStatus`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({
        open: true,
        message: selectedConsignment.summaryAdded
        ? "Summary updated successfully."
        : "Summary added successfully.",
        severity: "success",
      });

      setOpen(false);
       // Wait a bit to ensure the backend updates before re-fetching
    setTimeout(() => {
      fetchData(); // refresh table data including updated summaryAdded flag
    }, 500);
    } catch (err) {
      console.error("Error updating summary:", err);
      setSnackbar({
        open: true,
        message: "Failed to update summary.",
        severity: "error",
      });
    }
  };
  
  
//   const handleOpenAssignDialog = (routeId) => {
//     setSelectedRoute(routeId);
//     fetchDrivers();
//     setOpenAssignDialog(true);
//   };
const handleAssignDriver = async (driverId, routeId) => {
    if (!driverId || !routeId) {
        alert("Please select a driver.");
        return;
    }
try {
        const token = localStorage.getItem("token");
       
 const response = await axios.post(
            `${config.API_BASE_URL}/assignDriver`, 
            { driver_id: driverId, route_id: routeId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
 const assignedDriver = availableDrivers.find((d) => d.driver_id === driverId);
                   if (assignedDriver) {
  const newSelectedDrivers = {
                    ...selectedDrivers,
                    [routeId]: assignedDriver.driver_name,
                };
                setSelectedDrivers(newSelectedDrivers);
                localStorage.setItem("selectedDrivers", JSON.stringify(newSelectedDrivers)); // Update localStorage
            }
        console.log("API Response:", response.data);
        // alert("Driver assigned successfully.");
         // Show success snackbar

         setSnackbar({
           open: true,

           message: isReassigning
             ? "Driver reassigned successfully!"
             : "Driver assigned successfully!",

           severity: "success",
         });
        // Fetch updated data so UI reflects changes
        fetchData();
    } catch (error) {
        console.error("Error assigning driver:", error.response?.data || error.message);
        setSnackbar({ open: true, message: "Failed to assign driver.", severity: "error" });

        }

    };
  

//   const handleDriverSelectChange = (event, routeId) => {
//     const driverId = event.target.value;
//     setSelectedDrivers({ ...selectedDrivers, [routeId]: driverId });
// };
// const handleDriverSelectChange = (event, newValue, routeId) => {
//     if (newValue) {
//         // setSelectedDrivers((prev) => ({
//         //     ...prev,
//         //     [routeId]: newValue // Store selected driver
//         // }));
//         setIsReassigning(!!selectedDrivers[routeId]);
//           setSelectedDriver(newValue);
//           setSelectedRouteID(routeId);
//           if (selectedDrivers[routeId]) {
//           setOpenDialog(true); // Show confirmation dialog for reassignment
//           } else {
//           handleConfirmAssignment(); // Assign directly if it's the first time
//           }
//           }
//           };
const handleDriverSelectChange = async (event, newValue, routeId,item) => {
  if (newValue ) {
    try {
      setLoading(true); // Show loading state
      
      // Call the assignment API
      await handleAssignDriver(newValue.driver_id, routeId);
      
      // Update local state
      setSelectedDrivers(prev => ({
        ...prev,
        [routeId]: newValue.driver_name
      }));
      
      // Show success message
      setSnackbar({
        open: true,
        message: selectedDrivers[routeId] 
          ? "Driver reassigned successfully!" 
          : "Driver assigned successfully!",
        severity: "success"
      });
      
    } catch (error) {
      console.error("Assignment error:", error);
      setSnackbar({
        open: true,
        message: "Failed to assign driver",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  } else if (item.status === "started") {
    setSnackbar({
      open: true,
      message: "Route has already started, driver cannot be reassigned.",
      severity: "info"
    });
  } else if (item.status === "completed") {
    setSnackbar({
      open: true,
      message: "Route is completed, driver cannot be reassigned.",
      severity: "info"
    });
  }
};
        

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
     
  
      const response = await axios.get(`${config.API_BASE_URL}/getDrivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setAvailableDrivers(response.data.drivers || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setError("Failed to load drivers.");
    }
  };
  
    // Handle Pagination Changes
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
   // Reset pagination when tabIndex changes
   useEffect(() => {
    setPage(0); // Reset to first page when switching tabs
  }, [tabIndex]);
    //Search field
    const handleSearchChange = (event) => {
      setSearchQuery(event.target.value);
    };
const filteredData = data.filter((item) => {
  const searchValue = searchQuery.toLowerCase();
  return Object.values(item).some(
    (value) => value && value.toString().toLowerCase().includes(searchValue)
  );
});
// Reset pagination when search query changes
useEffect(() => {
  setPage(0);
}, [searchQuery]);  // Add this effect
// const filteredData = data.filter((item) => {
//   const searchValue = searchQuery.trim().toLowerCase();

//   const driverAvailability =
//     item.route_status === "Not Assigned" && item["Vehicle Status"] === "Not Assigned"
//       ? "available"
//       : "unavailable";

//   const assignedDriver =
//     item["Vehicle Status"] === "In Transit" ? "Assigned" : "Not Assigned";

//   const combinedValues = [
//     ...Object.values(item).map((val) =>
//       val != null ? val.toString().toLowerCase() : ""
//     ),
//     driverAvailability.toLowerCase(),
//     assignedDriver.toLowerCase(),
//   ];

//   return combinedValues.some((val) => val.startsWith(searchValue));
// });
//Edit/Update Planned Route
const handleEditRoute = async (item) => {
  console.log("Edit button clicked for item:", item);
  try {
    const token = localStorage.getItem("token");
    // Fetch full route data
    const response = await axios.post(
      `${config.API_BASE_URL}/getRouteData`,
      { routeID: item.routeID },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log("Fetched full route data:", response.data);
    
    // Extract the full route details from the API response
    const fullRouteData = response.data.route[0]; // if route is an array
    
    // Set edited route with full data
    setEditedRoute({
      ...fullRouteData,
      stop_demands: fullRouteData.stop_demands || [],
      origin:fullRouteData.origin || [],
      start_date: new Date(fullRouteData.start_date),
      preload_demand: fullRouteData.preloaded_demand || 0
    });
    setEditDialogOpen(true);
  } catch (error) {
    console.error("Error fetching full route data:", error);
    alert("Failed to fetch full route details.");
  }
};

// Log when editedRoute updates
useEffect(() => {
  console.log("editedRoute updated:", editedRoute);
}, [editedRoute]);



// const handleStopChange = (index, key, value) => {
//   const updatedStops = [...editedRoute.stop_demands];
//   console.log("editedRoute:", editedRoute);
//   updatedStops[index][key] = value;
//   console.log(`Updated stop ${index} - ${key}:`, value);
//   setEditedRoute(prev => ({
//     ...prev,
//     stop_demands: updatedStops
//   }));
// };

const handleStopChange = (index, key, value) => {
  setEditedRoute(prev => {
    const updatedStops = [...prev.stop_demands];
    updatedStops[index][key] = value;
    
    // Calculate duration immediately with updated stops
    operations.fetchDuration(
      prev.origin,
      prev.destination,
      updatedStops
    );

    return { ...prev, stop_demands: updatedStops };
  });
};

const handleUpdateRoute = async () => {
  if (changesMade) {
    setConfirmEditOpen(true);
    return;
  }
  // Validate stops before proceeding
  if (!operations.validateStops(editedRoute.stop_demands,editedRoute.preload_demand)) {
    setSnackbar({
      open: true,
      message: stopsError,
      severity: "error"
    });
    return;
  }
  const token = localStorage.getItem("token");
  // console.log("editedRoute1:", editedRoute);
  if (!editedRoute?.routeID || !Array.isArray(editedRoute?.stop_demands)) {
    alert("Missing route data.");
    // console.log("editedRoute2:", editedRoute);

    return;
  }

  try {
    const payload = {
      routeID: editedRoute.routeID,
      vehicle_type: editedRoute.vehicle_type,
    vehicle_capacity: editedRoute.vehicle_capacity,
      preloaded_demand: editedRoute.preload_demand || 0,
      start_date: editedRoute.start_date, 
      duration: editedRoute.duration,
      stop_demands: editedRoute.stop_demands.map((stop) => ({
        name: stop.name,
        coordinates: stop.coordinates,
        drop_demand: stop.drop_demand || 0,
        pickup_demand: stop.pickup_demand || 0,
        priority: stop.priority || 1
      }))
    };

    console.log("Sending payload to backend:", payload);

    const response = await axios.post(
      `${config.API_BASE_URL}/updatePlannedRoute`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("updatePlannedRoute response:", response);

    if (response.data.detail === "Route details updated successfully") {
      // alert("Route updated successfully!");
      setSnackbar({
        open: true,
        message: "Route details updated successfully!",
        severity: "success"
      });
      setEditDialogOpen(false);
      setChangesMade(false);
      fetchData(); // Optionally refresh the route list
    } else {
      alert("Unexpected response: " + response.data.detail);
    }
  } catch (err) {
    console.error("Error updating route:", err);
    setSnackbar({
      open: true,
      message: "Failed to update route details",
      severity: "error"
    });
  }
};

const handleRemoveStop = (index) => {
  // Your logic to remove a stop at the given index
  const updatedStops = editedRoute.stop_demands.filter((_, i) => i !== index);
  
  setEditedRoute(prev => ({
    ...prev,
    stop_demands: updatedStops
  }));

  // Trigger duration recalculation
  operations.fetchDuration(
    editedRoute.origin,
    editedRoute.destination,
    updatedStops
  );
};

const handleAddStop = () => {
  setEditedRoute(prev => {
    const newStop = { name: '', drop_demand: 0, pickup_demand: 0, priority: 1 };
    const updatedStops = [...prev.stop_demands, newStop];
    
    operations.fetchDuration(
      prev.origin,
      prev.destination,
      updatedStops
    );

    return { ...prev, stop_demands: updatedStops };
  });
};

const handleDeleteClick = (index, stop) => {
  setStopToDelete({ index, name: stop.name });
  setConfirmOpen(true);
};

const handleConfirmDelete = () => {
  if (stopToDelete.index !== null) {
    handleRemoveStop(stopToDelete.index);
  }
  setConfirmOpen(false);
};
useEffect(() => {
  if (editedRoute?.start_date && editedRoute?.duration) {
    const calculatedEndDate = new Date(
      new Date(editedRoute.start_date) + 
      editedRoute.duration * 60 * 60 * 1000 // Convert hours to milliseconds
    );
    
    setEditedRoute(prev => ({
      ...prev,
      end_date : calculatedEndDate.toISOString()
    }));
  }
}, [editedRoute?.start_date, editedRoute?.duration]);
useEffect(() => {
  const fetchVehicles = async () => {
    if (editDialogOpen && editedRoute?.start_date ) {
      console.log("Initiating vehicle fetch...");
      try {
    
         const token = localStorage.getItem("token");
         const formattedDate = new Date(editedRoute.start_date)
         .toISOString()
         .split("T")[0];
        const response = await axios.post(
          `${config.API_BASE_URL}/getAvailableVehicles`,
          {
            start_date: formattedDate,
            preloaded_demand: editedRoute.preload_demand
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const uniqueVehicles = response.data.vehicles?.reduce((acc, vehicle) => {
          if (!acc.some(v => v.LicenseNo === vehicle.LicenseNo)) {
            acc.push(vehicle);
          }
          return acc;
        }, []) || [];

        setVehicles(uniqueVehicles);
      } catch (error) {
        console.error("Vehicle fetch failed:", error);
        setVehicles([]);
      }
    }
  };

  fetchVehicles();
}, [editDialogOpen, editedRoute?.start_date, editedRoute?.preload_demand]);


 
useEffect(() => {
  setVehicleOptions(filterAvailableVehicles());
}, [vehicles, editedRoute?.preload_demand, editedRoute?.stop_demands]);
useEffect(() => {
  if (editDialogOpen && editedRoute) {
    getAvailableVehicles();
    
    setVehicles([]); 
  }
}, [editDialogOpen, editedRoute]);
// const filterAvailableVehicles = () => {
//   if ( !vehicles?.length) return [];

//   // Create a map using LicenseNo as unique key
//   const uniqueMap = new Map();
  
//   vehicles.forEach(vehicle => {
//     if (!uniqueMap.has(vehicle.LicenseNo)) {
//       uniqueMap.set(vehicle.LicenseNo, vehicle);
//     }
//   });

//   // Convert back to array
//   const uniqueVehicles = Array.from(uniqueMap.values());

//   // Rest of your filtering logic
//   const totalDemand = editedRoute.preload_demand + 
//     editedRoute.stop_demands.reduce((sum, stop) => sum + (stop.pickup_demand || 0), 0);

//   return uniqueVehicles
//     .filter(vehicle => vehicle.VehicleType === (totalDemand <= 15 ? 
//       "Light-duty trucks" : "Heavy-duty trucks"))
//     .map(vehicle => ({
//       id: vehicle.LicenseNo, // Use license number as ID
//       label: `${vehicle.VehicleType} (${vehicle.Quantity} tons) - ${vehicle.LicenseNo}`,
//       capacity: vehicle.Quantity,
//       type: vehicle.VehicleType
//     }));
// };
const filterAvailableVehicles = () => {
  if (!vehicles?.length) return [];

  // Double-check deduplication using Map
  const licenseMap = new Map();
  vehicles.forEach(vehicle => {
    if (!licenseMap.has(vehicle.LicenseNo)) {
      licenseMap.set(vehicle.LicenseNo, vehicle);
    }
  });

  const uniqueVehicles = Array.from(licenseMap.values());
  
  // Calculate total demand
  const totalDemand = (editedRoute?.preload_demand || 0) + 
    (editedRoute?.stop_demands?.reduce((sum, stop) => sum + (stop.pickup_demand || 0), 0) || 0);

  return uniqueVehicles
    .filter(vehicle => 
      vehicle.VehicleType === (totalDemand <= 15 ? 
        "Light-duty trucks" : "Heavy-duty trucks")
    )
    .map(vehicle => ({
      id: vehicle.LicenseNo,
      label: `${vehicle.VehicleType} (${vehicle.Quantity} tons) - ${vehicle.LicenseNo}`,
      capacity: vehicle.Quantity,
      type: vehicle.VehicleType
    }));
};

  return (
    <>
      <NavBar />
      <Breadcrumbs1 />
      <Paper  id="paper" sx={{ border: "1px solid  #e0e0e0", margin: "auto",padding:2 }}>
        {/* Tabs for Drivers, Vehicles, and Fleet Details */}
        <Box className="filter-container" id="filter-container"> 
          <Typography variant="h5" sx={{ color: "#156272" }} gutterBottom id="page-header">
            <FaUserTie className="role-icon" /> Manager Dashboard
          </Typography>
         
          <Box sx={{display:'flex',gap:1}} id="box">
                   <TextField className="search-add-container" id="search-add-container"
          
  label="Search"
  variant="outlined"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  smallWidth
  sx={{
    marginBottom: "9px",
    "& .MuiOutlinedInput-input": {
      padding: "6px 10px", // Reduce top/bottom and left/right padding
      fontSize: "12px", // Optional: Smaller font if needed
    },
    
    "& .MuiOutlinedInput-root": {
      minHeight: "37px", // Reduce total height of input
    },
  }}
  
/>

          <Tabs id="tabs" value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} sx={{borderRadius:"4px",border:"1px solid #dcdcdc"}}>
            <Tab id="tab" label="Drivers" sx={{
                backgroundColor: tabIndex === "Drivers" ? "#388e3c" : "#dcdcdc4a!important", // Change the background color of active tab
                color: tabIndex === "Drivers" ? "white" : "#1976d2", // Change text color for active tab
                border:"1px solid #dcdcdc",padding:"5px 15px",
                "&.MuiTab-root": { 
                  minHeight: "39px !important",
                },
                 
              }} />
            <Tab id="tab1" label="Vehicles"   sx={{
                backgroundColor: tabIndex === "Vehicles" ? "#388e3c" : "#dcdcdc4a!important", // Change the background color of active tab
                color: tabIndex === "Vehicles" ? "white" : "#1976d2", // Change text color for active tab
                border:"1px solid #dcdcdc",padding:"5px 15px",
                "&.MuiTab-root": { 
                  minHeight: "39px !important",
                },
                 
              }}/>
            <Tab id="tab" label="Routes"  sx={{
                backgroundColor: tabIndex === "Routes" ? "#388e3c" : "#dcdcdc4a!important", // Change the background color of active tab
                color: tabIndex === "Routes" ? "white" : "#1976d2", // Change text color for active tab
                border:"1px solid #dcdcdc",padding:"5px 15px",
                "&.MuiTab-root": { 
                  minHeight: "39px !important",
                },
                 
              }}/>
          </Tabs>
        </Box>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : data.length === 0 ? (
          <Typography>No data found.</Typography>
        ) : (
          <TableContainer id="table-container" component={Paper} sx={{ maxHeight:"60vh", overflowY: "auto" , boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <Table id="id" sx={{ minWidth: 650 ,borderCollapse: "collapse" }}>
              <TableHead id="table-head"sx={{ position: "sticky", top: 0, backgroundColor: "#5e87b0 ", zIndex: 1 }}>
                <TableRow id="table-row">
                  {tabIndex === 0 && (
                    <>
                      <TableCell id="user-sno" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>SNo</TableCell>
                      <TableCell id="user-drivername" sx={{ color: "white",borderRight: "1px solid #bbb" }}>Driver Name</TableCell>
                      <TableCell  id="user-sno" sx={{ color: "white",borderRight: "1px solid #bbb" }}>Email</TableCell>
                      <TableCell id="user-date_joining" sx={{ color: "white" ,borderRight: "1px solid #bbb"}}>Date of Joining</TableCell>
                      {/* <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>Vehicle Status</TableCell> */}
                      {/* <TableCell sx={{ color: "white" ,borderRight: "1px solid #bbb"}}>Route Status</TableCell> */}
                      <TableCell id="user-availability" sx={{ color: "white" ,borderRight: "1px solid #bbb"}}>Driver Availability</TableCell>
                    </>
                  )}
                  {tabIndex === 1 && (
                    <>
                      <TableCell id="vehicle-sno" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>SNo</TableCell>
                      <TableCell id="vehicle-licenseno" sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Vehicle LicenseNo</TableCell>
                      <TableCell id="vehicle-name" sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Vehicle Name</TableCell>
                      <TableCell id="vehicle-fueltype" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Fuel Type</TableCell>
                      <TableCell  id="vehicle-co2"sx={{ color: "white" , borderRight: "1px solid #bbb" }}>ExhaustCo2(lbs)</TableCell>
                      <TableCell id="vehicle-mileage" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Mileage(miles)</TableCell>
                      <TableCell id="vehicle-capacity" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Vehicle Capacity(tones)</TableCell>
                      <TableCell id="vehicle-status" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Vehicle Status</TableCell>
                      <TableCell id="vehicle-assigndriver" sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Assigned Driver</TableCell>
                    </>
                  )}
                  {tabIndex === 2 && (
                    <>
                        <TableCell id="sno" sx={{ color: "white", borderRight: "1px solid #bbb"  }}>SNo</TableCell>
                        <TableCell id="routeid" sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Route ID</TableCell>
                        <TableCell id="vehicle-licenseno" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Vehicle LicenseNo</TableCell>
                       
                        <TableCell id="origin" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>
                          <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: 6 }} />Origin</TableCell>
                        <TableCell id="destination" sx={{ color: "white", borderRight: "1px solid #bbb"  }}>
                        <FontAwesomeIcon icon={faFlagCheckered} style={{ marginRight: 6 }} /> Destination</TableCell>
                        <TableCell id="status" sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Status</TableCell>
                        <TableCell id="co2" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Carbon Emission(lbs)</TableCell>
                        <TableCell id="crated-date" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Created Date</TableCell>
                        <TableCell id="updaed-route" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Update/Edit Route</TableCell>
                        <TableCell id="summary" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Summary</TableCell>
                        <TableCell id="driver" sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Driver</TableCell>
                        <TableCell id="assign-driver" sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Assign Driver</TableCell>
                    </>
                    )}

                </TableRow>
              </TableHead>
              {Array.isArray(data) && data.length > 0 ? (
              <TableBody id="table-body">
                {filteredData
                  .sort((a, b) => new Date(b.joining_date) - new Date(a.joining_date))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => (
                  <TableRow id="table-row" key={item.id || index}>
                    {tabIndex === 0 && (
                      <>
                        <TableCell id="sno">{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell id="driver_name">{item.driver_name}</TableCell>
                        <TableCell id="driver-email">{item.email}</TableCell>
                        <TableCell id="driver-joiningdate">{item.joining_date}</TableCell>
                        {/* <TableCell>{item.vehicle_status}</TableCell> */}
                        {/* <TableCell>{item.route_status}</TableCell> */}
                        {/* <TableCell 
                          sx={{
                            color: item.route_status === "Not Assigned" && item.vehicle_status === "Not Assigned" 
                            ? "#7ade7a !important"
                            : "#cf6473 !important",
                            fontWeight: "bold"
                          }}
                        >
                          {item.route_status === "Not Assigned" && item.vehicle_status === "Not Assigned" 
                            ? "Available" 
                            : "Unavailable"}
                        </TableCell> */}
                        <TableCell id="driver-status" sx={{
                              color: item.driver_status === "In Transit" ?'#cf6473  !important' : '#7ade7a !important',
                              fontWeight: 'bold !important',
                             
                            }}>{item.driver_status}</TableCell>
                      </>

                    )}
                    {tabIndex === 1 && (
                      <>
                         <TableCell id="sno">{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell id="license">
                        <Tooltip title={item.LicenseNo || "No LicenseNo available"} arrow>
                        <span>{item.LicenseNo}</span>
                            {/* <span>{item.VehicleID ? item.VehicleID.slice(-5) : "N/A"}</span> */}
                        </Tooltip>
                        </TableCell>
                        <TableCell id="vehicletype">{item.VehicleType}</TableCell>
                        <TableCell id="fuelype">{item.FuelType}</TableCell>
                        <TableCell id="exhaustco2">{item.ExhaustCO2}</TableCell>
                        <TableCell id="mileage">{item.Mileage}</TableCell>
                        <TableCell id="vehiclecapacity">{item.VehicleCapacity}</TableCell>
                        <TableCell  id="status" sx={{
                              color: item["Vehicle Status"] === "In Transit" ? '#7ade7a !important' : '#cf6473 !important',
                              fontWeight: 'bold !important',
                             
                            }}>{item["Vehicle Status"]}</TableCell>

                        <TableCell id="assigned">
                            {item["Vehicle Status"] === "In Transit" ? "Assigned" : "Not Assigned"}
                          </TableCell>


                      </>
                    )}
                   {tabIndex === 2 && (
                    <>
                        <TableCell id="sno">{page * rowsPerPage + index + 1}</TableCell>
                        
                        <TableCell>
                        <Tooltip title={item.routeID || "N/A"} arrow>
                            <span>{item.routeID ? item.routeID.slice(-5) : "N/A"}</span>
                        </Tooltip>
                        </TableCell >
                        <TableCell id="license1">
                        <Tooltip title={item.LicenseNo || "No LicenseNo available"} arrow>
                        <span>{item.LicenseNo}</span>
                            {/* <span>{item.vehicle_id ? item.vehicle_id.slice(-5) : "N/A"}</span> */}
                        </Tooltip>
                        </TableCell>
                        
                        <TableCell id="origin"
                         sx={{ 
                            minWidth: "80px", // Ensures a minimum width
                            maxWidth: "15vw", // Sets max width relative to viewport
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            <Tooltip title={item.origin || "N/A"} arrow>
                              <span>{item.origin}</span>
                            </Tooltip>
                        </TableCell>
                        <TableCell id="destination" sx={{minWidth: "80px", 
                        maxWidth: "15vw", 
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>
                        <Tooltip title={item.destination || "N/A"} arrow>
                        <span>{item.destination}</span>
                        </Tooltip>
                    </TableCell>
                        <TableCell id="status1">{item.status}</TableCell>
                        <TableCell id="co2_!">{item.carbon_emission || "N/A"}</TableCell>
                        <TableCell id="createdate1">{new Date(item.creationDate).toLocaleDateString()}</TableCell>
                        <TableCell>
  <Tooltip
    title={
      item.updatedAt 
        ?"updated"
        : "Not updated"
    }
  >
    {/* Wrap the Button in a span to ensure disabled buttons still show tooltips */}
    <span>
      <Button
        sx={{ fontSize: "12px" }}
        onClick={() => handleEditRoute(item)}
        disabled={item.status !== "not started"} // Disable for started or completed routes
      >
       {item.isEdited ? "Edited" : "Edit"}
      </Button>
    </span>
  </Tooltip>
</TableCell>

                        <TableCell id="completed">
                          <Button
                            sx={{ fontSize: "12px" }}
                            onClick={() => handleOpenSummary(item)}
                            color={item.summaryAdded ? "secondary" : "primary"}
                            disabled={item.status !== "completed"} // Disable for "not started" & "started"
                          >
                            {item.summaryAdded ? "Edit Summary" : "Add Summary"}
                          </Button>
                        </TableCell>

                        {/* <TableCell>
                        <Button sx={{fontSize:"12px"}}
                            onClick={() => handleOpenSummary(item)}
                            color={item.summaryAdded ? "secondary" : "primary"}
                        >
                            {item.summaryAdded ? "Summary Added" : "Add Summary"}
                        </Button>
                        </TableCell> */}
                       {/* <TableCell
                        sx={{
                          backgroundColor: item.driver_id ? "#bde2bd" : "#e9a7a78c", // Green if assigned, Red if not
                          color: "white", // Ensure text remains visible
                          fontWeight: "bold",
                        }}
                      >
                        {item.driver}
                      </TableCell> */}
                       {/* <TableCell
                        sx={{
                          backgroundColor: item.driver_id ? "#bde2bd" : "#e9a7a78c", // Green if assigned, Red if not
                          color: "white", // Ensure text remains visible
                          fontWeight: "bold",
                        }}
                      >
                       {item.driver || "Not Assigned"}
                      </TableCell> */}
                     <TableCell id="selectdriver"
  sx={{
    backgroundColor: item.driver_id ? "#bde2bd" : "#e9a7a78c", // Green if assigned, Red if not
    color: "white", // Ensure text remains visible
    fontWeight: "bold",
    opacity: item.status === "completed" ? 0.5 : 1, // Dim the cell if reassignment is disabled
  }}
>
{/* {selectedDrivers[item.routeID] || "Not Assigned"} */}
{item.driver}
</TableCell>


                        <TableCell id="assigndriver">
                       {/* <Autocomplete
                            options={availableDrivers.filter((driver) => driver.route_status === "Not Assigned")}
                            getOptionLabel={(option) => option.driver_name || ""}
                            value={selectedDrivers[item.routeID] || null}
                            onChange={(event, newValue) => {
                                handleAssignDriver(newValue?.driver_id, item.routeID);
                            }}
                            sx={{fontSize:"10px",
                             
                              "&.MuiAutocomplete-root": { 
                                fontSize: "10px !important",
                              },
                            }}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label={selectedDrivers[item.routeID] ? "Reassign Driver" : "Select Driver"} 
                                    variant="outlined" 
                                />
                            )}
                        /> */}
                        {/* <Autocomplete
  options={availableDrivers.filter((driver) => driver.route_status === "Not Assigned")}
  getOptionLabel={(option) => option.driver_name || ""}
  value={selectedDrivers[item.routeID] || null}
  onChange={(event, newValue) => {
    handleAssignDriver(newValue?.driver_id, item.routeID);
  }}
  sx={{
    fontSize: "10px",
    "& .MuiInputBase-root": {
      fontSize: "10px", // Font size for the input field
    },
    "& .MuiAutocomplete-listbox": {
      fontSize: "10px", // Font size for dropdown list items
    },
    "& .MuiAutocomplete-endAdornment":{
      right:"2px !important",
    }
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label={selectedDrivers[item.routeID] ? "Reassign Driver" : "Select Driver"}
      variant="outlined"
      InputLabelProps={{
        sx: { fontSize: "10px" }, // Reduce font size of label
      }}
      inputProps={{
        ...params.inputProps,
        sx: { fontSize: "10px" }, // Reduce font size inside input field
      }}
    />
  )}
  componentsProps={{
    paper: { sx: { fontSize: "10px" } }, // Reduce font size in dropdown list
  }}
/> */}
<Tooltip
   title={
    item.status === "started"
      ? "Route has already started, driver cannot be reassigned."
      : item.status === "completed"
      ? "Route is completed, driver cannot be reassigned."
      : ""
  }
  arrow
  disableInteractive
>
  <span>
<Autocomplete
  options={availableDrivers.filter((driver) => driver. driver_status === "Available")}
  //options={availableDrivers}
  getOptionLabel={(option) => option.driver_name || ""}
  value={null} // Keeps dropdown empty after selection
//   onChange={(event, newValue) => {
//     handleDriverSelectChange(event, newValue, item.routeID);
//  }}
onChange={(event, newValue) => {
  if (item.status === "started" || item.status === "completed") {
    setSnackbar({
      open: true,
      message: item.status === "started" 
        ? "Route has already started, driver cannot be reassigned." 
        : "Route is completed, driver cannot be reassigned.",
      severity: "info"
    });
  } else {
    handleDriverSelectChange(event, newValue, item.routeID);
  }
}}
  disabled={item.status === "completed"|| item.status === "started"} 
  sx={{
    fontSize: "10px",
    "& .MuiInputBase-root": { fontSize: "10px" },
    "& .MuiAutocomplete-listbox": { fontSize: "10px" },
    "& .MuiAutocomplete-endAdornment": { right: "2px !important" },
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label={selectedDrivers[item.routeID] ? "Reassign Driver" : "Select Driver"}
      variant="outlined"
      InputLabelProps={{ sx: { fontSize: "10px" } }}
      inputProps={{ ...params.inputProps, sx: { fontSize: "10px" } }}
    />
  )}
  componentsProps={{ paper: { sx: { fontSize: "10px" } } }}
/>
</span>
</Tooltip>

    </TableCell>

    {/* Snackbar for success messages */}
    <Snackbar id="snackbar"
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
 
                  
                   

                    </>
                    )}

                  </TableRow>
                ))}
              </TableBody>
              ) : (
                <Typography>No data found.</Typography>
              )}
            </Table>
          </TableContainer>
          
         )}
         </Paper>
           {/* Pagination */}
      <TablePagination id="pagination"
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
       {/* Confirmation Dialog for Reassignment */}
    <Dialog id="dialog" open={confirmReassign} onClose={() => setConfirmReassign(false)}>
      <DialogTitle id="dialog_title">Reassign Driver</DialogTitle>
      <DialogContent id="dialog_Content">
        Are you sure you want to reassign the driver?
      </DialogContent>
      <DialogActions id="dialod_actions">
        <Button onClick={() => setConfirmReassign(false)} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            assignDriver(selectedRoute.newDriver, selectedRoute.routeID);
            setConfirmReassign(false);
          }}
          color="primary"
        >
          Yes, Reassign
        </Button>
      </DialogActions>
    </Dialog>
 
    <Dialog id="open"
  open={openDialog}
  onClose={() => setOpenDialog(false)}
>
  <DialogTitle id="dialog-title">Confirm Driver Reassignment</DialogTitle>
  <DialogContent id="dialog_content">
    <DialogContentText id="dialog-text">
      Are you sure you want to Reassign {selectedDriver?.driver_name} to this route?
    </DialogContentText>
  </DialogContent>
  <DialogActions id="dialogaction">
    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
    <Button onClick={handleConfirmAssignment} color="primary">Confirm</Button>
  </DialogActions>
</Dialog>



      <Dialog id="dialog1" open={open} onClose={() => setOpen(false)} fullWidth   maxWidth="xs">
      <DialogTitle id="dialogetitle1">
            {selectedConsignment?.summaryAdded ? "View/Edit Summary" : "Add Consignment Summary"}
        </DialogTitle>
      <DialogContent id="dialogecontent">
        {["delayFactor", "rerouteFactor", "accidentFactor", "stockMismatchFactor"].map((field) => (
          <FormControl key={field} fullWidth margin="dense">
            <InputLabel>{field.replace(/([A-Z])/g, " $1").trim()}</InputLabel>
            <Select
          name={field}
          value={summary[field]}
          label={field.replace(/([A-Z])/g, " $1").trim()}
          onChange={handleChange}
          // disabled={!isManager} // Only managers can edit
        >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        ))}
         {/* Date Field (Read-Only) */}
    {/* <TextField
      fullWidth
      margin="dense"
      label="Last Edited Date"
      type="date"
      value={summary.editedDate}
      InputProps={{ readOnly: true }}
    /> */}
      </DialogContent>
      <DialogActions>
    <Button onClick={() => setOpen(false)} color="secondary">Close</Button>
    { <Button onClick={handleSubmit} color="primary">Save</Button>}
  </DialogActions>
    </Dialog>
    <Dialog 
  open={editDialogOpen} 
  onClose={() => setEditDialogOpen(false)} 
  maxWidth="md" 
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 2,
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
    }
  }}
>
  <DialogTitle sx={{ 
    bgcolor: '#5e87b0', 
    color: 'white', 
  
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.1rem'
  }}>
    <DirectionsCarIcon sx={{ mr: 1, fontSize: '1.3rem' }} />
    Update Route Details
    <IconButton 
      sx={{ 
        color: 'white',
        ml: 'auto',
        p: 0.5,
        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
      }}
      onClick={() => setEditDialogOpen(false)}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </DialogTitle>

  <DialogContent sx={{ m:2.5}}>
    {/* Origin & Destination */}
    <Grid container spacing={2} sx={{ mb: 2,mt:2 }}>
      <Grid item xs={6}>
       
        <TextField
          fullWidth
          label="Origin"
          size="small"
          value={editedRoute?.origin?.name || ''}
          InputProps={{
            readOnly: true,
            // startAdornment: <TripOriginIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f5f5f5',
              borderRadius: 1,
              color:'#8c8787',
            }
          }}
        />
      </Grid>
      <Grid item xs={6}>
       
        <TextField
          fullWidth
          label="Destination"
          size="small"
          value={editedRoute?.destination?.name || ''}
          InputProps={{
            readOnly: true,
            // startAdornment: <WhereToVoteIcon fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f5f5f5',
              borderRadius: 1,
              color:'#8c8787',
            }
          }}
        />
      </Grid>
    </Grid>

    {/* Stops Table */}
    <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', mb: 2 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600,  width: '5%' }}>S.no</TableCell>
            <TableCell sx={{ fontWeight: 600, width: '35%' }}>Stop Name</TableCell>
            <TableCell sx={{ fontWeight: 600, width: '15%' }}>Drop Demand</TableCell>
            <TableCell sx={{ fontWeight: 600, width: '15%' }}>Pickup Demand</TableCell>
            <TableCell sx={{ fontWeight: 600, width: '10%' }}>Priority</TableCell>
            {/* <TableCell sx={{ fontWeight: 600, width: '10%' }}>Actions</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {editedRoute?.stop_demands?.map((stop, index) => (
            <TableRow key={index} hover>
              <TableCell >{index + 1}</TableCell>
              <TableCell >
                <TextField
                  value={stop.name}
                  size="small"
                  fullWidth
                  onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                />
              </TableCell>
              <TableCell >
                <TextField
                  value={stop.drop_demand}
                  type="number"
                  size="small"
                  onChange={(e) => handleStopChange(index, 'drop_demand', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">tons</InputAdornment>,
                  }}
                />
              </TableCell>
              <TableCell >
                <TextField
                  value={stop.pickup_demand}
                  type="number"
                  size="small"
                  onChange={(e) => handleStopChange(index, 'pickup_demand', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">tons</InputAdornment>,
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={stop.priority}
                  type="number"
                  size="small"
                  onChange={(e) => handleStopChange(index, 'priority', e.target.value)}
                />
              </TableCell>
              {/* <TableCell sx={{ textAlign: 'center' }}>
                <IconButton size="small" onClick={() => handleDeleteClick(index, stop)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
 
    {/* Date Section */}
    <Grid container spacing={2} sx={{ mb: 2,mt:2.5 ,ml:1}}>
      <Grid item xs={6}>
       
        <DatePicker
          selected={editedRoute?.start_date ? new Date(editedRoute.start_date) : null}
          onChange={(date) => {
            if (date) {
              setEditedRoute(prev => ({
                ...prev,
                start_date: date.toISOString()
              }));
            }
          }}
          minDate={new Date()}
          dateFormat="dd/MM/yyyy"
          customInput={
            <TextField
              size="small"
              label="Start Date"
             
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                  
                }
              }}
            />
          }
        />
      </Grid>
      <Grid item xs={6}>
        
        <TextField
          value={editedRoute?.end_date 
            ? new Date(editedRoute.end_date).toLocaleString() 
            : 'Calculating...'}
          size="small"
       
          label="End Date"
          InputProps={{ readOnly: true }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f5f5f5',color:'#8c8787',
              borderRadius: 1,
           
            }
          }}
        />
      </Grid>
    </Grid>

    {/* Demand and Vehicle Section */}
    <Grid container spacing={2} sx={{mt:2.5,ml:1}}>
      <Grid item xs={6}>
        
        <TextField
          value={editedRoute?.preload_demand || 0}
          size="small"
          
          type="number"
        
          label="Preload Demand"
          onChange={(e) => {setEditedRoute({...editedRoute, preload_demand: e.target.value});
          setStopsError('');
        }}
          InputProps={{
            endAdornment: <InputAdornment position="end">tons</InputAdornment>,
            sx: { 
              bgcolor: '#f5f5f5',
              borderRadius: 1,
             
            }
          }}
        />
         {stopsError && (
  <Alert severity="error" sx={{ mt: 2,width:"small" }}>
    {stopsError}
  </Alert>
)}
      </Grid>
      <Grid item xs={6}>
       
        <TextField
          value={editedRoute?.vehicle_type || 'Not selected'}
          size="small"
          
          label="Selected Vehicle"
          InputProps={{ readOnly: true }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f5f5f5',
              borderRadius: 1,
             color:"#8e8787"
            }
          }}
        />
      </Grid>
    </Grid>

    {/* Vehicle Selection */}
    <Box sx={{ mt: 2 }}>
      
      <Autocomplete
        options={vehicleOptions}
        size="small"
        fullWidth
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search vehicles..."
  label="Search Available Vehicles"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f5f5f5',
                borderRadius: 1,
              color:"#8e8787"
              }
            }}
          />
        )}
      />
    </Box>
  </DialogContent>

  <DialogActions sx={{ px: 2, py: 1, borderTop: '1px solid #e0e0e0' }}>
    <Button 
      size="small"
      onClick={() => setEditDialogOpen(false)}
      sx={{ 
        color: 'text.secondary',
        px: 2,
        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
      }}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      size="small"
      onClick={handleUpdateRoute}
      sx={{ 
        bgcolor: '#5e87b0',
        px: 2,
        '&:hover': { bgcolor: '#476885' }
      }}
    >
      Save
    </Button>
  </DialogActions>
</Dialog>
     {/* Confirmation Dialog */}
     <Dialog id="confirmdialog"
    open={confirmOpen}
    onClose={() => setConfirmOpen(false)}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 1 } }}
  >
    <DialogTitle sx={{ fontSize: '1rem', py: 1.5, fontWeight: 500 }} id="confirmtitle">
      Confirm Stop Deletion
    </DialogTitle>
    <DialogContent sx={{ py: 1 }} id="confirmcontent">
      <Typography variant="body2">
        Are you sure you want to delete <strong>{stopToDelete?.name || 'this stop'}</strong>?
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 2, py: 1 }} id="confirmactions">
      <Button
        onClick={() => setConfirmOpen(false)}
        size="small"
        sx={{ fontSize: '0.8125rem' }}
      >
        Cancel
      </Button>
      <Button id="confirmdelete"
        onClick={handleConfirmDelete}
        color="error"
        variant="contained"
        size="small"
        sx={{ fontSize: '0.8125rem' }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>

    </>
  );
};

export default Dashboard;
