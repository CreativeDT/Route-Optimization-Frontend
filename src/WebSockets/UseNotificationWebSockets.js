import { useState, useEffect, useRef } from "react";
import axios from "axios";
const useNotificationWebSocket = (userId) => { // Receive userId as prop
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const isMounted = useRef(true); // NEW: Track if component is still mounted
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
        if (!isMounted.current) return; // prevent setting state after unmount
        try {
          const data = JSON.parse(event.data);
          console.log("New Notifications:", data);
          // setNotifications((prev) => {
            
          //   const uniqueNotifications = data.filter(
          //     (newNotification) =>
          //       !prev.some(
          //         (existingNotification) =>
          //           existingNotification.notification_id ===
          //           newNotification.notification_id
          //       )
          //   ).map(notification => ({
          //     ...notification,
          //     read: false, // Mark new ones as unread
          //   }));
      
          //   return [...prev, ...uniqueNotifications];
          // });
          // setNotifications(prev => {
          //   const allNotifications = [...data, ...prev];
          //   const uniqueNotifications = allNotifications.reduce((acc, curr) => {
          //     if (!acc.some(item => item.notification_id === curr.notification_id)) {
          //       acc.push({ ...curr, read: false });
          //     }
          //     return acc;
          //   }, []);
          //   return uniqueNotifications;
          // });
          setNotifications(prev => {
            const updatedNotifications = [...prev];
      
            data.forEach(newNotif => {
              const existing = updatedNotifications.find(n => n.notification_id === newNotif.notification_id);
      
              if (!existing) {
                updatedNotifications.unshift({ ...newNotif, read: false }); // New notification => unread
              }
              // If already exists, don't push again.
            });
      
            return updatedNotifications;
          });
        } catch (error) {
          console.error("Error parsing notification:", error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket Error :", error);
      };

      socketRef.current.onclose = () => {
        console.warn("WebSocket Disconnected!  Reconnecting...");
        if (isMounted.current && reconnectAttempts.current < 5) {
          reconnectAttempts.current++;
          setTimeout(connectWebSocket, 5000 * reconnectAttempts.current);
        } else if (reconnectAttempts.current >= 5) {
          console.error("Max reconnect attempts reached. Giving up.");
        }
      };
    };

    connectWebSocket();

    return () => {
      console.log("Cleaning up WebSocket...");
      isMounted.current = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userId]); // Depend on userId

    return { notifications, setNotifications };
};

export default useNotificationWebSocket;