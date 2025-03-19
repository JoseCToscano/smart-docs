/**
 * Parse XML diff format from the API response and convert to HTML
 * This function parses XML tags like <addition> and <deletion> and converts
 * them to HTML elements with appropriate styling
 */
export function parseXmlDiff(diffText: string): string {
  try {
    console.log("[xmlDiffParser] Input text length:", diffText.length);
    console.log("[xmlDiffParser] Input text sample:", diffText.substring(0, 150).replace(/\n/g, "\\n"));
    
    // Check for XML tags
    const hasAdditionTags = diffText.includes("<addition>");
    const hasDeletionTags = diffText.includes("<deletion>");
    
    console.log("[xmlDiffParser] Has addition tags:", hasAdditionTags);
    console.log("[xmlDiffParser] Has deletion tags:", hasDeletionTags);
    
    if (!hasAdditionTags && !hasDeletionTags) {
      console.log("[xmlDiffParser] No XML tags found, returning original text");
      return diffText;
    }
    
    // First, convert escaped newlines to actual newlines
    diffText = diffText.replace(/\\n/g, '\n');
    
    // Convert actual newlines to placeholders for processing
    diffText = diffText.replace(/\n/g, '___NEWLINE___');
    
    // Create a simpler parser since both the DOM parser and recursive regex approach have issues
    // We'll use a more straightforward approach with greedy regex for better reliability
    
    // Replace addition tags - IMPORTANT: Don't escape HTML in the content
    let processedText = diffText.replace(
      /<addition>([\s\S]*?)<\/addition>/g, 
      '<span class="ai-addition ai-badge highlight">$1</span>'
    );
    
    // Replace deletion tags - IMPORTANT: Don't escape HTML in the content
    processedText = processedText.replace(
      /<deletion>([\s\S]*?)<\/deletion>/g, 
      '<span class="ai-deletion ai-badge highlight">$1</span>'
    );
    
    // Convert newline placeholders back to <br /> tags
    processedText = processedText.replace(/___NEWLINE___/g, '<br />');
    
    console.log("[xmlDiffParser] Processed text has addition spans:", processedText.includes('ai-addition'));
    console.log("[xmlDiffParser] Processed text has deletion spans:", processedText.includes('ai-deletion'));
    console.log("[xmlDiffParser] Processed text has <br> tags:", processedText.includes('<br />'));
    console.log("[xmlDiffParser] Final processed text sample:", processedText.substring(0, 150));
    
    return processedText;
  } catch (error) {
    console.error('Error parsing XML diff:', error);
    // Final fallback - simplest possible approach
    let processed = diffText;
    
    // Convert newlines to <br> tags
    processed = processed.replace(/\n/g, '<br />');
    
    // Replace addition tags - IMPORTANT: Don't escape HTML content
    processed = processed.replace(
      /<addition>([\s\S]*?)<\/addition>/g, 
      '<span class="ai-addition ai-badge highlight">$1</span>'
    );
    
    // Replace deletion tags - IMPORTANT: Don't escape HTML content
    processed = processed.replace(
      /<deletion>([\s\S]*?)<\/deletion>/g, 
      '<span class="ai-deletion ai-badge highlight">$1</span>'
    );
    
    return processed;
  }
}

/**
 * Process XML content with a recursive regex approach that can handle nested tags
 */
function processXmlWithRecursiveRegex(input: string): string {
  // First normalize input - replace actual newlines with placeholders
  let processedContent = input.replace(/\n/g, '___NEWLINE___');
  
  // Log the first 100 chars of content for debugging
  console.log("[xmlDiffParser] Processing content (first 100 chars):", 
    processedContent.substring(0, 100) + "...");
  
  // Function to recursively replace the innermost tags first
  const processNestedTags = (content: string): string => {
    // Match the innermost addition or deletion tags (those without nested tags)
    // Enhanced regex that handles more complex content including spaces, special chars
    const innerTagRegex = /<(addition|deletion)>((?:(?!<\/?addition|<\/?deletion)[^])*?)<\/\1>/g;
    
    let result = content;
    let match;
    let hasMatches = false;
    let matchCount = 0;
    
    // Replace all innermost tags with styled spans
    while ((match = innerTagRegex.exec(content)) !== null) {
      hasMatches = true;
      matchCount++;
      const [fullMatch, tagName, innerContent = ''] = match;
      
      // Create the styled span without escaping HTML in the content
      const replacement = tagName === 'addition' 
        ? `<span class="ai-addition ai-badge highlight">${innerContent}</span>`
        : `<span class="ai-deletion ai-badge highlight">${innerContent}</span>`;
      
      // Replace in the result - use a more reliable replacement technique
      result = result.replace(fullMatch, function() {
        return replacement;
      });
    }
    
    console.log(`[xmlDiffParser] Processed ${matchCount} matches in this iteration`);
    
    // If we found and replaced tags, process again to handle nesting
    if (hasMatches) {
      return processNestedTags(result);
    }
    
    return result;
  };
  
  let finalResult = processNestedTags(processedContent);
  
  // Convert newline placeholders back to <br /> tags
  finalResult = finalResult.replace(/___NEWLINE___/g, '<br />');
  
  console.log("[xmlDiffParser] Finished processing. Final content has length:", finalResult.length);
  console.log("[xmlDiffParser] Final content has ai-addition:", finalResult.includes('ai-addition'));
  console.log("[xmlDiffParser] Final content has ai-deletion:", finalResult.includes('ai-deletion'));
  
  return finalResult;
}

// Fallback method for parsing XML when the DOM parser fails
function fallbackXmlParse(diffText: string): string {
  try {
    // Normalize newlines first
    let processed = diffText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Then convert newlines to placeholders
    processed = processed.replace(/\n/g, '___NEWLINE___');
    
    console.log("[xmlDiffParser] Fallback processing, text contains addition tags:", 
      processed.includes('<addition>'));
    console.log("[xmlDiffParser] Fallback processing, text contains deletion tags:", 
      processed.includes('<deletion>'));
    
    // Replace addition tags without escaping HTML
    processed = processed.replace(
      /<addition>([\s\S]*?)<\/addition>/g, 
      '<span class="ai-addition ai-badge highlight">$1</span>'
    );
    
    // Replace deletion tags without escaping HTML
    processed = processed.replace(
      /<deletion>([\s\S]*?)<\/deletion>/g, 
      '<span class="ai-deletion ai-badge highlight">$1</span>'
    );
    
    // Convert newline placeholders back to <br /> tags
    processed = processed.replace(/___NEWLINE___/g, '<br />');
    
    console.log("[xmlDiffParser] Fallback processing complete");
    console.log("[xmlDiffParser] Processed content has ai-addition:", processed.includes('ai-addition'));
    console.log("[xmlDiffParser] Processed content has ai-deletion:", processed.includes('ai-deletion'));
    
    return processed;
  } catch (error) {
    console.error('Error in fallback XML parsing:', error);
    // As a last resort, just do basic replacements
    return diffText
      .replace(/\n/g, '<br />')
      .replace(/<addition>([\s\S]*?)<\/addition>/g, '<span class="ai-addition ai-badge highlight">$1</span>')
      .replace(/<deletion>([\s\S]*?)<\/deletion>/g, '<span class="ai-deletion ai-badge highlight">$1</span>');
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

    console.log("[xmlDiffToChanges] Processing diff text, length:", diffText.length);
    
    // First, ensure that any ___NEWLINE___ placeholders are converted to actual newlines
    diffText = diffText.replace(/___NEWLINE___/g, '\n');

    // We'll use regex for a more reliable extraction that handles HTML better
    const additionRegex = /<addition>([\s\S]*?)<\/addition>/g;
    const deletionRegex = /<deletion>([\s\S]*?)<\/deletion>/g;

    // Extract additions
    let additionMatch;
    while ((additionMatch = additionRegex.exec(diffText)) !== null) {
      const text = additionMatch[1] ?? '';
      // Log if the content contains newlines
      if (text.includes('\n')) {
        console.log("[xmlDiffToChanges] Addition contains newlines");
      }
      changes.additions.push({ text });
    }

    // Extract deletions
    let deletionMatch;
    while ((deletionMatch = deletionRegex.exec(diffText)) !== null) {
      const text = deletionMatch[1] ?? '';
      // Log if the content contains newlines
      if (text.includes('\n')) {
        console.log("[xmlDiffToChanges] Deletion contains newlines");
      }
      changes.deletions.push({ text });
    }

    // Try to identify replacements by looking for adjacent deletion-addition pairs
    // This is a simplified approach - for production you'd want more sophisticated patterns
    const deletionAdditionPairRegex = /<deletion>([\s\S]*?)<\/deletion>\s*<addition>([\s\S]*?)<\/addition>/g;
    let pairMatch;
    while ((pairMatch = deletionAdditionPairRegex.exec(diffText)) !== null) {
      const oldText = pairMatch[1] ?? '';
      const newText = pairMatch[2] ?? '';
      // Log if the content contains newlines
      if (oldText.includes('\n') || newText.includes('\n')) {
        console.log("[xmlDiffToChanges] Replacement contains newlines");
      }
      changes.replacements.push({ oldText, newText });
    }

    // Log sample of extracted content to verify newlines
    if (changes.additions && changes.additions.length > 0 && changes.additions[0]?.text) {
      console.log("[xmlDiffToChanges] Sample addition:", 
        JSON.stringify(changes.additions[0].text.substring(0, 50)));
    }
    
    if (changes.deletions && changes.deletions.length > 0 && changes.deletions[0]?.text) {
      console.log("[xmlDiffToChanges] Sample deletion:", 
        JSON.stringify(changes.deletions[0].text.substring(0, 50)));
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