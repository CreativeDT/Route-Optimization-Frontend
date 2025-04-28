import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaUser,
  FaBell,
  FaCog,
  FaHome,
  FaTruckMoving,
  FaUserShield,
  FaUserTie,
  FaUserCog,
} from "react-icons/fa";
import {
  Alert,
  Avatar,
  Switch,
  Typography,
  CircularProgress,
  Box,
  Tabs,
  Tab,
  Tooltip,
  Button,
  Dialog,
  TablePagination,
  Snackbar,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  PersonAdd,
  Error as ErrorIcon,
  CheckCircle,
  Info as InfoIcon,
  ErrorOutline,
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  BadgeOutlined,
  PersonOutline,
  Save,
  DirectionsCar,
  LocalShipping,
  OilBarrel,
  LocalGasStation,
  Co2,
  Speed,
  Scale,
  Receipt,
  Moving,
  Cancel,
} from "@mui/icons-material";
import {
  InputAdornment,
  FormControl,
  InputLabel,
  Select,Paper,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import SearchIcon from "@mui/icons-material/Search";
import config from "../../config";
import "./../Form.css";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const ACGrid = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(5);
  const [vehiclePage, setVehiclePage] = useState(0);
  const [vehicleRowsPerPage, setVehicleRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [loggedInUserRole, setLoggedInUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [user, setUser] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openDialog, setOpenDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    VehicleType: "",
    FuelType: "",
    ExhaustCO2: "",
    Mileage: "",
    VehicleCapacity: "",
    LicenseNo: "",
    VehicleStatus: "",
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

  // AG Grid column definitions
  const userColumnDefs = useMemo(() => [
    { 
      headerName: "SNo", 
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 80,
      sortable: false,
      filter: false
    },
    { 
      field: "name", 
      headerName: "Name",
      sortable: true,
      filter: true 
    },
    { 
      field: "role", 
      headerName: "Role",
      sortable: true,
      cellRenderer: (params) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar sx={{ width: 32, height: 32, marginRight: 1 }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    { field: "email", headerName: "Email", sortable: true },
    { 
      field: "status", 
      headerName: "Activity Status",
      sortable: true 
    },
    {
      headerName: "Action",
      cellRenderer: (params) => (
        <IconButton 
          onClick={() => handleDeleteUser(params.data.id)}
          color="error"
          size="small"
        >
          <Delete fontSize="small" />
        </IconButton>
      ),
      sortable: false,
      filter: false
    }
  ], []);

  const vehicleColumnDefs = useMemo(() => [
    { 
      headerName: "SNo", 
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 80,
      sortable: false,
      filter: false
    },
    { field: "license_no", headerName: "License No", sortable: true },
    { field: "vehicle_type", headerName: "Type", sortable: true },
    { field: "fuel_type", headerName: "Fuel Type", sortable: true },
    { 
      field: "exhaust_co2", 
      headerName: "CO2 (lbs)", 
      sortable: true,
      type: 'numericColumn'
    },
    { 
      field: "mileage", 
      headerName: "Mileage", 
      sortable: true,
      type: 'numericColumn'
    },
    { 
      field: "capacity", 
      headerName: "Capacity (lbs)", 
      sortable: true,
      type: 'numericColumn'
    },
    { field: "status", headerName: "Status", sortable: true },
    {
      headerName: "Action",
      cellRenderer: (params) => (
        <>
          <IconButton
            onClick={() => handleEditVehicle(params.data)}
            color="primary"
            size="small"
            disabled={params.data.status === "In Transit"}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteVehicle(params.data.vehicle_id)}
            color="error"
            size="small"
            disabled={params.data.status === "In Transit"}
          >
            <Delete fontSize="small" />
          </IconButton>
        </>
      ),
      sortable: false,
      filter: false
    }
  ], []);

  // Grid options
  const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
    suppressCellFocus: true,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100
    },
    onGridReady: (params) => {
      params.api.sizeColumnsToFit();
    },
    onFirstDataRendered: (params) => {
      params.api.sizeColumnsToFit();
    }
  };

  useEffect(() => {
    console.log("Fetching data with filter:", filter);
    fetchData();
  }, [tabIndex, filter]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const role = storedUser?.role || "";
    setLoggedInUserRole(role.toLowerCase());
    fetchData();
  }, [tabIndex]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    let apiUrl = "";
    
    if (tabIndex === 0) {
      apiUrl = `${config.API_BASE_URL}/users/usersList`;
    } else {
      apiUrl = `${config.API_BASE_URL}/getVehicles`;
    }
   
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      console.log("Calling API:", apiUrl);
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API Response:", response.data);
      let responseData = [];
    
      if (tabIndex === 0 && Array.isArray(response.data.users)) {
        responseData = response.data.users.map((user) => ({
          id: user.user_id,
          name: user.username,
          email: user.email,
          role: user.role.toLowerCase(),
          status: user.status,
          deleted: user.deleted ?? false,
        }));
      } else if (tabIndex === 1 && Array.isArray(response.data.vehicles)) {
        responseData = response.data.vehicles.map((vehicle) => ({
          vehicle_id: vehicle.VehicleID,
          vehicle_type: vehicle.VehicleType,
          fuel_type: vehicle.FuelType,
          exhaust_co2: vehicle.ExhaustCO2,
          mileage: vehicle.Mileage,
          capacity: vehicle.VehicleCapacity,
          license_no: vehicle.LicenseNo,
          status: vehicle["Vehicle Status"],
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
        `${config.API_BASE_URL}/users/updateStatus?active=` + newStatus,
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

  const handleSaveUser = () => {
    setErrorMessage("");

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

    const userPayload = editingUser
      ? {
          user_id: editingUser?.user_id,
          username: newUser.name,
          password: newUser.password,
          email: newUser.email,
          user_role: newUser.user_role,
        }
      : {
          username: newUser.name,
          password: newUser.password,
          user_role: newUser.role.toLowerCase(),
          email: newUser.email,
          status: newUser.status,
        };

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authorization failed");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const apiCall = editingUser
      ? axios.put(`${config.API_BASE_URL}/users/updateUserProfile`, userPayload, { headers })
      : axios.post(`${config.API_BASE_URL}/createUser`, userPayload, { headers });

    apiCall
      .then(() => {
        fetchData();
        handleCloseUserDialog();
        setSnackbar({
          open: true,
          message: `User ${editingUser ? "updated" : "added"} successfully!`,
          severity: "success",
        });
      })
      .catch((error) => {
        console.error(`Error ${editingUser ? "updating" : "creating"} user:`, error);
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
  };

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

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveVehicle = () => {
    if (
      !newVehicle.VehicleType ||
      !newVehicle.FuelType ||
      !newVehicle.ExhaustCO2 ||
      !newVehicle.Mileage ||
      !newVehicle.VehicleCapacity ||
      !newVehicle.LicenseNo ||
      !newVehicle.VehicleStatus
    ) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields.",
        severity: "error",
      });
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
      ? axios.post(
          `${config.API_BASE_URL}/vehicles/updateVehicle?vehicle_id=${editingVehicle.VehicleID}`,
          vehiclePayload,
          { headers }
        )
      : axios.post(`${config.API_BASE_URL}/addNewVehicle`, vehiclePayload, {
          headers,
        });

    apiCall
      .then((response) => {
        fetchData();
        handleCloseVehicleDialog();
        setSnackbar({
          open: true,
          message: `Vehicle ${editingVehicle ? "updated" : "added"} successfully`,
          severity: "success",
        });
      })
      .catch((error) => {
        console.error(`Error ${editingVehicle ? "updating" : "adding"} vehicle:`, error);
        setSnackbar({
          open: true,
          message: `Failed to ${editingVehicle ? "update" : "add"} vehicle`,
          severity: "error",
        });
      });
  };

  const handleDeleteVehicle = (vehicleId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authorization failed");
      return;
    }

    axios
      .delete(
        `${config.API_BASE_URL}/vehicles/deleteVehicle?vehicle_id=${vehicleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        fetchData();
        setSnackbar({
          open: true,
          message: "Vehicle deleted successfully",
          severity: "success",
        });
      })
      .catch((error) => {
        console.error("Error deleting vehicle:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete vehicle",
          severity: "error",
        });
      });
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditOpen(true);
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

  const handleOpenUserDialog = () => {
    setOpenUserDialog(true);
    setEditingUser(null);
  };

  const handleOpenVehicleDialog = () => {
    setOpenVehicleDialog(true);
    setEditingVehicle(null);
  };

  const handleCloseUserDialog = () => setOpenUserDialog(false);
  const handleCloseVehicleDialog = () => setOpenVehicleDialog(false);

  // Filter data based on search term and filter
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchMatch = JSON.stringify(item)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let roleMatch = true;
      if (tabIndex === 0 && filter !== "All") {
        if (filter === "deleted") {
          roleMatch = item.deleted === true;
        } else {
          roleMatch = item.role?.trim().toLowerCase() === filter.toLowerCase();
        }
      }

      let fuelTypeMatch = true;
      if (tabIndex === 1 && filter !== "All") {
        fuelTypeMatch =
          item.fuel_type?.trim().toLowerCase() === filter.toLowerCase();
      }

      return searchMatch && roleMatch && fuelTypeMatch;
    });
  }, [data, searchTerm, filter, tabIndex]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (tabIndex === 0 ? userPage : vehiclePage) * 
                      (tabIndex === 0 ? userRowsPerPage : vehicleRowsPerPage);
    const endIndex = startIndex + 
                    (tabIndex === 0 ? userRowsPerPage : vehicleRowsPerPage);
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, userPage, vehiclePage, userRowsPerPage, vehicleRowsPerPage, tabIndex]);

  // Counts for filters
  const allCountVehicles = data.length;
  const dieselCount = data.filter(
    (v) => v.fuel_type?.trim().toLowerCase() === "diesel"
  ).length;
  const gasolineCount = data.filter(
    (v) => v.fuel_type?.trim().toLowerCase() === "gasoline"
  ).length;

  return (
    <>
      <NavBar id="navbar"/>
      <Breadcrumbs id="breadcrumbs"/>
      <Paper id="dashboard-container" sx={{ padding: 2, margin: "auto" }}>
        <Box id="header-container"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Typography id="admin-dashboard-title" variant="h5" sx={{ color: "#156272" }}>
            <FaUserShield className="role-icon" /> Admin Dashboard
          </Typography>

          <Tabs id="main-tab-selector"
            value={tabIndex}
            className="tab-links"
            onChange={(e, newValue) => setTabIndex(newValue)}
            sx={{ borderRadius: "4px", border: "1px solid #dcdcdc" }}
          >
            <Tab id="tab-users"
              label="Users"
              className="tab-link"
              sx={{ "&.MuiTab-root": { minHeight: "37px!important" } }}
            />
            <Tab label="Vehicles" id="tab-vehicles" className="tab-link" />
          </Tabs>
        </Box>
        <Box id="content-container">
          {tabIndex === 0 ? (
            <Box className="filter-container" id="user-tab-content">
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button id="create-user-btn"
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={handleOpenUserDialog}
                >
                  Create User
                </Button>
                <Button
                  id="filter-deleted-users"
                  sx={{
                    backgroundColor: filter === "deleted" ? "#d32f2f" : "#d32f2f!important",
                    color: "white",
                    border: "1px solid #dcdcdc",
                    padding: "5px 15px",
                    minHeight: "39px",
                    textTransform: "none",
                  }}
                >
                  Deleted Users ({data.filter((u) => u.role?.trim().toLowerCase() === "deleted").length})
                </Button>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField id="search-users"
                  className="search-add-container"
                  placeholder="Search"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Tabs id="user-filter-tabs"
                  value={filter}
                  onChange={(e, newValue) => {
                    setFilter(newValue);
                    setUserPage(0);
                  }}
                >
                  <Tab id="filter-all-users"
                    label={`All (${data.length})`}
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
                  <Tab id="filter-managers"
                    label={`Managers (${
                      data.filter((u) => u.role?.trim().toLowerCase() === "manager").length
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
                  <Tab id="filter-drivers"
                    label={`Drivers (${
                      data.filter((u) => u.role === "driver").length
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
                </Tabs>
              </Box>
            </Box>
          ) : (
            <Box className="filter-container" id="vehicle-tab-content">
              <Button id="add-vehicle-btn"
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleOpenVehicleDialog}
              >
                Add Vehicle
              </Button>

              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField id="search-vehicles"
                  variant="outlined"
                  placeholder="Search Vehicle"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Tabs id="vehicle-filter-tabs"
                  value={filter}
                  onChange={(e, newValue) => {
                    setFilter(newValue);
                    setVehiclePage(0);
                  }}
                >
                  <Tab id="filter-all-vehicles"
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
                  <Tab id="filter-diesel-vehicles"
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
                  <Tab id="filter-gasoline-vehicles"
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
          <CircularProgress id="loading-indicator"/>
        ) : error ? (
          <Typography id="error-message" color="error">{error}</Typography>
        ) : data.length === 0 ? (
          <Typography id="no-data-message">No data found.</Typography>
        ) : (
          <div 
            className="ag-theme-alpine"
            style={{
              width: '100%',
              height: '60vh',
              marginTop: '16px'
            }}
          >
            <AgGridReact
              columnDefs={tabIndex === 0 ? userColumnDefs : vehicleColumnDefs}
              rowData={filteredData}
              gridOptions={gridOptions}
              pagination={true}
              paginationPageSize={tabIndex === 0 ? userRowsPerPage : vehicleRowsPerPage}
              suppressPaginationPanel={true}
            />
          </div>
        )}

        {/* Custom Pagination Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={tabIndex === 0 ? userRowsPerPage : vehicleRowsPerPage}
            page={tabIndex === 0 ? userPage : vehiclePage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>

        {/* Snackbar for success messages */}
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

      {/* User Dialog */}
      <Dialog
        open={openUserDialog}
        onClose={handleCloseUserDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 1,
            marginBottom: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <PersonAdd /> {editingUser ? "Edit User" : "Create New User"}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" noValidate autoComplete="off">
            {/* Name Field */}
            <TextField
              label={
                <span>
                  Full Name <span style={{ color: "red" }}>*</span>
                </span>
              }
              fullWidth
              size="small"
              margin="normal"
              variant="outlined"
              type="text"
              placeholder="e.g. John Doe"
              value={newUser.name}
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
              error={
                newUser.name.length > 15 || newUser.name.startsWith(" ")
              }
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
                      {newUser.name.length > 0
                        ? "Valid name"
                        : "Enter user's full name"}
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

            {/* Email Field */}
            <TextField
              label={
                <span>
                  Email <span style={{ color: "red" }}>*</span>
                </span>
              }
              fullWidth
              size="small"
              margin="normal"
              variant="outlined"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value.trim() })
              }
              error={
                newUser.email.length > 0 &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)
              }
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

            {/* Password Field */}
            <TextField
              label={
                <span>
                  Password <span style={{ color: "red" }}>*</span>
                </span>
              }
              fullWidth
              size="small"
              margin="normal"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={newUser.password}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 10) {
                  setNewUser({ ...newUser, password: value });
                }
              }}
              error={
                newUser.password.length > 0 &&
                (newUser.password.length < 6 || newUser.password.length > 10)
              }
              helperText={
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {newUser.password.length === 0 ? (
                    <>
                      <InfoIcon color="info" fontSize="small" />
                      Password must be 6-10 characters
                    </>
                  ) : newUser.password.length < 6 ||
                    newUser.password.length > 10 ? (
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
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

                       {/* Password Strength Indicator */}
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

            {/* Role Field */}
            <TextField
              label="User Role"
              fullWidth
              size="small"
              select
              margin="normal"
              variant="outlined"
              SelectProps={{ native: true }}
              value={newUser.role}
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
              <Alert
                severity="error"
                sx={{ mt: 2, display: "flex", alignItems: "center" }}
              >
                <ErrorOutline />
                <Box sx={{ ml: 1 }}>{errorMessage}</Box>
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
          <Button
            onClick={handleCloseUserDialog}
            variant="outlined"
            startIcon={<Cancel />}
          >
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
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 1,
            marginBottom: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <DirectionsCar sx={{ fontSize: "1.5rem" }} />
          {editingVehicle ? "Edit Vehicle Details" : "Add New Vehicle"}
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {/* Vehicle Type - Auto-determined by capacity */}
            <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
              <InputLabel shrink>Vehicle Type</InputLabel>
              <Select
                value={newVehicle.VehicleType}
                disabled
                sx={{
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
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

            {/* Fuel Type */}
            <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
              <InputLabel
                sx={{ transform: "translate(14px, -9px) scale(0.75)" }}
              >
                Fuel Type
              </InputLabel>
              <Select
                value={newVehicle.FuelType}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, FuelType: e.target.value })
                }
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

            {/* Emissions */}
            <TextField
              fullWidth
              size="small"
              label="Exhaust CO₂ Emissions (g/mile)"
              variant="outlined"
              sx={{ mb: 2.5 }}
              type="number"
              value={newVehicle.ExhaustCO2}
              onChange={(e) => {
                setNewVehicle(prev => ({
                  ...prev,
                  ExhaustCO2: e.target.value
                }));
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Co2 />
                  </InputAdornment>
                ),
              }}
            />

            {/* Fuel Efficiency */}
            <TextField
              fullWidth
              size="small"
              label="Fuel Efficiency (mpg)"
              variant="outlined"
              sx={{ mb: 2.5 }}
              type="number"
              value={newVehicle.Mileage}
              onChange={(e) => {
                setNewVehicle((prev) => ({
                  ...prev,
                  Mileage: e.target.value,
                }));
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Speed />
                  </InputAdornment>
                ),
              }}
            />

            {/* Vehicle Capacity */}
            <TextField
              fullWidth
              size="small"
              label="Vehicle Capacity (lbs)"
              variant="outlined"
              sx={{ mb: 2.5 }}
              type="number"
              value={newVehicle.VehicleCapacity || ""}
              onChange={(e) => {
                const raw = e.target.value;
                const tons = raw === "" ? "" : parseFloat(raw);
              
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
              }}
              inputProps={{ min: 3, max: 40, step: 1 }}
              helperText={
                <Box component="span" display="flex" alignItems="center" gap={1}>
                  <InfoIcon color="info" fontSize="small" />
                  3–15 t =&gt; Light-duty | 16–40 t =&gt; Heavy-duty
                </Box>
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Scale />
                  </InputAdornment>
                ),
              }}
              FormHelperTextProps={{
                sx: { fontSize: "0.75rem", mt: 0.5 }
              }}
            />

            {/* License Plate */}
            <TextField
              fullWidth
              size="small"
              label="License Plate Number"
              variant="outlined"
              sx={{ mb: 2.5 }}
              value={newVehicle.LicenseNo}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, LicenseNo: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Receipt />
                  </InputAdornment>
                ),
              }}
            />

            {/* Vehicle Status */}
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel
                sx={{ transform: "translate(14px, -9px) scale(0.75)" }}
              >
                Vehicle Status
              </InputLabel>
              <Select
                value={newVehicle.VehicleStatus}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    VehicleStatus: e.target.value,
                  })
                }
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
          <Button
            onClick={handleCloseVehicleDialog}
            variant="outlined"
            startIcon={<Cancel />}
            sx={{ minWidth: 100 }}
          >
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
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Vehicle Details</DialogTitle>
        <DialogContent>
          <TextField
            label="License No"
            fullWidth
            margin="dense"
            value={selectedVehicle?.license_no || ""}
            onChange={(e) =>
              setSelectedVehicle({
                ...selectedVehicle,
                license_no: e.target.value,
              })
            }
          />
          <TextField
            label="Mileage"
            fullWidth
            margin="dense"
            type="number"
            value={selectedVehicle?.mileage || ""}
            onChange={(e) =>
              setSelectedVehicle({
                ...selectedVehicle,
                mileage: e.target.value,
              })
            }
          />
          <TextField
            label="CO2 Emissions"
            fullWidth
            margin="dense"
            type="number"
            value={selectedVehicle?.exhaust_co2 || ""}
            onChange={(e) =>
              setSelectedVehicle({
                ...selectedVehicle,
                exhaust_co2: e.target.value,
              })
            }
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedVehicle?.status || ""}
              onChange={(e) =>
                setSelectedVehicle({
                  ...selectedVehicle,
                  status: e.target.value,
                })
              }
              label="Status"
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="In Transit">In Transit</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={updateVehicleDetails}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ACGrid;