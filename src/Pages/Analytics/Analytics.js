import React from 'react';
import Navbar from '../../Components/NavBar';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

const Analytics = () => {
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
              src="https://app.powerbi.com/reportEmbed?reportId=859cf7be-971b-41a5-a2b3-af1991e4be54&autoAuth=true&ctid=a9c50c6c-2ecc-4653-99b2-58024af91866&navContentPaneEnabled=false&filterPaneEnabled=false"
              style={{ border: 'none', borderRadius: '8px' }}
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;