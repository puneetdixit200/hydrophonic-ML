import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  InputField,
  SelectField,
  Button,
  ErrorAlert,
  SuccessAlert,
} from '../components/Common';
import { validateInput } from '../utils/helpers';
import { predictPlantHealth } from '../utils/api';

/**
 * InputDashboard Component
 * Main form for entering hydroponic system parameters
 * Collects: pH, EC, Water Temp, Humidity, Visual Condition
 */
export default function InputDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    pH: '',
    EC: '',
    water_temp: '',
    humidity: '',
    visual_condition: '',
  });

  const [errors, setErrors] = useState({});

  // Visual condition options
  const visualConditions = [
    'Healthy',
    'Yellowing',
    'Wilting',
    'Leaf Curling',
    'Spotting',
  ];

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate input
    const { isValid, errors: validationErrors } = validateInput(formData);

    if (!isValid) {
      setErrors(validationErrors);
      setError('Please correct the errors below');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const inputData = {
        pH: parseFloat(formData.pH),
        EC: parseFloat(formData.EC),
        water_temp: parseFloat(formData.water_temp),
        humidity: parseFloat(formData.humidity),
        visual_condition: formData.visual_condition,
      };

      // Make prediction request
      const result = await predictPlantHealth(inputData);

      setSuccess('✓ Prediction successful! Loading results...');

      // Navigate to results page and pass data
      setTimeout(() => {
        navigate('/results', { state: { prediction: result, input: inputData } });
      }, 500);
    } catch (err) {
      setError(err.message || 'Failed to get prediction. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setFormData({
      pH: '',
      EC: '',
      water_temp: '',
      humidity: '',
      visual_condition: '',
    });
    setErrors({});
    setError('');
    setSuccess('');
  };

  /**
   * Load example data for testing
   */
  const loadExampleData = () => {
    setFormData({
      pH: '6.5',
      EC: '1500',
      water_temp: '22',
      humidity: '65',
      visual_condition: 'Healthy',
    });
    setErrors({});
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light to-bg-light-2 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">🌱 Hydroponic Health Monitor</h1>
          <p className="text-gray-600">
            Enter your system parameters to receive real-time health insights and recommendations
          </p>
        </div>

        {/* Alerts */}
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
        {success && <SuccessAlert message={success} />}

        {/* Main Form Card */}
        <Card title="System Parameters" icon="📊">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* pH Input */}
            <div>
              <InputField
                label="pH Value"
                name="pH"
                value={formData.pH}
                onChange={handleInputChange}
                placeholder="Enter pH (5.5-7.0 optimal)"
                type="number"
                min="3.0"
                max="9.0"
                step="0.1"
                error={errors.pH}
                unit="pH"
              />
              <div className="text-xs text-gray-500 mt-1">
                💡 Tip: Optimal range for most plants is 5.5-7.0
              </div>
            </div>

            {/* EC/TDS Input */}
            <div>
              <InputField
                label="EC/TDS Value"
                name="EC"
                value={formData.EC}
                onChange={handleInputChange}
                placeholder="Enter EC value (1200-1800 optimal)"
                type="number"
                min="500"
                max="3000"
                step="50"
                error={errors.EC}
                unit="µS/cm"
              />
              <div className="text-xs text-gray-500 mt-1">
                💡 Tip: Typical range is 1200-1800 µS/cm depending on crop
              </div>
            </div>

            {/* Water Temperature Input */}
            <div>
              <InputField
                label="Water Temperature"
                name="water_temp"
                value={formData.water_temp}
                onChange={handleInputChange}
                placeholder="Enter temperature (18-24 optimal)"
                type="number"
                min="5"
                max="40"
                step="0.1"
                error={errors.water_temp}
                unit="°C"
              />
              <div className="text-xs text-gray-500 mt-1">
                💡 Tip: Most vegetables prefer 18-24°C water temperature
              </div>
            </div>

            {/* Humidity Input */}
            <div>
              <InputField
                label="Air Humidity"
                name="humidity"
                value={formData.humidity}
                onChange={handleInputChange}
                placeholder="Enter humidity (55-75 optimal)"
                type="number"
                min="10"
                max="100"
                step="1"
                error={errors.humidity}
                unit="%"
              />
              <div className="text-xs text-gray-500 mt-1">
                💡 Tip: Optimal humidity range is 55-75% for most crops
              </div>
            </div>

            {/* Visual Condition Dropdown */}
            <div>
              <SelectField
                label="Visual Condition"
                value={formData.visual_condition}
                onChange={(e) =>
                  handleInputChange({
                    target: { name: 'visual_condition', value: e.target.value },
                  })
                }
                options={visualConditions}
                error={errors.visual_condition}
              />
              <div className="text-xs text-gray-500 mt-1">
                💡 Tip: Select the current visual state of your plants
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={loading}
              >
                ↻ Reset
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : '→ Predict'}
              </Button>
            </div>

            {/* Example Data Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={loadExampleData}
                className="w-full text-center text-sm text-secondary hover:text-primary font-medium py-2 hover:bg-blue-50 rounded transition"
              >
                📋 Load Example Data
              </button>
            </div>
          </form>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Card icon="ℹ️" title="About">
            <p className="text-sm text-gray-600">
              This tool uses advanced XGBoost machine learning to analyze your hydroponic system's health based on environmental parameters and plant condition.
            </p>
          </Card>
          <Card icon="⚙️" title="System Status">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Backend API:</span>
                <span className="font-medium text-success">✓ Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Models:</span>
                <span className="font-medium text-success">✓ Loaded</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium text-primary">1.0.0</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
