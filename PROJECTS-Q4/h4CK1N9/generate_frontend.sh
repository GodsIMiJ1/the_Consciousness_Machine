#!/bin/bash

# Define project name and directory
PROJECT_NAME="the-repeater-frontend"
PROJECT_DIR="$PROJECT_NAME"

# Create project directory
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Initialize the project
npx create-react-app .

# Install additional dependencies
npm install react-router-dom axios

# Create project structure
mkdir -p src/components src/css
touch src/App.css src/index.css

# Populate components
cat << 'EOF' > src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

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
EOF

cat << 'EOF' > src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

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
EOF

cat << 'EOF' > src/components/Dashboard.js
import React from 'react';
import './Dashboard.css';

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
EOF

cat << 'EOF' > src/components/CampaignForm.js
import React, { useState } from 'react';
import axios from 'axios';
import './CampaignForm.css';

const CampaignForm = () => {
  const [campaign, setCampaign] = useState({
    type: '',
    targetList: [],
    messageTemplate: '',
    schedule: '',
    frequency: '',
    duration: '',
  });

  const handleChange = (e) => {
    setCampaign({ ...campaign, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/campaigns', campaign);
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  return (
    <div className="campaign-form">
      <h1>Create a New Campaign</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select name="type" onChange={handleChange} required>
            <option value="">Select Type</option>
            <option value="phone">Phone Call</option>
            <option value="text">Text Message</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="targetList">Target List</label>
          <input type="text" name="targetList" onChange={handleChange} placeholder="Comma-separated list" required />
        </div>
        <div className="form-group">
          <label htmlFor="messageTemplate">Message Template</label>
          <textarea name="messageTemplate" onChange={handleChange} required></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="schedule">Schedule</label>
          <input type="datetime-local" name="schedule" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="frequency">Frequency</label>
          <input type="text" name="frequency" onChange={handleChange} placeholder="e.g., every hour" required />
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration</label>
          <input type="text" name="duration" onChange={handleChange} placeholder="e.g., 1 week" required />
        </div>
        <button type="submit">Create Campaign</button>
      </form>
    </div>
  );
};

export default CampaignForm;
EOF

# Populate CSS
cat << 'EOF' > src/css/Header.css
.header {
  background-color: #1e1e1e;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.nav a {
  color: #ffffff;
  margin: 0 15px;
  text-decoration: none;
}

.profile {
  display: flex;
  align-items: center;
}

.profile span {
  margin-left: 10px;
  font-size: 16px;
}
EOF

cat << 'EOF' > src/css/Sidebar.css
.sidebar {
  background-color: #1e1e1e;
  color: #ffffff;
  width: 250px;
  padding: 20px;
  position: fixed;
  height: 100%;
  overflow-y: auto;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin: 10px 0;
}

.sidebar a {
  color: #ffffff;
  text-decoration: none;
  font-size: 18px;
}
EOF

cat << 'EOF' > src/css/Dashboard.css
.dashboard {
  padding: 20px;
  background-color: #1e1e1e;
  color: #ffffff;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #2e2e2e;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 30%;
}

.heat-map {
  text-align: center;
}

.heat-map img {
  max-width: 100%;
  border-radius: 8px;
}
EOF

cat << 'EOF' > src/css/CampaignForm.css
.campaign-form {
  background-color: #1e1e1e;
  color: #ffffff;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 16px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #333333;
  border-radius: 4px;
  background-color: #2e2e2e;
  color: #ffffff;
  font-size: 16px;
}

.form-group textarea {
  height: 100px;
}

button {
  background-color: #007bff;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
EOF

cat << 'EOF' > src/css/App.css
.app {
  display: flex;
  height: 100vh;
  background-color: #1e1e1e;
  color: #ffffff;
}

.main-content {
  margin-left: 250px;
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
}
EOF

# Populate index.js
cat << 'EOF' > src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './index.css';
import App from './App';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CampaignForm from './components/CampaignForm';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <App />
  </Router>
);
EOF

# Populate App.js
cat << 'EOF' > src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/campaigns" component={CampaignForm} />
            {/* Add more routes for other components */}
          </Switch>
        </main>
      </div>
    </Router>
  );
};

export default App;
EOF

echo "Frontend scaffold generated successfully!"
