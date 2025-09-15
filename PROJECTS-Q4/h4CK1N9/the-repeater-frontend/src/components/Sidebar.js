import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/campaigns">Campaigns</Link></li>
        <li><Link to="/targets">Targets</Link></li>
        <li><Link to="/messages">Messages</Link></li>
        <li><Link to="/settings">Settings</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
