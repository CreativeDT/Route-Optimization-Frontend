import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, Box, Tabs, Tab, Tooltip, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { NavLink } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import config from "../../config";
import "./Form.css";  

const Dashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
const [availableDrivers, setAvailableDrivers] = useState([]);
const [selectedDriver, setSelectedDriver] = useState("");
const [selectedRoute, setSelectedRoute] = useState("");


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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    let apiUrl = "";
    
    if (tabIndex === 0) apiUrl = `${config.API_BASE_URL}/getDrivers`;
    else if (tabIndex === 1) apiUrl = `${config.API_BASE_URL}/getVehicles`;
    else if (tabIndex === 2) apiUrl = `${config.API_BASE_URL}/fleetRequest/getFleetRequests`;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Data:", response.data);
      setData(response.data.drivers || response.data.vehicles || response.data.results || []);
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
      delayFactor: "",
      rerouteFactor: "",
      accidentFactor: "",
      stockMismatchFactor: ""
    });
    setOpen(true);
  };
  const handleChange = (event) => {
    setSummary({ ...summary, [event.target.name]: event.target.value });
  };

  const handleSubmit = () => {
    console.log("Summary Submitted:", summary);
    setOpen(false);
  };
  const handleOpenAssignDialog = (routeId) => {
    setSelectedRoute(routeId);
    fetchDrivers();
    setOpenAssignDialog(true);
  };
  const handleAssignDriver = async () => {
    if (!selectedDriver || !selectedRoute) {
      alert("Please select a driver.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        return;
      }
  
      const response = await axios.post(
        `${config.API_BASE_URL}/assignDriver`,
        {
          driver_id: selectedDriver,
          route_id: selectedRoute,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      alert(response.data.detail || "Driver assigned successfully.");
      setOpenAssignDialog(false);
      fetchData(); // Refresh the fleet details table
    } catch (error) {
      console.error("Error assigning driver:", error);
      setError("Failed to assign driver.");
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
  
  return (
    <>
      <NavBar />
      <Breadcrumbs />
      <Paper sx={{ border: "1px solid #ddd", margin: "auto" }}>
        {/* Tabs for Drivers, Vehicles, and Fleet Details */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ color: "#156272" }} gutterBottom>
            Manager Dashboard
          </Typography>
          <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
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
          <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: "auto" }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ position: "sticky", top: 0, backgroundColor: "#156272", zIndex: 1 }}>
                <TableRow sx={{ backgroundColor: "#156272", color: "white" }}>
                  {tabIndex === 0 && (
                    <>
                      <TableCell sx={{ color: "white" }}>SNo</TableCell>
                      <TableCell sx={{ color: "white" }}>Driver Name</TableCell>
                      <TableCell sx={{ color: "white" }}>Email</TableCell>
                      <TableCell sx={{ color: "white" }}>Date of Joining</TableCell>
                      <TableCell sx={{ color: "white" }}>Vehicle Status</TableCell>
                      <TableCell sx={{ color: "white" }}>Route Status</TableCell>
                    </>
                  )}
                  {tabIndex === 1 && (
                    <>
                      <TableCell sx={{ color: "white" }}>SNo</TableCell>
                      <TableCell sx={{ color: "white" }}>Vehicle Id</TableCell>
                      <TableCell sx={{ color: "white" }}>Vehicle Name</TableCell>
                      <TableCell sx={{ color: "white" }}>Fuel Type</TableCell>
                      <TableCell sx={{ color: "white" }}>ExhaustCo2</TableCell>
                      <TableCell sx={{ color: "white" }}>Mileage</TableCell>
                      <TableCell sx={{ color: "white" }}>Vehicle Capacity</TableCell>
                      <TableCell sx={{ color: "white" }}>Vehicle Status</TableCell>
                      <TableCell sx={{ color: "white" }}>Assigned Driver</TableCell>
                    </>
                  )}
                  {tabIndex === 2 && (
                    <>
                      <TableCell sx={{ color: "white" }}>SNo</TableCell>
                      <TableCell sx={{ color: "white" }}>Country</TableCell>
                      <TableCell sx={{ color: "white" }}>Origin</TableCell>
                      <TableCell sx={{ color: "white" }}>Destination</TableCell>
                      <TableCell sx={{ color: "white" }}>Start Date</TableCell>
                      <TableCell sx={{ color: "white" }}>End Date</TableCell>
                      <TableCell sx={{ color: "white" }}>Demand</TableCell>
                      <TableCell sx={{ color: "white" }}>Created Date</TableCell>
                      <TableCell sx={{ color: "white" }}>Summary</TableCell>
                      <TableCell sx={{ color: "white" }}>Assign Driver</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={item.id || index}>
                    {tabIndex === 0 && (
                      <>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.driver_name}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.joining_date}</TableCell>
                        <TableCell>{item.vehicle_status}</TableCell>
                        <TableCell>{item.route_status}</TableCell>
                      </>
                    )}
                    {tabIndex === 1 && (
                      <>
                        <TableCell>{index + 1}</TableCell>
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
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.country}</TableCell>
                        <TableCell>{item.origin}</TableCell>
                        <TableCell>{item.destination}</TableCell>
                        <TableCell>{item.start_date}</TableCell>
                        <TableCell>{item.end_date}</TableCell>
                        <TableCell>{item.demand}</TableCell>
                        <TableCell>{item.createdAt}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleOpenSummary(item)} color="primary">
                            Add Summary
                          </Button>
                        </TableCell>
                        <TableCell>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenAssignDialog(item.route_id)}
                        >
                            Assign Driver
                        </Button>
                        </TableCell>

                       
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
         )}
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Add Consignment Summary</DialogTitle>
      <DialogContent>
        {["delayFactor", "rerouteFactor", "accidentFactor", "stockMismatchFactor"].map((field) => (
          <FormControl key={field} fullWidth margin="dense">
            <InputLabel>{field.replace(/([A-Z])/g, " $1").trim()}</InputLabel>
            <Select name={field} value={summary[field]} onChange={handleChange}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
    {/* Assign driver pop up */}
    <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)}>
  <DialogTitle>Assign Driver to Route</DialogTitle>
  <DialogContent>
    <FormControl fullWidth margin="dense">
      <InputLabel>Select Driver</InputLabel>
      <Select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
        {availableDrivers.map((driver) => (
          <MenuItem key={driver.id} value={driver.id}>
            {driver.driver_name} ({driver.email})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenAssignDialog(false)} color="secondary">
      Cancel
    </Button>
    <Button onClick={handleAssignDriver} color="primary">
      Assign
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
};

export default Dashboard;
