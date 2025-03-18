"use client";

import { TextArea as KendoTextArea } from "@progress/kendo-react-inputs";

// Define types for our component props
export interface TextAreaProps {
  value?: string;
  onChange?: (e: any) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  "aria-label"?: string;
}

/**
 * Wrapper for Kendo UI TextArea component (Free)
 * 
 * @component
 * @example
 * // Basic usage
 * <TextArea value={value} onChange={handleChange} placeholder="Enter text..." rows={4} />
 */
export function TextArea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled = false,
  className,
  style,
  rows = 3,
  minLength,
  maxLength,
  "aria-label": ariaLabel,
  ...rest
}: TextAreaProps & Omit<React.ComponentProps<typeof KendoTextArea>, 'size' | 'rounded'>) {
  return (
    <KendoTextArea
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      style={style}
      rows={rows}
      minLength={minLength}
      maxLength={maxLength}
      aria-label={ariaLabel}
      {...rest}
    />
  );
}

export default TextArea; 