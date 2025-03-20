export const pageSizes = {
  A4: { width: 210, height: 297, name: "A4" },
  A3: { width: 297, height: 420, name: "A3" },
  Letter: { width: 215.9, height: 279.4, name: "Letter" },
  Legal: { width: 215.9, height: 355.6, name: "Legal" },
  Tabloid: { width: 279.4, height: 431.8, name: "Tabloid" }
};

export const getPageSizeInPixels = (pageSize: keyof typeof pageSizes) => {
  // Add a fallback to A4 if pageSize is not a valid key in pageSizes
  const pageDetails = pageSizes[pageSize] ?? pageSizes.A4;
  
  // Convert mm to px using a more precise conversion factor
  // Standard conversion: 1mm ≈ 3.7795275591 pixels (96 DPI)
  const mmToPx = 3.7795275591;
  
  // Calculate dimensions
  const widthPx = Math.round(pageDetails.width * mmToPx);
  const heightPx = Math.round(pageDetails.height * mmToPx);
  
  console.log("[DocumentPage] Page dimensions calculated:", 
    `${pageDetails.width}mm x ${pageDetails.height}mm →`,
    `${widthPx}px x ${heightPx}px`);
  
  return {
    width: `${widthPx}px`,
    height: `${heightPx}px`,
    aspectRatio: pageDetails.width / pageDetails.height,
    widthValue: widthPx,
    heightValue: heightPx
  };
};