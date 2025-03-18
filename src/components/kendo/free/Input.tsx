"use client";

import { Input as KendoInput } from "@progress/kendo-react-inputs";

// Define types for our component props
export interface InputProps {
  value?: string;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: string;
  valid?: boolean;
  "aria-label"?: string;
}

/**
 * Wrapper for Kendo UI Input component (Free)
 * 
 * @component
 * @example
 * // Basic usage
 * <Input value={value} onChange={handleChange} placeholder="Enter text..." />
 */
export function Input({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  className,
  style,
  type = "text",
  valid,
  "aria-label": ariaLabel,
  ...rest
}: InputProps & Omit<React.ComponentProps<typeof KendoInput>, 'size' | 'rounded'>) {
  return (
    <KendoInput
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      style={style}
      type={type}
      valid={valid}
      aria-label={ariaLabel}
      {...rest}
    />
  );
}

export default Input; 