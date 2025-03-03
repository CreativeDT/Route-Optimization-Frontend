import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Switch, TextField,
  Avatar, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Tabs, Tab,Box
} from "@mui/material";
import { Edit, Add } from "@mui/icons-material";
import NavBar from "../../Components/NavBar";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", role: "driver", email: "", status: true });

  // Fetch users from API
  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authorization failed");
      return;
    }

    axios
      .get("http://127.0.0.1:8000/users/usersList", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        console.log("Fetched Users:", response.data); 
        setUsers(response.data.users.map(user => ({
          id: user.user_id,
          name: user.username,
          email: user.email,
          role: user.role.toLowerCase(),  // Convert role to lowercase
          status: user.status === "active"
        })));
      })
      .catch((error) => console.error("Error fetching users:", error));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open Dialog for Add/Edit
  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    setNewUser(user ? { ...user } : { name: "", role: "driver", email: "", status: true });
    setOpenDialog(true);
  };

  // Close Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  // Save User (Add or Edit)
  const handleSaveUser = () => {
    const userPayload = {
      username: newUser.name,
      password: "defaultpassword",
      user_role: newUser.role.toLowerCase(),
      email: newUser.email
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
          fetchUsers();  // Re-fetch users after update
          handleCloseDialog();
        })
        .catch((error) => console.error("Error updating user:", error));
    } else {
      // Create new user
      axios
        .post("http://127.0.0.1:8000/createUser", userPayload, { headers })
        .then(() => {
          fetchUsers();  // Re-fetch users after creation
          handleCloseDialog();
        })
        .catch((error) => console.error("Error creating user:", error));
    }
  };

  // Toggle User Status
  const toggleUserStatus = (id) => {
    setUsers(users.map((user) => user.id === id ? { ...user, status: !user.status } : user));
  };

  // Filtering Users
  const filteredUsers = users.filter((user) => 
    (filter === "All" || user.role === filter.toLowerCase()) &&
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
    <NavBar />
    <Breadcrumbs />
    <Paper sx={{ padding: 3, margin: "auto", maxWidth: 900 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="h6" gutterBottom>Users List</Typography>

      {/* Filter Tabs */}
      <Tabs value={filter} onChange={(e, newValue) => setFilter(newValue)} textColor="primary">
        <Tab label={`All (${users.length})`} value="All" />
        <Tab label={`Managers (${users.filter((u) => u.role === "manager").length})`} value="manager" />
        <Tab label={`Drivers (${users.filter((u) => u.role === "driver").length})`} value="driver" />
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
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Create User
        </Button>
      </div>

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 340, overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#00796b", color: "white" }}>
              <TableCell sx={{ color: "white" }}>SNo</TableCell>
              <TableCell sx={{ color: "white" }}>User Name</TableCell>
              <TableCell sx={{ color: "white" }}>Role</TableCell>
              <TableCell sx={{ color: "white" }}>Email</TableCell>
              <TableCell sx={{ color: "white" }}>Status</TableCell>
              <TableCell sx={{ color: "white" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell><Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, marginRight: 1 }} />
                            <Typography variant="body2">{user.role}</Typography>
                            </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Switch checked={user.status} onChange={() => toggleUserStatus(user.id)} /></TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenDialog(user)}><Edit /></IconButton>
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
          <TextField label="Name" fullWidth sx={{ mt: 2 }} value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          <TextField label="Email" fullWidth sx={{ mt: 2 }} value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
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
        
          </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
    </>
  );
};

export default UserList;
