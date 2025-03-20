"use client";

import React from 'react';
import { Input as KendoInput, InputProps as KendoInputProps } from "@progress/kendo-react-inputs";

// Define types for our component props
interface InputProps extends KendoInputProps {
  value?: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  type?: string;
  name?: string;
  id?: string;
  'aria-label'?: string;
}

/**
 * Input component that wraps KendoReact Input
 */
const Input: React.FC<InputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  style,
  disabled,
  readOnly,
  required,
  type = 'text',
  name,
  id,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <KendoInput
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      style={style}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      type={type}
      name={name}
      id={id}
      aria-label={ariaLabel}
      {...props}
    />
  );
};

export default Input; 