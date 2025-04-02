import { useState, useEffect, useRef } from "react";

const useNotificationWebSocket = (userId) => { // Receive userId as prop
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    if (!userId || !("WebSocket" in window)) { // Check for valid userId
      console.error("WebSocket not supported or userId missing.");
      
      return;
    }

    const connectWebSocket = () => {
      console.log(`Attempting WebSocket connection (Try ${reconnectAttempts.current + 1})`);

      console.log("User ID for WebSocket:", userId);

      const wsUrl = `ws://localhost:8000/ws/notifications/${userId}`;
      console.log("WebSocket Notification URL:", wsUrl);
      console.log("User ID for WebSocket:", userId);
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log("Connected to Notification WebSocket ");
        reconnectAttempts.current = 0;
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("New Notifications:", data);
          setNotifications((prev) => {
            const uniqueNotifications = data.filter(
              (newNotification) =>
                !prev.some(
                  (existingNotification) =>
                    existingNotification.notification_id ===
                    newNotification.notification_id
                )
            );
            return [...prev, ...uniqueNotifications];
          });
        } catch (error) {
          console.error("Error parsing notification:", error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket Error ❌:", error);
      };

      socketRef.current.onclose = () => {
        console.warn("WebSocket Disconnected! 🔄 Reconnecting...");
        if (reconnectAttempts.current < 5) {
          reconnectAttempts.current++;
          setTimeout(connectWebSocket, 5000 * reconnectAttempts.current);
        } else {
          console.error("Max reconnect attempts reached! ❌");
        }
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userId]); // Depend on userId

  return { notifications };
};

export default useNotificationWebSocket;