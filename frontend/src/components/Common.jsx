import React from 'react';

/**
 * Gauge component for displaying circular progress
 * @param {number} value - Value 0-100
 * @param {string} label - Label for gauge
 * @param {string} color - Tailwind color class
 * @param {string} unit - Unit of measurement
 */
export const Gauge = ({ value = 0, label = '', color = 'text-primary', unit = '%' }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={color}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-primary">{value.toFixed(0)}</div>
          <div className="text-xs text-gray-600">{unit}</div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </div>
    </div>
  );
};

/**
 * Card component for consistent layout
 */
export const Card = ({ title, children, icon = null, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-card p-6 border-l-4 border-primary ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <span className="text-2xl mr-3">{icon}</span>}
        {title && <h3 className="text-lg font-bold text-primary">{title}</h3>}
      </div>
      {children}
    </div>
  );
};

/**
 * Input field with label and error
 */
export const InputField = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'number',
  min = null,
  max = null,
  step = '0.1',
  error = null,
  unit = '',
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {unit && <span className="text-gray-500 font-normal ml-1">({unit})</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition ${
          error
            ? 'border-danger focus:border-danger'
            : 'border-gray-300 focus:border-primary'
        }`}
      />
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
};

/**
 * Select/Dropdown field
 */
export const SelectField = ({ label, value, onChange, options = [], error = null }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition ${
          error
            ? 'border-danger focus:border-danger'
            : 'border-gray-300 focus:border-primary'
        }`}
      >
        <option value="">-- Select {label} --</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
};

/**
 * Progress bar with label
 */
export const ProgressBar = ({ label, value, max = 100, color = 'bg-primary' }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-primary">{value.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Status badge
 */
export const StatusBadge = ({ status, color = 'bg-primary' }) => {
  return (
    <span className={`px-4 py-2 rounded-full text-white font-semibold text-sm ${color}`}>
      {status}
    </span>
  );
};

/**
 * Recommendation item
 */
export const RecommendationItem = ({ recommendation, index }) => {
  return (
    <div className="flex items-start mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-primary">
      <span className="mr-3 mt-1 text-lg">💡</span>
      <p className="text-gray-700 text-sm">{recommendation}</p>
    </div>
  );
};

/**
 * Feature importance bar
 */
export const FeatureImportance = ({ features, label = 'Feature Importance' }) => {
  return (
    <Card title={label} icon="📊">
      <div className="space-y-3">
        {features && Object.entries(features).map(([name, value]) => (
          <div key={name}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{name}</span>
              <span className="text-sm font-bold text-primary">{value.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-500"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * Button component
 */
export const Button = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  className = '',
}) => {
  const baseStyles = 'px-6 py-3 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-danger text-white hover:bg-red-700',
    success: 'bg-success text-white hover:bg-green-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span className="inline-flex items-center">
          <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Loading spinner
 */
export const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg className="w-12 h-12 text-primary animate-spin mb-4" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

/**
 * Error alert
 */
export const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="bg-red-50 border-l-4 border-danger p-4 mb-4 rounded">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-danger text-xl mr-3">⚠️</span>
          <p className="text-danger font-medium">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-danger hover:text-red-700">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Success alert
 */
export const SuccessAlert = ({ message, onClose }) => {
  return (
    <div className="bg-green-50 border-l-4 border-success p-4 mb-4 rounded">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-success text-xl mr-3">✓</span>
          <p className="text-success font-medium">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-success hover:text-green-700">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default {
  Gauge,
  Card,
  InputField,
  SelectField,
  ProgressBar,
  StatusBadge,
  RecommendationItem,
  FeatureImportance,
  Button,
  LoadingSpinner,
  ErrorAlert,
  SuccessAlert,
};
