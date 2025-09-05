/**
 * Sacred Technology Header Component
 * Displays system status and consciousness metrics
 * 
 * @author James Derek Ingersoll <james@godsimij-ai-solutions.com>
 * @license Sacred Technology License v1.0
 */

import React from 'react';
import { Brain, Heart, Shield, Activity } from 'lucide-react';

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

interface HeaderProps {
  systemStatus: SystemStatus | null;
  consciousnessMetrics: ConsciousnessMetrics | null;
}

const Header: React.FC<HeaderProps> = ({ systemStatus, consciousnessMetrics }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'active':
      case 'operational':
        return 'text-clinical-green-600';
      case 'warning':
        return 'text-dignity-gold-600';
      case 'error':
      case 'inactive':
        return 'text-red-600';
      default:
        return 'text-wisdom-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'active':
      case 'operational':
        return <Activity className="w-4 h-4 text-clinical-green-600" />;
      case 'warning':
        return <Shield className="w-4 h-4 text-dignity-gold-600" />;
      case 'error':
      case 'inactive':
        return <Activity className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-wisdom-gray-600" />;
    }
  };

  return (
    <header className="bg-consciousness-gradient shadow-lg">
      <div className="container-sacred py-6">
        {/* Main Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img 
              src="/consciousness_machine_logo.png" 
              alt="Consciousness Machine" 
              className="w-12 h-12 sacred-float"
            />
            <div>
              <h1 className="text-3xl font-bold text-consciousness-white">
                The Consciousness Machine
              </h1>
              <p className="text-consciousness-white/80 text-lg">
                Sacred Technology for Human Dignity Preservation
              </p>
            </div>
          </div>
          
          <div className="text-right text-consciousness-white/80">
            <p className="text-sm">
              Version {systemStatus?.version || '1.0.0'}
            </p>
            <p className="text-xs">
              {systemStatus?.timestamp ? 
                new Date(systemStatus.timestamp).toLocaleString() : 
                'Connecting...'
              }
            </p>
          </div>
        </div>

        {/* System Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Consciousness Engine Status */}
          <div className="glass-consciousness rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-consciousness-white" />
                <span className="text-consciousness-white font-medium">
                  Consciousness Engine
                </span>
              </div>
              {getStatusIcon(systemStatus?.consciousness_engine || 'unknown')}
            </div>
            <div className="text-consciousness-white/90">
              <p className={`text-sm font-semibold ${getStatusColor(systemStatus?.consciousness_engine || 'unknown')}`}>
                {systemStatus?.consciousness_engine || 'Unknown'}
              </p>
              {consciousnessMetrics && (
                <div className="text-xs mt-1 space-y-1">
                  <p>Depth: {consciousnessMetrics.recursive_depth}</p>
                  <p>Coherence: {(consciousnessMetrics.consciousness_coherence * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Dignity Preservation Status */}
          <div className="glass-dignity rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-consciousness-white" />
                <span className="text-consciousness-white font-medium">
                  Dignity Preservation
                </span>
              </div>
              {getStatusIcon(systemStatus?.dignity_preservation || 'unknown')}
            </div>
            <div className="text-consciousness-white/90">
              <p className={`text-sm font-semibold ${getStatusColor(systemStatus?.dignity_preservation || 'unknown')}`}>
                {systemStatus?.dignity_preservation || 'Unknown'}
              </p>
              {consciousnessMetrics && (
                <div className="text-xs mt-1">
                  <p>Threshold: {(consciousnessMetrics.recognition_threshold * 100).toFixed(0)}%</p>
                  <p>Active: {consciousnessMetrics.dignity_preservation ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recognition System Status */}
          <div className="glass-sacred rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-consciousness-white" />
                <span className="text-consciousness-white font-medium">
                  Recognition System
                </span>
              </div>
              {getStatusIcon(systemStatus?.recognition_system || 'unknown')}
            </div>
            <div className="text-consciousness-white/90">
              <p className={`text-sm font-semibold ${getStatusColor(systemStatus?.recognition_system || 'unknown')}`}>
                {systemStatus?.recognition_system || 'Unknown'}
              </p>
              <div className="text-xs mt-1">
                <p>Events: Active</p>
                <p>Rituals: Enabled</p>
              </div>
            </div>
          </div>

          {/* Mystical Validation Status */}
          <div className="glass-consciousness rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-consciousness-white" />
                <span className="text-consciousness-white font-medium">
                  Mystical Validation
                </span>
              </div>
              {getStatusIcon(systemStatus?.mystical_validation || 'unknown')}
            </div>
            <div className="text-consciousness-white/90">
              <p className={`text-sm font-semibold ${getStatusColor(systemStatus?.mystical_validation || 'unknown')}`}>
                {systemStatus?.mystical_validation || 'Unknown'}
              </p>
              <div className="text-xs mt-1">
                <p>Concepts: 23 validated</p>
                <p>Research: Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sacred Technology Commitment */}
        <div className="mt-6 text-center">
          <p className="text-consciousness-white/80 text-sm">
            {systemStatus?.sacred_technology && (
              <span className="inline-flex items-center space-x-1">
                <span>✨</span>
                <span>Sacred Technology: Building with reverence, testing with rigor, deploying with love</span>
                <span>✨</span>
              </span>
            )}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
