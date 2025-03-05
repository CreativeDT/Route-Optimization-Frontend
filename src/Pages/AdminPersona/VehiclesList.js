import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    Select, MenuItem, FormControl, InputLabel, IconButton, Snackbar, Alert,TablePagination
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import NavBar from "../../Components/NavBar";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import config from "../../config";

const VehiclesList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [newVehicle, setNewVehicle] = useState({
        VehicleType: "Heavy-duty trucks",
        FuelType: "Diesel",
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

    const fetchVehicles = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, authorization failed");
            return;
        }

        axios.get(`${config.API_BASE_URL}/getVehicles`, {
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
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingVehicle(null);
    };

    const handleSaveVehicle = () => {
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

    const filteredVehicles = vehicles.filter(vehicle =>
        (vehicle.VehicleType && vehicle.VehicleType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.LicenseNo && vehicle.LicenseNo.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Paper sx={{ padding: 3, margin: "auto" , backgroundColor:  '#E8E8E8'}}>
                <Typography variant="h5" gutterBottom>
                           Admin Dashboard !!
                          </Typography>
                        

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" gutterBottom>
                           Vehicle List
                          </Typography>

                    
                    <TextField
                        variant="outlined"
                        placeholder="Search Vehicle"
                        size="small"
                        fullWidth
                        sx={{ mr: 2, width: '30%' }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                        Add Vehicle
                    </Button>
                </div>

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
                          <TableHead sx={{ position: "sticky", top: 0, backgroundColor: "#00796b", zIndex: 1 }}>
                            <TableRow sx={{ backgroundColor: "#00796b", color: "white" }}>
                                <TableCell sx={{ color: "white" }}>SNo</TableCell>
                                <TableCell sx={{ color: "white" }}>Vehicle Type</TableCell>
                                <TableCell sx={{ color: "white" }}>Fuel Type</TableCell>
                                <TableCell sx={{ color: "white" }}>Mileage</TableCell>
                                <TableCell sx={{ color: "white" }}>Capacity</TableCell>
                                <TableCell sx={{ color: "white" }}>CO2 Emissions</TableCell>
                                <TableCell sx={{ color: "white" }}>Status</TableCell>
                                <TableCell sx={{ color: "white" }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody  sx={{ "& td, & th": { padding: "4px" } }} >
                            {filteredVehicles
                             .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Apply pagination
                            .map((vehicle, index) => (
                                <TableRow key={vehicle.VehicleID}>
                                     <TableCell>{page * rowsPerPage + index + 1.}</TableCell>
                                    <TableCell>{vehicle.VehicleType}</TableCell>
                                    <TableCell>{vehicle.FuelType}</TableCell>
                                    <TableCell>{vehicle.Mileage} km/l</TableCell>
                                    <TableCell>{vehicle.VehicleCapacity} kg</TableCell>
                                    <TableCell>{vehicle.ExhaustCO2} g/km</TableCell>
                                    <TableCell>{vehicle.VehicleStatus}</TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleOpenDialog(vehicle)}><Edit /></IconButton>
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
                            onChange={(e) => setNewVehicle({ ...newVehicle, VehicleType: e.target.value })}
                            label="Vehicle Type"
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
        value={newVehicle.ExhaustCO2}
        onChange={(e) => setNewVehicle({ ...newVehicle, ExhaustCO2: e.target.value })}
    />

    <TextField
        fullWidth
        label="Mileage (km/l)"
        variant="outlined"
        sx={{ mt: 2 }}
        value={newVehicle.Mileage}
        onChange={(e) => setNewVehicle({ ...newVehicle, Mileage: e.target.value })}
    />

    <TextField
        fullWidth
        label="Vehicle Capacity (kg)"
        variant="outlined"
        sx={{ mt: 2 }}
        value={newVehicle.VehicleCapacity}
        onChange={(e) => setNewVehicle({ ...newVehicle, VehicleCapacity: e.target.value })}
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
