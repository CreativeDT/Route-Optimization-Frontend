import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SessionExpiry = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('/current_user')
        .then(res => {
          // Optionally refresh user context or token
          console.log('User still active');
        })
        .catch(err => {
          if (err.response?.status === 401) {
            // Token is invalid or expired
            console.warn('Session expired');
            localStorage.clear(); // or remove token
            navigate('/sessionexpired'); // redirect to session expiry page
          }
        });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval); // cleanup on unmount
  }, [navigate]);

  return null; // This is a background utility component
};

export default SessionExpiry;
