import React, { useState,useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../../config';
import './UpdateProfile.css';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faHome,
  faIdCard,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import NavBar from '../../../Components/NavBar';
import Breadcrumbs2 from '../Breadcrumbs2';

  const UpdateProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const profile = location.state?.profile;
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success', // can be "error", "info", "warning"
  });
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const token = localStorage.getItem("token");
useEffect(() => {
  const fetchProfile = async () => {
    
    try {
    
      const res = await axios.get(`${config.API_BASE_URL}/users/userProfile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;

      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        email:profile.email || '',
        joining_date: profile.joining_date?.split('T')[0] || '',
      });

    } catch (error) {
      console.error("Failed to load profile", error);
      setSnack({ open: true, message: 'Failed to load profile', severity: 'error' });
    }
  };

  fetchProfile();
}, [token]);

  const [formData, setFormData] = useState({
    // driver_name: profile?.driver_name || '',
    // email: profile?.email || '',
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email:profile.email || '',
    address: profile?.address || '',
   
    joining_date: profile?.joining_date?.split('T')[0] || '',
    phone: profile?.phone || '',
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    const token = localStorage.getItem("token");
    e.preventDefault();
    const payload = Object.fromEntries(Object.entries(formData).filter(([_, v]) => v));
    
  try {
    const res = await axios.post(`${config.API_BASE_URL}/users/updateUserProfile`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSnack({ open: true, message: res.data.detail, severity: 'success' });
    setTimeout(() => navigate(-1), 2000); // wait a bit before navigating back
  } catch (error) {
    console.error("Error updating profile:", error);
    setSnack({ open: true, message: 'Failed to update profile', severity: 'error' });
  }
  };



  
  return (
    <>
    <NavBar />
    

    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        {/* <div className="form-group">
          <FontAwesomeIcon icon={faUser} />
          <input type="text" name="driver_name" placeholder="Driver Name" value={formData.driver_name} onChange={handleChange} />
        </div> */}

      
        

        <div className="form-group">
          <FontAwesomeIcon icon={faUser} />
          <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <FontAwesomeIcon icon={faIdCard} />
          <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
        </div>
        <div className="form-group full-width" >
          <FontAwesomeIcon icon={faEnvelope} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        </div>

        <div className="form-group">
          <FontAwesomeIcon icon={faPhone} />
          <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="form-group" >
          <label htmlFor="joining_date"   style={{
            display: 'block',
            
            
            color: '#33333b0',
            fontSize: '14px'
          }}>
                  <FontAwesomeIcon icon={faCalendarAlt} /> Joining Date
          </label>
          <input
            type="date"
            id="joining_date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-width">
          <FontAwesomeIcon icon={faHome} />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
        </div>
       

        <button type="submit" className="btn-submit">Update Profile</button>
      </form>
    </div>

    <Snackbar
  open={snack.open}
  autoHideDuration={3000}
  onClose={() => setSnack({ ...snack, open: false })}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity}>
    {snack.message}
  </Alert>
</Snackbar>

    </>
  );
};

export default UpdateProfile;
