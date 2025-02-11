import { useState, useEffect, useRef } from "react";

const UseWebSocket = (url) => {
    const [vehiclePosition, setVehiclePosition] = useState(null);
    const socketRef = useRef(null);
    const intervalRef = useRef(null);  // ✅ Use ref to store interval

    console.log("WebSocket URL:", url);
    
    useEffect(() => {
        if (!("WebSocket" in window)) {
            console.error("WebSocket is not supported by your browser.");
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

                    if (Array.isArray(data) && data.length > 0) {
                        const vehicle = data[0];
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

                            setVehiclePosition({
                                lat,
                                lng,
                                placeName,
                                status: vehicle.status || "unknown",
                            });

                            console.log("Updated Vehicle Position 🚗:", { lat, lng, placeName });
                        } else {
                            console.error("Invalid location format:", locationString);
                        }
                    }
                } catch (error) {
                    console.error("WebSocket Data Parsing Error:", error);
                }
            };

            //  Store interval in useRef
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
                setTimeout(connectWebSocket, 5000);
            };
        };

        connectWebSocket();
        
        return () =>  {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);  // ✅ Properly clear interval
            }
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [url]);

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

    return { vehiclePosition };
};

export default UseWebSocket;
