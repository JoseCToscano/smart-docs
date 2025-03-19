"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Tooltip } from "@/components/kendo";
import { NumericTextBox, NumericTextBoxChangeEvent } from "@progress/kendo-react-inputs";
import { DropDownList } from "@/components/kendo/free/Dropdown";
import { PageSize } from "./MarginsPopup";

// Page size definitions in millimeters
const pageSizes = {
  A4: { width: 210, height: 297, name: "A4" },
  A3: { width: 297, height: 420, name: "A3" },
  Letter: { width: 215.9, height: 279.4, name: "Letter" },
  Legal: { width: 215.9, height: 355.6, name: "Legal" },
  Tabloid: { width: 279.4, height: 431.8, name: "Tabloid" }
};

interface MarginSettingsProps {
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

const MarginSettings = ({ 
  margins, 
  onMarginsChange, 
  pageSize = "A4", 
  onPageSizeChange = () => {} 
}: MarginSettingsProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentPageSize, setCurrentPageSize] = useState<PageSize>(pageSize);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Update internal state when props change
  useEffect(() => {
    setCurrentPageSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    setMounted(true);
    
    // Cleanup function to close popup when component unmounts
    return () => {
      setShowSettings(false);
    };
  }, []);

  const toggleSettings = () => {
    setShowSettings(prev => !prev);
  };

  // Calculate the scale factor for the preview
  const previewScale = 0.25;
  
  // Convert a page size to pixels for the preview at the given scale
  const pageToPixels = (size: PageSize) => {
    const pageDetails = pageSizes[size] || pageSizes["A4"];
    // Convert mm to px (1mm ≈ 3.78px)
    return {
      width: Math.round(pageDetails.width * 3.78 * previewScale),
      height: Math.round(pageDetails.height * 3.78 * previewScale),
      aspectRatio: pageDetails.width / pageDetails.height
    };
  };

  // Calculate preview dimensions
  const previewDimensions = pageToPixels(currentPageSize);

  // Page size dropdown data
  const pageSizeData = Object.keys(pageSizes).map(key => ({
    text: `${key} (${pageSizes[key as PageSize].width}×${pageSizes[key as PageSize].height}mm)`,
    value: key
  }));

  // Handle page size change
  const handlePageSizeChange = (size: PageSize) => {
    // Validate the page size
    if (pageSizes[size]) {
      setCurrentPageSize(size);
      onPageSizeChange(size);
    } else {
      console.warn(`Invalid page size selected: ${size}, defaulting to A4`);
      setCurrentPageSize("A4");
      onPageSizeChange("A4");
    }
  };

  // Alternative popup content that doesn't rely on the Popup component
  const renderPopupContent = () => {
    if (!showSettings) return null;
    
    return (
      <div 
        className="bg-white rounded shadow-lg p-4 min-w-80 border border-gray-200 absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
      >
        <h3 className="font-medium text-sm mb-3 border-b pb-2">Page Settings</h3>
        
        {/* Page size selection */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Page Size</label>
          <DropDownList
            data={pageSizeData}
            textField="text"
            dataItemKey="value"
            value={currentPageSize}
            onChange={(e: any) => handlePageSizeChange(e.value as PageSize)}
            size="small"
            style={{ width: '100%' }}
          />
        </div>
        
        {/* Margin preview */}
        <div 
          className="mb-4 relative mx-auto border border-gray-300"
          style={{ 
            height: previewDimensions.height, 
            width: previewDimensions.width 
          }}
        >
          <div className="absolute inset-0 bg-gray-50">
            {/* Document area representing the content */}
            <div 
              className="absolute bg-white border border-dashed border-blue-400 transition-all duration-300"
              style={{
                top: `${margins.top * previewScale}px`,
                right: `${margins.right * previewScale}px`,
                bottom: `${margins.bottom * previewScale}px`,
                left: `${margins.left * previewScale}px`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] text-gray-400">Content</span>
              </div>
            </div>
            
            {/* Margin labels */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-[7px] text-blue-600 font-medium"
                style={{ top: `${margins.top * previewScale / 2}px` }}>
              {margins.top}px
            </div>
            <div className="absolute top-1/2 transform -translate-y-1/2 text-[7px] text-blue-600 font-medium"
                style={{ right: `${margins.right * previewScale / 2}px` }}>
              {margins.right}px
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 text-[7px] text-blue-600 font-medium"
                style={{ bottom: `${margins.bottom * previewScale / 2}px` }}>
              {margins.bottom}px
            </div>
            <div className="absolute top-1/2 transform -translate-y-1/2 text-[7px] text-blue-600 font-medium"
                style={{ left: `${margins.left * previewScale / 2}px` }}>
              {margins.left}px
            </div>
            
            {/* Page size label */}
            <div className="absolute right-0 bottom-0 bg-gray-100 text-[7px] text-gray-500 p-0.5">
              {(pageSizes[currentPageSize] || pageSizes["A4"]).width} × {(pageSizes[currentPageSize] || pageSizes["A4"]).height}mm
            </div>
          </div>
        </div>
        
        <h4 className="font-medium text-xs mb-2">Margins (px)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Top</label>
            <NumericTextBox
              min={0}
              max={100}
              value={margins.top}
              onChange={(e: NumericTextBoxChangeEvent) => onMarginsChange('top', e.value || 0)}
              spinners={true}
              step={4}
              size="small"
              width="100%"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Right</label>
            <NumericTextBox
              min={0}
              max={100}
              value={margins.right}
              onChange={(e: NumericTextBoxChangeEvent) => onMarginsChange('right', e.value || 0)}
              spinners={true}
              step={4}
              size="small"
              width="100%"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Bottom</label>
            <NumericTextBox
              min={0}
              max={100}
              value={margins.bottom}
              onChange={(e: NumericTextBoxChangeEvent) => onMarginsChange('bottom', e.value || 0)}
              spinners={true}
              step={4}
              size="small"
              width="100%"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Left</label>
            <NumericTextBox
              min={0}
              max={100}
              value={margins.left}
              onChange={(e: NumericTextBoxChangeEvent) => onMarginsChange('left', e.value || 0)}
              spinners={true}
              step={4}
              size="small"
              width="100%"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <Button
            themeColor="base"
            onClick={() => {
              onMarginsChange('top', 24);
              onMarginsChange('right', 24);
              onMarginsChange('bottom', 24);
              onMarginsChange('left', 24);
            }}
            className="text-xs"
          >
            Reset to Default
          </Button>
          <Button
            themeColor="primary"
            onClick={() => setShowSettings(false)}
            className="text-xs"
          >
            Apply & Close
          </Button>
        </div>
      </div>
    );
  };

  // Close popup when clicking outside
  useEffect(() => {
    if (!showSettings) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <Tooltip anchorElement="target" position="bottom" content={() => "Adjust page size and margins"}>
        <Button
          themeColor="base"
          onClick={toggleSettings}
          icon="ruler"
          className="k-button-md"
          title="Page Settings"
          ref={buttonRef}
        >
          Page Setup
        </Button>
      </Tooltip>

      {mounted && renderPopupContent()}
    </div>
  );
};

export default MarginSettings; 