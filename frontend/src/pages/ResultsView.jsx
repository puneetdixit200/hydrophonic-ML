/**
 * ResultsView Component
 * Displays detailed prediction results with visualizations
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import './ResultsView.css'

function ResultsView({ data }) {
  const navigate = useNavigate()

  /**
   * Get health status color and icon
   */
  const getHealthColor = (status) => {
    switch (status) {
      case 'Healthy':
        return { bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-500' }
      case 'Stressed':
        return { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-500' }
      case 'Diseased':
        return { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-500' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-900', border: 'border-gray-500' }
    }
  }

  /**
   * Get growth rate color
   */
  const getGrowthColor = (rate) => {
    switch (rate) {
      case 'High':
        return 'text-green-600'
      case 'Moderate':
        return 'text-yellow-600'
      case 'Low':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  /**
   * Get severity color for nutrient issues
   */
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-900'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-900'
      case 'Low':
        return 'bg-green-100 text-green-900'
      default:
        return 'bg-gray-100 text-gray-900'
    }
  }

  /**
   * Get status badge styling
   */
  const getStatusBadge = (severity) => {
    switch (severity) {
      case 'High':
        return '🔴'
      case 'Medium':
        return '🟡'
      case 'Low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  const healthColor = getHealthColor(data.plant_health_status)

  // Prepare data for visualizations
  const scoreData = [
    { name: 'Health', value: (data.plant_health_status === 'Healthy' ? 0.8 : data.plant_health_status === 'Stressed' ? 0.5 : 0.2) * 100 },
    { name: 'Yield', value: data.yield_prediction },
    { name: 'Confidence', value: data.confidence_score * 100 },
  ]

  const riskData = [
    {
      name: 'Disease Risk',
      value: data.disease_risk_percentage,
      safe: 100 - data.disease_risk_percentage,
    },
  ]

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="min-h-screen bg-gradient-to-br from-hydro-light to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 animate-slide-in">
          <div>
            <h2 className="text-4xl font-bold text-hydro-dark mb-2">
              🔍 Prediction Results
            </h2>
            <p className="text-gray-600">Comprehensive analysis of your hydroponic system</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all text-hydro-dark font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            New Prediction
          </button>
        </div>

        {/* Main Health Status Card */}
        <div className={`rounded-2xl p-8 mb-8 border-l-4 shadow-xl ${healthColor.bg} ${healthColor.border} animate-fade-in`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">PLANT HEALTH STATUS</p>
              <h3 className={`text-5xl font-bold ${healthColor.text}`}>
                {data.plant_health_status}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Confidence Score</p>
              <p className="text-3xl font-bold text-hydro-green">
                {(data.confidence_score * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-300">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">GROWTH RATE</p>
              <p className={`text-2xl font-bold ${getGrowthColor(data.growth_rate)}`}>
                {data.growth_rate}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">YIELD PREDICTION</p>
              <p className="text-2xl font-bold text-hydro-green">
                {data.yield_prediction.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">DISEASE RISK</p>
              <p className="text-2xl font-bold text-red-600">
                {data.disease_risk_percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Visualizations Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Scores Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-hydro-dark mb-6">📊 Performance Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Disease Risk Gauge */}
          <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-hydro-dark mb-6">⚠️ Disease Risk Assessment</h3>
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-red-500 opacity-20"></div>
                  <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-red-600">
                        {data.disease_risk_percentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Risk Level</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  {data.disease_risk_percentage > 70
                    ? '🔴 High risk - Immediate action recommended'
                    : data.disease_risk_percentage > 40
                    ? '🟡 Moderate risk - Monitor closely'
                    : '🟢 Low risk - Conditions are favorable'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Recommendations */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Info className="w-6 h-6 text-hydro-green" />
            <h3 className="text-xl font-bold text-hydro-dark">💡 Environmental Recommendations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.environmental_recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.includes('✓')
                    ? 'bg-green-50 border-green-500'
                    : rec.includes('🔴')
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <p className="text-sm font-medium text-gray-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrient Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-6 h-6 text-hydro-green" />
            <h3 className="text-xl font-bold text-hydro-dark">🧪 Nutrient & Toxicity Analysis</h3>
          </div>

          {data.nutrient_issues && data.nutrient_issues.length > 0 ? (
            <div className="space-y-3">
              {data.nutrient_issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(
                    issue.severity
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">
                        {getStatusBadge(issue.severity)} {issue.nutrient}
                      </p>
                      <p className="text-sm">{issue.issue}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white bg-opacity-50">
                      {issue.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900 font-semibold">✓ All nutrient levels optimal!</p>
            </div>
          )}
        </div>

        {/* Model Information Footer */}
        <div className="bg-hydro-dark text-white rounded-xl p-6 text-center animate-fade-in">
          <p className="text-sm">
            🤖 Model: XGBoost Multi-Output Regression | Version: {data.model_version}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Predictions are based on synthetic training data. Use real sensor data for production accuracy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResultsView
