import React, { useState } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography, CircularProgress, Alert ,Paper} from "@mui/material";
import config from "../../config";
import NavBar from "../../Components/NavBar";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

const DriverFleetstatus = () => {
  const [routeID, setRouteID] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleFetchStatus = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/getStatus`,
        { routeID },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // The backend returns {"detail": "...", "result": result }
      setResult(response.data.result);
    } catch (err) {
      console.error("Error fetching status:", err);
      setError(err.response?.data?.detail || "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <NavBar />
    <Breadcrumbs />
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Get Route Status
      </Typography>
      <TextField
        label="Route ID"
        variant="outlined"
        fullWidth
        value={routeID}
        onChange={(e) => setRouteID(e.target.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleFetchStatus}
        disabled={loading || !routeID}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Fetch Status"}
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {result && (
        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6">Status Details:</Typography>
          <Typography>Route ID: {result.routeID}</Typography>
          <Typography>Status: {result.status}</Typography>
          <Typography>Vehicle ID: {result.vehicle_id}</Typography>
          <Typography>
            Current Location:{" "}
            {Array.isArray(result.current_location)
              ? result.current_location.join(", ")
              : JSON.stringify(result.current_location)}
          </Typography>
        </Paper>
      )}
    </Container>
    </>
  );
};

export default DriverFleetstatus;
