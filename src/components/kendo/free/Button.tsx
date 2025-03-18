"use client";

import React from 'react';
import { Button as KendoButton } from "@progress/kendo-react-buttons";

// Define types for our component props
interface ButtonProps {
  children?: React.ReactNode;
  themeColor?: 'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error' | 'dark' | 'light' | 'inverse' | 'base';
  fillMode?: 'solid' | 'flat' | 'outline' | 'link';
  size?: 'small' | 'medium' | 'large';
  rounded?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
  disabled?: boolean;
  icon?: string;
  svgIcon?: any;  // For SVG icons
  onClick?: (e: any) => void;
  title?: string;
  [key: string]: any;
}

/**
 * Button component that wraps KendoReact Button
 */
const Button: React.FC<ButtonProps> = ({
  children,
  themeColor = 'primary',
  fillMode = 'solid',
  size = 'medium',
  rounded,
  className,
  disabled,
  icon,
  svgIcon,
  onClick,
  title,
  ...props
}) => {
  return (
    <KendoButton
      themeColor={themeColor}
      fillMode={fillMode}
      size={size}
      rounded={rounded}
      className={className}
      disabled={disabled}
      icon={icon}
      svgIcon={svgIcon}
      onClick={onClick}
      title={title}
      {...props}
    >
      {children}
    </KendoButton>
  );
};

export default Button; 