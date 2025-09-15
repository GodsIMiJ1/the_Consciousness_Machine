import React, { useState } from 'react';
import axios from 'axios';
import '../css/CampaignForm.css';

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
