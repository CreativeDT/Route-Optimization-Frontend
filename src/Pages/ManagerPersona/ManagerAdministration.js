import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, Box, Tabs, Tab, Tooltip, Button, Dialog,TablePagination,
    DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,TextField, Autocomplete
} from "@mui/material";
import { NavLink } from "react-router-dom";
import NavBar from "../../Components/NavBar";

import config from "../../config";
import "./../Form.css";  
import Breadcrumbs1 from "./Breadcrumbs1";

const Dashboard = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

const [availableDrivers, setAvailableDrivers] = useState([]);
// const [selectedDriver, setSelectedDriver] = useState("");
const [selectedDrivers, setSelectedDrivers] = useState({}); // Store selected driver IDs per route
const [selectedRoute, setSelectedRoute] = useState("");
const [isManager, setIsManager] = useState(false);
const [consignments, setConsignments] = useState([]);
const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [summary, setSummary] = useState({
    delayFactor: "",
    rerouteFactor: "",
    accidentFactor: "",
    stockMismatchFactor: ""
  });
  useEffect(() => {
    fetchData();
  }, [tabIndex]); // Fetch data when tab changes
  useEffect(() => {
    if (tabIndex === 2) {
        fetchDrivers();
    }
}, [tabIndex]);
  const fetchData = async () => {
    setLoading(true);
    setError("");
    let apiUrl = "";
    let method = "get"; // Default to GET
    let payload = {};   // Default empty payload
  
    if (tabIndex === 0) {
      apiUrl = `${config.API_BASE_URL}/getDrivers`;
    } else if (tabIndex === 1) {
      apiUrl = `${config.API_BASE_URL}/getVehicles`;
    } else if (tabIndex === 2) {
      apiUrl = `${config.API_BASE_URL}/getConsignments`;
      method = "post"; // Change to POST for this endpoint
      payload = {  status: '',
        origin: '',
        destination: '',
        vehicle_id: '',
        routeID: '' }; // Example payload (adjust as needed)
    }
    console.log("Payload Sent:", payload);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
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
      editedDate: consignment.summary?.editedDate || new Date().toISOString().split("T")[0], // Default to today if no date exists
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
      editedDate: new Date().toISOString().split("T")[0], // Update date on edit
    }));
  };
  
  const handleSubmit = async () => {
    if (!selectedConsignment) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${config.API_BASE_URL}/updateSummary`,
        {
          consignmentId: selectedConsignment.id,
          summary,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      alert("Summary updated successfully.");
      setOpen(false);
      fetchData(); // Refresh data after update
    } catch (error) {
      console.error("Error updating summary:", error);
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
            console.error("No token found. Please log in.");
            return;
        }

        // Modify API endpoint to correct one
        const response = await axios.post(
            `${config.API_BASE_URL}/assignDriver`, 
            { driver_id: driverId, route_id: routeId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        //  Update the selectedDrivers state immediately after success
          setSelectedDrivers((prev) => ({
            ...prev,
            [routeId]: availableDrivers.find((d) => d.driver_id === driverId),
          }));
        console.log("API Response:", response.data);
        alert("Driver assigned successfully.");
        
        // Fetch updated data so UI reflects changes
        fetchData();
    } catch (error) {
        console.error("Error assigning driver:", error.response?.data || error.message);
    }
};

//   const handleDriverSelectChange = (event, routeId) => {
//     const driverId = event.target.value;
//     setSelectedDrivers({ ...selectedDrivers, [routeId]: driverId });
// };
const handleDriverSelectChange = (event, newValue, routeId) => {
    if (newValue) {
        setSelectedDrivers((prev) => ({
            ...prev,
            [routeId]: newValue // Store selected driver
        }));

        handleAssignDriver(newValue.id, routeId);
    }
};

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
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
    
  return (
    <>
      <NavBar />
      <Breadcrumbs1 />
      <Paper sx={{ border: "1px solid  #e0e0e0", margin: "auto",padding:2 }}>
        {/* Tabs for Drivers, Vehicles, and Fleet Details */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",marginBottom: 2 }}> 
          <Typography variant="h5" sx={{ color: "#156272" }} gutterBottom>
            Manager Dashboard
          </Typography>
          <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} sx={{borderRadius:"4px"}}>
            <Tab label="Drivers" />
            <Tab label="Vehicles" />
            <Tab label="Fleet Details" />
          </Tabs>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : data.length === 0 ? (
          <Typography>No data found.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight:"60vh", overflowY: "auto" , boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <Table sx={{ minWidth: 650 ,borderCollapse: "collapse" }}>
              <TableHead sx={{ position: "sticky", top: 0, backgroundColor: "#5e87b0 ", zIndex: 1 }}>
                <TableRow>
                  {tabIndex === 0 && (
                    <>
                      <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>SNo</TableCell>
                      <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>Driver Name</TableCell>
                      <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>Email</TableCell>
                      <TableCell sx={{ color: "white" ,borderRight: "1px solid #bbb"}}>Date of Joining</TableCell>
                      <TableCell sx={{ color: "white",borderRight: "1px solid #bbb" }}>Vehicle Status</TableCell>
                      <TableCell sx={{ color: "white" ,borderRight: "1px solid #bbb"}}>Route Status</TableCell>
                    </>
                  )}
                  {tabIndex === 1 && (
                    <>
                      <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>SNo</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Vehicle Id</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Vehicle Name</TableCell>
                      <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Fuel Type</TableCell>
                      <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>ExhaustCo2</TableCell>
                      <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Mileage</TableCell>
                      <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Vehicle Capacity</TableCell>
                      <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Vehicle Status</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Assigned Driver</TableCell>
                    </>
                  )}
                  {tabIndex === 2 && (
                    <>
                        <TableCell sx={{ color: "white", borderRight: "1px solid #bbb"  }}>SNo</TableCell>
                        <TableCell sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Route ID</TableCell>
                        <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Vehicle ID</TableCell>
                       
                        <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Origin</TableCell>
                        <TableCell sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Destination</TableCell>
                        <TableCell sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Status</TableCell>
                        <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Carbon Emission</TableCell>
                        <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Created Date</TableCell>
                        <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Summary</TableCell>
                        <TableCell sx={{ color: "white", borderRight: "1px solid #bbb"  }}>Driver</TableCell>
                        <TableCell sx={{ color: "white" , borderRight: "1px solid #bbb" }}>Assign Driver</TableCell>
                    </>
                    )}

                </TableRow>
              </TableHead>
              {Array.isArray(data) && data.length > 0 ? (
              <TableBody>
                {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => (
                  <TableRow key={item.id || index}>
                    {tabIndex === 0 && (
                      <>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{item.driver_name}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.joining_date}</TableCell>
                        <TableCell>{item.vehicle_status}</TableCell>
                        <TableCell>{item.route_status}</TableCell>
                      </>
                    )}
                    {tabIndex === 1 && (
                      <>
                         <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                        <Tooltip title={item.VehicleID || "No ID available"} arrow>
                            <span>{item.VehicleID ? item.VehicleID.slice(-5) : "N/A"}</span>
                        </Tooltip>
                        </TableCell>
                        <TableCell>{item.VehicleType}</TableCell>
                        <TableCell>{item.FuelType}</TableCell>
                        <TableCell>{item.ExhaustCO2}</TableCell>
                        <TableCell>{item.Mileage}</TableCell>
                        <TableCell>{item.VehicleCapacity}</TableCell>
                        <TableCell>{item["Vehicle Status"]}</TableCell>

                        <TableCell>{item.assigned_driver || "Not Assigned"}</TableCell>
                      </>
                    )}
                   {tabIndex === 2 && (
                    <>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        
                        <TableCell>
                        <Tooltip title={item.routeID || "N/A"} arrow>
                            <span>{item.routeID ? item.routeID.slice(-5) : "N/A"}</span>
                        </Tooltip>
                        </TableCell>
                        <TableCell>
                        <Tooltip title={item.vehicle_id || "N/A"} arrow>
                            <span>{item.vehicle_id ? item.vehicle_id.slice(-5) : "N/A"}</span>
                        </Tooltip>
                        </TableCell>
                        
                        <TableCell
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
                        <TableCell  sx={{minWidth: "80px", 
                        maxWidth: "15vw", 
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>
                        <Tooltip title={item.destination || "N/A"} arrow>
                        <span>{item.destination}</span>
                        </Tooltip>
                    </TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>{item.carbon_emission || "N/A"}</TableCell>
                        <TableCell>{new Date(item.creationDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                        <Button sx={{fontSize:"12px"}}
                            onClick={() => handleOpenSummary(item)}
                            color={item.summaryAdded ? "secondary" : "primary"}
                        >
                            {item.summaryAdded ? "Summary Added" : "Add Summary"}
                        </Button>
                        </TableCell>
                        <TableCell> {item.driver}</TableCell>
                        <TableCell>
                       <Autocomplete
                            options={availableDrivers.filter((driver) => driver.route_status === "Not Assigned")}
                            getOptionLabel={(option) => option.driver_name || ""}
                            value={selectedDrivers[item.routeID] || null}
                            onChange={(event, newValue) => {
                                handleAssignDriver(newValue?.driver_id, item.routeID);
                            }}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label={selectedDrivers[item.routeID] ? "Reassign Driver" : "Select Driver"} 
                                    variant="outlined" 
                                />
                            )}
                        />

                    </TableCell>

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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>
            {selectedConsignment?.summaryAdded ? "View/Edit Summary" : "Add Consignment Summary"}
        </DialogTitle>
      <DialogContent>
        {["delayFactor", "rerouteFactor", "accidentFactor", "stockMismatchFactor"].map((field) => (
          <FormControl key={field} fullWidth margin="dense">
            <InputLabel>{field.replace(/([A-Z])/g, " $1").trim()}</InputLabel>
            <Select
          name={field}
          value={summary[field]}
          onChange={handleChange}
          disabled={!isManager} // Only managers can edit
        >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        ))}
         {/* Date Field (Read-Only) */}
    <TextField
      fullWidth
      margin="dense"
      label="Last Edited Date"
      type="date"
      value={summary.editedDate}
      InputProps={{ readOnly: true }}
    />
      </DialogContent>
      <DialogActions>
    <Button onClick={() => setOpen(false)} color="secondary">Close</Button>
    {isManager && <Button onClick={handleSubmit} color="primary">Save</Button>}
  </DialogActions>
    </Dialog>
    {/* Assign driver pop up */}
    {/* <Dialog fullWidth  open={openAssignDialog} onClose={() => setOpenAssignDialog(false)}>
  <DialogTitle>Assign Driver to Route</DialogTitle>
  <DialogContent>
  <TableContainer component={Paper} fullWidth sx={{ maxHeight: 300, overflowY: "auto" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>SNo</TableCell>
                                    <TableCell>Driver Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Vehicle Status</TableCell>
                                    <TableCell>Route Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {availableDrivers
                                    .filter((driver) => driver.route_status === "Not Assigned")
                                    .map((driver, index) => (
                                        <TableRow key={driver.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{driver.driver_name}</TableCell>
                                            <TableCell>{driver.email}</TableCell>
                                            <TableCell>{driver.vehicle_status}</TableCell>
                                            <TableCell>{driver.route_status}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => setSelectedDriver(driver.id)}
                                                >
                                                    Select
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
   
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenAssignDialog(false)} color="secondary">
      Cancel
    </Button>
    <Button onClick={handleAssignDriver} color="primary">
      Assign
    </Button>
  </DialogActions>
</Dialog> */}

    </>
  );
};

export default Dashboard;
