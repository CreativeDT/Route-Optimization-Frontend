import React, { useEffect, useState, useContext } from "react";
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
  Paper,Box,
  Alert,
  Switch,
} from "@mui/material";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import "./Table.css"; 
import NavBar from "../../Components/NavBar";

import config from "../../config";
import Breadcrumbs2 from "./Breadcrumbs2";

const DriverFleetDetails = () => {
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const tableHeadStyles = {
    position: "sticky",
    top: 0,
    backgroundColor: "#3f51b5", // Dark blue header
    color: "#ffffff",
    zIndex: 2,
  };
  
  const tableCellStyles = {
    borderRight: "1px solid #e0e0e0", // Light gray divider
    color: "#ffffff",
    fontWeight: "bold",
  };
  
  const tableContainerStyles = {
    maxHeight: "70vh", // Restrict height to allow scrolling
    overflow: "auto",
  };
  
  const rowStyles = {
    "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" }, // Alternate row colors
    "&:hover": { backgroundColor: "#e3f2fd" }, // Light blue on hover
  };
  
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
          `${config.API_BASE_URL}/getConsignments`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("API Response:", response.data);

        if (
          !response.data ||
          !response.data.consignments ||
          response.data.consignments.length === 0
        ) {
          setError("No consignments found.");
          setConsignments([]);
        } else {
          setConsignments(response.data.consignments);
        }
      } catch (err) {
        console.error("API Fetch Error:", err.response?.data || err.message);
        setError("Failed to fetch consignments.");
        setConsignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConsignments();
  }, [token]);

  // Handler to toggle route status.
  // For example, toggling between "started" and "not started".
  const handleToggleStatus = async (routeID, currentStatus) => {
    const newStatus = currentStatus === "started" ? "not started" : "started";

    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/updateStatus`,
        { routeID, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        // Update local state with the new status for this route.
        setConsignments((prev) =>
          prev.map((consignment) =>
            consignment.routeID === routeID
              ? { ...consignment, status: newStatus }
              : consignment
          )
        );
      }
    } catch (err) {
      console.error("Error updating route status:", err);
      setError("Failed to update route status.");
    }
  };

  return (
    <>
      <NavBar />
      <Breadcrumbs2 />
      <Box fullWidth>
        <Typography variant="h6">Driver Fleet Details</Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : consignments.length > 0 ? (
          <TableContainer component={Paper} sx={tableContainerStyles}>
            <Table className="customTable"stickyHeader>
              <TableHead>
                <TableRow sx={tableHeadStyles}>
                  <TableCell sx={tableCellStyles}>Route ID</TableCell>
                  <TableCell sx={tableCellStyles}>Vehicle ID</TableCell>
                  <TableCell sx={tableCellStyles}>Origin</TableCell>
                  <TableCell sx={tableCellStyles}>Destination</TableCell>
                  <TableCell sx={tableCellStyles}>Status</TableCell>
                  <TableCell sx={tableCellStyles}>Carbon Emission</TableCell>
                  <TableCell sx={tableCellStyles}>Created Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consignments.map((consignment) => (
                  <TableRow key={consignment.routeID}>
                    <TableCell>{consignment.routeID}</TableCell>
                    <TableCell>{consignment.vehicle_id}</TableCell>
                    <TableCell>{consignment.origin}</TableCell>
                    <TableCell>{consignment.destination}</TableCell>
                    <TableCell>
                      <Switch
                        checked={consignment.status === "started"}
                        onChange={() =>
                          handleToggleStatus(consignment.routeID, consignment.status)
                        }
                        color="primary"
                      />
                      {consignment.status}
                    </TableCell>
                    <TableCell>{consignment.carbon_emission}</TableCell>
                    <TableCell>
                      {new Date(consignment.creationDate).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No consignments found.</Typography>
        )}
      </Box>
    </>
  );
};

export default DriverFleetDetails;
