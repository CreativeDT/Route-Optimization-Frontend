import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, TextField, Button, Box, Paper, Grid, Link, MenuItem, Container } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { AuthContext } from '../Context/AuthContext';
import './Login.css'; // Import the CSS for background animation
import logo from '../Assets/images/CSG Logo_PNG.png';
import config from '../config'; 

const theme = createTheme();

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userRole, setUserRole] = useState('admin');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    console.log('config ::',config);
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${config.API_BASE_URL}/login`, {
                username,
                password,
                user_role: userRole
            });

            if (response.data) {
                const userData = { 
                    token: response.data.access_token,
                    username,
                    userRole
                };
                login(userData);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login Error:', err.response?.data || err.message);
            setError(err.response?.data?.detail || 'Invalid username, password, or role');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <div className="login-page"> {/* Background wrapper */}
                <Container
                    component={motion.main}
                    maxWidth="xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    sx={{ position: 'relative' }}
                >
                    <Paper elevation={3} className="login-box"> {/* Login box */}
                    <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                            style={{ marginBottom: '10px' }} // Add some spacing below logo
                        >
                            <img src={logo} alt="CSG Logo" className="login-logo" />
                        </motion.div>
                        <motion.div initial={{ y: -50 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
                            <LockOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        </motion.div>
                        <Typography component="h1" variant="h6" sx={{ mt: 1, fontSize: '1.2rem' }}>
                            Sign in
                        </Typography>
                        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                            <TextField
                                margin="dense"  // Reduces vertical spacing
                                required
                                fullWidth
                                size="small"    // Smaller input fields
                                label="Username"
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                required
                                fullWidth
                                size="small"
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                required
                                fullWidth
                                size="small"
                                label="User Role"
                                select
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="manager">Manager</MenuItem>
                                <MenuItem value="driver">Driver</MenuItem>
                            </TextField>
                            {error && (
                                <Typography color="error" variant="body2" sx={{ fontSize: '0.8rem' }}>
                                    {error}
                                </Typography>
                            )}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="small"  // Smaller button
                                sx={{ mt: 2, mb: 1, py: 1, fontSize: '0.9rem', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                            >
                                Sign In
                            </Button>
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Link href="#" variant="body2" sx={{ display: 'block', mb: 0.5, fontSize: '0.85rem' }}>
                                    Forgot password?
                                </Link>
                                <Link href="/signup" variant="body2" sx={{ display: 'block', fontSize: '0.85rem' }}>
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </div>
        </ThemeProvider>
    );
};

export default Login;
