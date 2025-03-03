import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
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
  DialogContent,
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

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [openDialog, setOpenDialog] = useState(false);
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
      .get("http://127.0.0.1:8000/users/usersList", {
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
    setEditingUser(user);
    setNewUser(
      user
        ? { ...user, password: "" }
        : { name: "", role: "driver", email: "", password: "", status: true }
    );
    setOpenDialog(true);
  };

  // Close Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  // Save User (Add or Edit)
  const handleSaveUser = () => {
    setErrorMessage(""); // Reset error message

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
        .post("http://127.0.0.1:8000/createUser", userPayload, { headers })
        .then(() => {
          fetchUsers(); // Re-fetch users after creation
          handleCloseDialog();
          setSnackbar({
            open: true,
            message: "User added successfully!",
            severity: "success",
          });
        })
        .catch((error) => {
          console.error("Error creating user:", error);
          if (error.response && error.response.status === 400) {
            setErrorMessage(
              "User already exists. Please try a different username."
            );
          }
        });
    }
  };

  const handleDeleteUser = (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .delete(`http://127.0.0.1:8000/users/removeUser?user_id=${id}`, {
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

  // const toggleUserStatus = (id) => {
  //   setUsers(users.map(user => user.id === id ? { ...user, status: !user.status } : user));
  // };
  const handleToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? false : true; // Convert to boolean

    try {
      // Backend expects query parameters, not a request body
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://127.0.0.1:8000/users/updateStatus?active=" + newStatus,
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
        // Set the snackbar message based on the new status
        setSnackbar({
          open: true,
          message: `User status updated to ${
            newStatus ? "active" : "inactive"
          }`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setSnackbar({
        open: true,
        message: "Failed to update user status",
        severity: "error",
      });
    }
  };
  const filteredUsers = users.filter(
    (user) =>
      (filter === "All" || user.role === filter.toLowerCase()) &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <NavBar />
      <Breadcrumbs />
      <Paper sx={{ padding: 3, margin: "auto", maxWidth: 900 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" gutterBottom>
            Users List
          </Typography>

          {/* Filter Tabs */}
          <Tabs
            value={filter}
            onChange={(e, newValue) => setFilter(newValue)}
            textColor="primary"
          >
            <Tab label={`All (${users.length})`} value="All" />
            <Tab
              label={`Managers (${
                users.filter((u) => u.role === "manager").length
              })`}
              value="manager"
            />
            <Tab
              label={`Drivers (${
                users.filter((u) => u.role === "driver").length
              })`}
              value="driver"
            />
          </Tabs>
        </Box>
        {/* Search Bar & Add Button */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <TextField
            variant="outlined"
            placeholder="Search User"
            size="small"
            fullWidth
            sx={{ mr: 2, width: "70%" }}
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
        </div>

        {/* Users Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 340 }}>
          <Table sx={{ minWidth: 650, borderCollapse: "collapse" }}>
            <TableHead sx={{ position: "sticky" }}>
              <TableRow sx={{ backgroundColor: "#00796b", color: "white" }}>
                <TableCell sx={{ color: "white" }}>SNo</TableCell>
                <TableCell sx={{ color: "white" }}>User Name</TableCell>
                <TableCell sx={{ color: "white" }}>Role</TableCell>
                <TableCell sx={{ color: "white" }}>Email</TableCell>
                <TableCell sx={{ color: "white" }}>Status</TableCell>
                <TableCell sx={{ color: "white" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ overflow: "auto" }}>
              {filteredUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
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
                      checked={user.status === "active"}
                      onChange={() => handleToggle(user.id, user.status)}
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
