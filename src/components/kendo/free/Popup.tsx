import React from 'react';
import { Popup as KendoPopup, PopupProps as KendoPopupProps } from '@progress/kendo-react-popup';

export interface PopupProps extends KendoPopupProps {
  /**
   * Custom className to be applied to the popup
   */
  className?: string;
  
  /**
   * Custom inline styles to be applied to the popup
   */
  style?: React.CSSProperties;
}

/**
 * Custom Popup component that wraps the KendoReact Popup
 * with potential for custom enhancements
 */
export const Popup: React.FC<PopupProps> = ({
  className,
  style,
  children,
  ...rest
}) => {
  return (
    <KendoPopup
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </KendoPopup>
  );
};

export default Popup; 