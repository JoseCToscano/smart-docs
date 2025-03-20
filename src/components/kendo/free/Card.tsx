import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children?: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children?: React.ReactNode;
  className?: string;
}

interface CardActionsProps {
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <h2 className={`text-lg font-medium text-gray-900 truncate mb-2 ${className}`}>
      {children}
    </h2>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
};

export const CardActions: React.FC<CardActionsProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between ${className}`}>
      {children}
    </div>
  );
};

export default Card; 