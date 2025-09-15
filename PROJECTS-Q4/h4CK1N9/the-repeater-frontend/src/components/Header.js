import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">The Repeater</div>
      <nav className="nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/campaigns">Campaigns</Link>
        <Link to="/targets">Targets</Link>
        <Link to="/messages">Messages</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <div className="profile">
        <span>User Profile</span>
      </div>
    </header>
  );
};

export default Header;
