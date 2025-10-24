/**
 * Utility functions for data validation and formatting
 */

/**
 * Validate prediction input
 * @param {Object} formData - Form data to validate
 * @returns {Object} {isValid: boolean, errors: {}}
 */
export const validateInput = (formData) => {
  const errors = {};

  // Validate pH
  if (formData.pH === '' || formData.pH === null) {
    errors.pH = 'pH is required';
  } else if (isNaN(formData.pH)) {
    errors.pH = 'pH must be a number';
  } else if (formData.pH < 3.0 || formData.pH > 9.0) {
    errors.pH = 'pH must be between 3.0 and 9.0';
  }

  // Validate EC
  if (formData.EC === '' || formData.EC === null) {
    errors.EC = 'EC/TDS is required';
  } else if (isNaN(formData.EC)) {
    errors.EC = 'EC/TDS must be a number';
  } else if (formData.EC < 500 || formData.EC > 3000) {
    errors.EC = 'EC/TDS must be between 500 and 3000 µS/cm';
  }

  // Validate water temperature
  if (formData.water_temp === '' || formData.water_temp === null) {
    errors.water_temp = 'Water temperature is required';
  } else if (isNaN(formData.water_temp)) {
    errors.water_temp = 'Temperature must be a number';
  } else if (formData.water_temp < 5 || formData.water_temp > 40) {
    errors.water_temp = 'Temperature must be between 5°C and 40°C';
  }

  // Validate humidity
  if (formData.humidity === '' || formData.humidity === null) {
    errors.humidity = 'Humidity is required';
  } else if (isNaN(formData.humidity)) {
    errors.humidity = 'Humidity must be a number';
  } else if (formData.humidity < 10 || formData.humidity > 100) {
    errors.humidity = 'Humidity must be between 10% and 100%';
  }

  // Validate visual condition
  if (!formData.visual_condition || formData.visual_condition === '') {
    errors.visual_condition = 'Visual condition is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format confidence score for display
 * @param {number} score - Confidence score (0-1)
 * @returns {string} Formatted percentage
 */
export const formatConfidence = (score) => {
  return `${(score * 100).toFixed(1)}%`;
};

/**
 * Get color based on value range
 * @param {number} value - Value to check
 * @param {number} min - Minimum threshold
 * @param {number} max - Maximum threshold
 * @returns {string} Tailwind color class
 */
export const getStatusColor = (value, min, max) => {
  if (value < min) return 'text-danger';
  if (value > max) return 'text-danger';
  return 'text-success';
};

/**
 * Get health status icon and color
 * @param {string} status - Health status
 * @returns {Object} {icon: string, color: string}
 */
export const getHealthStatusStyle = (status) => {
  const styles = {
    'Healthy': { icon: '✓', color: 'bg-success text-white' },
    'Stressed': { icon: '⚠', color: 'bg-yellow-500 text-white' },
    'Diseased': { icon: '✗', color: 'bg-danger text-white' },
  };
  return styles[status] || { icon: '?', color: 'bg-gray-400 text-white' };
};

/**
 * Get growth rate display info
 * @param {string} rate - Growth rate
 * @returns {Object} {label: string, color: string}
 */
export const getGrowthRateStyle = (rate) => {
  const styles = {
    'Low': { color: 'bg-red-100 text-red-800', percentage: 33 },
    'Moderate': { color: 'bg-yellow-100 text-yellow-800', percentage: 66 },
    'High': { color: 'bg-success bg-opacity-20 text-success', percentage: 100 },
  };
  return styles[rate] || { color: 'bg-gray-100 text-gray-800', percentage: 0 };
};

/**
 * Get disease risk level info
 * @param {number} risk - Risk percentage (0-100)
 * @returns {Object} {level: string, color: string, severity: number}
 */
export const getDiseaseRiskStyle = (risk) => {
  if (risk < 30) {
    return { level: 'Low Risk', color: 'bg-green-100 text-green-800', severity: 1 };
  } else if (risk < 60) {
    return { level: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800', severity: 2 };
  } else {
    return { level: 'High Risk', color: 'bg-red-100 text-red-800', severity: 3 };
  }
};

/**
 * Format number to 1 decimal place
 * @param {number} value - Value to format
 * @returns {string} Formatted value
 */
export const formatValue = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return value.toFixed(1);
};

export default {
  validateInput,
  formatConfidence,
  getStatusColor,
  getHealthStatusStyle,
  getGrowthRateStyle,
  getDiseaseRiskStyle,
  formatValue,
};
