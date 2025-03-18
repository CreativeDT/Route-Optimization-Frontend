import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Button,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import config from "../../config";
import NavBar from "../../Components/NavBar";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

const Nearbyconsignments = () => {
  const { vehicleId } = useParams(); // Get vehicle_id from URL params
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!vehicleId) {
      setError("Vehicle ID is missing.");
      setLoading(false);
      return;
    }

    const fetchNearbyConsignments = async () => {
      try {
        console.log("Fetching nearby consignments...");
        const response = await axios.get(
          `${config.API_BASE_URL}/nextNearbyConsignments?vehicle_id=${vehicleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("API Response:", response.data);

        if (!response.data || response.data.consignments.length === 0) {
          setError("No nearby consignments available.");
          setConsignments([]);
        } else {
          setConsignments(response.data.consignments);
        }
      } catch (err) {
        console.error("Error fetching consignments:", err);
        setError("Failed to fetch nearby consignments.");
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyConsignments();
  }, [vehicleId, token]);

  return (
    <>
      <NavBar />
      <Breadcrumbs />
      <Container fullWidth>
        <Typography variant="h6">Nearby Consignments</Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : consignments.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Consignment ID</TableCell>
                  <TableCell>Pickup Location</TableCell>
                  <TableCell>Drop-off Location</TableCell>
                  <TableCell>Distance (km)</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consignments.map((consignment) => (
                  <TableRow key={consignment.id}>
                    <TableCell>{consignment.id}</TableCell>
                    <TableCell>{consignment.pickup_location}</TableCell>
                    <TableCell>{consignment.dropoff_location}</TableCell>
                    <TableCell>{consignment.distance} km</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => alert(`Assigned consignment ${consignment.id}`)}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No nearby consignments found.</Typography>
        )}
      </Container>
    </>
  );
};

export default Nearbyconsignments;
