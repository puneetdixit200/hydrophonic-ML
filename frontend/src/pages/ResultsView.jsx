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

/**
 * ResultsView Component
 * Displays prediction results and recommendations
 */
export default function ResultsView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prediction, input } = location.state || {};

  if (!prediction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-light to-bg-light-2 py-12 px-4 flex items-center justify-center">
        <Card title="No Results" icon="⚠️">
          <p className="text-gray-600 mb-4">No prediction data available.</p>
          <Button onClick={() => navigate('/')} variant="primary">
            ← Back to Input
          </Button>
        </Card>
      </div>
    );
  }

  // Generate recommendations based on prediction
  const getRecommendations = () => {
    const recommendations = [];

    if (prediction.health_status !== 'Healthy') {
      recommendations.push({
        icon: '⚕️',
        title: 'Health Alert',
        description: `Plant health status is ${prediction.health_status}. Consider checking nutrient levels and water quality.`,
      });
    }

    if (prediction.nutrient_issue !== 'None') {
      recommendations.push({
        icon: '🧪',
        title: 'Nutrient Issue',
        description: `Detected: ${prediction.nutrient_issue}. Adjust nutrient solution composition.`,
      });
    }

    if (prediction.disease_risk > 0.6) {
      recommendations.push({
        icon: '🦠',
        title: 'Disease Risk',
        description: 'High disease risk detected. Increase air circulation and monitor humidity.',
      });
    }

    if (prediction.growth_rate !== 'Moderate' && prediction.growth_rate !== 'High') {
      recommendations.push({
        icon: '📈',
        title: 'Growth Optimization',
        description: 'Growth rate is lower than expected. Check light levels and CO2 concentration.',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        icon: '✅',
        title: 'System Optimal',
        description: 'Your hydroponic system is performing well. Continue current maintenance routine.',
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  // Feature importance (mock data based on typical ML model behavior)
  const featureImportance = [
    { name: 'pH Level', value: 0.25 },
    { name: 'EC/TDS', value: 0.20 },
    { name: 'Water Temp', value: 0.20 },
    { name: 'Humidity', value: 0.18 },
    { name: 'Visual Condition', value: 0.17 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light to-bg-light-2 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">📊 Prediction Results</h1>
          <p className="text-gray-600">Detailed analysis of your hydroponic system</p>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <Gauge
              label="Health Score"
              value={prediction.health_score * 100}
              size="sm"
              unit="%"
            />
          </Card>
          <Card>
            <Gauge
              label="Yield Score"
              value={prediction.yield_prediction}
              max={100}
              size="sm"
              unit="%"
            />
          </Card>
          <Card>
            <Gauge
              label="Growth Rate"
              value={
                prediction.growth_rate === 'High'
                  ? 100
                  : prediction.growth_rate === 'Moderate'
                  ? 65
                  : 30
              }
              size="sm"
              unit="%"
            />
          </Card>
          <Card>
            <Gauge
              label="Disease Risk"
              value={prediction.disease_risk * 100}
              size="sm"
              unit="%"
            />
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card title="Plant Health Status" icon="🌱">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-700">Status:</span>
              <StatusBadge
                status={
                  prediction.health_status === 'Healthy'
                    ? 'healthy'
                    : prediction.health_status === 'Warning'
                    ? 'warning'
                    : 'critical'
                }
                label={prediction.health_status}
              />
            </div>
            <div className="mt-4">
              <ProgressBar
                label="Health Score"
                value={prediction.health_score * 100}
                color={
                  prediction.health_score > 0.7
                    ? 'success'
                    : prediction.health_score > 0.4
                    ? 'warning'
                    : 'danger'
                }
              />
            </div>
          </Card>

          <Card title="Nutrient Analysis" icon="🧪">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-700">Issues:</span>
              <StatusBadge
                status={prediction.nutrient_issue === 'None' ? 'healthy' : 'warning'}
                label={prediction.nutrient_issue}
              />
            </div>
            <ProgressBar
              label="Nutrient Quality Score"
              value={prediction.nutrient_score * 100}
              color={prediction.nutrient_score > 0.8 ? 'success' : 'warning'}
            />
          </Card>
        </div>

        {/* Recommendations */}
        <Card title="System Recommendations" icon="💡">
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <RecommendationItem
                key={idx}
                icon={rec.icon}
                title={rec.title}
                description={rec.description}
              />
            ))}
          </div>
        </Card>

        {/* Feature Importance */}
        <Card title="Feature Importance" icon="📈">
          <p className="text-sm text-gray-600 mb-4">
            Relative importance of input parameters in the prediction model:
          </p>
          <FeatureImportance features={featureImportance} />
        </Card>

        {/* Input Summary */}
        <Card title="Input Parameters" icon="📋">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">pH</p>
              <p className="text-xl font-bold text-primary">{input.pH}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">EC/TDS</p>
              <p className="text-xl font-bold text-primary">{Math.round(input.EC)} µS/cm</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Water Temp</p>
              <p className="text-xl font-bold text-primary">{input.water_temp}°C</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Humidity</p>
              <p className="text-xl font-bold text-primary">{Math.round(input.humidity)}%</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Visual Condition</p>
              <p className="text-xl font-bold text-primary">{input.visual_condition}</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={() => navigate('/')}
            variant="secondary"
            className="flex-1"
          >
            ← New Prediction
          </Button>
          <Button
            onClick={() => {
              const dataStr = JSON.stringify({ prediction, input }, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `prediction_${new Date().toISOString()}.json`;
              link.click();
            }}
            variant="primary"
            className="flex-1"
          >
            ↓ Export Results
          </Button>
        </div>
      </div>
    </div>
  );
}
