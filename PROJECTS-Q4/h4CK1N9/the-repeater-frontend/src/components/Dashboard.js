import React from 'react';
import '../css/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Campaign Overview</h1>
      <div className="stats">
        <div className="stat-card">
          <h2>Total Messages Sent</h2>
          <p>1,234</p>
        </div>
        <div className="stat-card">
          <h2>Responses Received</h2>
          <p>56</p>
        </div>
        <div className="stat-card">
          <h2>Unique Targets</h2>
          <p>345</p>
        </div>
      </div>
      <div className="heat-map">
        <h2>Spam Heat Map</h2>
        <img src="heat-map.png" alt="Heat Map" />
      </div>
    </div>
  );
};

export default Dashboard;
