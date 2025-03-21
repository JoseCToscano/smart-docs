"use client";

import React from 'react';
import { TextArea as KendoTextArea, TextAreaProps } from "@progress/kendo-react-inputs";


/**
 * TextArea component that wraps KendoReact TextArea
 */
const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  style,
  disabled,
  readOnly,
  required,
  name,
  id,
  rows,
  cols,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <KendoTextArea
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      style={style}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      id={id}
      rows={rows}
      cols={cols}
      aria-label={ariaLabel}
      {...props}
    />
  );
};

export default TextArea; 