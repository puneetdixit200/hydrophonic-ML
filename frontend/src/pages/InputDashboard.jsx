/**
 * InputDashboard Component
 * Main page for users to input plant parameters
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, AlertCircle, Loader } from 'lucide-react'
import axios from 'axios'
import './InputDashboard.css'

const API_BASE_URL = 'http://localhost:8000'

function InputDashboard({ onPredictionComplete }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    ph_value: 6.0,
    ec_value: 1200,
    water_temperature: 21,
    air_humidity: 60,
    visual_condition: 'Healthy',
  })

  // Form validation rules
  const validationRules = {
    ph_value: { min: 3.0, max: 9.0, label: 'pH Value' },
    ec_value: { min: 200, max: 3000, label: 'EC Value' },
    water_temperature: { min: 5, max: 35, label: 'Water Temperature' },
    air_humidity: { min: 20, max: 95, label: 'Air Humidity' },
  }

  /**
   * Validate form data
   */
  const validateForm = () => {
    for (const [key, rule] of Object.entries(validationRules)) {
      const value = parseFloat(formData[key])
      if (value < rule.min || value > rule.max) {
        setError(
          `${rule.label} must be between ${rule.min} and ${rule.max}. You entered ${value}.`
        )
        return false
      }
    }
    return true
  }

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'visual_condition' ? value : parseFloat(value),
    }))
    setError('')
  }

  /**
   * Submit form and get predictions
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, formData)
      onPredictionComplete(response.data)
      navigate('/results')
    } catch (err) {
      if (err.response?.status === 503) {
        setError(
          'Model not loaded. Please train the model first by running: python train_model.py'
        )
      } else if (err.response?.data?.detail) {
        setError(`Prediction error: ${err.response.data.detail}`)
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to backend. Make sure FastAPI is running on http://localhost:8000')
      } else {
        setError(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Set values to optimal range
   */
  const setOptimalValues = () => {
    setFormData({
      ph_value: 6.0,
      ec_value: 1200,
      water_temperature: 21,
      air_humidity: 60,
      visual_condition: 'Healthy',
    })
    setError('')
  }

  /**
   * Set values to stressed conditions
   */
  const setStressedValues = () => {
    setFormData({
      ph_value: 4.5,
      ec_value: 2200,
      water_temperature: 28,
      air_humidity: 75,
      visual_condition: 'Yellowing',
    })
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12 animate-slide-in">
        <h2 className="text-4xl font-bold text-hydro-dark mb-3">
          🌿 Plant Health Predictor
        </h2>
        <p className="text-gray-600 text-lg">
          Enter your hydroponic system parameters to receive AI-powered health insights
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* pH Value */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                pH Value 📍
              </label>
              <input
                type="number"
                name="ph_value"
                min="3.0"
                max="9.0"
                step="0.1"
                value={formData.ph_value}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hydro-green focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 3.0 - 9.0 | Optimal: 5.5 - 6.5</p>
            </div>

            {/* EC/TDS Value */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                EC/TDS Value (µS/cm) ⚡
              </label>
              <input
                type="number"
                name="ec_value"
                min="200"
                max="3000"
                step="50"
                value={formData.ec_value}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hydro-green focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 200 - 3000 | Optimal: 800 - 1800</p>
            </div>

            {/* Water Temperature */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Water Temperature (°C) 🌡️
              </label>
              <input
                type="number"
                name="water_temperature"
                min="5"
                max="35"
                step="0.5"
                value={formData.water_temperature}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hydro-green focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 5 - 35 | Optimal: 18 - 24</p>
            </div>

            {/* Air Humidity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Air Humidity (%) 💧
              </label>
              <input
                type="number"
                name="air_humidity"
                min="20"
                max="95"
                step="1"
                value={formData.air_humidity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hydro-green focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 20 - 95 | Optimal: 40 - 80</p>
            </div>

            {/* Visual Condition */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Visual Plant Condition 👁️
              </label>
              <select
                name="visual_condition"
                value={formData.visual_condition}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hydro-green focus:border-transparent outline-none transition bg-white"
              >
                <option value="Healthy">✓ Healthy</option>
                <option value="Yellowing">🟡 Yellowing</option>
                <option value="Wilting">🌀 Wilting</option>
                <option value="Leaf Curling">↻ Leaf Curling</option>
                <option value="Spotting">⚫ Spotting</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Select the most apparent visual symptom</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-hydro-green to-hydro-accent text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Get Prediction
                </>
              )}
            </button>

            <button
              type="button"
              onClick={setOptimalValues}
              className="flex-1 bg-hydro-light text-hydro-dark py-3 px-6 rounded-lg font-semibold hover:bg-hydro-accent hover:text-white transition-all"
            >
              ✨ Optimal Values
            </button>

            <button
              type="button"
              onClick={setStressedValues}
              className="flex-1 bg-orange-100 text-orange-900 py-3 px-6 rounded-lg font-semibold hover:bg-orange-200 transition-all"
            >
              ⚠️ Stressed Scenario
            </button>
          </div>
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
          <h3 className="font-bold text-blue-900 mb-2">💡 Optimal Ranges</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>🔹 pH: 5.5 - 6.5</li>
            <li>🔹 EC: 800 - 1800 µS/cm</li>
            <li>🔹 Temp: 18 - 24°C</li>
            <li>🔹 Humidity: 40 - 80%</li>
          </ul>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
          <h3 className="font-bold text-purple-900 mb-2">📊 Model Capabilities</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>✓ Health Status Classification</li>
            <li>✓ Growth Rate Estimation</li>
            <li>✓ Disease Risk Assessment</li>
            <li>✓ Yield Prediction</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InputDashboard
