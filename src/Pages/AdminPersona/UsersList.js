import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import {
  Table,TablePagination,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Switch,
  TextField,
  Avatar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,CircularProgress,
  DialogTitle,
  Tabs,
  Tab,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import NavBar from "../../Components/NavBar";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import config from "../../config";
import { useNavigate } from 'react-router-dom';
import "./Form.css";  
 
const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    role: "driver",
    email: "",
    password: "",
    status: true,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
 
 

  // Fetch users from API
  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authorization failed");
      return;
    }
 
    axios
      .get(`${config.API_BASE_URL}/users/usersList`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Fetched Users:", response.data);
        setUsers(
          response.data.users.map((user) => ({
            id: user.user_id,
            name: user.username,
            email: user.email,
            role: user.role.toLowerCase(), // Convert role to lowercase
            status: user.status === "active",
          }))
        );
      })
      .catch((error) => console.error("Error fetching users:", error));
  };
 
  useEffect(() => {
    fetchUsers();
  }, []);
 
  // Open Dialog for Add/Edit
  const handleOpenDialog = (user = null) => {
    console.log("Opening dialog, user:", user); // Log the user object
    setEditingUser(user);
    setNewUser(
      user
        ? { ...user, password: "" }
        : { name: "", role: "driver", email: "", password: "", status: true }
    );
    setSearchTerm(""); // Reset search term to avoid filtering issues
    setOpenDialog(true);
  };
 
  // Close Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setErrorMessage(""); // Clear error message when closing
  };
 
  // Save User (Add or Edit)
  const handleSaveUser = () => {
    setErrorMessage(""); // Reset error message
 

     // Validation: Check if all fields are filled
     if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      setErrorMessage("Please fill in all fields.");
      return; // Stop execution if validation fails
    }
    const userPayload = {
      username: newUser.name,
      password: newUser.password,
      user_role: newUser.role.toLowerCase(),
      email: newUser.email,
      status: newUser.status ? "active" : "inactive",
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
        .put(`/updateUser/${editingUser.id}`, userPayload, { headers })
        .then(() => {
          fetchUsers(); // Re-fetch users after update
          handleCloseDialog();
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
          fetchUsers(); // Re-fetch users after creation
          handleCloseDialog();
          console.log("UserPayload:",userPayload)
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
              setErrorMessage(backendError); // Generic error from backend
            }
          }
          else {
            setErrorMessage("An unexpected error occurred. Please try again.");
          }
        });
    }
  };
  const handleTabChange = (event, newPage) => {
    setActiveTab(newPage);
    if (newPage === 1) {
      navigate('/vehiclelist');
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
        fetchUsers();
        setSnackbar({
          open: true,
          message: "User removed successfully!",
          severity: "success",
        });
      })
      .catch((error) => console.error("Error removing user:", error));
  };
 
  const loggedInUserRole = localStorage.getItem("user_role");
 
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
 
  const filteredUsers = users.filter(
    (user) =>
      (filter === "All" || user.role.includes(filter.toLowerCase())) &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
 
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
      <Box sx={{ display: "flex", alignItems: "center" ,justifyContent: "space-between"  }}>
            <Typography variant="h6" sx={{color:"#156272"}} gutterBottom className="title">Admin Dashboard</Typography>
            <Box  className="nav-links"> 
            <Typography   gutterBottom component={NavLink} to="/userlist" className="nav-link">
           Users
          </Typography>
          <Typography gutterBottom component={NavLink} to="/vehiclelist" className="nav-link">
           Vehicles
          </Typography>
          </Box>
          </Box>

          <Box className="filter-container">
          {/* Filter Tabs */}
       
          <Tabs
            value={filter}
            onChange={(e, newValue) => setFilter(newValue)}
            >
            <Tab label={`All (${users.length})`} value="All" className="tab"/>
            <Tab
              label={`Managers (${
                users.filter((u) => u.role === "manager").length
              })`}
              className="tab"
              value="manager"
            />
            <Tab
              label={`Drivers (${
                users.filter((u) => u.role === "driver").length
              })`}
              value="driver"
              className="tab"
            />
          </Tabs>
       
        {/* Search Bar & Add Button */}
        <Box className="search-add-container">
          <TextField
            placeholder="Search"
            size="small"
           
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Create User
          </Button>
          </Box>
          </Box>
            

        <TableContainer component={Paper}  sx={{ maxHeight: 300, overflowY: "auto", "&::-webkit-scrollbar": {
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
          <Table sx={{ minWidth: 650, borderCollapse: "collapse" }}>
            <TableHead sx={{ position: "sticky", top: 0, backgroundColor: "#156272", zIndex: 1 , padding: "8px"}}>
              <TableRow sx={{ backgroundColor: "#00796b", color: "white" }}>
                <TableCell sx={{ color: "white" }}>SNo</TableCell>
                <TableCell sx={{ color: "white" }}>User Name</TableCell>
                <TableCell sx={{ color: "white" }}>Role</TableCell>
                <TableCell sx={{ color: "white" }}>Email</TableCell>
                <TableCell sx={{ color: "white" }}>Status</TableCell>
                <TableCell sx={{ color: "white" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody  sx={{ "& td, & th": { padding: "4px" } }} >
              {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Apply pagination
                  .map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{page * rowsPerPage + index + 1.}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ width: 32, height: 32, marginRight: 1 }} />
                      <Typography variant="body2">{user.role}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                   <TableCell>
                   <Switch
  checked={user.status === "inactive"}
  onChange={() => handleToggle(user.id, user.status)}
  disabled={loggedInUserRole && loggedInUserRole.toLowerCase() === "admin"}
/>
 
                  </TableCell>
                 
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <Edit />
                    </IconButton>
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
          </Table>
        </TableContainer>
          
        {/* Table Pagination */}
        <TablePagination
                    rowsPerPageOptions={[5,10, 25, 50]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
 
        {/* Add/Edit User Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              fullWidth
              sx={{ mt: 2 }}
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              sx={{ mt: 2 }}
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
            <TextField
              label="Password"
              fullWidth
              sx={{ mt: 2 }}
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
            <TextField
              label="Role"
              fullWidth
              select
              SelectProps={{ native: true }}
              sx={{ mt: 2 }}
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="Driver">Driver</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </TextField>
 
            {errorMessage && (
              <Typography color="error" sx={{ mt: 1 }}>
                {errorMessage}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSaveUser}
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};
 
export default UserList;