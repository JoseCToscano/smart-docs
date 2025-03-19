import { Popup } from "@/components/kendo/free/Popup";
import { NumericTextBox, NumericTextBoxChangeEvent } from "@/components/kendo/free/NumericTextBox";
import Button from "@/components/kendo/free/Button";

interface MarginPopupProps {
    marginSettingsRef: React.RefObject<HTMLDivElement>,
     showMarginSettings: boolean,
      setShowMarginSettings: (show: boolean) => void,
       margins: { left: number; right: number; top: number; bottom: number; }, 
       handleMarginChange: (margin: "top" | "right" | "bottom" | "left", value: number) => void
}

export default function MarginsPopup({marginSettingsRef, showMarginSettings, setShowMarginSettings, margins, handleMarginChange}: MarginPopupProps) {
  // Calculate the scale factor for the preview (making it responsive)
  const previewScale = 0.8; // This will scale down the pixel values for the preview
  
  return (<Popup
    anchor={marginSettingsRef.current}
    show={showMarginSettings}
    popupClass="popup-content"
    animate={true}
    anchorAlign={{ horizontal: 'center', vertical: 'bottom' }}
    popupAlign={{ horizontal: 'center', vertical: 'top' }}
    onClose={() => setShowMarginSettings(false)}
  >
    <div className="bg-white rounded shadow-lg p-4 min-w-72 border border-gray-200">
      <h3 className="font-medium text-sm mb-3 border-b pb-2">Document Margins (px)</h3>
      
      {/* Margin preview */}
      <div className="mb-4 relative mx-auto" style={{ height: '100px', width: '160px' }}>
        <div className="absolute inset-0 border border-gray-200 bg-gray-50">
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
              <span className="text-xs text-gray-400">Content</span>
            </div>
          </div>
          
          {/* Margin labels */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-[9px] text-blue-600 font-medium"
               style={{ top: `${margins.top * previewScale / 2}px` }}>
            {margins.top}px
          </div>
          <div className="absolute top-1/2 transform -translate-y-1/2 text-[9px] text-blue-600 font-medium"
               style={{ right: `${margins.right * previewScale / 2}px` }}>
            {margins.right}px
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-[9px] text-blue-600 font-medium"
               style={{ bottom: `${margins.bottom * previewScale / 2}px` }}>
            {margins.bottom}px
          </div>
          <div className="absolute top-1/2 transform -translate-y-1/2 text-[9px] text-blue-600 font-medium"
               style={{ left: `${margins.left * previewScale / 2}px` }}>
            {margins.left}px
          </div>
        </div>
      </div>
      
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
          Close
        </Button>
      </div>
    </div>
  </Popup>)
}