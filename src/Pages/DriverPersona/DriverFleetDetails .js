import React, { useEffect, useState, useContext } from "react";
import { Container, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from "@mui/material";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";

const DriverFleetDetails = () => {
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    const fetchConsignments = async () => {
        try {
          console.log("Fetching consignments...");
      
          const response = await axios.post(
            "http://127.0.0.1:8000/getConsignments",
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
      
          console.log("API Response:", response.data);
      
          // Check if response.data.consignments exists before accessing its length
          if (!response.data || !response.data.consignments || response.data.consignments.length === 0) {
            setError("No consignments found.");
            setConsignments([]); // Ensure state is reset to empty array
          } else {
            setConsignments(response.data.consignments);
          }
        } catch (err) {
          console.error("API Fetch Error:", err.response?.data || err.message);
          setError("Failed to fetch consignments.");
          setConsignments([]); // Reset state in case of error
        } finally {
          setLoading(false);
        }
      };
      
    fetchConsignments();
  }, [token]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4">Driver Fleet Details</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : consignments.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Route ID</TableCell>
                <TableCell>Vehicle ID</TableCell>
                <TableCell>Origin</TableCell>
                <TableCell>Destination</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Carbon Emission</TableCell>
                <TableCell>Created Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consignments.map((consignment) => (
                <TableRow key={consignment.routeID}>
                  <TableCell>{consignment.routeID}</TableCell>
                  <TableCell>{consignment.vehicle_id}</TableCell>
                  <TableCell>{consignment.origin}</TableCell>
                  <TableCell>{consignment.destination}</TableCell>
                  <TableCell>{consignment.status}</TableCell>
                  <TableCell>{consignment.carbon_emission}</TableCell>
                  <TableCell>{new Date(consignment.creationDate).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No consignments found.</Typography>
      )}
    </Container>
  );
};

export default DriverFleetDetails;
