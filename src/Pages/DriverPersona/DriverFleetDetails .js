import React, { useEffect, useState, useContext ,useMemo,createContext} from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Table,  Snackbar,
  TableBody,
  TableCell,TextField,
  TableContainer,
  TableHead,
  TableRow,Tooltip,  FormControlLabel,
  Paper,Box,TablePagination,
  Alert,Select, MenuItem ,
  Switch,
} from "@mui/material";
import { useRefresh } from "../RefreshContext";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import "./Table.css"; 
import NavBar from "../../Components/NavBar";
import { GiSteeringWheel } from 'react-icons/gi';
import config from "../../config";
import Breadcrumbs2 from "./Breadcrumbs2";
import { faMapMarkerAlt, faFlagCheckered } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DriverFleetDetails = () => {
  const { refreshKey } = useRefresh();
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
   const [rowsPerPage, setRowsPerPage] = useState(5);
   const [isInTransit, setIsInTransit] = useState(true); // Default status
const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const tableHeadStyles = {
    position: "sticky",
    top: 0,
    backgroundColor: "#3f51b5", // Dark blue header
    color: "#ffffff",
    zIndex: 2,
  };
  const currentDriverID = user?.user_id || user?.id; 


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
    // if (!token) {
    //   setError("No authentication token found.");
    //   setLoading(false);
    //   return;
    // }

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
  }, [token,refreshKey]);

  // Handler to toggle route status.
  // For example, toggling between "started" and "not started".
  // const handleToggleStatus = async (routeID, currentStatus) => {
  //   const newStatus = currentStatus === "started" ? "not started" : "started";

  //   try {
  //     const response = await axios.post(
  //       `${config.API_BASE_URL}/updateStatus`,
  //       { routeID, status: newStatus },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     if (response.status === 200) {
  //       // Update local state with the new status for this route.
  //       setConsignments((prev) =>
  //         prev.map((consignment) =>
  //           consignment.routeID === routeID
  //             ? { ...consignment, status: newStatus }
  //             : consignment
  //         )
  //       );
  //     }
  //   } catch (err) {
  //     console.error("Error updating route status:", err);
  //     setError("Failed to update route status.");
  //   }
  // };
  // const handleStatusChange = async (routeID, newStatus) => {
  //   try {
  //     const response = await axios.post(
  //       `${config.API_BASE_URL}/updateStatus`,
  //       { routeID, status: newStatus },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  
  //     if (response.status === 200) {
  //       // Update local state
  //       setConsignments((prev) =>
  //         prev.map((consignment) =>
  //           consignment.routeID === routeID
  //             ? { ...consignment, status: newStatus }
  //             : consignment
  //         )
  //       );
  //     }
  //   } catch (err) {
  //     console.error("Error updating route status:", err);
  //     setError("Failed to update route status.");
  //   }
  // };
  const handleStatusChange = async (routeID, newStatus) => {
    try {
      // Get the current driver ID from user context
      const currentDriverID = user?.driverID || user?.id;
      
      // Check if driver is trying to start a new route
      if (newStatus === "started") {
        // Check if driver already has any active route
        const activeRoute = consignments.find(
          c => c.driverID === currentDriverID && c.status === "started"
        );
  
        if (activeRoute) {
          setSnackbar({
            open: true,
            message: `You're already on route ${activeRoute.routeID.slice(-5)}. Complete it before starting another.`,
            severity: "warning"
          });
          return;
        }
      }
  
      // Rest of your status change logic...
      const response = await axios.post(
        `${config.API_BASE_URL}/updateStatus`,
        { routeID, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        setConsignments(prev =>
          prev.map(consignment =>
            consignment.routeID === routeID
              ? { ...consignment, status: newStatus }
              : consignment
          )
        );
        
        setSnackbar({
          open: true,
          message: `Route status updated to ${newStatus}`,
          severity: "success"
        });
      }
    } catch (err) {
      console.error("Error updating route status:", err);
      setSnackbar({
        open: true,
        message: "Failed to update route status",
        severity: "error"
      });
    }
  };
  const filteredConsignments = useMemo(() => {
    return consignments.filter((consignment) =>
      Object.values(consignment)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, consignments]);
  
  const paginatedConsignments = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredConsignments.slice(start, end);
  }, [filteredConsignments, page, rowsPerPage]);
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);
  // const handleToggle = (event) => {
  //   const newStatus = event.target.checked;
  //   setIsInTransit(newStatus);
  //   const token = localStorage.getItem('token');
  //   // Send updated status to backend  
  //   axios.post(
  //     `${config.API_BASE_URL}/driver/restPeriod?rest=${newStatus}`, // sending boolean true/false
  //     {},
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   )
  //     .then(() => {
  //       setSnackbar({ open: true, message: 'Driver status updated', severity: 'success' });
  //     })
  //     .catch(() => {
  //       setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
  //       setIsInTransit(!newStatus); // Revert toggle on failure
  //     });
  // };
  return (
    <>
      <NavBar />
      <Breadcrumbs2 />
      {/* <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        Driver Status
      </Typography>

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="body1">
          Current Status: <strong>{isInTransit ? 'In Transit' : 'Rested'}</strong>
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isInTransit}
              onChange={handleToggle}
              color="primary"
            />
          }
          label={isInTransit ? 'In Transit' : 'Rested'}
        />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
      
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper> */}
      <Paper  id="paper" sx={{ border: "1px solid  #e0e0e0", margin: "auto",padding:2 }}>
      <Box className="filter-container" id="filter-container">
           <Box sx={{display:'flex',gap:1, 
           justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          flexWrap: "wrap",}} id="box">
     <Typography variant="h6">    <GiSteeringWheel  className="role-icon" />Driver Fleet Details</Typography>
     <TextField
          label="Search"
          variant="outlined"
          size="small"
          sx={{ minWidth: 250 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
         
        />
</Box>
        
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
                  <TableCell sx={tableCellStyles}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: 6 }} />Origin</TableCell>
                  <TableCell sx={tableCellStyles}>
                    <FontAwesomeIcon icon={faFlagCheckered} style={{ marginRight: 6 }} />Destination</TableCell>
                  <TableCell sx={tableCellStyles}>Status</TableCell>
                  <TableCell sx={tableCellStyles}>Carbon Emission(lbs)</TableCell>
                  <TableCell sx={tableCellStyles}>Created Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* {consignments.map((consignment) => ( */}
                {paginatedConsignments.map((consignment) => (

                  <TableRow key={consignment.routeID}>
                    <TableCell>
                        <Tooltip title={consignment.routeID || "No routeid available"} arrow>
                      <span>{consignment.routeID ? consignment.routeID.slice(-5) : "N/A"}</span></Tooltip>
                      </TableCell>
                    <TableCell>
                    <Tooltip title={consignment.vehicle_id || "No routeid available"} arrow>
                    <span>{consignment.vehicle_id ? consignment.vehicle_id.slice(-5) : "N/A"}</span></Tooltip>

                    </TableCell>
                    <TableCell>{consignment.origin}</TableCell>
                    <TableCell>{consignment.destination}</TableCell>
                    {/* <TableCell>
                      <Switch
                        checked={consignment.status === "started"}
                        onChange={() =>
                          handleToggleStatus(consignment.routeID, consignment.status)
                        }
                        color="primary"
                      />
                      {consignment.status}
                    </TableCell> */}
                   <TableCell>
                      {/* <Select
                        value={consignment.status}
                        onChange={(e) => handleStatusChange(consignment.routeID, e.target.value)}
                        variant="standard" // removes the default outlined border
                        disableUnderline // removes the underline from 'standard' variant
                        size="small"
                        sx={{
                          minWidth: 120,
                          backgroundColor:
                            consignment.status === "started"
                               ? "#ff980073" // orange
                              : consignment.status === "not started"
                              ? "#ff00005e" 
                              : consignment.status === "rested"
                              ? "#03a9f485" // blue
                              : consignment.status === "completed"
                              ? "#4caf50ab" // green
                              : "#e0e0e0", // default gray
                          color: "white",
                          borderRadius: 1,
                           fontSize:"10px",
                          "& .MuiSelect-select": {
                            padding: "2px 12px",
                          },
                        }}
                      >
                        <MenuItem value="started">Started</MenuItem>
                        <MenuItem value="not started">Not Started</MenuItem>
                        <MenuItem value="rested">Rested</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select> */}
                      
  <Tooltip
    title={
      consignments.some(c => 
        c.driverID === currentDriverID && 
        c.status === "started" &&
        c.routeID !== consignment.routeID
      )
        ? "You already have an active route. Complete it first."
        : ""
    }
    arrow
  >
    <span>
      <Select
        value={consignment.status}
        onChange={(e) => handleStatusChange(consignment.routeID, e.target.value)}
        disabled={
          consignments.some(c => 
            c.driverID === currentDriverID && 
            c.status === "started" &&
            c.routeID !== consignment.routeID
          ) ||
          consignment.status === "completed"
        }
        
        variant="standard"
        disableUnderline
        size="small"
        sx={{
          minWidth: 120,
          backgroundColor:
            consignment.status === "started"
              ? "#ff980073"
              : consignment.status === "not started"
              ? "#ff00005e" 
              : consignment.status === "rested"
              ? "#ff00005e" 
              
              : consignment.status === "completed"
              ? "#4caf50ab"
              : "#e0e0e0",
          color: "white",
          borderRadius: 1,
          fontSize: "10px",
          "& .MuiSelect-select": {
            padding: "2px 12px",
          },
        }}
      >
        <MenuItem value="started">Started</MenuItem>
        <MenuItem value="not started">Not Started</MenuItem>
        <MenuItem value="rested">Rested</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
      </Select>
    </span>
  </Tooltip>

                    </TableCell>


                    <TableCell>{consignment.carbon_emission}</TableCell>
                    <TableCell>
                      {new Date(consignment.creationDate).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
  component="div"
  count={filteredConsignments.length}
  page={page}
  onPageChange={(event, newPage) => setPage(newPage)}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={(event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  }}
  rowsPerPageOptions={[5, 10, 25]}
/>

          </TableContainer>
        ) : (
          <Typography>No consignments found.</Typography>
        )}
      </Box>
      </Paper>
    </>
  );
};

export default DriverFleetDetails;