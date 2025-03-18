import React from 'react';
import { Tooltip as KendoTooltip, TooltipProps as KendoTooltipProps } from '@progress/kendo-react-tooltip';

export interface TooltipProps extends Omit<KendoTooltipProps, 'content'> {
  /**
   * Content to display in the tooltip.
   * Can be a string, JSX element, or a function that returns either.
   */
  content: string | JSX.Element | (() => string | JSX.Element);
  
  /**
   * Custom className to be applied to the tooltip
   */
  className?: string;
  
  /**
   * Custom inline styles to be applied to the tooltip
   */
  style?: React.CSSProperties;
}

/**
 * Custom Tooltip component that wraps the KendoReact Tooltip
 * with potential for custom enhancements and simplified content handling
 */
export const Tooltip: React.FC<TooltipProps> = ({
  className,
  style,
  content,
  children,
  ...rest
}) => {
  // Convert string or JSX content to a function as required by KendoReact Tooltip
  const contentFunction = typeof content === 'function' 
    ? content 
    : () => content;

  return (
    <KendoTooltip
      className={className}
      style={style}
      content={contentFunction}
      {...rest}
    >
      {children}
    </KendoTooltip>
  );
};

export default Tooltip; 