import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Avatar, Switch,
  Typography, CircularProgress, Box, Tabs, Tab, Tooltip, Button, Dialog, TablePagination, Snackbar,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton
} from "@mui/material";
import { 
  Edit, Delete, Add, PersonAdd, Error as ErrorIcon, CheckCircle, Info as InfoIcon, 
  ErrorOutline, Visibility, VisibilityOff, LockOutlined, EmailOutlined, BadgeOutlined, 
  PersonOutline, Save, DirectionsCar, LocalShipping, OilBarrel, LocalGasStation, Co2,
  Speed, Scale, Receipt, Moving, Cancel
} from "@mui/icons-material";
import {
  FaUser, FaBell, FaCog, FaHome, FaTruckMoving, FaUserShield, FaUserTie, FaUserCog
} from "react-icons/fa";
import {
  InputAdornment, FormControl, InputLabel, Select, MenuItem, LinearProgress
} from '@mui/material';
import { NavLink } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import SearchIcon from "@mui/icons-material/Search";
import config from "../../config";
import "./../Form.css";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

const AdminAdministration = () => {
  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(5);
  const [vehiclePage, setVehiclePage] = useState(0);
  const [vehicleRowsPerPage, setVehicleRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [showDeletedUsers, setShowDeletedUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [loggedInUserRole, setLoggedInUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [activeTab, setActiveTab] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [user, setUser] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [capacityError, setCapacityError] = useState("");
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    VehicleType: '',
    FuelType: '',
    ExhaustCO2: '',
    Mileage: '',
    VehicleCapacity: '',
    LicenseNo: '',
    VehicleStatus: ''
  });
  const [newUser, setNewUser] = useState({
    name: "",
    role: "driver",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    loading: false
  });

  // Fetch data based on tab
  useEffect(() => {
    fetchData();
  }, [tabIndex]);

  // Set logged in user role
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role || "";
    setLoggedInUserRole(role.toLowerCase());
    fetchData();
  }, [tabIndex]);

  // Fetch main data
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
        responseData = response.data.users.map((user) => ({
          id: user.user_id,
          name: user.username,
          email: user.email,
          role: user.role.toLowerCase(),
          status: user.status,
        }));
      } else if (tabIndex === 1 && Array.isArray(response.data.vehicles)) {
        responseData = response.data.vehicles.map(vehicle => ({
          vehicle_id: vehicle.VehicleID,
          vehicle_type: vehicle.VehicleType,
          fuel_type: vehicle.FuelType,
          exhaust_co2: vehicle.ExhaustCO2,
          mileage: vehicle.Mileage,
          capacity: vehicle.VehicleCapacity,
          license_no: vehicle.license_no,
          status: vehicle["Vehicle Status"]
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

  // Fetch deleted users
  const fetchDeletedUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${config.API_BASE_URL}/users/deletedUsersList`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeletedUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching deleted users:", error);
      setSnackbar({
        open: true,
        message: "Failed to load deleted users",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status
  const handleToggle = async (userId, currentStatus) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const loggedInUserRole = storedUser?.role;
    const loggedInUserId = storedUser?.id;

    if (loggedInUserRole === "admin" && userId !== loggedInUserId) {
      setSnackbar({
        open: true,
        message: "Admins cannot change other users' statuses.",
        severity: "warning",
      });
      return;
    }

    const newStatus = currentStatus === "active" ? false : true;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${config.API_BASE_URL}/users/updateStatus?active=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
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

  // Delete user handlers
  const handleDeleteUser = (id) => {
    setDeleteDialog({
      open: true,
      userId: id,
      loading: false
    });
  };

  const confirmDeleteUser = () => {
    const { userId } = deleteDialog;
    const token = localStorage.getItem("token");
    if (!token || !userId) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));

    axios
      .delete(`${config.API_BASE_URL}/users/removeUser?user_id=${userId}`, {
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
      .catch((error) => {
        console.error("Error removing user:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to delete user",
          severity: "error",
        });
      })
      .finally(() => {
        setDeleteDialog({
          open: false,
          userId: null,
          loading: false
        });
      });
  };

  // Vehicle handlers
  const handleSaveVehicle = () => {
    if (!newVehicle.VehicleType || !newVehicle.FuelType || !newVehicle.ExhaustCO2 || 
        !newVehicle.Mileage || !newVehicle.VehicleCapacity || !newVehicle.LicenseNo || 
        !newVehicle.VehicleStatus) {
      setSnackbar({ open: true, message: "Please fill in all fields.", severity: "error" });
      return;
    }

    const isDuplicate = data.some(vehicle => 
      vehicle.license_no?.toLowerCase() === newVehicle.LicenseNo.toLowerCase() &&
      (!editingVehicle || vehicle.vehicle_id !== editingVehicle.vehicle_id)
    );

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
      ? axios.post(`${config.API_BASE_URL}/vehicles/updateVehicle?vehicle_id=${editingVehicle.vehicle_id}`, vehiclePayload, { headers })
      : axios.post(`${config.API_BASE_URL}/addNewVehicle`, vehiclePayload, { headers });

    apiCall
      .then(() => {
        fetchData();
        handleCloseVehicleDialog();
        setSnackbar({ 
          open: true, 
          message: `Vehicle ${editingVehicle ? "updated" : "added"} successfully`, 
          severity: "success" 
        });
      })
      .catch(error => {
        console.error(`Error ${editingVehicle ? "updating" : "creating"} vehicle:`, error);
        setSnackbar({ 
          open: true, 
          message: `Failed to ${editingVehicle ? "update" : "add"} vehicle`, 
          severity: "error" 
        });
      });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    if (tabIndex === 0) {
      setUserPage(newPage);
    } else {
      setVehiclePage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    if (tabIndex === 0) {
      setUserRowsPerPage(parseInt(event.target.value, 10));
      setUserPage(0);
    } else {
      setVehicleRowsPerPage(parseInt(event.target.value, 10));
      setVehiclePage(0);
    }
  };

  // Calculate vehicle counts
  const allCountVehicles = data.length;
  const dieselCount = data.filter((v) => v.fuel_type?.trim().toLowerCase() === "diesel").length;
  const gasolineCount = data.filter((v) => v.fuel_type?.trim().toLowerCase() === "gasoline").length;
// Add these function definitions to your component

// Vehicle dialog handlers
const handleOpenVehicleDialog = (vehicle = null) => {
  setEditingVehicle(vehicle);
  setNewVehicle(
    vehicle
      ? {
          VehicleType: vehicle.vehicle_type,
          FuelType: vehicle.fuel_type,
          ExhaustCO2: vehicle.exhaust_co2,
          Mileage: vehicle.mileage,
          VehicleCapacity: vehicle.capacity,
          LicenseNo: vehicle.license_no,
          VehicleStatus: vehicle.status
        }
      : {
          VehicleType: '',
          FuelType: '',
          ExhaustCO2: '',
          Mileage: '',
          VehicleCapacity: '',
          LicenseNo: '',
          VehicleStatus: ''
        }
  );
  setOpenVehicleDialog(true);
};

const handleCloseVehicleDialog = () => {
  setOpenVehicleDialog(false);
  setEditingVehicle(null);
};

// User dialog handlers
const handleOpenUserDialog = (user = null) => {
  setEditingUser(user);
  setNewUser(
    user
      ? { ...user, password: "" }
      : { name: "", role: "driver", email: "", password: "" }
  );
  setOpenUserDialog(true);
};

const handleCloseUserDialog = () => {
  setOpenUserDialog(false);
  setEditingUser(null);
  setErrorMessage("");
};

// Vehicle capacity validation
const handleCapacityChange = (e) => {
  const raw = e.target.value;
  const tons = raw === "" ? "" : parseFloat(raw);

  if (tons !== "" && (tons < 3 || tons > 40)) {
    setCapacityError("Vehicle capacity must be between 3 and 40 tons.");
  } else {
    setCapacityError("");
  }

  setNewVehicle((prev) => ({
    ...prev,
    VehicleCapacity: tons,
    VehicleType:
      typeof tons === "number" && tons >= 3 && tons <= 40
        ? tons <= 15
          ? "Light-duty trucks"
          : "Heavy-duty trucks"
        : "",
  }));
};

// Vehicle edit/delete handlers
const handleEditVehicle = (vehicle) => {
  setSelectedVehicle(vehicle);
  setEditOpen(true);
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
      fetchData();
      setSnackbar({ 
        open: true, 
        message: "Vehicle deleted successfully", 
        severity: "success" 
      });
    })
    .catch(error => {
      console.error("Error deleting vehicle:", error);
      setSnackbar({ 
        open: true, 
        message: "Failed to delete vehicle", 
        severity: "error" 
      });
    });
};

const updateVehicleDetails = () => {
  const token = localStorage.getItem("token");
  axios
    .post(
      `${config.API_BASE_URL}/vehicles/updateVehicle?vehicle_id=${selectedVehicle.vehicle_id}`,
      selectedVehicle,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(() => {
      setSnackbar({
        open: true,
        message: "Vehicle updated successfully",
        severity: "success",
      });
      setEditOpen(false);
      fetchData();
    })
    .catch((error) => {
      setSnackbar({
        open: true,
        message: "Failed to update vehicle",
        severity: "error",
      });
      console.error("Update error:", error);
    });
};

// User save handler
const handleSaveUser = () => {
  setErrorMessage("");

  // Validation
  if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
    setErrorMessage("Please fill in all fields.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
    setErrorMessage("Enter a valid email address.");
    return;
  }
  if (newUser.password.length < 6 || newUser.password.length > 10) {
    setErrorMessage("Password must be at least 6 characters long.");
    return;
  }
  if (newUser.name.length > 15) {
    setErrorMessage("Name must be at most 15 characters.");
    return;
  }

  const userPayload = {
    username: newUser.name,
    password: newUser.password,
    user_role: newUser.role.toLowerCase(),
    email: newUser.email,
  };

  const userPayload1 = {
    user_id: editingUser?.id,
    username: newUser.name,
    password: newUser.password,
    email: newUser.email,
    user_role: newUser.role,
  };

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  if (editingUser) {
    axios
      .put(`${config.API_BASE_URL}/users/updateUserProfile`, userPayload1, { headers })
      .then(() => {
        fetchData();
        handleCloseUserDialog();
        setSnackbar({
          open: true,
          message: "User updated successfully!",
          severity: "success",
        });
      })
      .catch((error) => console.error("Error updating user:", error));
  } else {
    axios
      .post(`${config.API_BASE_URL}/createUser`, userPayload, { headers })
      .then(() => {
        fetchData();
        handleCloseUserDialog();
        setSnackbar({
          open: true,
          message: "User added successfully!",
          severity: "success",
        });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        if (error.response && error.response.status === 400) {
          const backendError = error.response.data.detail;
          if (backendError === "Username already exists") {
            setErrorMessage("Username already exists. Please choose a different username.");
          } else if (backendError === "Email already exists") {
            setErrorMessage("Email already exists. Please use a different email.");
          } else {
            setErrorMessage(backendError);
          }
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      });
  }
};
  return (
    <>
      <NavBar />
      <Breadcrumbs />
      <Paper sx={{ padding: 2, margin: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <Typography id="admin-dashboard-title" variant="h5" sx={{ color: "#156272" }}>
            <FaUserShield className="role-icon" /> Admin Dashboard
          </Typography>

          <Tabs 
            id="main-tab-selector"
            value={tabIndex}
            className="tab-links"
            onChange={(e, newValue) => setTabIndex(newValue)}
            sx={{ borderRadius: "4px", border: "1px solid #dcdcdc" }}
          >
            <Tab id="tab-users" label="Users" className="tab-link" sx={{ "&.MuiTab-root": { minHeight: "37px!important" } }}/>
            <Tab label="Vehicles" className="tab-link" id="tab-vehicles" className="tab-link"/>
          </Tabs>
        </Box>

        <Box id="content-container">
          {tabIndex === 0 ? (
            <Box className="filter-container" id="user-tab-content">
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => handleOpenUserDialog()}
                >
                  Create User
                </Button>
                {/* <Button
                  variant="outlined"
                  color={showDeletedUsers ? "secondary" : "primary"}
                  startIcon={<Delete />}
                  onClick={() => {
                    if (!showDeletedUsers) {
                      fetchDeletedUsers();
                    }
                    setShowDeletedUsers(!showDeletedUsers);
                  }}
                >
                  {showDeletedUsers ? "Hide Deleted Users" : "Show Deleted Users"}
                </Button> */}
              <Button
  variant="outlined"
  color={showDeletedUsers ? "secondary" : "primary"}
  startIcon={<Delete />}
  onClick={() => {
    if (!showDeletedUsers) {
      fetchDeletedUsers();
    }
    setShowDeletedUsers(!showDeletedUsers);
  }}
  sx={{
    backgroundColor: showDeletedUsers ? "#f44336" : "",
    color: showDeletedUsers ? "white" : "",
    '&:hover': {
      backgroundColor: showDeletedUsers ? "#d32f2f" : "",
    }
  }}
>
  {showDeletedUsers ? "Hide Deleted Users" : "Show Deleted Users"}
</Button>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  className="search-add-container"
                  placeholder="Search"
                  size="small"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* <Tabs
                  value={filter}
                  onChange={(e, newValue) => {
                    setFilter(newValue);
                    setUserPage(0);
                  }}
                >
                  <Tab
                    label={`All (${showDeletedUsers ? deletedUsers.length : data.length})`}
                    value="All"
                    className="tab"
                    sx={{
                      backgroundColor: filter === "All" ? "#388e3c" : "#dcdcdc4a!important",
                      color: filter === "All" ? "white" : "#1976d2",
                      border: "1px solid #dcdcdc",
                      padding: "5px 15px",
                      "&.MuiTab-root": { minHeight: "39px !important" },
                    }}
                  />
                  <Tab
                    id="filter-managers"
                    label={`Managers (${
                      showDeletedUsers 
                        ? deletedUsers.filter(u => u.user_role === "manager").length
                        : data.filter(u => u.role === "manager").length
                    })`}
                    className="tab"
                    value="manager"
                    sx={{
                      backgroundColor: filter === "manager" ? "#388e3c" : "#dcdcdc4a!important",
                      color: filter === "manager" ? "white" : "#1976d2",
                      border: "1px solid #dcdcdc",
                      padding: "5px 15px",
                      "&.MuiTab-root": { minHeight: "39px !important" },
                    }}
                  />
                  <Tab
                    label={`Drivers (${
                      showDeletedUsers
                        ? deletedUsers.filter(u => u.user_role === "driver").length
                        : data.filter(u => u.role === "driver").length
                    })`}
                    value="driver"
                    className="tab"
                    sx={{
                      backgroundColor: filter === "driver" ? "#388e3c" : "#dcdcdc4a!important",
                      color: filter === "driver" ? "white" : "#1976d2",
                      border: "1px solid #dcdcdc",
                      padding: "5px 15px",
                      "&.MuiTab-root": { minHeight: "39px !important" },
                    }}
                  />
                </Tabs> */}
           <Tabs
  value={filter}
  onChange={(e, newValue) => {
    setFilter(newValue);
    setUserPage(0);
  }}
>
  <Tab
    label={`All (${showDeletedUsers ? deletedUsers.length : data.length})`}
    value="All"
    className="tab"
    sx={{
      backgroundColor: showDeletedUsers ? "#f4433652!important" : 
                      filter === "All" ? "#388e3c" : "#dcdcdc4a!important",
      color: "white",
      border: "1px solid #dcdcdc",
      padding: "5px 15px",
      "&.MuiTab-root": { minHeight: "39px !important" },
    }}
  />
  <Tab
    id="filter-managers"
    label={`Managers (${
      showDeletedUsers 
        ? deletedUsers.filter(u => (u.user_role || u.role)?.toLowerCase() === "manager").length
        : data.filter(u => u.role?.toLowerCase() === "manager").length
    })`}
    className="tab"
    value="manager"
    sx={{
      backgroundColor: showDeletedUsers ? "#f4433652!important" : 
                      filter === "manager" ? "#388e3c" : "#dcdcdc4a",
      color: "white",
      border: "1px solid #dcdcdc",
      padding: "5px 15px",
      "&.MuiTab-root": { minHeight: "39px !important" },
    }}
  />
  <Tab
    label={`Drivers (${
      showDeletedUsers
        ? deletedUsers.filter(u => (u.user_role || u.role)?.toLowerCase() === "driver").length
        : data.filter(u => u.role?.toLowerCase() === "driver").length
    })`}
    value="driver"
    className="tab"
    sx={{
      backgroundColor: 
        showDeletedUsers && filter === "driver" ? "#f44336!important" : // Red when selected in deleted view
        showDeletedUsers ? "#f4433652!important" : // Semi-transparent red when showing deleted but not selected
        filter === "driver" ? "#388e3c!important" : // Green when selected in normal view
        "#dcdcdc4a!important", // Default light gray
      color: "white",
      border: "1px solid #dcdcdc",
      padding: "5px 15px",
      "&.MuiTab-root": { minHeight: "39px !important" },
      "&.MuiTab-root &.Mui-selected": {
        backgroundColor: showDeletedUsers ? "#f44336!important" : "#388e3c!important"
      }
    }}
  />
</Tabs>
              </Box>
            </Box>
          ) : (
            <Box className="filter-container">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => handleOpenVehicleDialog()}
              >
                Add Vehicle
              </Button>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  variant="outlined"
                  placeholder="Search Vehicle"
                  size="small"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Tabs value={filter} onChange={(e, newValue) => {
                  setFilter(newValue);
                  setUserPage(0);
                }}>
                  <Tab
                    label={`All (${allCountVehicles})`}
                    value="All"
                    className="tab"
                    sx={{
                      backgroundColor: filter === "All" ? "#388e3c" : "#dcdcdc4a",
                      color: filter === "All" ? "white" : "#1976d2",
                      border: "1px solid #dcdcdc",
                      padding: "5px 15px",
                    }}
                  />
                  <Tab
                    label={`Diesel (${dieselCount})`}
                    value="Diesel"
                    className="tab"
                    sx={{
                      backgroundColor: filter === "Diesel" ? "#388e3c" : "#dcdcdc4a",
                      color: filter === "Diesel" ? "white" : "#1976d2",
                      border: "1px solid #dcdcdc",
                      padding: "5px 15px",
                    }}
                  />
                  <Tab
                    label={`Gasoline (${gasolineCount})`}
                    value="Gasoline"
                    className="tab"
                    sx={{
                      backgroundColor: filter === "Gasoline" ? "#388e3c" : "#dcdcdc4a",
                      color: filter === "Gasoline" ? "white" : "#1976d2",
                      border: "1px solid #dcdcdc",
                      padding: "5px 15px",
                    }}
                  />
                </Tabs>
              </Box>
            </Box>
          )}
        </Box>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : tabIndex === 0 && showDeletedUsers && deletedUsers.length === 0 ? (
          <Typography>No deleted users found.</Typography>
        ) : tabIndex === 0 && !showDeletedUsers && data.length === 0 ? (
          <Typography>No active users found.</Typography>
        ) : tabIndex === 1 && data.length === 0 ? (
          <Typography>No vehicles found.</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "60vh",
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: "6px", height: "6px" },
              "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "10px" },
              "&::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "10px" },
              "&::-webkit-scrollbar-thumb:hover": { background: "#555" },
            }}
          >
            <Table sx={{ borderCollapse: "collapse" }}>
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#5e87b0",
                  zIndex: 1,
                  "& th": { padding: "4px" },
                }}
              >
                <TableRow>
                  {tabIndex === 0 ? (
                    <>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>SNo</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Name</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Role</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Email</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Status</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Action</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>SNo</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Vehicle LicenseNo</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Vehicle Type</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Fuel Type</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>CO2 Emissions(lbs)</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Mileage(miles)</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Capacity(tones)</TableCell>
                      <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>Status</TableCell>
                      <TableCell id="vehicle-action" sx={{ color: "white", borderRight: "1px solid #bbb" }}>
                        Action
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              {tabIndex === 0 ? (
                showDeletedUsers ? (
                  <TableBody>
                    {deletedUsers
                      .filter(user => {
                        const matchesSearch = JSON.stringify(user).toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesFilter = filter === "All" || user.role?.toLowerCase() === filter.toLowerCase();
                        return matchesSearch && matchesFilter;
                      })

                      
                      .slice(userPage * userRowsPerPage, userPage * userRowsPerPage + userRowsPerPage)
                      .map((user, index) => (
                        <TableRow key={`deleted-${index}`}>
                          <TableCell>{userPage * userRowsPerPage + index + 1}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar sx={{ width: 32, height: 32, marginRight: 1 }} />
                              <Typography variant="body2">
                                {user.role}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>Deleted</TableCell>
                          <TableCell>
                            <Tooltip title="User is deleted and cannot be modified">
                              <span>
                                <IconButton disabled color="error">
                                  <Delete />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                ) : (
                  <TableBody>
                    {data
                      .filter(user => {
                        const matchesSearch = JSON.stringify(user).toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesFilter = filter === "All" || user.role === filter.toLowerCase();
                        return matchesSearch && matchesFilter;
                      })
                      .slice(userPage * userRowsPerPage, userPage * userRowsPerPage + userRowsPerPage)
                      .map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>{userPage * userRowsPerPage + index + 1}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar sx={{ width: 32, height: 32, marginRight: 1 }} />
                              <Typography variant="body2">
                                {user.role}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell id={`user-status-${index}`}>{user.status}</TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleDeleteUser(user.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                )
              ) : (
                <TableBody>
                  {data
                    .filter(vehicle => {
                      const matchesSearch = JSON.stringify(vehicle).toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesFilter = filter === "All" || vehicle.fuel_type?.trim().toLowerCase() === filter.toLowerCase();
                      return matchesSearch && matchesFilter;
                    })
                    .slice(vehiclePage * vehicleRowsPerPage, vehiclePage * vehicleRowsPerPage + vehicleRowsPerPage)
                    .map((vehicle, index) => (
                      <TableRow key={index}>
                        <TableCell>{vehiclePage * vehicleRowsPerPage + index + 1}</TableCell>
                        <TableCell>{vehicle.license_no}</TableCell>
                        <TableCell>{vehicle.vehicle_type}</TableCell>
                        <TableCell>{vehicle.fuel_type}</TableCell>
                        <TableCell>{vehicle.exhaust_co2}</TableCell>
                        <TableCell>{vehicle.mileage}</TableCell>
                        <TableCell>{vehicle.capacity}</TableCell>
                        <TableCell>{vehicle.status}</TableCell>
                        <TableCell id={`vehicle-action-${index}`}>
                          {vehicle.status === "In Transit" ? (
                            <>
                              <Tooltip title="Vehicle is in transit, can't edit/delete">
                                <span>
                                  <IconButton disabled color="primary" id={`edit-vehicle-${vehicle.vehicle_id}`}>
                                    <Edit />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Vehicle is in transit, can't edit/delete">
                                <span>
                                  <IconButton disabled color="error" id={`delete-vehicle-${vehicle.vehicle_id}`}>
                                    <Delete />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <IconButton
                                onClick={() => handleEditVehicle(vehicle)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              )}
            </Table>
          </TableContainer>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={
          tabIndex === 0
            ? showDeletedUsers
              ? deletedUsers.filter(user => 
                  JSON.stringify(user).toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (filter === "All" || user.user_role?.toLowerCase() === filter.toLowerCase())
                ).length
              : data.filter(user => 
                  JSON.stringify(user).toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (filter === "All" || user.role === filter.toLowerCase())
                ).length
            : data.filter(vehicle => 
                JSON.stringify(vehicle).toLowerCase().includes(searchTerm.toLowerCase()) &&
                (filter === "All" || vehicle.fuel_type?.trim().toLowerCase() === filter.toLowerCase())
              ).length
        }
        rowsPerPage={tabIndex === 0 ? userRowsPerPage : vehicleRowsPerPage}
        page={tabIndex === 0 ? userPage : vehiclePage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* User Dialog */}
      <Dialog
        open={openUserDialog}
        onClose={handleCloseUserDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white", py: 1, marginBottom: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <PersonAdd /> {editingUser ? "Edit User" : "Create New User"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              label={<span>Full Name <span style={{ color: "red" }}>*</span></span>}
              fullWidth size="small" margin="normal" variant="outlined"
              type="text" placeholder="e.g. john doe" value={newUser.name}
              onChange={(e) => {
                let value = e.target.value;
                if (value.startsWith(" ")) {
                  setNewUser({ ...newUser, name: newUser.name });
                  return;
                }
                if (/^[A-Za-z0-9\s]*$/.test(value)) {
                  setNewUser({ ...newUser, name: value });
                }
              }}
              ErrorIcon={newUser.name.length > 15 || newUser.name.startsWith(" ")}
              helperText={
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {newUser.name.startsWith(" ") ? (
                    <>
                      <ErrorIcon color="error" fontSize="small" />
                      Name cannot start with a space
                    </>
                  ) : newUser.name.length > 15 ? (
                    <>
                      <ErrorIcon color="error" fontSize="small" />
                      Maximum 15 characters allowed ({newUser.name.length}/15)
                    </>
                  ) : (
                    <>
                      <CheckCircle color="success" fontSize="small" />
                      {newUser.name.length > 0 ? "Valid name" : "Enter user's full name"}
                    </>
                  )}
                </span>
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlined />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={<span>Email <span style={{ color: "red" }}>*</span></span>}
              fullWidth size="small" margin="normal" variant="outlined"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value.trim() })}
              ErrorIcon={newUser.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)}
              helperText={
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {newUser.email.length === 0 ? (
                    <>
                      <InfoIcon color="info" fontSize="small" />
                      Enter a valid email address
                    </>
                  ) : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email) ? (
                    <>
                      <ErrorIcon color="error" fontSize="small" />
                      Invalid email format
                    </>
                  ) : (
                    <>
                      <CheckCircle color="success" fontSize="small" />
                      Valid email address
                    </>
                  )}
                </span>
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={<span>Password <span style={{ color: "red" }}>*</span></span>}
              fullWidth size="small" margin="normal" variant="outlined"
              type={showPassword ? "text" : "password"} value={newUser.password}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 10) {
                  setNewUser({ ...newUser, password: value });
                }
              }}
              ErrorIcon={newUser.password.length > 0 && (newUser.password.length < 6 || newUser.password.length > 10)}
              helperText={
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {newUser.password.length === 0 ? (
                    <>
                      <InfoIcon color="info" fontSize="small" />
                      Password must be 6-10 characters
                    </>
                  ) : newUser.password.length < 6 || newUser.password.length > 10 ? (
                    <>
                      <ErrorIcon color="error" fontSize="small" />
                      {newUser.password.length < 6
                        ? `Too short (${newUser.password.length}/6)`
                        : `Maximum 10 characters (${newUser.password.length}/10)`}
                    </>
                  ) : (
                    <>
                      <CheckCircle color="success" fontSize="small" />
                      Strong password
                    </>
                  )}
                </span>
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {newUser.password.length > 0 && (
              <Box sx={{ mb: 2, ml: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((newUser.password.length / 10) * 100, 100)}
                  color={
                    newUser.password.length < 6
                      ? "error"
                      : newUser.password.length < 8
                      ? "warning"
                      : "success"
                  }
                  sx={{ height: 4, borderRadius: 2 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Password strength:{" "}
                  {newUser.password.length < 6
                    ? "Weak"
                    : newUser.password.length < 8
                    ? "Moderate"
                    : "Strong"}
                </Typography>
              </Box>
            )}

            <TextField
              label="User Role"
              fullWidth size="small" select margin="normal" variant="outlined"
              SelectProps={{ native: true }} value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline />
                  </InputAdornment>
                ),
              }}
            >
              <option value="Driver">Driver</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Administrator</option>
            </TextField>

            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                <ErrorOutline />
                <Box sx={{ ml: 1 }}>{errorMessage}</Box>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
          <Button onClick={handleCloseUserDialog} variant="outlined" startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            color="primary"
            disabled={
              !newUser.name ||
              !newUser.email ||
              !newUser.password ||
              newUser.name.length > 15 ||
              newUser.name.startsWith(" ") ||
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email) ||
              newUser.password.length < 6 ||
              newUser.password.length > 10
            }
            startIcon={<Save />}
            sx={{ minWidth: 120 }}
          >
            {editingUser ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle Dialog */}
      <Dialog
        open={openVehicleDialog}
        onClose={handleCloseVehicleDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white", py: 1, marginBottom: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <DirectionsCar sx={{ fontSize: "1.5rem" }} />
          {editingVehicle ? "Edit Vehicle Details" : "Add New Vehicle"}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                value={newVehicle.FuelType}
                onChange={(e) => setNewVehicle({ ...newVehicle, FuelType: e.target.value })}
                label="Fuel Type"
              >
                <MenuItem value="Diesel">
                  <Box display="flex" alignItems="center" gap={1}>
                    <OilBarrel />
                    Diesel
                  </Box>
                </MenuItem>
                <MenuItem value="Gasoline">
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocalGasStation />
                    Gasoline
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth size="small" label="Exhaust CO₂ Emissions (g/mile)" variant="outlined" sx={{ mb: 2.5 }}
              type="number" value={newVehicle.ExhaustCO2}
              onChange={(e) => setNewVehicle(prev => ({ ...prev, ExhaustCO2: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Co2 />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth size="small" label="Fuel Efficiency (mpg)" variant="outlined" sx={{ mb: 2.5 }}
              type="number" value={newVehicle.Mileage}
              onChange={(e) => setNewVehicle(prev => ({ ...prev, Mileage: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Speed />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth size="small" label="Vehicle Capacity (tons)" variant="outlined" type="number"
              value={newVehicle.VehicleCapacity || ""} onChange={handleCapacityChange}
              inputProps={{ min: 3, max: 40, step: 1 }} error={Boolean(capacityError)}
              helperText={
                capacityError || (
                  <Box component="span" display="flex" alignItems="center" gap={1}>
                    <InfoIcon color="info" fontSize="small" />
                    3–15 t ⇒ Light‑duty | 16–40 t ⇒ Heavy‑duty
                  </Box>
                )
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Scale />
                  </InputAdornment>
                ),
              }}
              FormHelperTextProps={{ sx: { fontSize: "0.75rem", mt: 0.5 } }}
              sx={{ mb: 2.5 }}
            />

            <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                value={newVehicle.VehicleType}
                label="Vehicle Type"
                disabled
                sx={{ "& .MuiSelect-select": { display: "flex", alignItems: "center" } }}
              >
                <MenuItem value="Heavy-duty trucks">
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocalShipping />
                    Heavy-duty trucks
                  </Box>
                </MenuItem>
                <MenuItem value="Light-duty trucks">
                  <Box display="flex" alignItems="center" gap={1}>
                    <DirectionsCar />
                    Light-duty trucks
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth size="small" label="License Plate Number" variant="outlined" sx={{ mb: 2.5 }}
              value={newVehicle.LicenseNo}
              onChange={(e) => setNewVehicle({ ...newVehicle, LicenseNo: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Receipt />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel>Vehicle Status</InputLabel>
              <Select
                value={newVehicle.VehicleStatus}
                onChange={(e) => setNewVehicle({ ...newVehicle, VehicleStatus: e.target.value })}
                label="Vehicle Status"
              >
                <MenuItem value="In Transit">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Moving />
                    In Transit
                  </Box>
                </MenuItem>
                <MenuItem value="Available">
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle />
                    Available
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button onClick={handleCloseVehicleDialog} variant="outlined" startIcon={<Cancel />} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveVehicle}
            variant="contained"
            color="primary"
            startIcon={<Save />}
            sx={{ minWidth: 100 }}
            disabled={!newVehicle.LicenseNo || !newVehicle.FuelType}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Vehicle Details</DialogTitle>
        <DialogContent>
          <TextField
            label="License No"
            fullWidth margin="dense" value={selectedVehicle?.license_no || ""}
            onChange={(e) => setSelectedVehicle({ ...selectedVehicle, license_no: e.target.value })}
          />
          <TextField
            label="Mileage"
            fullWidth margin="dense" value={selectedVehicle?.mileage || ""}
            onChange={(e) => setSelectedVehicle({ ...selectedVehicle, mileage: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => updateVehicleDetails()}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, userId: null })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent id="alert-dialog-description">
          Are you sure you want to delete this user? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, userId: null })}
            color="primary"
            disabled={deleteDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteUser}
            color="error"
            autoFocus
            disabled={deleteDialog.loading}
          >
            {deleteDialog.loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminAdministration;