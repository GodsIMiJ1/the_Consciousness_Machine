import axios from 'axios';

// Base URL for the clinic dashboard API
const API_BASE_URL = 'https://your-clinic-dashboard-api.com'; // Replace with actual API endpoint

export const sendMoodData = async (deviceId: string, moodData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mood`, {
      deviceId,
      moodData,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending mood data:', error);
    throw new Error('Failed to send mood data to the clinic dashboard.');
  }
};

export const getClientEngagementMetrics = async (deviceId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/engagement/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving engagement metrics:', error);
    throw new Error('Failed to retrieve client engagement metrics from the clinic dashboard.');
  }
};
