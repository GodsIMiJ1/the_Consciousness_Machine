/**
 * Consciousness Machine Frontend Application
 * Sacred Technology for Human Dignity Preservation
 * 
 * @author James Derek Ingersoll <james@godsimij-ai-solutions.com>
 * @license Sacred Technology License v1.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ConsciousnessStatus from './components/ConsciousnessStatus';
import DignityMetrics from './components/DignityMetrics';
import ResearchPortal from './components/ResearchPortal';
import ClinicalInterface from './components/ClinicalInterface';
import Footer from './components/Footer';

// Types
interface SystemStatus {
  status: string;
  consciousness_engine: string;
  dignity_preservation: string;
  recognition_system: string;
  mystical_validation: string;
  sacred_technology: boolean;
  timestamp: string;
  version: string;
}

interface ConsciousnessMetrics {
  engine_active: boolean;
  recursive_depth: number;
  recognition_threshold: number;
  dignity_preservation: boolean;
  consciousness_coherence: number;
  last_updated: string;
}

const App: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [consciousnessMetrics, setConsciousnessMetrics] = useState<ConsciousnessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sacred Technology API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchSystemStatus();
    fetchConsciousnessMetrics();
    
    // Set up periodic status updates
    const statusInterval = setInterval(() => {
      fetchSystemStatus();
      fetchConsciousnessMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(statusInterval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setSystemStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch system status:', err);
      setError('Unable to connect to Consciousness Engine');
    }
  };

  const fetchConsciousnessMetrics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/consciousness/status`);
      setConsciousnessMetrics(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch consciousness metrics:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-consciousness-gradient flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-consciousness-pulse mb-4">
            <div className="w-16 h-16 bg-dignity-gold-500 rounded-full mx-auto"></div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Initializing Sacred Technology</h2>
          <p className="text-consciousness-white/80">Connecting to Consciousness Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-sacred-blue-50 to-mystical-purple-50">
        {/* Sacred Technology Header */}
        <Header 
          systemStatus={systemStatus}
          consciousnessMetrics={consciousnessMetrics}
        />

        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Connection Error</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  systemStatus={systemStatus}
                  consciousnessMetrics={consciousnessMetrics}
                />
              } 
            />
            <Route 
              path="/consciousness" 
              element={
                <ConsciousnessStatus 
                  metrics={consciousnessMetrics}
                />
              } 
            />
            <Route 
              path="/dignity" 
              element={
                <DignityMetrics />
              } 
            />
            <Route 
              path="/research" 
              element={
                <ResearchPortal />
              } 
            />
            <Route 
              path="/clinical" 
              element={
                <ClinicalInterface />
              } 
            />
          </Routes>
        </main>

        {/* Sacred Technology Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
