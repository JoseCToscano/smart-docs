/**
 * Parse XML diff format from the API response and convert to HTML
 * This function parses XML tags like <addition> and <deletion> and converts
 * them to HTML elements with appropriate styling
 */
export function parseXmlDiff(diffText: string): string {
  try {
    // Create a parser and parse the XML
    if (typeof window === 'undefined') {
      // Server-side rendering - don't attempt to parse
      return diffText;
    }

    // Create a DOM parser
    const parser = new DOMParser();
    // Wrap the content in a root element to make it valid XML
    const xmlDoc = parser.parseFromString(`<root>${diffText}</root>`, "text/xml");
    
    // Check for parsing errors
    const parserErrors = xmlDoc.getElementsByTagName('parsererror');
    if (parserErrors.length > 0) {
      console.error("XML parsing error:", parserErrors[0]?.textContent || 'Unknown parsing error');
      // Try to fallback to a more robust approach
      return fallbackXmlParse(diffText);
    }
    
    // Get all addition and deletion elements
    const additions = xmlDoc.getElementsByTagName('addition');
    const deletions = xmlDoc.getElementsByTagName('deletion');
    
    // Convert to HTML with appropriate styling
    let htmlContent = diffText;
    
    // Process deletions first to avoid changing positions
    for (let i = deletions.length - 1; i >= 0; i--) {
      const deletionElement = deletions.item(i);
      if (!deletionElement) continue;
      
      const deletionText = deletionElement.textContent || '';
      // Use attribute encoding to ensure HTML is preserved
      const escapedText = deletionText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      
      const deletionHtml = `<span class="ai-deletion ai-badge highlight">${escapedText}</span>`;
      
      // Replace the deletion tag with HTML
      // Use a safer approach that handles potential HTML content in the deletion text
      const tagPattern = new RegExp(`<deletion>${escapeRegExp(deletionText)}</deletion>`, 'g');
      htmlContent = htmlContent.replace(tagPattern, deletionHtml);
    }
    
    // Then process additions
    for (let i = additions.length - 1; i >= 0; i--) {
      const additionElement = additions.item(i);
      if (!additionElement) continue;
      
      const additionText = additionElement.textContent || '';
      // Use attribute encoding to ensure HTML is preserved
      const escapedText = additionText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      
      const additionHtml = `<span class="ai-addition ai-badge highlight">${escapedText}</span>`;
      
      // Replace the addition tag with HTML
      // Use a safer approach that handles potential HTML content in the addition text
      const tagPattern = new RegExp(`<addition>${escapeRegExp(additionText)}</addition>`, 'g');
      htmlContent = htmlContent.replace(tagPattern, additionHtml);
    }
    
    return htmlContent;
  } catch (error) {
    console.error('Error parsing XML diff:', error);
    return fallbackXmlParse(diffText); // Use fallback method if parsing fails
  }
}

// Fallback method for parsing XML when the DOM parser fails
function fallbackXmlParse(diffText: string): string {
  try {
    // Simple regex-based approach as fallback
    // Replace addition tags
    let processed = diffText.replace(
      /<addition>([\s\S]*?)<\/addition>/g, 
      '<span class="ai-addition ai-badge highlight">$1</span>'
    );
    
    // Replace deletion tags
    processed = processed.replace(
      /<deletion>([\s\S]*?)<\/deletion>/g, 
      '<span class="ai-deletion ai-badge highlight">$1</span>'
    );
    
    return processed;
  } catch (error) {
    console.error('Error in fallback XML parsing:', error);
    return diffText; // Return original if all else fails
  }
}

// Helper function to escape special characters in regex patterns
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Convert XML diff format to DocumentChanges structure
 * This extracts additions and deletions from XML tags and converts them to 
 * a structured format that can be used with the existing DocumentChanges interface
 */
export function xmlDiffToChanges(diffText: string): {
  additions: { text: string }[];
  deletions: { text: string }[];
  replacements: { oldText: string; newText: string }[];
} {
  const changes = {
    additions: [] as { text: string }[],
    deletions: [] as { text: string }[],
    replacements: [] as { oldText: string; newText: string }[]
  };

  try {
    if (typeof window === 'undefined') {
      // Server-side - can't parse
      return changes;
    }

    // Create a DOM parser
    const parser = new DOMParser();
    // Wrap the content in a root element to make it valid XML
    const xmlDoc = parser.parseFromString(`<root>${diffText}</root>`, "text/xml");
    
    // Get all addition and deletion elements
    const additions = xmlDoc.getElementsByTagName('addition');
    const deletions = xmlDoc.getElementsByTagName('deletion');
    
    // Extract additions
    for (let i = 0; i < additions.length; i++) {
      const addition = additions.item(i);
      if (!addition) continue;
      
      const text = addition.textContent || '';
      changes.additions.push({ text });
    }
    
    // Extract deletions
    for (let i = 0; i < deletions.length; i++) {
      const deletion = deletions.item(i);
      if (!deletion) continue;
      
      const text = deletion.textContent || '';
      changes.deletions.push({ text });
    }
    
    // Try to identify replacements by looking for adjacent deletion-addition pairs
    // We'll keep this logic simpler for now, but in a real implementation
    // you might want more sophisticated pattern matching
    
    return changes;
  } catch (error) {
    console.error('Error parsing XML diff to changes:', error);
    return changes;
  }
} 