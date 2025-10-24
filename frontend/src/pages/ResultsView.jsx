import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  Gauge,
  ProgressBar,
  StatusBadge,
  RecommendationItem,
  FeatureImportance,
  Button,
} from '../components/Common';
import {
  getHealthStatusStyle,
  getGrowthRateStyle,
  getDiseaseRiskStyle,
  formatValue,
} from '../utils/helpers';

/**
 * ResultsView Component
 * Displays prediction results with visualizations and recommendations
 */
export default function ResultsView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prediction, input } = location.state || {};

  // Redirect to home if no prediction data
  if (!prediction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-light to-bg-light-2 py-12 px-4 flex items-center justify-center">
        <Card title="No Results Found">
          <p className="mb-4 text-gray-600">
            No prediction data available. Please return to the input page and submit your data.
          </p>
          <Button onClick={() => navigate('/')} variant="primary">
            ← Back to Input
          </Button>
        </Card>
      </div>
    );
  }

  const healthStyle = getHealthStatusStyle(prediction.health_status);
  const growthStyle = getGrowthRateStyle(prediction.growth_rate);
  const diseaseStyle = getDiseaseRiskStyle(prediction.disease_risk);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light to-bg-light-2 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">📊 Prediction Results</h1>
            <p className="text-gray-600">
              Analysis completed at {new Date(prediction.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="secondary">
            ← New Analysis
          </Button>
        </div>

        {/* Main Predictions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Health Status */}
          <Card icon="💚" title="Health Status">
            <div className="text-center">
              <div
                className={`inline-block px-6 py-3 rounded-full text-white font-bold text-2xl mb-3 ${healthStyle.color}`}
              >
                {healthStyle.icon} {prediction.health_status}
              </div>
              <div className="mt-4">
                <ProgressBar
                  label="Confidence"
                  value={prediction.health_score * 100}
                  max={100}
                  color="bg-green-500"
                />
              </div>
            </div>
          </Card>

          {/* Growth Rate */}
          <Card icon="📈" title="Growth Rate">
            <div className="text-center">
              <div className={`px-4 py-2 rounded-full font-bold text-lg mb-3 ${growthStyle.color}`}>
                {prediction.growth_rate}
              </div>
              <div className="mt-4">
                <ProgressBar
                  label="Potential"
                  value={growthStyle.percentage}
                  max={100}
                  color="bg-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Yield Prediction */}
          <Card icon="🎯" title="Yield Score">
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">
                {formatValue(prediction.yield_prediction)}
              </div>
              <div className="text-sm text-gray-600 mb-4">out of 100</div>
              <div>
                <ProgressBar
                  label=""
                  value={prediction.yield_prediction}
                  max={100}
                  color="bg-secondary"
                />
              </div>
            </div>
          </Card>

          {/* Disease Risk */}
          <Card icon="🦠" title="Disease Risk">
            <div className="text-center">
              <div
                className={`px-4 py-2 rounded-full font-bold text-lg mb-3 ${diseaseStyle.color}`}
              >
                {formatValue(prediction.disease_risk)}%
              </div>
              <div className={`text-sm font-medium ${diseaseStyle.color}`}>
                {diseaseStyle.level}
              </div>
              <div className="mt-4">
                <ProgressBar
                  label=""
                  value={prediction.disease_risk}
                  max={100}
                  color={
                    prediction.disease_risk < 30
                      ? 'bg-green-500'
                      : prediction.disease_risk < 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Input Parameters Summary */}
          <Card title="Input Parameters" icon="📋">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">pH Level</span>
                <span className="text-primary font-bold">{formatValue(input.pH)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">EC/TDS</span>
                <span className="text-primary font-bold">{formatValue(input.EC)} µS/cm</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Water Temperature</span>
                <span className="text-primary font-bold">{formatValue(input.water_temp)}°C</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Air Humidity</span>
                <span className="text-primary font-bold">{formatValue(input.humidity)}%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-700">Visual Condition</span>
                <span className="text-primary font-bold">{input.visual_condition}</span>
              </div>
            </div>
          </Card>

          {/* Nutrient Analysis */}
          <Card title="Nutrient Analysis" icon="🌱">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-secondary">
                <p className="text-sm font-semibold text-gray-800 mb-1">Status:</p>
                <p className="text-primary font-bold text-lg">{prediction.nutrient_issue}</p>
              </div>
              <div>
                <ProgressBar
                  label="Nutrient Status Confidence"
                  value={prediction.nutrient_score * 100}
                  max={100}
                  color="bg-green-500"
                />
              </div>
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                Based on pH, EC, and visual indicators. Monitor closely for nutrient deficiency
                symptoms.
              </div>
            </div>
          </Card>
        </div>

        {/* Feature Importance */}
        <div className="mb-8">
          <FeatureImportance features={prediction.feature_importance} label="Feature Importance" />
        </div>

        {/* Recommendations */}
        <Card title="🎯 Recommendations & Actions" icon="">
          <div className="space-y-3">
            {prediction.recommendations && prediction.recommendations.length > 0 ? (
              prediction.recommendations.map((rec, idx) => (
                <RecommendationItem key={idx} recommendation={rec} index={idx} />
              ))
            ) : (
              <p className="text-gray-600">No specific recommendations at this time.</p>
            )}
          </div>
        </Card>

        {/* Confidence Section */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-card border-l-4 border-secondary">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-primary mb-1">Prediction Confidence</h3>
              <p className="text-sm text-gray-600">
                Overall confidence in this prediction based on model certainty
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-secondary">
                {(prediction.confidence * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Confidence Level</div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar
              label=""
              value={prediction.confidence * 100}
              max={100}
              color="bg-secondary"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/')} variant="primary">
            ← Back to Dashboard
          </Button>
          <Button
            onClick={() => {
              // In production, implement export functionality
              const dataStr = JSON.stringify({ prediction, input }, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `prediction_${new Date().getTime()}.json`;
              link.click();
            }}
            variant="secondary"
          >
            💾 Export Results
          </Button>
        </div>
      </div>
    </div>
  );
}
