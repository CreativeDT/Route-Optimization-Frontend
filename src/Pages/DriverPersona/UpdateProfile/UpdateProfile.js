import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../../config';
import './UpdateProfile.css';

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

  const [formData, setFormData] = useState({
    // driver_name: profile?.driver_name || '',
    // email: profile?.email || '',
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
   
    address: profile?.address || '',
   
    joining_date: profile?.joining_date?.split('T')[0] || '',
    phone: profile?.phone || '',
  });

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(Object.entries(formData).filter(([_, v]) => v));
    try {
      const res = await axios.post(`${config.API_BASE_URL}/users/updateUserProfile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.detail);
      navigate(-1);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
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

        {/* <div className="form-group">
          <FontAwesomeIcon icon={faEnvelope} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        </div> */}

        

        <div className="form-group">
          <FontAwesomeIcon icon={faUser} />
          <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <FontAwesomeIcon icon={faIdCard} />
          <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <FontAwesomeIcon icon={faPhone} />
          <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="form-group ">
          <FontAwesomeIcon icon={faCalendarAlt} placeholder="Joining date" />
          <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} />
        </div>
        <div className="form-group full-width">
          <FontAwesomeIcon icon={faHome} />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
        </div>
       

        <button type="submit" className="btn-submit">Update Profile</button>
      </form>
    </div>
    </>
  );
};

export default UpdateProfile;
