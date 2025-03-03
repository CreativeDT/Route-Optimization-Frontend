import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    Select, MenuItem, FormControl, InputLabel,IconButton
} from "@mui/material";
import {Edit, Add } from "@mui/icons-material";
import NavBar from "../../Components/NavBar";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

const VehiclesList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
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

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, authorization failed");
            return;
        }

        axios.get("http://127.0.0.1:8000/getVehicles", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
            // Normalize "Vehicle Status" to "VehicleStatus"
            const updatedVehicles = response.data.vehicles.map(vehicle => ({
                ...vehicle,
                VehicleStatus: vehicle["Vehicle Status"] // Assigning the value correctly
            }));
            setVehicles(updatedVehicles);
        })
            .catch(error => console.error("Error fetching vehicles:", error));
    }, []);

    // Open Dialog for Add/Edit
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

    // Close Dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingVehicle(null);
    };

    // Save Vehicle (Add or Edit)
    const handleSaveVehicle = () => {
        //const vehiclePayload = { ...newVehicle };
             // Assume you have a token stored in localStorage or context
    const token = localStorage.getItem("token"); // or get from context/state

    if (!token) {
      console.error("No token found, authorization failed");
      return;
    }
  
    const headers = {
        Authorization: `Bearer ${token}`,  // Correct format
        "Content-Type": "application/json",  // Ensure JSON format
    };

    const vehiclePayload = {
        vehicle_type: newVehicle.VehicleType,  
        fuel_type: newVehicle.FuelType,
        exhaust_co2: parseFloat(newVehicle.ExhaustCO2) || 0,
        mileage: parseFloat(newVehicle.Mileage) || 0,
        vehicle_capacity: parseFloat(newVehicle.VehicleCapacity) || 0,
        license_no: newVehicle.LicenseNo,
        vehicle_status: newVehicle.VehicleStatus, // Check if API requires this
    };
    
        if (editingVehicle) {
            // Update vehicle
            axios.put(`http://127.0.0.1:8000/updateVehicle/${editingVehicle.VehicleID}`, vehiclePayload,{ headers })
                .then(response => {
                    setVehicles(vehicles.map(v => v.VehicleID === editingVehicle.VehicleID ? response.data : v));
                    handleCloseDialog();
                })
                .catch(error => console.error("Error updating vehicle:", error));
        } else {
            // Create new vehicle
            axios.post("http://127.0.0.1:8000/addNewVehicle", vehiclePayload ,{ headers })
                .then(response => {
                    console.log("Vehicle added:", response.data);
                    setVehicles([...vehicles, response.data]);
                    handleCloseDialog();
                })
                .catch(error => console.error("Error creating vehicle:", error));
        }
    };

    // Filtering Vehicles based on search term
    const filteredVehicles = vehicles.filter(vehicle =>
        (vehicle.VehicleType && vehicle.VehicleType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vehicle.LicenseNo && vehicle.LicenseNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
        <NavBar />
        <Breadcrumbs />
        <Paper sx={{ padding: 3, margin: "auto", maxWidth: 900 }}>
            <Typography variant="h6" gutterBottom>
                Vehicles List
            </Typography>

            {/* Search Bar & Add Button */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <TextField
                    variant="outlined"
                    placeholder="Search Vehicle"
                    size="small"
                    fullWidth
                    sx={{ mr: 2 ,width:'70%'}}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                    Add Vehicle
                </Button>
            </div>

            {/* Vehicles Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 350, overflow: 'auto' }}>
                <Table>
                    <TableHead>
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
                    <TableBody>
                        {filteredVehicles.map((vehicle, index) => (
                            <TableRow key={vehicle.VehicleID}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{vehicle.VehicleType}</TableCell>
                                <TableCell>{vehicle.FuelType}</TableCell>
                                <TableCell>{vehicle.Mileage} km/l</TableCell>
                                <TableCell>{vehicle.VehicleCapacity} kg</TableCell>
                                <TableCell>{vehicle.ExhaustCO2} g/km</TableCell>
                                <TableCell>{vehicle.VehicleStatus}</TableCell>
                                <TableCell>
                                <IconButton color="primary" onClick={() => handleOpenDialog(vehicle)}><Edit /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Vehicle Dialog */}
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
        </>
    );
};

export default VehiclesList;
