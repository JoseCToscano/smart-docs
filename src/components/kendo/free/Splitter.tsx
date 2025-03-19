import React from 'react';
import { 
   Splitter as KendoSplitter,
   SplitterProps as KendoSplitterProps, 
   SplitterPane, 
   SplitterPaneProps,
   SplitterOnChangeEvent
  } from '@progress/kendo-react-layout';


export interface SplitterProps extends KendoSplitterProps {
  /**
   * Custom className to be applied to the splitter
   */
  className?: string;
  
  /**
   * Custom inline styles to be applied to the splitter
   */
  style?: React.CSSProperties;
}

/**
 * Custom Splitter component that wraps the KendoReact Splitter
 * with potential for custom enhancements
 */
const Splitter: React.FC<SplitterProps> = ({
  className,
  style,
  children,
  ...rest
}) => {
  return (
    <KendoSplitter
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </KendoSplitter>
  );
};

export { Splitter, SplitterPane, type SplitterPaneProps, type SplitterOnChangeEvent }; 