import React ,{useEffect ,useState} from 'react';
import Navbar from '../../Components/NavBar';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import config from '../../config';

const Analytics = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Fetch user ID from localStorage (or API if needed)
    const storedUserId = localStorage.getItem("user_id"); // Ensure this key matches how it's stored
    if (storedUserId) {
      setUserId(storedUserId);
    }
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