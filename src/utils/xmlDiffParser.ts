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

    // Check if the content already contains HTML span tags from previous parsing
    if (diffText.includes('class="ai-addition"') || diffText.includes('class="ai-deletion"')) {
      console.log("[xmlDiffParser] Content already contains highlighted spans, returning as is");
      return diffText;
    }

    // First try to use recursive regex-based approach which handles nested tags better
    try {
      return processXmlWithRecursiveRegex(diffText);
    } catch (recursiveError) {
      console.error("[xmlDiffParser] Error in recursive regex approach:", recursiveError);
      // Fall back to DOM parser approach
    }

    // Preserve newlines by converting them to a placeholder before XML parsing
    const preservedText = diffText.replace(/\n/g, '___NEWLINE___');

    // Create a DOM parser
    const parser = new DOMParser();
    // Wrap the content in a root element to make it valid XML
    const xmlDoc = parser.parseFromString(`<root>${preservedText}</root>`, "text/xml");
    
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
    let htmlContent = preservedText;
    
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
    
    // Convert placeholders back to actual HTML line breaks
    htmlContent = htmlContent.replace(/___NEWLINE___/g, '<br />');
    
    return htmlContent;
  } catch (error) {
    console.error('Error parsing XML diff:', error);
    return fallbackXmlParse(diffText); // Use fallback method if parsing fails
  }
}

/**
 * Process XML content with a recursive regex approach that can handle nested tags
 */
function processXmlWithRecursiveRegex(input: string): string {
  // First replace all newlines with <br> tags for proper rendering
  let processedContent = input.replace(/\n/g, '<br />');
  
  // Log the first 100 chars of content for debugging
  console.log("[xmlDiffParser] Processing content (first 100 chars):", 
    processedContent.substring(0, 100) + "...");
  
  // Function to recursively replace the innermost tags first
  const processNestedTags = (content: string): string => {
    // Match the innermost addition or deletion tags (those without nested tags)
    const innerTagRegex = /<(addition|deletion)>([^<>]*)<\/(addition|deletion)>/g;
    
    let result = content;
    let match;
    let hasMatches = false;
    let matchCount = 0;
    
    // Replace all innermost tags with styled spans
    while ((match = innerTagRegex.exec(content)) !== null) {
      hasMatches = true;
      matchCount++;
      const [fullMatch, tagName, innerContent = '', closingTag] = match;
      
      if (tagName !== closingTag) {
        console.warn(`Mismatched tags: ${tagName} and ${closingTag}`);
        continue;
      }
      
      // Escape any HTML in the content
      const escapedContent = innerContent
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      
      // Create the styled span
      const replacement = tagName === 'addition' 
        ? `<span class="ai-addition ai-badge highlight">${escapedContent}</span>`
        : `<span class="ai-deletion ai-badge highlight">${escapedContent}</span>`;
      
      // Replace in the result
      result = result.replace(fullMatch, replacement);
    }
    
    console.log(`[xmlDiffParser] Processed ${matchCount} matches in this iteration`);
    
    // If we found and replaced tags, process again to handle nesting
    if (hasMatches) {
      return processNestedTags(result);
    }
    
    return result;
  };
  
  const finalResult = processNestedTags(processedContent);
  console.log("[xmlDiffParser] Finished processing. Final content has length:", finalResult.length);
  
  return finalResult;
}

// Fallback method for parsing XML when the DOM parser fails
function fallbackXmlParse(diffText: string): string {
  try {
    // Preserve newlines before processing
    let processed = diffText.replace(/\n/g, '<br />');
    
    // Try recursive approach first
    try {
      return processXmlWithRecursiveRegex(diffText);
    } catch (recursiveError) {
      console.error("[xmlDiffParser] Error in recursive approach in fallback:", recursiveError);
      // Continue with simple regex approach
    }
    
    // Simple regex-based approach as fallback
    // Replace addition tags
    processed = processed.replace(
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

    console.log("[xmlDiffToChanges] Processing diff text, length:", diffText.length);

    // We'll use regex for a more reliable extraction that handles HTML better
    const additionRegex = /<addition>([\s\S]*?)<\/addition>/g;
    const deletionRegex = /<deletion>([\s\S]*?)<\/deletion>/g;

    // Extract additions
    let additionMatch;
    while ((additionMatch = additionRegex.exec(diffText)) !== null) {
      const text = additionMatch[1] ?? '';
      changes.additions.push({ text });
    }

    // Extract deletions
    let deletionMatch;
    while ((deletionMatch = deletionRegex.exec(diffText)) !== null) {
      const text = deletionMatch[1] ?? '';
      changes.deletions.push({ text });
    }

    // Try to identify replacements by looking for adjacent deletion-addition pairs
    // This is a simplified approach - for production you'd want more sophisticated patterns
    const deletionAdditionPairRegex = /<deletion>([\s\S]*?)<\/deletion>\s*<addition>([\s\S]*?)<\/addition>/g;
    let pairMatch;
    while ((pairMatch = deletionAdditionPairRegex.exec(diffText)) !== null) {
      const oldText = pairMatch[1] ?? '';
      const newText = pairMatch[2] ?? '';
      changes.replacements.push({ oldText, newText });
    }

    console.log("[xmlDiffToChanges] Extracted changes:", {
      additions: changes.additions.length,
      deletions: changes.deletions.length,
      replacements: changes.replacements.length
    });
    
    return changes;
  } catch (error) {
    console.error('Error parsing XML diff to changes:', error);
    return changes;
  }
} 