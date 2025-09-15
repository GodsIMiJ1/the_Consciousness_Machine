import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CampaignForm from './components/CampaignForm';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaigns" element={<CampaignForm />} />
            {/* Add more routes for other components */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
