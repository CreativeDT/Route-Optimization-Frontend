import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  Divider,
  CircularProgress,
  Paper,
  Chip,
  IconButton,Tooltip,
  Stack
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Directions as DirectionsIcon,
  Refresh as RefreshIcon,
  Circle as CircleIcon,
  LocationOn as LocationIcon,
  ArrowUpward as PickupIcon,
  ArrowDownward as DropIcon,
  PriorityHigh as PriorityIcon
} from "@mui/icons-material";
import config from '../../config';

const RouteHistory = ({ onLoadRoute }) => {
  const [plannedRoutes, setPlannedRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem('token');

  const fetchPlannedRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/routeHistory/plannedRoutes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPlannedRoutes(data.routes || []);
    } catch (error) {
      console.error("Failed to fetch planned routes", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlannedRoutes();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPlannedRoutes().finally(() => setRefreshing(false));
  };

  return (
    <Paper elevation={0} sx={{ 
      // height: '100%',
      display: 'flex',
      flexDirection: 'column',
      p: 1,
       borderRadius: 2
    }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1
      }}>
        <Typography variant="h6">Route History</Typography>
        <IconButton onClick={handleRefresh} size="small">
          {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      ) : plannedRoutes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No saved routes found
        </Typography>
      ) : (
        <List dense sx={{ flex: 1 }}>
        {[...plannedRoutes]
          .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
          .map((route) => (
            <React.Fragment key={route.route_id}>
              <ListItem sx={{ 
                flexDirection: 'column',
                alignItems: 'flex-start',
                px: 0
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <CircleIcon sx={{ fontSize: 8, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(route.start_date).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Typography variant="subtitle2" sx={{ ml: 2, mb: 1 }}>
                  {/* {route.origin} → {route.destination} */}
                    {route.origin?.name} → {route.destination?.name}
                </Typography>

                <Box sx={{ ml: 2, width: '95%' }}>
                  {route.stop_demands?.map((stop, index) => (
                    <Stack 
                    key={`${stop.name}-${index}`}
                      direction="row" 
                      spacing={1}
                      alignItems="center"
                     
                      sx={{ 
                        mb: 1,
                        // p: 1,
                        borderRadius: 1,
                        bgcolor: 'action.hover',fontSize:'10px'
                      }}
                    >
                      <LocationIcon color="primary" fontSize="small" />
                      <Typography variant="body2">Stop Name:{stop.name}</Typography>
                      
                    
                      
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <DropIcon color="error" fontSize="small" />
                        <Typography variant="caption">Drop Demand:{stop.drop_demand}</Typography>
                      </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                        <PickupIcon color="success" fontSize="small" />
                        <Typography variant="caption">PickUp Demand:{stop.pickup_demand}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <PriorityIcon color="warning" fontSize="small" />
                        <Typography variant="caption">Priority:{stop.priority}</Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Box>

                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'flex-end',
                  width: '100%',
                  mt: 1,
                  gap: 1
                }}>
                  <Tooltip title="Load route">
                 
                    <IconButton
                      size="small"
                       onClick={() =>{
                        console.log("Route clicked:", route);
                        onLoadRoute(route)}}
                       
                      color="primary"
                    >
                      <DirectionsIcon fontSize="small" />
                    </IconButton>
                     
                  </Tooltip>
                  <Tooltip title="Delete route">
                    <IconButton
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
              <Divider sx={{ my: 1 }} />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default RouteHistory;