import * as React from 'react';
import clsx from 'clsx';

export interface ProgressBarProps {
  value?: number;
  min?: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  themeColor?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  min = 0,
  max = 100,
  label,
  showLabel = true,
  themeColor = 'primary',
  size = 'medium',
  animation = true,
  className,
  style,
}) => {
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  // Define color classes based on themeColor
  const colorClasses = {
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    info: 'bg-cyan-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };
  
  // Define size classes
  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-4'
  };

  // For indeterminate animation when no value is provided
  const isIndeterminate = value === null || value === undefined;
  
  return (
    <div className={clsx('w-full', className)} style={style}>
      {label && showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span>{label}</span>
          {!isIndeterminate && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        {isIndeterminate ? (
          <div 
            className={clsx(
              'h-full rounded-full', 
              colorClasses[themeColor],
              animation && 'animate-progress-indeterminate'
            )}
            style={{ width: '25%' }}
          />
        ) : (
          <div 
            className={clsx(
              'h-full rounded-full', 
              colorClasses[themeColor],
              animation && 'transition-all duration-300'
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};

export default ProgressBar; 