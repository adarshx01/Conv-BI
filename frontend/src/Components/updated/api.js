import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api'; // Make sure this matches your server port

export const saveReport = async (name, data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reports`, { name, data });
    return response.data;
  } catch (error) {
    console.error('Error saving report to server:', error);
    throw error; // Propagate the error to be handled by the caller
  }
};

export const loadReports = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reports`);
    return response.data;
  } catch (error) {
    console.error('Error loading reports from server:', error);
    throw error; // Propagate the error to be handled by the caller
  }
};

export const loadReport = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reports/${id}`);
    if (response.data && response.data.data) {
      return response.data.data; // The actual report data
    } else {
      throw new Error('Invalid report data structure');
    }
  } catch (error) {
    console.error('Error loading report from server:', error);
    throw error; // Propagate the error to be handled by the caller
  }
};

