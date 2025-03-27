import React ,{useEffect ,useState} from 'react';
import Navbar from '../../Components/NavBar';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import config from '../../config';
import axios from 'axios';

const Analytics = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}${config.USER_DETAILS_API}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`, // If authentication is required
          },
        });

        if (response.data && response.data.user_id) {
          setUserId(response.data.user_id);
        } else {
          throw new Error("User ID not found in response");
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '95vh', overflow: 'hidden' }}>
      <Navbar />
      <Breadcrumbs />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar (optional) */}
        {/* <div style={{ width: '200px', backgroundColor: '#f4f4f4', padding: '20px', overflowY: 'auto' }}>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>Analytics Menu</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}><a href="#" style={{ textDecoration: 'none', color: '#555' }}>Dashboard</a></li>
            <li style={{ marginBottom: '10px' }}><a href="#" style={{ textDecoration: 'none', color: '#555' }}>Reports</a></li>
            <li style={{ marginBottom: '10px' }}><a href="#" style={{ textDecoration: 'none', color: '#555' }}>Settings</a></li>
          </ul>
        </div> */}

        {/* Main Content */}
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
          {/* Power BI Embed */}
          <div style={{ 
            backgroundColor: '#fff', 
            borderRadius: '8px', 
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
            padding: '20px', 
            height: 'calc(100vh - 160px)', // Adjusted height to fit the screen
            overflow: 'hidden'
          }}>
            <iframe 
              title="FleetDashboard" 
              width="100%" 
              height="100%" 
              src={`${config.POWER_BI_URL}${userId}'`} 
             
              style={{ border: 'none', borderRadius: '8px' }}
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;