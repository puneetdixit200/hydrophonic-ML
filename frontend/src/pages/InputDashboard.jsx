import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
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
    pH: '6.5',
    EC: '1500',
    water_temp: '22',
    humidity: '65',
    visual_condition: 'Healthy',
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* pH Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold text-gray-700">pH Value</label>
                <div className="text-2xl font-bold text-primary">{parseFloat(formData.pH || 6.5).toFixed(1)}</div>
              </div>
              <input
                type="range"
                name="pH"
                value={formData.pH || 6.5}
                onChange={handleInputChange}
                min="3.0"
                max="9.0"
                step="0.1"
                className="w-full h-3 bg-gradient-to-r from-red-400 to-green-400 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>3.0 (Acidic)</span>
                <span className="text-green-600 font-semibold">5.5-7.0 (Optimal)</span>
                <span>9.0 (Alkaline)</span>
              </div>
            </div>

            {/* EC/TDS Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold text-gray-700">EC/TDS Value</label>
                <div className="text-2xl font-bold text-primary">{Math.round(formData.EC || 1500)} µS/cm</div>
              </div>
              <input
                type="range"
                name="EC"
                value={formData.EC || 1500}
                onChange={handleInputChange}
                min="500"
                max="3000"
                step="50"
                className="w-full h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>500</span>
                <span className="text-blue-600 font-semibold">1200-1800 (Optimal)</span>
                <span>3000</span>
              </div>
            </div>

            {/* Water Temperature Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold text-gray-700">Water Temperature</label>
                <div className="text-2xl font-bold text-primary">{parseFloat(formData.water_temp || 22).toFixed(1)}°C</div>
              </div>
              <input
                type="range"
                name="water_temp"
                value={formData.water_temp || 22}
                onChange={handleInputChange}
                min="5"
                max="40"
                step="0.1"
                className="w-full h-3 bg-gradient-to-r from-blue-500 to-red-500 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5°C</span>
                <span className="text-orange-600 font-semibold">18-24°C (Optimal)</span>
                <span>40°C</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold text-gray-700">Air Humidity</label>
                <div className="text-2xl font-bold text-primary">{Math.round(formData.humidity || 65)}%</div>
              </div>
              <input
                type="range"
                name="humidity"
                value={formData.humidity || 65}
                onChange={handleInputChange}
                min="10"
                max="100"
                step="1"
                className="w-full h-3 bg-gradient-to-r from-yellow-300 to-blue-500 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10%</span>
                <span className="text-cyan-600 font-semibold">55-75% (Optimal)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Visual Condition Dropdown */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-gray-700">Visual Condition</label>
              <SelectField
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
