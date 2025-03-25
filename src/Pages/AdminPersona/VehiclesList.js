import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,Tooltip,
    Select, MenuItem, FormControl, InputLabel, IconButton, Snackbar, Alert,TablePagination, Tabs,
    Tab,
    Box,
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import NavBar from "../../Components/NavBar";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import config from "../../config";
import { useNavigate } from 'react-router-dom';

const VehiclesList = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [page, setPage] = useState(0);
      const [filter, setFilter] = useState("All");

     const [activeTab, setActiveTab] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [capacityError, setCapacityError] = useState("");
    
    const getVehicleType = (capacity) => {
        if (capacity === "") return ""; // No selection if empty
        return capacity > 15000 ? "Heavy-duty trucks" : "Light-duty trucks";
    };
    const [newVehicle, setNewVehicle] = useState({
        VehicleType: "",
        FuelType: "",
        ExhaustCO2: "",
        Mileage: "",
        VehicleCapacity: "",
        LicenseNo: "",
        VehicleStatus: "In Transit",
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        fetchVehicles();
    }, []);
    // const filteredvehicles = vehicle.filter(
    //     (user) =>
    //       (filter === "All" || vehicle.FuelType.includes(filter.toLowerCase())) &&
    //     FuelType.name.toLowerCase().includes(searchTerm.toLowerCase())
    //   );
     
    const fetchVehicles = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, authorization failed");
            return;
        }

        axios.get(`${config.API_BASE_URL}/getVehicles`, 
            {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(response => {
                const updatedVehicles = response.data.vehicles.map(vehicle => ({
                    ...vehicle,
                    VehicleStatus: vehicle["Vehicle Status"]
                }));
                setVehicles(updatedVehicles);
            })
            .catch(error => console.error("Error fetching vehicles:", error));
    };

    const handleOpenDialog = (vehicle = null) => {
        setEditingVehicle(vehicle);
        setNewVehicle(vehicle || {
            VehicleType: "Heavy-duty trucks",
            FuelType: "Diesel",
            ExhaustCO2: "",
            Mileage: "",
            VehicleCapacity: "",
            LicenseNo: "",
            VehicleStatus: "In Transit",
        });
        console.log("newVehicle in handleOpenDialog:", newVehicle); // Check the state
        setOpenDialog(true);
      
    };
    // Count Vehicles
const dieselCount = vehicles.filter(v => v.FuelType === "Diesel").length;
const gasolineCount = vehicles.filter(v => v.FuelType === "Gasoline").length;
const allCount = vehicles.length;


    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingVehicle(null);
    };
    const handleTabChange = (event, newPage) => {
        setActiveTab(newPage);
        if (newPage === 0) {
            navigate('/userlist'); // Navigate to UserList when the first tab is clicked
          }
      };
    const handleSaveVehicle = () => {
        if (!newVehicle.VehicleType || !newVehicle.FuelType || !newVehicle.ExhaustCO2 || !newVehicle.Mileage || !newVehicle.VehicleCapacity || !newVehicle.LicenseNo || !newVehicle.VehicleStatus) {
            setSnackbar({ open: true, message: "Please fill in all fields.", severity: "error" });
            return;
        }
        if (vehicles.some(vehicle => vehicle.LicenseNo === newVehicle.LicenseNo && (!editingVehicle || vehicle.VehicleID !== editingVehicle.VehicleID))) {
            setSnackbar({ open: true, message: "License number already registered.", severity: "error" });
            return;
        }
         

        const isDuplicate = vehicles.some(vehicle => {
            console.log("vehicle.LicenseNo:", vehicle.LicenseNo);
            console.log("newVehicle.LicenseNo:", newVehicle.LicenseNo);
    
            // Check if LicenseNo exists for both vehicles
            if (!vehicle.LicenseNo || !newVehicle.LicenseNo) {
                return false; // Skip this vehicle if LicenseNo is missing
            }
    
            return (
                vehicle.LicenseNo.toLowerCase() === newVehicle.LicenseNo.toLowerCase() &&
                (editingVehicle ? vehicle.VehicleID !== editingVehicle.VehicleID : true)
            );
        });
        if (isDuplicate) {
            setSnackbar({ open: true, message: "License number already registered.", severity: "error" });
            return;
        }
    
    
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, authorization failed");
            return;
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        const vehiclePayload = {
            vehicle_type: newVehicle.VehicleType,
            fuel_type: newVehicle.FuelType,
            exhaust_co2: parseFloat(newVehicle.ExhaustCO2) || 0,
            mileage: parseFloat(newVehicle.Mileage) || 0,
            vehicle_capacity: parseFloat(newVehicle.VehicleCapacity) || 0,
            license_no: newVehicle.LicenseNo,
            vehicle_status: newVehicle.VehicleStatus,
        };

        const apiCall = editingVehicle
            ? axios.post(`${config.API_BASE_URL}/vehicles/updateVehicle?vehicle_id=${editingVehicle.VehicleID}`, vehiclePayload, { headers })
            : axios.post(`${config.API_BASE_URL}/addNewVehicle`, vehiclePayload, { headers });

        apiCall
            .then(response => {
                fetchVehicles();
                handleCloseDialog();
                setSnackbar({ open: true, message: `Vehicle ${editingVehicle ? "updated" : "added"} successfully`, severity: "success" });
            })
            .catch(error => {
                console.error(`Error ${editingVehicle ? "updating" : "creating"} vehicle:`, error);
                setSnackbar({ open: true, message: `Failed to ${editingVehicle ? "update" : "add"} vehicle`, severity: "error" });
            });
    };

    const handleDeleteVehicle = (vehicleId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, authorization failed");
            return;
        }

        axios.delete(`${config.API_BASE_URL}/vehicles/deleteVehicle?vehicle_id=${vehicleId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(() => {
                fetchVehicles();
                setSnackbar({ open: true, message: "Vehicle deleted successfully", severity: "success" });
            })
            .catch(error => {
                console.error("Error deleting vehicle:", error);
                setSnackbar({ open: true, message: "Failed to delete vehicle", severity: "error" });
            });
    };

//     // Apply Filtering
// const filteredVehicles = vehicles.filter(vehicle => {
//     if (filter === "All") return true;
//     return vehicle.FuelType === filter;
// });


//     const filteredVehicles = vehicles.filter(vehicle => {
//         const searchTermLower = searchTerm.toLowerCase();
//         return (
//             (vehicle.VehicleType && vehicle.VehicleType.toLowerCase().includes(searchTermLower)) ||
//             (vehicle.LicenseNo && vehicle.LicenseNo.toLowerCase().includes(searchTermLower)) ||
//             (vehicle.FuelType && vehicle.FuelType.toLowerCase().includes(searchTermLower)) 
//         );
//     });

const filteredVehicles = vehicles.filter(vehicle => {
    const searchTermLower = searchTerm.toLowerCase();

    // Apply fuel type filter
    const fuelTypeMatch = filter === "All" || vehicle.FuelType === filter;

    // Apply search term filter
    const searchMatch =
        (vehicle.VehicleType && vehicle.VehicleType.toLowerCase().includes(searchTermLower)) ||
        (vehicle.LicenseNo && vehicle.LicenseNo.toLowerCase().includes(searchTermLower)) ||
        (vehicle.FuelType && vehicle.FuelType.toLowerCase().includes(searchTermLower));

    return fuelTypeMatch && searchMatch; // ✅ Both conditions must be true
});

    // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
};

const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when rows per page changes
};

    return (
        <>
            <NavBar />
            <Breadcrumbs />
             <Paper sx={{border:"1px solid #ddd", margin: "auto" }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' ,mt:1}}>
          <Typography variant="h5" component="div">
           Admin Dashboard !!
          </Typography>
          <Box  className="nav-links"> 
            <Typography   gutterBottom component={NavLink} to="/userlist" className="nav-link">
           Users
          </Typography>
          <Typography gutterBottom component={NavLink} to="/vehiclelist" className="nav-link">
           Vehicles
          </Typography>
          </Box>
          {/* <Tabs value={activeTab} onChange={handleTabChange} >
          <Tab label="UsersList"  />
          <Tab label="VehicleList" />
        </Tabs> */}
      </Box>
                        

                {/* <div style={{ display: "flex", justifyContent: "space-between" ,mt:2,mb:2}}> */}
              
                {/* <Box sx={{ display: "flex", gap: 2, alignItems: "center"}}> */}
                 <Box className="filter-container">

                 <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                        Add Vehicle
                    </Button>
                    

         <Box className="search-add-container">
                    
                    <TextField
                        variant="outlined"
                        placeholder="Search Vehicle"
                        size="small"
                       
                      
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Box>
  <Button 
    variant={filter === "All" ? "contained" : "outlined"} 
    onClick={() => setFilter("All")}
    sx={{
        backgroundColor: filter === "All" ? "#EDF4FD " : "#dcdcdc4a!important", // Change the background color of active tab
        color: filter === "All" ?  "#1976d2": "#666666"  , // Change text color for active tab
        border:"1px solid #dcdcdc",padding:"5px 15px",
        "&.MuiTab-root": { 
          minHeight: "39px !important",
        },
         
      }}
  >
    All ({allCount})
  </Button>
  <Button 
    variant={filter === "Diesel" ? "contained" : "outlined"} 
    onClick={() => setFilter("Diesel")}

    sx={{
        backgroundColor: filter === "Diesel" ? "#EDF4FD " : "#dcdcdc4a!important", // Change the background color of active tab
        color: filter === "Diesel" ? "#1976d2" : "#666666", // Change text color for active tab
        border:"1px solid #dcdcdc",padding:"5px 15px",
        "&.MuiTab-root": { 
          minHeight: "39px !important",
        },
         
      }}
  >
    Diesel ({dieselCount})
  </Button>
  <Button 
    variant={filter === "Gasoline" ? "contained" : "outlined"} 
    onClick={() => setFilter("Gasoline")}
    sx={{
        backgroundColor: filter === "Gasoline" ? "#EDF4FD " : "#dcdcdc4a!important", // Change the background color of active tab
        color: filter === "Gasoline" ?  "#1976d2" : "#666666", // Change text color for active tab
        border:"1px solid #dcdcdc",padding:"5px 15px",
        "&.MuiTab-root": { 
          minHeight: "39px !important",
        },
         
      }}
  >
    Gasoline ({gasolineCount})
  </Button>
</Box>
                    {/* <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                        Add Vehicle
                    </Button> */}
                    </Box>
                    </Box>

              <TableContainer component={Paper}  sx={{ maxHeight: "65vh", overflowY: "auto",  boxShadow: "0 2px 4px rgba(0,0,0,0.1)" ,"&::-webkit-scrollbar": {
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
                        <Table  sx={{ minWidth: 650 ,borderCollapse: "collapse" }}>
                          <TableHead sx={{ position: "sticky", top: 0, backgroundColor: "#5e87b0 ", zIndex: 1 }}>
                            <TableRow >
                                <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>SNo</TableCell>
                                <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>Vehicle ID</TableCell>
                                <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>Vehicle Type</TableCell>
                                <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>Fuel Type</TableCell>
                                <TableCell sx={{ color: "white" ,borderRight: "1px solid #bbb"}}>Mileage</TableCell>
                                <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>Capacity</TableCell>
                                <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>CO2 Emissions</TableCell>
                                <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>Status</TableCell>
                                <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody  sx={{ "& td, & th": { padding: "4px" } }} >
                            {filteredVehicles
                              .reverse()
                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Apply pagination
                            .map((vehicle, index) => (
                                <TableRow key={vehicle.VehicleID}>
                                     <TableCell>{page * rowsPerPage + index + 1.}</TableCell>
                                      <TableCell>
                                         <Tooltip title={vehicle.VehicleID || "N/A"} arrow>
                                         <span>{vehicle.VehicleID ? vehicle.VehicleID.slice(-5) : "N/A"}</span>
                                        </Tooltip>
                                     </TableCell> 
                                    <TableCell>{vehicle.VehicleType}</TableCell>
                                    <TableCell>{vehicle.FuelType}</TableCell>
                                    <TableCell>{vehicle.Mileage} km/l</TableCell>
                                    <TableCell>{vehicle.VehicleCapacity} kg</TableCell>
                                    <TableCell>{vehicle.ExhaustCO2} g/km</TableCell>
                                    <TableCell>{vehicle.VehicleStatus}</TableCell>
                                    <TableCell>
                                        {/* <IconButton color="primary" onClick={() => handleOpenDialog(vehicle)}><Edit /></IconButton> */}
                                        <IconButton color="error" onClick={() => handleDeleteVehicle(vehicle.VehicleID)}><Delete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Table Pagination */}
        <TablePagination
                    rowsPerPageOptions={[5,10, 25, 50]}
                    component="div"
                    count={filteredVehicles.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />


                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
                    <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Vehicle Type</InputLabel>
                        <Select
                            value={newVehicle.VehicleType}
                            disabled // Prevent manual selection
                        >
                            <MenuItem value="Heavy-duty trucks">Heavy-duty trucks</MenuItem>
                            <MenuItem value="Light-duty trucks">Light-duty trucks</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Fuel Type</InputLabel>
                        <Select
                            value={newVehicle.FuelType}
                            onChange={(e) => setNewVehicle({ ...newVehicle, FuelType: e.target.value })}
                            label="Fuel Type"
                        >
                            <MenuItem value="Diesel">Diesel</MenuItem>
                            <MenuItem value="Gasoline">Gasoline</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
        fullWidth
        label="Exhaust CO2 Emissions (g/km)"
        variant="outlined"
        sx={{ mt: 2 }}
            type="text"
        value={newVehicle.ExhaustCO2}
        onChange={(e) => {
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value)) { // Allow only numbers and decimals
              setNewVehicle({ ...newVehicle, ExhaustCO2: value });
            }
          }}
    />

    <TextField
        fullWidth
        label="Mileage (km/l)"
        variant="outlined"
        type="text"
        sx={{ mt: 2 }}
        value={newVehicle.Mileage}
        onChange={(e) => {
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value)) {
              setNewVehicle({ ...newVehicle, Mileage: value });
            }
        }}
    />

<TextField
    fullWidth
    label="Vehicle Capacity (kg)"
    variant="outlined"
    type="number"
    sx={{ mt: 2 }}
    value={newVehicle.VehicleCapacity}
    onChange={(e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            const numericValue = value === "" ? "" : parseFloat(value);
            setNewVehicle({
                ...newVehicle,
                VehicleCapacity: numericValue,
                VehicleType: getVehicleType(numericValue),
            });
        }
    }}
    helperText={
        <span style={{ minHeight: "20px", display: "inline-block" }}>
            Light-duty trucks ≤ 15000, Heavy-duty trucks &gt; 15000
        </span>
    } 
    FormHelperTextProps={{ sx: { minHeight: "20px" } }} // Ensures fixed space for helper text
/>


    <TextField
        fullWidth
        label="License No"
        variant="outlined"
        sx={{ mt: 2 }}
        value={newVehicle.LicenseNo}
        onChange={(e) => setNewVehicle({ ...newVehicle, LicenseNo: e.target.value })}
    />    
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Vehicle Status</InputLabel>
                        <Select
                            value={newVehicle.VehicleStatus}
                            onChange={(e) => setNewVehicle({ ...newVehicle, VehicleStatus: e.target.value })}
                            label="Vehicle Status"
                        >
                            <MenuItem value="In Transit">In Transit</MenuItem>
                            <MenuItem value="Rested">Rested</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSaveVehicle} variant="contained" color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default VehiclesList;
