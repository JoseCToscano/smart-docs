"use client";

import { Button as KendoButton } from "@progress/kendo-react-buttons";

// Define types for our component props
export interface ButtonProps {
  themeColor?: "primary" | "secondary" | "tertiary" | "info" | "success" | "warning" | "error" | "dark" | "light" | "inverse" | "base";
  disabled?: boolean;
  icon?: string;
  svgIcon?: any;
  size?: "small" | "medium" | "large" | "none";
  rounded?: "small" | "medium" | "large" | "full" | "none";
  fillMode?: "solid" | "flat" | "outline" | "link" | "none";
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  title?: string;
}

/**
 * Wrapper for Kendo UI Button component (Free)
 * 
 * @component
 * @example
 * // Basic usage
 * <Button themeColor="primary" onClick={handleClick}>Click Me</Button>
 */
export function Button({
  themeColor = "primary",
  disabled = false,
  icon,
  svgIcon,
  size,
  rounded,
  fillMode,
  children,
  className,
  onClick,
  type = "button",
  title,
  ...rest
}: ButtonProps & React.ComponentProps<typeof KendoButton>) {
  return (
    <KendoButton
      themeColor={themeColor}
      disabled={disabled}
      icon={icon}
      svgIcon={svgIcon}
      size={size}
      rounded={rounded}
      fillMode={fillMode}
      className={className}
      onClick={onClick}
      type={type}
      title={title}
      {...rest}
    >
      {children}
    </KendoButton>
  );
}

export default Button; 