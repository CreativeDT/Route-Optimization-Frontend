import React, { useState } from "react";
import { Container, TextField, Button, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from "@mui/material";
import axios from "axios";
import * as yup from "yup";
import { useFormik } from "formik";

const validationSchema = yup.object({
  user_id: yup.string().required("User ID is required"),
  driver_id: yup.string().when("user_role", {
    is: "driver",
    then: yup.string().required("Driver ID is required for drivers"),
  }),
});

const DriverFleetDetails = () => {
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      user_id: "",
      driver_id: "",
      user_role: "admin", // Change role dynamically
    },
    validationSchema,
    onSubmit: async (values) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, authorization failed");
            return;
        }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post("http://127.0.0.1:8000/getConsignments", values,{
            headers: { Authorization: `Bearer ${token}` },
        });
        setConsignments(response.data.consignments);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch consignments");
      }
      setLoading(false);
    },
  });

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Fetch Consignments</Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          label="User ID"
          name="user_id"
          value={formik.values.user_id}
          onChange={formik.handleChange}
          error={formik.touched.user_id && Boolean(formik.errors.user_id)}
          helperText={formik.touched.user_id && formik.errors.user_id}
          margin="normal"
        />
        {formik.values.user_role === "driver" && (
          <TextField
            fullWidth
            label="Driver ID"
            name="driver_id"
            value={formik.values.driver_id}
            onChange={formik.handleChange}
            error={formik.touched.driver_id && Boolean(formik.errors.driver_id)}
            helperText={formik.touched.driver_id && formik.errors.driver_id}
            margin="normal"
          />
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Fetch Consignments"}
        </Button>
      </form>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {consignments.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Route ID</TableCell>
                <TableCell>Vehicle ID</TableCell>
                <TableCell>Origin</TableCell>
                <TableCell>Destination</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consignments.map((consignment) => (
                <TableRow key={consignment.routeID}>
                  <TableCell>{consignment.routeID}</TableCell>
                  <TableCell>{consignment.vehicle_id}</TableCell>
                  <TableCell>{consignment.origin}</TableCell>
                  <TableCell>{consignment.destination}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default DriverFleetDetails;
