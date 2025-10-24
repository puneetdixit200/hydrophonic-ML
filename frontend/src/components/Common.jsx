import React from 'react';

/**
 * Card Component - Main container component
 */
export const Card = ({ title, icon = '', children, className = '' }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-card p-6 mb-6 ${className}`}
    >
      {(title || icon) && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-primary">
            {icon} {title}
          </h2>
        </div>
      )}
      {children}
    </div>
  );
};

/**
 * Input Field Component
 */
export const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  max,
  step,
  error,
  unit = '',
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {unit && <span className="text-gray-500">({unit})</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition ${
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-300 focus:border-primary'
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

/**
 * Select Field Component
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
            ? 'border-red-500 focus:border-red-500'
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
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

/**
 * Button Component
 */
export const Button = ({
  children,
  onClick,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}) => {
  const baseStyles =
    'px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 active:scale-95',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95',
    success: 'bg-success text-white hover:bg-green-600 active:scale-95',
    danger: 'bg-danger text-white hover:bg-red-600 active:scale-95',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? '⏳ Loading...' : children}
    </button>
  );
};

/**
 * Gauge Component - For displaying circular progress
 */
export const Gauge = ({ label, value, max = 100, size = 'md', unit = '' }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  const getColor = (percent) => {
    if (percent < 33) return '#d1625b';
    if (percent < 66) return '#f59e0b';
    return '#51d982';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeClasses[size]} relative`}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45"
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{percentage.toFixed(0)}%</div>
            <div className="text-xs text-gray-500">{unit}</div>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 mt-2">{label}</p>
    </div>
  );
};

/**
 * Progress Bar Component
 */
export const ProgressBar = ({ label, value, max = 100, color = 'primary' }) => {
  const percentage = (value / max) * 100;
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-yellow-500',
    danger: 'bg-danger',
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status, label }) => {
  const statusStyles = {
    healthy: 'bg-success text-white',
    warning: 'bg-yellow-500 text-white',
    critical: 'bg-danger text-white',
    moderate: 'bg-blue-500 text-white',
    none: 'bg-gray-300 text-gray-700',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${
        statusStyles[status] || statusStyles.none
      }`}
    >
      {label}
    </span>
  );
};

/**
 * Recommendation Item Component
 */
export const RecommendationItem = ({ icon, title, description }) => {
  return (
    <div className="bg-blue-50 border-l-4 border-primary p-4 rounded mb-3">
      <div className="flex gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Feature Importance Chart Component
 */
export const FeatureImportance = ({ features }) => {
  const maxValue = Math.max(...features.map(f => f.value));

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <div key={feature.name}>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{feature.name}</span>
            <span className="text-sm font-semibold text-primary">
              {(feature.value * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(feature.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin">
        <div className="border-4 border-gray-300 border-t-primary rounded-full w-12 h-12"></div>
      </div>
    </div>
  );
};

/**
 * Alert Components
 */
export const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex justify-between items-center animate-fadeIn">
      <span>❌ {message}</span>
      <button
        onClick={onClose}
        className="text-red-600 hover:text-red-800 font-bold text-lg"
      >
        ×
      </button>
    </div>
  );
};

export const SuccessAlert = ({ message }) => {
  return (
    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 animate-fadeIn">
      <span>✓ {message}</span>
    </div>
  );
};

export const WarningAlert = ({ message }) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 animate-fadeIn">
      <span>⚠️ {message}</span>
    </div>
  );
};
