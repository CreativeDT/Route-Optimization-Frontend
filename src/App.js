// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/SignUp'; 
import Dashboard from './Pages/Dashboard'; 
import RouteTracking from './Pages/RouteTracking/RouteTracking'; 
import Analytics1  from './Pages/Analytics/Analytics';
import RoutePlanning from './Pages/RoutePlanning/SuggestedRoutes';

import UserList from './Pages/AdminPersona/UsersList';
import VehiclesList from './Pages/AdminPersona/VehiclesList';
import DriverDashboard from './Pages/DriverPersona/DriverDashboard';
import DriverFleetDetails from './Pages/DriverPersona/DriverFleetDetails ';
import DriverFleetstatus from './Pages/DriverPersona/DriverFleetstatus';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/route-tracking" element={<RouteTracking />} />
        <Route path="/analytics" element={<Analytics1 />} />
        <Route path="/route-planning" element={<RoutePlanning />} />
        <Route path="/userlist" element={<UserList/>}/>
        <Route path="/vehiclelist" element={<VehiclesList/>}/>
        <Route path="/driverdashboard" element={<DriverDashboard />} />
        <Route path="/driverfleetdetails" element={<DriverFleetDetails />} />
        <Route path="/driverfleetstatus"  element={<DriverFleetstatus />} />
      </Routes>
    </Router>
  );
};

export default App;