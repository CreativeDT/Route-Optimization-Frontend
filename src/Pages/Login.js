import React, { useState, useContext,useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Typography, TextField,  IconButton, InputAdornment,Button, Box, Paper, Link, MenuItem, Container } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";
import { AuthContext } from "../Context/AuthContext";
import "./Login.css"; // Import the CSS for background animation
import logo from "../Assets/images/CSG Logo_PNG.png";
import config from "../config";
import { Visibility, VisibilityOff } from "@mui/icons-material";



const theme = createTheme();


const SESSION_TIMEOUT = 1 * 60 * 1000; // 5 minutes
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("admin");
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  
const handleTogglePassword = () => {
  setShowPassword(!showPassword);
};
  let timeoutRef = useRef(null);
  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        handleSessionTimeout();
      }, SESSION_TIMEOUT);
    };
  
    resetTimer(); // Start timer

  
    const handleSessionTimeout = () => {
      setSessionExpired(true);
      logout(); // Clear authentication
      navigate("/sessionexpired"); // Redirect to login page
    };

    resetTimer(); // Initialize timer on login
     // Listen for user activity to reset the timer
     window.addEventListener("mousemove", resetTimer);
     window.addEventListener("keydown", resetTimer);
 
     return () => {
      clearTimeout(timeoutRef.current);
       window.removeEventListener("mousemove", resetTimer);
       window.removeEventListener("keydown", resetTimer);
     };
   }, [navigate, logout]);


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        console.log("  login with:", { username, userRole });
        const response = await axios.post(`${config.API_BASE_URL}/login`, {
        username,
        password,
        user_role: userRole,
      });
      console.log("Login API Response:", response.data);
      if (response.data) {
          const { access_token, user_id, driver_id } = response.data;

                  // Create user object
                const userData = {
                  token: access_token,
                  // user_id: user_id,
                  user_role: userRole,
                  username: username,
              };
        
               // Store user details in localStorage
               localStorage.setItem("user", JSON.stringify(userData));


               // Store user details in localStorage
              // localStorage.setItem("token", access_token);/
              //  localStorage.setItem("user_id", user_id);
                //  localStorage.setItem("user_role", userRole);
              // Log the token to verify it's stored correctly
              // console.log("Token stored in localStorage:", localStorage.getItem("token"));


        // Store driver_id only if user is a driver
        if (userRole === "driver" && driver_id) {
            localStorage.setItem("driver_id", driver_id);
            console.log("Stored driver_id:", driver_id);
        } else {
            localStorage.removeItem("driver_id"); // Ensure it's removed for non-drivers
        }

        
        // Set authentication token for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

        login(userData); // Set auth context
        setSessionExpired(false); // Reset session expiration state

         // Update AuthContext
         console.log("Calling login function with:",userData);
         login(userData); 
         console.log("Calling login function with:", userData);
        // Redirect based on user role
        if (userRole === "driver") {
          navigate("/driverdashboard");
        } else if (userRole === "manager") {
          navigate("/managerdashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError( "Invalid username, password, or role");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="login-page">
        <Container
          component={motion.main}
          maxWidth="xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{ position: "relative" }}
        >
          <Paper elevation={3} className="login-box">
          {sessionExpired && (
              <Typography color="error" variant="body2" sx={{ textAlign: "center", mb: 2 }}>
                Session expired due to inactivity. Please log in again.
              </Typography>
            )}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              style={{ marginBottom: "10px" }}
            >
              <img src={logo} alt="CSG Logo" className="login-logo" />
            </motion.div>
            <motion.div initial={{ y: -50 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100 }}>
              <LockOutlinedIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </motion.div>
            <Typography component="h1" variant="h6" sx={{ mt: 1, fontSize: "1.2rem" }}>
              Sign in
            </Typography>
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                margin="dense"
                required
                fullWidth
                size="small"
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
  type={showPassword ? "text" : "password"}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={handleTogglePassword} edge="end" sx={{ 
        "& .MuiSvgIcon-root ": { 
                        
                       fontSize:"12px!important"
                          
                             } ,
                     }}>
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
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
                <MenuItem value="manager">Fleet Manager</MenuItem>
                <MenuItem value="driver">Driver</MenuItem>
              </TextField>
              {error && (
                <Typography color="error" variant="body2" sx={{ fontSize: "0.8rem" }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="small"
                sx={{
                  mt: 2,
                  mb: 1,
                  py: 1,
                  fontSize: "0.9rem",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                Sign In
              </Button>
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Link href="#" variant="body2" sx={{ display: "block", mb: 0.5, fontSize: "0.85rem" }}>
                  Forgot password?
                </Link>
                <Link href="/signup" variant="body2" sx={{ display: "block", fontSize: "0.85rem" }}>
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
