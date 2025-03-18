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
      const deletionHtml = `<span class="ai-deletion ai-badge highlight">${deletionText}</span>`;
      
      // Replace the deletion tag with HTML
      htmlContent = htmlContent.replace(
        `<deletion>${deletionText}</deletion>`, 
        deletionHtml
      );
    }
    
    // Then process additions
    for (let i = additions.length - 1; i >= 0; i--) {
      const additionElement = additions.item(i);
      if (!additionElement) continue;
      
      const additionText = additionElement.textContent || '';
      const additionHtml = `<span class="ai-addition ai-badge highlight">${additionText}</span>`;
      
      // Replace the addition tag with HTML
      htmlContent = htmlContent.replace(
        `<addition>${additionText}</addition>`, 
        additionHtml
      );
    }
    
    return htmlContent;
  } catch (error) {
    console.error('Error parsing XML diff:', error);
    return diffText; // Return original text if parsing fails
  }
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