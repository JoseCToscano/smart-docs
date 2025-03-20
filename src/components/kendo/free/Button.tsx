"use client";

import React from 'react';
import { Button as KendoButton, ButtonProps } from "@progress/kendo-react-buttons";

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