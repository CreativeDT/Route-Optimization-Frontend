import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Lock as LockIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';

const SessionExpiryPage = () => {
  // Session timeout in seconds (5 minutes)
  const initialTimeout = 1 * 60;
  const [timeLeft, setTimeLeft] = useState(initialTimeout);
  const [open, setOpen] = useState(true);
  const [extended, setExtended] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = ((initialTimeout - timeLeft) / initialTimeout) * 100;

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0) {
      // Session expired - redirect to login or perform logout
      console.log('Session expired');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Extend session handler
  const handleExtendSession = () => {
    setTimeLeft(initialTimeout);
    setExtended(true);
    setTimeout(() => setExtended(false), 3000);
  };

  // Logout handler
  const handleLogout = () => {
    // Perform logout operations
    console.log('User logged out');
    setOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <LockIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Session About to Expire
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your session will expire in {formatTime(timeLeft)} due to inactivity.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ height: 8, borderRadius: 4 }}
                color={timeLeft < 60 ? 'error' : 'primary'}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleExtendSession}
              sx={{ px: 4 }}
            >
              Stay Signed In
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{ px: 4 }}
            >
              Sign Out
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Extension confirmation dialog */}
      <Dialog open={extended} onClose={() => setExtended(false)}>
        <DialogTitle>Session Extended</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your session has been extended. You'll be logged out after another period of inactivity.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtended(false)} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionExpiryPage;