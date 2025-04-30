import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaBell, FaCog, FaHome, FaTruckMoving, FaUserShield,FaUserTie,FaUserCog } from 'react-icons/fa';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Alert ,DialogContentText,
    Typography, CircularProgress, Box, Tabs, Tab, Tooltip, Button, Dialog,TablePagination,Snackbar,
    DialogTitle, DialogContent, DialogActions, InputLabel, Select, MenuItem,TextField, Autocomplete, IconButton,
    InputAdornment
} from "@mui/material";
import { FormControl } from "@mui/material";
import { faMapMarkerAlt, faFlagCheckered } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
const Dashboard = () => {
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
    if (!token) {
      navigate("/sessionexpired");
      setLoading(false);
      return;
    }
  
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
  
      alert("Summary updated successfully.");
      setOpen(false);
      fetchData(); // reload your table
    } catch (err) {
      console.error("Error updating summary:", err);
      alert("Failed to update summary.");
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
        if (!token) {
          navigate("/sessionexpired");
            return;
        }
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
      if (!token) {
        navigate("/sessionexpired");
        return;
      }
  
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
// const filteredData = data.filter((item) => {
//   const searchValue = searchQuery.toLowerCase();
//   return Object.values(item).some(
//     (value) => value && value.toString().toLowerCase().includes(searchValue)
//   );
// });

const filteredData = data.filter((item) => {
  const searchValue = searchQuery.trim().toLowerCase();

  const driverAvailability =
    item.route_status === "Not Assigned" && item["Vehicle Status"] === "Not Assigned"
      ? "available"
      : "unavailable";

  const assignedDriver =
    item["Vehicle Status"] === "In Transit" ? "Assigned" : "Not Assigned";

  const combinedValues = [
    ...Object.values(item).map((val) =>
      val != null ? val.toString().toLowerCase() : ""
    ),
    driverAvailability.toLowerCase(),
    assignedDriver.toLowerCase(),
  ];

  return combinedValues.some((val) => val.startsWith(searchValue));
});
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
    
    // Set edited route with full data, ensuring stop_demands is defined.
    setEditedRoute({
      ...fullRouteData,
      stop_demands: fullRouteData.stop_demands || [],
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



const handleStopChange = (index, key, value) => {
  const updatedStops = [...editedRoute.stop_demands];
  console.log("editedRoute:", editedRoute);
  updatedStops[index][key] = value;
  console.log(`Updated stop ${index} - ${key}:`, value);
  setEditedRoute({ ...editedRoute, stop_demands: updatedStops });
};

const handleUpdateRoute = async () => {
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
      alert("Route updated successfully!");
      setEditDialogOpen(false);
      fetchData(); // Optionally refresh the route list
    } else {
      alert("Unexpected response: " + response.data.detail);
    }
  } catch (err) {
    console.error("Error updating route:", err);
    alert("Failed to update the route.");
  }
};

const handleRemoveStop = (index) => {
  // Your logic to remove a stop at the given index
  const updatedStops = [...editedRoute.stop_demands];
  updatedStops.splice(index, 1);
  setEditedRoute({
    ...editedRoute,
    stop_demands: updatedStops
  });
};

const handleAddStop = () => {
  // Your logic to add a new stop
  const newStop = {
    name: '',
    drop_demand: 0,
    pickup_demand: 0,
    priority: 1
  };
  
  setEditedRoute({
    ...editedRoute,
    stop_demands: [...(editedRoute.stop_demands || []), newStop]
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
        Edit
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
                            {item.summaryAdded ? "Summary Added" : "Add Summary"}
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
        count={data.length}
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



      <Dialog id="dialog1" open={open} onClose={() => setOpen(false)}>
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

    {/* pop up Edit/Update Planned Route */}
   <Dialog id="dialog3"
  open={editDialogOpen}
  onClose={() => setEditDialogOpen(false)}
  maxWidth="md"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 1,
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
      maxHeight: '98vh',
    }
  }}
>
  <DialogTitle id="dialogtitle3"
    sx={{
      bgcolor: '#5e87b0;',
      color: 'white',
      fontWeight: 600,
      py: 1,
      px: 2,
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}
  >
    <Box display="flex" alignItems="center">
      <DirectionsCarIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
      Update Route Details
    </Box>
    <IconButton
      edge="end"
      color="inherit"
      onClick={() => setEditDialogOpen(false)}
      aria-label="close"
      size="small"
      sx={{
        '&:hover': { bgcolor: 'primary.dark' }
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </DialogTitle>

  <DialogContent  id="dialog-content3" sx={{ py: 1, px: 2 }}>
    {editedRoute?.stop_demands?.length > 0 ? (
      <Box>
        <Typography variant="subtitle2" fontWeight={500} mb={1} color="text.secondary">
          <LocationOnIcon color="primary" sx={{ fontSize: '1rem', mr: 0.5 }} />
          Stop Points Configuration
        </Typography>
        
        <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 0.5 }}>
          {editedRoute.stop_demands.map((stop, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 1,
                mb: 1,
                borderRadius: 1,
                borderLeft: '3px solid',
                borderColor: 'primary.main',
                bgcolor: 'background.paper'
              }}
            >
              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <TextField
                  label="Stop Name"
                  value={stop.name}
                  onChange={(e) => handleStopChange(index, "name", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ minWidth: 150 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PlaceIcon sx={{ fontSize: '1rem' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Drop Demand"
                  type="number"
                  value={stop.drop_demand}
                  onChange={(e) => handleStopChange(index, "drop_demand", e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ width: 120 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">tones</InputAdornment>,
                  }}
                />
                <TextField
                  label="Pickup Demand"
                  type="number"
                  value={stop.pickup_demand}
                  onChange={(e) => handleStopChange(index, "pickup_demand", e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ width: 120 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">tones</InputAdornment>,
                  }}
                />
                <TextField
                  label="Priority"
                  type="number"
                  value={stop.priority}
                  onChange={(e) => handleStopChange(index, "priority", e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ width: 90 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PriorityHighIcon sx={{ fontSize: '1rem' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton id="deletestop"
  color="error"
  onClick={() => handleDeleteClick(index, stop)}
  size="small"
  sx={{
    ml: 'auto',
    '&:hover': { bgcolor: 'error.light' }
  }}
>
  <DeleteOutlineIcon sx={{ fontSize: '1.1rem' }} />
</IconButton>
              </Box>
            </Paper>
          ))}
        </Box>

        <Box mt={1} display="flex" justifyContent="flex-end" id="handlestop">
          <Button id="addstop"
            variant="outlined"
            startIcon={<AddLocationIcon sx={{ fontSize: '1rem' }} />}
            onClick={handleAddStop}
            size="small"
            sx={{ textTransform: 'none', borderRadius: 0.5, fontSize: '0.8125rem' }}
          >
            Add Stop
          </Button>
        </Box>
      </Box>
    ) : (
      <Box id="center"
        textAlign="center"
        py={2}
        sx={{
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <Box sx={{ fontSize: '2rem', color: 'text.disabled', mb: 0.5 }} id="points">
          <LocationOffIcon fontSize="inherit" />
        </Box>
        <Typography variant="body2" color="text.secondary" mb={1}>
          No stop points configured
        </Typography>
        <Button id="add"
          variant="contained"
          startIcon={<AddLocationIcon sx={{ fontSize: '1rem' }} />}
          onClick={handleAddStop}
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 0.5,
            fontSize: '0.8125rem'
          }}
        >
          Add First Stop
        </Button>
      </Box>
    )}
  </DialogContent>

  <DialogActions  id="dialogactions4" sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
    <Button id="open4"
      onClick={() => setEditDialogOpen(false)}
      variant="outlined"
      size="small"
      sx={{
        textTransform: 'none',
        px: 1.5,
        borderRadius: 0.5,
        fontSize: '0.8125rem'
      }}
    >
      Cancel
    </Button>
    <Button id="update4"
      variant="contained"
      onClick={handleUpdateRoute}
      startIcon={<SaveIcon sx={{ fontSize: '1rem' }} />}
      size="small"
      sx={{
        textTransform: 'none',
        px: 1.5,
        borderRadius: 0.5,
        fontSize: '0.8125rem',
        boxShadow: 'none',
        '&:hover': { boxShadow: 'none', bgcolor: 'primary.dark' }
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
