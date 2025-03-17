import { useState, useEffect, useRef } from "react";

const UseWebSocket = (url, shouldConnect) => {
  // vehiclePositions is an object keyed by routeID (or vehicleID)
  const [vehiclePositions, setVehiclePositions] = useState({});
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const shouldConnectRef = useRef(shouldConnect);

  // Update the ref whenever shouldConnect changes
  useEffect(() => {
    shouldConnectRef.current = shouldConnect;
  }, [shouldConnect]);

  console.log("WebSocket URL:", url);

  useEffect(() => {
    if (!shouldConnect || !("WebSocket" in window)) {
      console.error("WebSocket is not supported by your browser or should not connect.");
      return;
    }

    const connectWebSocket = () => {
      console.log("Connecting to WebSocket...");
      socketRef.current = new WebSocket(url);

      socketRef.current.onopen = () => {
        console.log("Connected to WebSocket Server ✅");
        socketRef.current.send("Fetch data");  // Initial request
      };

      socketRef.current.onmessage = async (event) => {
        console.log("WebSocket Message Received 📡:", event.data);

        try {
          const data = JSON.parse(event.data);
          // Expect data to be an array of vehicles with route identifiers
          if (Array.isArray(data) && data.length > 0) {
            // Loop over each vehicle data
            data.forEach(async (vehicle) => {
              // Ensure that vehicle.current_location is a valid JSON string
              const locationString = vehicle.current_location;
              let locationArray;
              try {
                locationArray = JSON.parse(locationString);
              } catch (error) {
                console.error("Invalid location format:", locationString);
                return;
              }

              if (Array.isArray(locationArray) && locationArray.length === 2) {
                const [lng, lat] = locationArray;
                // Fetch human-readable place name
                const placeName = await fetchPlaceName(lat, lng);
                // Update vehiclePositions state keyed by vehicle.routeID (or vehicleID)
                if (vehicle.routeID) {
                  setVehiclePositions((prevPositions) => ({
                    ...prevPositions,
                    [vehicle.routeID]: {
                      lat,
                      lng,
                      placeName,
                      status: vehicle.status || "unknown",
                    },
                  }));
                  console.log("Updated Vehicle Position for route", vehicle.routeID, { lat, lng, placeName });
                } else {
                  console.warn("Vehicle data missing routeID:", vehicle);
                }
              } else {
                console.error("Invalid location format:", locationString);
              }
            });
          }
        } catch (error) {
          console.error("WebSocket Data Parsing Error:", error);
        }
      };

      intervalRef.current = setInterval(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send("Fetch data");
        }
      }, 5000);

      socketRef.current.onerror = (error) => {
        console.error("WebSocket Error ❌:", error);
      };

      socketRef.current.onclose = () => {
        console.warn("WebSocket Disconnected! 🔄 Reconnecting in 5 seconds...");
        if (shouldConnectRef.current) {
          setTimeout(connectWebSocket, 5000);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url, shouldConnect]);

  const fetchPlaceName = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.display_name || "Unknown Location";
    } catch (error) {
      console.error("Error fetching place name:", error);
      return "Unknown Location";
    }
  };

  return { vehiclePositions };
};

export default UseWebSocket;
