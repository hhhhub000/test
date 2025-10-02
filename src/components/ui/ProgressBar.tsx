import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  label,
  color = 'blue',
  showPercentage = true,
  className = '',
}) => {
  const percentage = Math.min((current / max) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-primary-500',
    green: 'bg-secondary-500',
    yellow: 'bg-yellow-500',
    red: 'bg-danger-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-200">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-400">
              {current}/{max} ({Math.round(percentage)}%)
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};