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

  // Convert string values to numbers for sliders
  const pH = parseFloat(formData.pH);
  const EC = parseFloat(formData.EC);
  const water_temp = parseFloat(formData.water_temp);
  const humidity = parseFloat(formData.humidity);

  // Validate pH
  if (formData.pH === '' || formData.pH === null || isNaN(pH)) {
    errors.pH = 'pH is required';
  } else if (pH < 3.0 || pH > 9.0) {
    errors.pH = 'pH must be between 3.0 and 9.0';
  }

  // Validate EC
  if (formData.EC === '' || formData.EC === null || isNaN(EC)) {
    errors.EC = 'EC/TDS is required';
  } else if (EC < 500 || EC > 3000) {
    errors.EC = 'EC/TDS must be between 500 and 3000 µS/cm';
  }

  // Validate water temperature
  if (formData.water_temp === '' || formData.water_temp === null || isNaN(water_temp)) {
    errors.water_temp = 'Water temperature is required';
  } else if (water_temp < 5 || water_temp > 40) {
    errors.water_temp = 'Temperature must be between 5°C and 40°C';
  }

  // Validate humidity
  if (formData.humidity === '' || formData.humidity === null || isNaN(humidity)) {
    errors.humidity = 'Humidity is required';
  } else if (humidity < 10 || humidity > 100) {
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
 * Format number to fixed decimal places
 */
export const formatNumber = (num, decimals = 2) => {
  return parseFloat(num).toFixed(decimals);
};

/**
 * Get health status color
 */
export const getHealthStatusStyle = (status) => {
  const styles = {
    Healthy: 'text-green-600 bg-green-50',
    Warning: 'text-yellow-600 bg-yellow-50',
    Critical: 'text-red-600 bg-red-50',
    Moderate: 'text-blue-600 bg-blue-50',
  };
  return styles[status] || 'text-gray-600 bg-gray-50';
};

/**
 * Get color for percentage value
 */
export const getScoreColor = (score) => {
  if (score >= 0.7) return 'text-success';
  if (score >= 0.4) return 'text-warning';
  return 'text-danger';
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

/**
 * Export data as JSON file
 */
export const exportAsJSON = (data, filename) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Debounce function for performance
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
