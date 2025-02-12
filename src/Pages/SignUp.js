// src/components/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, TextField, Button, Box, Paper, Grid, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import logo from '../Assets/images/CSG Logo_PNG.png';
import { motion } from 'framer-motion';
import './Signup.css';
import config from '../config';

const theme = createTheme();

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('manager');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.API_BASE_URL}/signup`, {
        username,
        password,
        user_role: userRole
      });
      if (response.data) {
        navigate('/login'); // Redirect to login after successful signup
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="signup-page"> {/* Add a wrapper div */}
        <Container
          component={motion.main}
          maxWidth="xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',width: '100%' }}
        >
          <Paper elevation={3} className="signup-box"> {/* Add a class to the Paper */}
            {/* Logo added here */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              style={{ marginBottom: '10px' }} // Add some spacing below logo
            >
              <img src={logo} alt="CSG Logo" className="signup-logo" />
            </motion.div>

            <motion.div initial={{ y: -50 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
              <LockOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </motion.div>
            <Typography component="h1" variant="h5" sx={{ mt: 0 }}>
              Sign up
            </Typography>
            <Box component="form" onSubmit={handleSignup} sx={{ mt: 0, width: '100%'  }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="userRole"
                label="User Role"
                select
                SelectProps={{ native: true }}
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="driver">Driver</option>
              </TextField>
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="/login" variant="body2">
                    {"Already have an account? Sign In"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default Signup;