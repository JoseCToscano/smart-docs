"use client";

import React, { memo } from "react";
import MarginSettings from "./MarginSettings";
import { PageSize } from "./MarginsPopup";

interface MarginSettingsToolProps {
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  onMarginsChange: (margin: 'top' | 'right' | 'bottom' | 'left', value: number) => void;
  pageSize?: PageSize;
  onPageSizeChange?: (newSize: PageSize) => void;
}

// Create a custom tool that follows Kendo UI Editor's tool pattern
const MarginSettingsTool = ({ 
  margins, 
  onMarginsChange, 
  pageSize = "A4", 
  onPageSizeChange = () => {} 
}: MarginSettingsToolProps) => {
  // Create a memoized component to prevent unnecessary re-renders
  const MarginsToolComponent = memo(function MarginsToolComponent() {
    return (
      <MarginSettings 
        margins={margins} 
        onMarginsChange={onMarginsChange} 
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />
    );
  });
  
  return MarginsToolComponent;
};

export default MarginSettingsTool; 