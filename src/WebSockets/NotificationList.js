import React, { useState } from "react";
import { List, ListItem, ListItemText, Badge, Typography, Box } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import useNotificationWebSocket from "./UseNotificationWebSockets"; // Your custom hook

const NotificationList = ({ userId }) => {
  const { notifications } = useNotificationWebSocket(userId);
  const [localNotifications, setLocalNotifications] = useState([]);

  React.useEffect(() => {
    setLocalNotifications(notifications); // Update local copy when new notifications arrive
  }, [notifications]);

  const handleNotificationClick = (notificationId) => {
    setLocalNotifications((prev) =>
      prev.map((n) =>
        n.notification_id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        <Badge 
          badgeContent={localNotifications.filter(n => !n.read).length}
          color="error"
        >
          <NotificationsIcon fontSize="large" />
        </Badge> Notifications
      </Typography>

      <List sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
        {localNotifications.length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            No notifications yet!
          </Typography>
        ) : (
          localNotifications.map((notification) => (
            <ListItem 
              key={notification.notification_id} 
              sx={{ 
                backgroundColor: notification.read ? "white" : "#e3f2fd",
                mb: 1,
                borderRadius: 2,
                boxShadow: 1,
                cursor: 'pointer'
              }}
              onClick={() => handleNotificationClick(notification.notification_id)}
            >
              <ListItemText 
                primary={notification.title || "New Notification"} 
                secondary={notification.message || "No details available."} 
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default NotificationList;
