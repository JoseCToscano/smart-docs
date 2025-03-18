import React from 'react';
import { Avatar as KendoAvatar } from '@progress/kendo-react-layout';

export interface AvatarProps {
  /**
   * The type of avatar to display
   */
  type?: 'image' | 'text' | 'icon';
  
  /**
   * The size of the avatar
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * The roundness of the avatar
   */
  rounded?: 'small' | 'medium' | 'large' | 'full';
  
  /**
   * The theme color of the avatar
   */
  themeColor?: 'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error' | 'dark' | 'light' | 'inverse';
  
  /**
   * Custom className to be applied to the avatar
   */
  className?: string;
  
  /**
   * Custom inline styles to be applied to the avatar
   */
  style?: React.CSSProperties;
  
  /**
   * Children content for the avatar (initials or icon)
   */
  children?: React.ReactNode;
}

/**
 * Custom Avatar component that wraps the KendoReact Avatar
 * with potential for custom enhancements
 */
export const Avatar: React.FC<AvatarProps> = ({
  type = 'text',
  size = 'medium',
  rounded = 'full',
  themeColor = 'primary',
  className,
  style,
  children,
  ...rest
}) => {
  return (
    <KendoAvatar
      type={type}
      size={size}
      rounded={rounded}
      themeColor={themeColor}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </KendoAvatar>
  );
};

export default Avatar; 