import axios from 'axios';

// API base URL - configure based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Make prediction request to backend
 * @param {Object} inputData - Input parameters
 * @returns {Promise<Object>} Prediction result
 */
export const predictPlantHealth = async (inputData) => {
  try {
    const response = await api.post('/predict', inputData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get prediction');
  }
};

/**
 * Get model information
 * @returns {Promise<Object>} Model metadata
 */
export const getModelInfo = async () => {
  try {
    const response = await api.get('/model-info');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch model info');
  }
};

/**
 * Health check
 * @returns {Promise<Object>} API health status
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Failed to connect to API');
  }
};

/**
 * Request model retraining
 * @returns {Promise<Object>} Training job response
 */
export const retainModel = async () => {
  try {
    const response = await api.post('/train');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to start retraining');
  }
};

export default api;
