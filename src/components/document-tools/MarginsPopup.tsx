import { Popup } from "@/components/kendo/free/Popup";
import { NumericTextBox, NumericTextBoxChangeEvent } from "@/components/kendo/free/NumericTextBox";
import Button from "@/components/kendo/free/Button";
import { DropDownList } from "@/components/kendo/free/Dropdown";
import { useState, useEffect } from "react";

// Page size definitions in millimeters
const pageSizes = {
  A4: { width: 210, height: 297, name: "A4" },
  A3: { width: 297, height: 420, name: "A3" },
  Letter: { width: 215.9, height: 279.4, name: "Letter" },
  Legal: { width: 215.9, height: 355.6, name: "Legal" },
  Tabloid: { width: 279.4, height: 431.8, name: "Tabloid" }
};

// Define the page size type
export type PageSize = "A4" | "A3" | "Letter" | "Legal" | "Tabloid";

interface MarginPopupProps {
    marginSettingsRef: React.RefObject<HTMLDivElement>,
    showMarginSettings: boolean,
    setShowMarginSettings: (show: boolean) => void,
    margins: { left: number; right: number; top: number; bottom: number; }, 
    handleMarginChange: (margin: "top" | "right" | "bottom" | "left", value: number) => void,
    pageSize?: PageSize,
    onPageSizeChange?: (newSize: PageSize) => void
}

export default function MarginsPopup({
  marginSettingsRef, 
  showMarginSettings, 
  setShowMarginSettings, 
  margins, 
  handleMarginChange,
  pageSize = "A4",
  onPageSizeChange = () => {}
}: MarginPopupProps) {
  // Calculate the scale factor for the preview (making it responsive)
  const previewScale = 0.25; // This will scale down the pixel values for the preview
  
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
  const [previewDimensions, setPreviewDimensions] = useState(pageToPixels(pageSize || "A4"));

  // Update preview dimensions when page size changes
  useEffect(() => {
    setPreviewDimensions(pageToPixels(pageSize || "A4"));
  }, [pageSize]);

  // Page size dropdown data
  const pageSizeData = Object.keys(pageSizes).map(key => ({
    text: `${key} (${pageSizes[key as PageSize].width}×${pageSizes[key as PageSize].height}mm)`,
    value: key
  }));
  
  return (<Popup
    anchor={marginSettingsRef.current}
    show={showMarginSettings}
    popupClass="popup-content"
    animate={true}
    anchorAlign={{ horizontal: 'center', vertical: 'bottom' }}
    popupAlign={{ horizontal: 'center', vertical: 'top' }}
    onClose={() => setShowMarginSettings(false)}
  >
    <div className="bg-white rounded shadow-lg p-4 min-w-80 border border-gray-200">
      <h3 className="font-medium text-sm mb-3 border-b pb-2">Page Settings</h3>
      
      {/* Page size selection */}
      <div className="mb-3">
        <label className="block text-xs text-gray-600 mb-1">Page Size</label>
        <DropDownList
          style={{ width: '100%' }}
          data={pageSizeData}
          textField="text"
          dataItemKey="value"
          value={pageSizeData.find(item => item.value === pageSize)}
          defaultValue={pageSizeData[0]}
          onChange={(event) => {
            console.log("[MarginsPopup] DropDownList onChange:", event.target.value);
            // In the official Kendo implementation, the selected value is in event.target.value
            if (event.target.value) {
              const newSize = event.target.value as { text: string, value: string };
              console.log("[MarginsPopup] newSize:", newSize);
              if (pageSizes[newSize.value as PageSize]) {
                console.log("[MarginsPopup] newSize is valid:", newSize);
                onPageSizeChange(newSize.value as PageSize);
              } else {
                console.log("[MarginsPopup] newSize is invalid:", newSize);
                onPageSizeChange("A4");
              }
            }
          }}
          size="small"
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
            {(pageSizes[pageSize] || pageSizes["A4"]).width} × {(pageSizes[pageSize] || pageSizes["A4"]).height}mm
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
            onChange={(e: NumericTextBoxChangeEvent) => handleMarginChange('top', e.value || 0)}
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
            onChange={(e: NumericTextBoxChangeEvent) => handleMarginChange('right', e.value || 0)}
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
            onChange={(e: NumericTextBoxChangeEvent) => handleMarginChange('bottom', e.value || 0)}
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
            onChange={(e: NumericTextBoxChangeEvent) => handleMarginChange('left', e.value || 0)}
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
            handleMarginChange('top', 24);
            handleMarginChange('right', 24);
            handleMarginChange('bottom', 24);
            handleMarginChange('left', 24);
          }}
          className="text-xs"
        >
          Reset to Default
        </Button>
        <Button
          themeColor="primary"
          onClick={() => setShowMarginSettings(false)}
          className="text-xs"
        >
          Apply & Close
        </Button>
      </div>
    </div>
  </Popup>)
}