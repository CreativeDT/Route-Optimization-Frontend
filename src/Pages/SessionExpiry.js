import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from "../config";
const SessionExpiry = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
        
      axios.get(`${config.API_BASE_URL}/current_user`,{
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
      })
        .then(res => {
          // Optionally refresh user context or token
          console.log("USER still active:", 'active');
        })
        .catch(err => {
          if (err.response?.status === 401) {
            // Token is invalid or expired
            console.warn('Session expired');
            localStorage.clear(); // or remove token
            navigate('/sessionexpired'); // redirect to session expiry page
          }
        });
    }, 1 * 60 * 1000); // 5 minutes


   


    return () => clearInterval(interval); // cleanup on unmount
  }, [navigate]);

  return null; // This is a background utility component
};

export default SessionExpiry;
