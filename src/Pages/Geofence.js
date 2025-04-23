import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polygon, Popup } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import { Button } from "@mui/material";

const GeofenceMap = ({ selectedRouteID }) => {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const center = [12.9716, 77.5946]; // Default map center

  //  Function to Create Geofence
  const createGeofence = async (routeID) => {
    try {
      setLoading(true);
      await axios.post(`http://127.0.0.1:8000/geofence/createGeofences?routeID=${routeID}`);
      fetchGeofences(routeID); // Fetch geofences after creating
    } catch (err) {
      setError("Failed to create geofence");
    } finally {
      setLoading(false);
    }
  };

  //  Function to Fetch Geofences
  const fetchGeofences = async (routeID) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/geofence/getGeofences?routeID=${routeID}`);
      setGeofences(response.data);
    } catch (err) {
      setError("Failed to fetch geofence data");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch geofences when routeID changes
  useEffect(() => {
    if (selectedRouteID) {
      fetchGeofences(selectedRouteID);
    }
  }, [selectedRouteID]);

  if (loading) return <p>Loading geofences...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold text-center mb-4">Geofence Map</h2>

      {/* Save & Track Button */}
      <Button
        variant="contained"
        size="small"
        onClick={() => createGeofence(selectedRouteID)}
        sx={{ backgroundColor: "#318CE7", color: "white", fontSize: "12px" }}
      >
        Save & Track
      </Button>

      {/* Map Container */}
      <MapContainer center={center} zoom={10} className="w-full h-[500px] rounded-lg shadow-md mt-4">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {geofences.map((geo) => {
          const coordinates = JSON.parse(geo.geofence_coordinates).map(coord => [coord[1], coord[0]]);
          const waypoints = JSON.parse(geo.route_waypoints).map(wp => [wp.coordinates[1], wp.coordinates[0]]);

          return (
            <React.Fragment key={geo.geofence_id}>
              {/* Geofence Polygon */}
              <Polygon positions={coordinates} color="blue">
                <Popup><b>Geofence ID:</b> {geo.geofence_id}</Popup>
              </Polygon>

              {/* Waypoints Markers */}
              {waypoints.map((position, index) => (
                <Marker key={index} position={position} icon={L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", iconSize: [25, 25] })}>
                  <Popup>Waypoint {index + 1}</Popup>
                </Marker>
              ))}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default GeofenceMap;
