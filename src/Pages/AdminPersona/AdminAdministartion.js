import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Avatar, Switch,
    Typography, CircularProgress, Box, Tabs, Tab, Tooltip, Button, Dialog, TablePagination, Snackbar,
    DialogTitle, DialogContent, DialogActions, TextField,IconButton
} from "@mui/material";
import { NavLink } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import SearchIcon from "@mui/icons-material/Search";
import config from "../../config";
import "./../Form.css";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import { Edit, Delete, Add ,Visibility, VisibilityOff } from "@mui/icons-material";
const AdminAdministration = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tabIndex, setTabIndex] = useState(0);
    const [loggedInUserRole, setLoggedInUserRole] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
     const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
      });
    useEffect(() => {
        fetchData();
    }, [tabIndex]);
    useEffect(() => {
        // Retrieve the user object from localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const role = storedUser?.role || "";
        setLoggedInUserRole(role.toLowerCase());
        fetchData();
      }, [tabIndex]);
    const fetchData = async () => {
        setLoading(true);
        setError("");
        let apiUrl = tabIndex === 0 
            ? `${config.API_BASE_URL}/users/usersList`
            : `${config.API_BASE_URL}/getVehicles`;
        
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No token found. Please log in.");
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            let responseData = [];
            if (tabIndex === 0 && Array.isArray(response.data.users)) {
                responseData =
                response.data.users.map((user) => ({
                    id: user.user_id,
                    name: user.username,
                    email: user.email,
                    role: user.role.toLowerCase(), // Convert role to lowercase
                    // status: user.status === "active",
                  }))
            } else if (tabIndex === 1 && Array.isArray(response.data.vehicles)) {
                responseData = response.data.vehicles.map(vehicle => ({
                    vehicle_id: vehicle.VehicleID,
                    vehicle_type: vehicle.VehicleType,
                    fuel_type: vehicle.FuelType,
                    exhaust_co2: vehicle.ExhaustCO2,
                    mileage: vehicle.Mileage,
                    capacity: vehicle.VehicleCapacity,
                    status: vehicle["Vehicle Status"] // Correcting the key
                }));
            }
            setData(responseData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error.response?.data?.detail || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    useEffect(() => {
        setPage(0);
    }, [tabIndex, searchQuery]);
    // const loggedInUserRole = localStorage.getItem("user_role");
 
    // Other state and useEffect code
   
    // Function to handle status toggle
    const handleToggle = async (userId, currentStatus) => {
      // Retrieve the user object from localStorage
      const storedUser = JSON.parse(localStorage.getItem("user"));
   
      // Extract the user role and ID from the stored object
      const loggedInUserRole = storedUser?.role; // Use optional chaining to handle null
      const loggedInUserId = storedUser?.id;
   
      console.log("Logged-in User Role:", loggedInUserRole);
      console.log("Logged-in User ID:", loggedInUserId);
      console.log("Target User ID:", userId);
      console.log("Current Status:", currentStatus);
   
      // Prevent admin from changing other users' statuses
      if (loggedInUserRole === "admin" && userId !== loggedInUserId) {
          console.log("Admin is trying to change another user's status. Blocking...");
          setSnackbar({
              open: true,
              message: "Admins cannot change other users' statuses.",
              severity: "warning",
          });
          return; // Stop execution
      }
   
      console.log("Proceeding with status update...");
   
      const newStatus = currentStatus === "active" ? false : true; // Toggle the status
   
      try {
          const token = localStorage.getItem("token");
          const response = await axios.post(
              `${config.API_BASE_URL}/users/updateStatus?active=` + newStatus,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
          );
   
          if (response.status === 200) {
              console.log("Status updated successfully:", newStatus);
              setUsers((prevUsers) =>
                  prevUsers.map((user) =>
                      user.id === userId
                          ? { ...user, status: newStatus ? "active" : "inactive" }
                          : user
                  )
              );
   
              if (userId === loggedInUserId) {
                  setSnackbar({
                      open: true,
                      message: `Your status is now ${newStatus ? "active" : "inactive"}`,
                      severity: "success",
                  });
              }
          }
      } catch (error) {
          console.error("Error updating status:", error);
          setSnackbar({
              open: true,
              message: "Failed to update status.",
              severity: "error",
          });
      }
  };
  const handleDeleteUser = (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
 
    axios
      .delete(`${config.API_BASE_URL}/users/removeUser?user_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchData();
        setSnackbar({
          open: true,
          message: "User removed successfully!",
          severity: "success",
        });
      })
      .catch((error) => console.error("Error removing user:", error));
  };
  useEffect(() => {
    fetchData();
   }, []);
    return (
        <>
            <NavBar />
            <Breadcrumbs />
            <Paper sx={{ padding: 2, margin: "auto" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <Typography variant="h5" sx={{ color: "#156272" }}>Admin Dashboard</Typography>
                    <TextField
                        label="Search"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: "300px" }}
                    />
                      <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} sx={{borderRadius:"4px",border:"1px solid #dcdcdc"}}>
                        <Tab label="Users" />
                        <Tab label="Vehicles" />
                    </Tabs>
                </Box>

                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : data.length === 0 ? (
                    <Typography>No data found.</Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ position: "sticky", top: 0, backgroundColor:"#5e87b0 ", zIndex: 1 ,"& th": { padding: "4px" } }}>
                                <TableRow>
                                    {tabIndex === 0 ? (
                                        <>
                                            <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>ID</TableCell>
                                            <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Name</TableCell>
                                          
                                            <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Role</TableCell>
                                            <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Email</TableCell>
                                            <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Status</TableCell>
                                            <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Action</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell>Vehicle ID</TableCell>
                                            <TableCell>Vehicle Type</TableCell>
                                            <TableCell>Fuel Type</TableCell>
                                            <TableCell>CO2 Emissions</TableCell>
                                            <TableCell>Mileage</TableCell>
                                            <TableCell>Capacity</TableCell>
                                            <TableCell>Status</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .filter(item => JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((item, index) => (
                                        <TableRow key={index}>
                                            {tabIndex === 0 ? (
                                                <>
                                                    <TableCell>{item.user_id}</TableCell>
                                                    <TableCell>{item.name}</TableCell>
                                                     <TableCell>
                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                          <Avatar sx={{ width: 32, height: 32, marginRight: 1 }} />
                                                                          <Typography variant="body2">{item.role}</Typography>
                                                                        </Box>
                                                                      </TableCell>
                                                    <TableCell>{item.email}</TableCell>
                                                     <TableCell>
                                                                       <Switch
                                                      checked={item.status === "inactive"}
                                                      onChange={() => handleToggle(item.id, item.status)}
                                                      disabled={loggedInUserRole && loggedInUserRole.toLowerCase() === "admin"}
                                                    />
                                                     
                                                                      </TableCell>
                                                  
                                                    <TableCell>
                                                    <IconButton
                      onClick={() => handleDeleteUser(item.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>{item.vehicle_id}</TableCell>
                                                    <TableCell>{item.vehicle_type}</TableCell>
                                                    <TableCell>{item.fuel_type}</TableCell>
                                                    <TableCell>{item.exhaust_co2}</TableCell>
                                                    <TableCell>{item.mileage}</TableCell>
                                                    <TableCell>{item.capacity}</TableCell>
                                                    <TableCell>{item.status}</TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))}
                            </TableBody>
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
        </>
    );
};

export default AdminAdministration;
