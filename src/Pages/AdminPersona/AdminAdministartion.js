import React, { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import SearchIcon from "@mui/icons-material/Search";
import config from "../../config";
import "./../Form.css";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

const AdminAdministration = () => {
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
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const [openDialog, setOpenDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingVehicle, setEditingVehicle] = React.useState(false);
  const [newVehicle, setNewVehicle] = React.useState({
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
    //  status: true,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const sortedUsers = [...users].sort((a, b) => {
    if (!a[sortField] || !b[sortField]) return 0; // Handle missing values
    return sortOrder === "asc"
      ? a[sortField].localeCompare(b[sortField])
      : b[sortField].localeCompare(a[sortField]);
  });
  const handleSort = (field) => {
    setSortOrder(sortField === field && sortOrder === "asc" ? "desc" : "asc");
    setSortField(field);
  };

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
    // let apiUrl = tabIndex === 0
    //     ? `${config.API_BASE_URL}/users/usersList`
    //     : `${config.API_BASE_URL}/getVehicles`;
    let apiUrl = "";
    if (tabIndex === 0) {
      if (filter === "deleted") {
        apiUrl = `${config.API_BASE_URL}/users/deletedUsersList`;
      } else {
        apiUrl = `${config.API_BASE_URL}/users/usersList`;
      }
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
          role: user.role.toLowerCase(), // Convert role to lowercase
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
          status: vehicle["Vehicle Status"], // Correcting the key
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

  // const handleChangePage = (event, newPage) => setPage(newPage);
  // const handleChangeRowsPerPage = (event) => {
  //     setRowsPerPage(parseInt(event.target.value, 10));
  //     setPage(0);
  // };
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
      console.log(
        "Admin is trying to change another user's status. Blocking..."
      );
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
  // Open Dialog for Add/Edit
  //   const handleOpenDialog = (user = null) => {
  //     console.log("Opening dialog, user:", user); // Log the user object
  //     setEditingUser(user);
  //     setNewUser(
  //       user
  //         ? { ...user, password: "" }
  //         : { name: "", role: "driver", email: "", password: "", status: false }
  //     );
  //     setSearchTerm(""); // Reset search term to avoid filtering issues
  //     setOpenDialog(true);
  //   };

  //   // Close Dialog
  //   const handleCloseDialog = () => {
  //     setOpenDialog(false);
  //     setEditingUser(null);
  //     setErrorMessage(""); // Clear error message when closing
  //   };

  // Save User (Add or Edit)
  const handleSaveUser = () => {
    setErrorMessage(""); // Reset error message

    // Validation: Check if all fields are filled
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      setErrorMessage("Please fill in all fields.");
      return; // Stop execution if validation fails
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
      status: newUser.status,
    };

    const userPayload1 = {
      user_id: editingUser?.user_id, // Ensure ID is sent when editing
      username: newUser.username,
      password: newUser.password,
      email: newUser.email,
      user_role: newUser.user_role,
    };

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authorization failed");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    if (editingUser) {
      // Update user
      axios
        .put(`${config.API_BASE_URL}/users/updateUserProfile`, userPayload1, {
          headers,
        })
        .then(() => {
          fetchData(); // Re-fetch users after update
          handleCloseUserDialog();
          setSnackbar({
            open: true,
            message: "User updated successfully!",
            severity: "success",
          });
        })
        .catch((error) => console.error("Error updating user:", error));
    } else {
      // Create new user
      axios
        .post(`${config.API_BASE_URL}/createUser`, userPayload, { headers })
        .then(() => {
          fetchData(); // Re-fetch users after creation
          handleCloseUserDialog();
          console.log("UserPayload:", userPayload);
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
              setErrorMessage(
                "Username already exists. Please choose a different username."
              );
            } else if (backendError === "Email already exists") {
              setErrorMessage(
                "Email already exists. Please use a different email."
              );
            } else {
              setErrorMessage(backendError); // Generic error from backend
            }
          } else {
            setErrorMessage("An unexpected error occurred. Please try again.");
          }
        });
    }
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

  // Add this helper function in your component
  const getVehicleType = (capacity) => {
    return capacity > 15000 ? "Heavy-duty trucks" : "Light-duty trucks";
  };
  const filteredVehicles =
    filter === "All"
      ? data
      : data.filter(
          (v) => v.fuel_type?.trim().toLowerCase() === filter.toLowerCase()
        );

  const paginatedData =
    tabIndex === 0
      ? data.slice(
          userPage * userRowsPerPage,
          userPage * userRowsPerPage + userRowsPerPage
        )
      : filteredVehicles.slice(
          vehiclePage * vehicleRowsPerPage,
          vehiclePage * vehicleRowsPerPage + vehicleRowsPerPage
        );
  const allCountVehicles = data.length;
  const dieselCount = data.filter(
    (v) => v.fuel_type?.trim().toLowerCase() === "diesel"
  ).length;
  const gasolineCount = data.filter(
    (v) => v.fuel_type?.trim().toLowerCase() === "gasoline"
  ).length;

  // Debugging logs
  console.log("allCountVehicles:", allCountVehicles);
  console.log("Diesel Count:", dieselCount);
  console.log("Gasoline Count:", gasolineCount);
  console.log("Data:", data);

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
    if (
      data.some(
        (vehicle) =>
          vehicle.LicenseNo === newVehicle.LicenseNo &&
          (!editingVehicle || vehicle.VehicleID !== editingVehicle.VehicleID)
      )
    ) {
      setSnackbar({
        open: true,
        message: "License number already registered.",
        severity: "error",
      });
      return;
    }
  
    const isDuplicate = data.some((vehicle) => {
      console.log("vehicle.LicenseNo:", vehicle.LicenseNo);
      console.log("newVehicle.LicenseNo:", newVehicle.LicenseNo);

      // Check if LicenseNo exists for both vehicles
      if (!vehicle.LicenseNo || !newVehicle.LicenseNo) {
        return false; // Skip this vehicle if LicenseNo is missing
      }

      return (
        vehicle.LicenseNo.toLowerCase() ===
          newVehicle.LicenseNo.toLowerCase() &&
        (editingVehicle ? vehicle.VehicleID !== editingVehicle.VehicleID : true)
      );
    });
    if (isDuplicate) {
      setSnackbar({
        open: true,
        message: "License number already registered.",
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

    console.log("vehiclePayload:", vehiclePayload);

    const apiCall = editingVehicle
      ? axios.post(
          `${config.API_BASE_URL}/vehicles/updateVehicle?vehicle_id=${editingVehicle.VehicleID}`,
          vehiclePayload,
          { headers }
        )
      : axios.post(`${config.API_BASE_URL}/addNewVehicle`, vehiclePayload, {
          headers,
        });
    console.log("vehiclePayload:", vehiclePayload);
    apiCall
      .then((response) => {
        fetchData();
        handleCloseVehicleDialog();
        setSnackbar({
          open: true,
          message: `Vehicle ${
            editingVehicle ? "updated" : "added"
          } successfully`,
          severity: "success",
        });
      })
      .catch((error) => {
        console.error(
          `Error ${editingVehicle ? "updating" : "creating"} vehicle:`,
          error
        );
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
  //edit vehicle data
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
        fetchData(); // refresh the table
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
    setEditingUser(null); // optional: reset edit
  };

  const handleOpenVehicleDialog = () => {
    setOpenVehicleDialog(true);
    setEditingVehicle(null); // optional: reset edit
  };

  const handleCloseUserDialog = () => setOpenUserDialog(false);
  const handleCloseVehicleDialog = () => setOpenVehicleDialog(false);

  return (
    <>
      <NavBar />
      <Breadcrumbs />
      <Paper sx={{ padding: 2, margin: "auto" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Typography variant="h5" sx={{ color: "#156272" }}>
            <FaUserShield className="role-icon" /> Admin Dashboard
          </Typography>

          <Tabs
            value={tabIndex}
            className="tab-links"
            onChange={(e, newValue) => setTabIndex(newValue)}
            sx={{ borderRadius: "4px", border: "1px solid #dcdcdc" }}
          >
            <Tab
              label="Users"
              className="tab-link"
              sx={{ "&.MuiTab-root": { minHeight: "37px!important" } }}
            />
            <Tab label="Vehicles" className="tab-link" />
          </Tabs>
        </Box>
        <Box>
          {tabIndex === 0 ? (
            <Box className="filter-container">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => handleOpenUserDialog()} // Replace with your handleOpenDialog function
              >
                Create User
              </Button>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  className="search-add-container"
                  placeholder="Search"
                  size="small"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Tabs
                  value={filter}
                  onChange={(e, newValue) => {
                    setFilter(newValue); // Update the filter
                    setUserPage(0); // Reset pagination to first page
                  }}
                >
                  <Tab
                    label={`All (${data.length})`}
                    value="All"
                    className="tab"
                    sx={{
                      backgroundColor:
                        filter === "All" ? "#388e3c" : "#dcdcdc4a!important",
                      color: filter === "All" ? "white" : "#1976d2",
                      border: "1px solid #dcdcdc",
                      padding: "5px 15px",
                      "&.MuiTab-root": {
                        minHeight: "39px !important",
                      },
                    }}
                  />
                  <Tab
                    label={`Managers (${
                      data.filter(
                        (u) => u.role?.trim().toLowerCase() === "manager"
                      ).length
                    })`}
                    className="tab"
                    value="manager"
                    sx={{
                      backgroundColor:
                        filter === "manager"
                          ? "#388e3c"
                          : "#dcdcdc4a!important",
                      color: filter === "manager" ? "white" : "#1976d2",
                      border: "1px solid #dcdcdc",
                      padding: "5px 15px",
                      "&.MuiTab-root": {
                        minHeight: "39px !important",
                      },
                    }}
                  />
                  <Tab
                    label={`Drivers (${
                      data.filter((u) => u.role === "driver").length
                    })`}
                    value="driver"
                    className="tab"
                    sx={{
                      backgroundColor:
                        filter === "driver" ? "#388e3c" : "#dcdcdc4a!important",
                      color: filter === "driver" ? "white" : "#1976d2",
                      border: "1px solid #dcdcdc",
                      padding: "5px 15px",
                      "&.MuiTab-root": {
                        minHeight: "39px !important",
                      },
                    }}
                  />
                  <Tab
                    label={`Deleted Users (${
                      data.filter((u) => u.deleted === true).length
                    })`}
                    value="deleted"
                    className="tab"
                    sx={{
                      backgroundColor:
                        filter === "deleted"
                          ? "#388e3c"
                          : "#dcdcdc4a!important",
                      color: filter === "deleted" ? "white" : "#1976d2",
                      border: "1px solid #dcdcdc",
                      padding: "5px 15px",
                      "&.MuiTab-root": {
                        minHeight: "39px !important",
                      },
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
                <Tabs
                  value={filter}
                  onChange={(e, newValue) => {
                    setFilter(newValue); // Update the filter
                    setUserPage(0); // Reset pagination to first page
                  }}
                >
                  <Tab
                    label={`All (${allCountVehicles})`}
                    value="All"
                    className="tab"
                    sx={{
                      backgroundColor:
                        filter === "All" ? "#388e3c" : "#dcdcdc4a",
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
                      backgroundColor:
                        filter === "Diesel" ? "#388e3c" : "#dcdcdc4a",
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
                      backgroundColor:
                        filter === "Gasoline" ? "#388e3c" : "#dcdcdc4a",
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
        ) : data.length === 0 ? (
          <Typography>No data found.</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "60vh",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "6px", // Width of the scrollbar
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
              },
            }}
          >
            <Table sx={{ borderCollapse: "collapse" }}>
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#5e87b0 ",
                  zIndex: 1,
                  "& th": { padding: "4px" },
                }}
              >
                <TableRow>
                  {tabIndex === 0 ? (
                    <>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        SNo
                      </TableCell>
                      {/* <TableCell sx={{ color: "white", borderRight: "1px solid #bbb" }}>ID</TableCell> */}
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Name
                      </TableCell>

                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Role
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Email
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Activity Status
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Action
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        SNo
                      </TableCell>

                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Vehicle LicenseNo
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Vehicle Type
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Fuel Type
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        CO2 Emissions(g/mile)
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Mileage(km/l)
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Capacity(lbs)
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", borderRight: "1px solid #bbb" }}
                      >
                        Action
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData
                  .filter((item) => {
                    // Convert everything to lowercase for case-insensitive search
                    const searchMatch = JSON.stringify(item)
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());

                    // Role-based filtering (for users only)
                    let roleMatch = true;
                    if (tabIndex === 0 && filter !== "All") {
                      roleMatch =
                        item.role?.trim().toLowerCase() ===
                        filter.toLowerCase();
                    }

                    // Fuel-type filtering (for vehicles only)
                    let fuelTypeMatch = true;
                    if (tabIndex === 1 && filter !== "All") {
                      fuelTypeMatch =
                        item.fuel_type?.trim().toLowerCase() ===
                        filter.toLowerCase();
                    }

                    return searchMatch && roleMatch && fuelTypeMatch;
                  })
                  .map((item, index) => (
                    <TableRow key={index}>
                      {tabIndex === 0 ? (
                        <>
                          <TableCell>
                            {userPage * userRowsPerPage + index + 1}
                          </TableCell>
                          {/* <TableCell>{item.user_id}</TableCell> */}
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar
                                sx={{ width: 32, height: 32, marginRight: 1 }}
                              />
                              <Typography variant="body2">
                                {item.role}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell>{item.status}</TableCell>

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
                          <TableCell>
                            {vehiclePage * vehicleRowsPerPage + index + 1}
                          </TableCell>
                          <TableCell>{item.license_no}</TableCell>
                          <TableCell>{item.vehicle_type}</TableCell>
                          <TableCell>{item.fuel_type}</TableCell>
                          <TableCell>{item.exhaust_co2}</TableCell>
                          <TableCell>{item.mileage}</TableCell>
                          <TableCell>{item.capacity}</TableCell>
                          <TableCell>{item.status}</TableCell>
                          <TableCell>
                            {item.status === "In Transit" ? (
                              <>
                                <Tooltip title="Vehicle is in transit,cant able to edit/delete">
                                  <span>
                                    <IconButton disabled color="primary">
                                      <Edit />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Vehicle is in transit,cant able to edit/delete">
                                  <span>
                                    <IconButton disabled color="error">
                                      <Delete />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  onClick={() => handleEditVehicle(item)}
                                  color="primary"
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  onClick={() =>
                                    handleDeleteVehicle(item.vehicle_id)
                                  }
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                          {/* Snackbar for success messages */}
                          <Snackbar
                            open={snackbar.open}
                            autoHideDuration={3000}
                            onClose={() =>
                              setSnackbar({ ...snackbar, open: false })
                            }
                            anchorOrigin={{
                              vertical: "top",
                              horizontal: "right",
                            }}
                          >
                            <Alert
                              onClose={() =>
                                setSnackbar({ ...snackbar, open: false })
                              }
                              severity={snackbar.severity}
                              sx={{ width: "100%" }}
                            >
                              {snackbar.message}
                            </Alert>
                          </Snackbar>
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
        count={tabIndex === 0 ? data.length : data.length}
        rowsPerPage={tabIndex === 0 ? userRowsPerPage : vehicleRowsPerPage}
        page={tabIndex === 0 ? userPage : vehiclePage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
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
              ErrorIcon={
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
              ErrorIcon={
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
              ErrorIcon={
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
            g
            sx={{ minWidth: 120 }}
          >
            {editingUser ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
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
            <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
              <InputLabel
                sx={{ transform: "translate(14px, -9px) scale(0.75)" }}
              >
                Vehicle Type
              </InputLabel>
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

            {/* Emissions (converted to US units) */}
            <TextField
              fullWidth
              size="small"
              label="Exhaust CO₂ Emissions (g/mile)"
              variant="outlined"
              sx={{ mb: 2.5 }}
              type="number"
              value={
                newVehicle.ExhaustCO2
                  ? (parseFloat(newVehicle.ExhaustCO2) * 1.60934).toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setNewVehicle({
                    ...newVehicle,
                    ExhaustCO2: value
                      ? (parseFloat(value) / 1.60934).toFixed(2)
                      : "",
                  });
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Co2 />
                  </InputAdornment>
                ),
              }}
            />

            {/* Fuel Efficiency (converted to mpg) */}
            <TextField
              fullWidth
              size="small"
              label="Fuel Efficiency (mpg)"
              variant="outlined"
              sx={{ mb: 2.5 }}
              type="number"
              value={
                newVehicle.Mileage
                  ? (2.3521458 / parseFloat(newVehicle.Mileage)).toFixed(1)
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setNewVehicle({
                    ...newVehicle,
                    Mileage: value
                      ? (2.3521458 / parseFloat(value)).toFixed(4)
                      : "",
                  });
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Speed />
                  </InputAdornment>
                ),
              }}
            />

            {/* Vehicle Capacity (converted to lbs) */}
            <TextField
              fullWidth
              size="small"
              label="Vehicle Capacity (lbs)"
              variant="outlined"
              sx={{ mb: 2.5 }}
              type="number"
              value={
                newVehicle.VehicleCapacity
                  ? (parseFloat(newVehicle.VehicleCapacity) * 2.20462).toFixed(
                      0
                    )
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  const numericValue =
                    value === "" ? "" : parseFloat(value) / 2.20462;
                  setNewVehicle({
                    ...newVehicle,
                    VehicleCapacity: numericValue,
                    VehicleType: getVehicleType(numericValue),
                  });
                }
              }}
              helperText={
                <Box
                  component="span"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <InfoIcon color="info" fontSize="small" />
                  Light-duty: ≤ 33,069 lbs, Heavy-duty: > 33,069 lbs
                </Box>
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Scale />
                  </InputAdornment>
                ),
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

      {/* //edit vehicle data */}
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
            value={selectedVehicle?.mileage || ""}
            onChange={(e) =>
              setSelectedVehicle({
                ...selectedVehicle,
                mileage: e.target.value,
              })
            }
          />
          {/* Add other fields as needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => updateVehicleDetails()}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminAdministration;
