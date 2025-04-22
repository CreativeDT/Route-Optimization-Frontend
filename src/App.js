// src/App.js
import React from 'react';
import {  Router, Routes, Route } from 'react-router-dom';
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
import Nearbyconsignments from './Pages/DriverPersona/Nearbyconsignments';
import ManagerDashboard from './Pages/ManagerPersona/ManagerDashboard';
import ManagerAdministration from './Pages/ManagerPersona/ManagerAdministration';
import ManagerSuggestRoutes from './Pages/ManagerPersona/ManagerSuggestRoutes';
import ManagerRouteTracking from './Pages/ManagerPersona/ManagerRouteTracking';
import ManagerAnalytics from './Pages/ManagerPersona/ManagerAnalytics';
import DriverRouteTracking from './Pages/DriverPersona/DriverRouteTracking';
import DriverAnalytics from './Pages/DriverPersona/DriverAnalytics';
import AdminAdministration from './Pages/AdminPersona/AdminAdministartion';
import UpdateProfile from './Pages/DriverPersona/UpdateProfile/UpdateProfile';
import SessionExpiryPage from './Pages/SessionExpiryPage';
import SessionExpired from './Pages/SessionExpired';










const App = () => {
  return (

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
        <Route path="/nearbyconsignments" element={<Nearbyconsignments />} />
        <Route path="/managerdashboard"  element={<ManagerDashboard />} />
        <Route path="/manageradministration" element={<ManagerAdministration />}/>
        <Route path="/managersuggestroutes" element={<ManagerSuggestRoutes />} />
        <Route path="/managerroutetracking"  element={<ManagerRouteTracking />} />
        <Route path="/manageranalytics"  element={<ManagerAnalytics />} />
        <Route path="/driverroutetracking" element={<DriverRouteTracking />} />
        <Route path ="/driveranalytics" element={<DriverAnalytics />} />
        <Route path ="/adminadministration" element={<AdminAdministration />} />
        <Route path ="/updateprofile" element={<UpdateProfile />} />
        <Route path ="/sessionexpiraypage" element={<SessionExpiryPage />} />
        <Route path ="/sessionexpired" element={<SessionExpired />} />
       
   
      </Routes>
    

  );
};

export default App;