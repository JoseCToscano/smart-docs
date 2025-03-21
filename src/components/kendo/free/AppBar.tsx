import * as React from 'react';
import { AppBar as KendoAppBar, AppBarSection as KendoAppBarSection } from "@progress/kendo-react-layout";
import clsx from 'clsx';

export interface AppBarProps {
  children?: React.ReactNode;
  position?: 'static' | 'sticky' | 'fixed';
  themeColor?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
}

export interface AppBarSectionProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const AppBarSection: React.FC<AppBarSectionProps> = ({
  children,
  className,
  style
}) => {
  return (
    <KendoAppBarSection className={clsx('flex items-center', className)} style={style}>
      {children}
    </KendoAppBarSection>
  );
};

export const AppBarSpacer: React.FC = () => {
  return <KendoAppBarSection className="flex-1" />;
};

export const AppBarSeparator: React.FC = () => {
  return <div className="h-6 w-px bg-gray-300 mx-3" />;
};

const AppBar: React.FC<AppBarProps> = ({
  children,
  position = 'static',
  themeColor = 'light',
  className,
  style
}) => {
  // Define position classes
  const positionClasses = {
    static: '',
    sticky: 'sticky top-0 z-10',
    fixed: 'fixed top-0 left-0 right-0 z-10'
  };

  // Define color classes based on themeColor
  const colorClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-purple-600 text-white',
    info: 'bg-cyan-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-amber-600 text-white',
    error: 'bg-red-600 text-white',
    light: 'bg-white text-gray-800 border-b border-gray-200',
    dark: 'bg-gray-800 text-white'
  };

  return (
    <KendoAppBar
      className={clsx(
        'py-2 px-4 shadow-sm',
        positionClasses[position],
        colorClasses[themeColor],
        className
      )}
      style={style}
      themeColor={themeColor === 'light' ? 'base' : themeColor}
      positionMode={position === 'fixed' ? 'fixed' : position === 'sticky' ? 'sticky' : 'static'}
    >
      {children}
    </KendoAppBar>
  );
};

export default AppBar; 