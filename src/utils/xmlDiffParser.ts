/**
 * Parse XML diff format from the API response and convert to HTML
 * This function parses XML tags like <addition> and <deletion> and converts
 * them to HTML elements with appropriate styling
 */
export function parseXmlDiff(diffText: string): string {
  try {
    console.log("[xmlDiffParser] Input text length:", diffText.length);
    console.log("[xmlDiffParser] Input text sample:", diffText.substring(0, 150).replace(/\n/g, "\\n"));
    
    // Check for XML and HTML tags in the content
    const hasAdditionTags = diffText.includes("<addition>");
    const hasDeletionTags = diffText.includes("<deletion>");
    const hasMarkTags = diffText.includes("<mark>");
    
    console.log("[xmlDiffParser] Has addition tags:", hasAdditionTags);
    console.log("[xmlDiffParser] Has deletion tags:", hasDeletionTags);
    console.log("[xmlDiffParser] Has mark tags:", hasMarkTags);
    
    if (!hasAdditionTags && !hasDeletionTags) {
      console.log("[xmlDiffParser] No XML tags found, returning original text");
      return diffText;
    }
    
    // First, convert escaped newlines to actual newlines
    diffText = diffText.replace(/\\n/g, '\n');
    
    // Convert actual newlines to placeholders for processing
    diffText = diffText.replace(/\n/g, '___NEWLINE___');
    
    // Count mark tags to verify they're present
    const markTagCount = (diffText.match(/<mark>/g) ?? []).length;
    console.log("[xmlDiffParser] Number of mark tags:", markTagCount);
    
    // Special handling to preserve mark tags within additions
    // Add a temporary marker to protect them
    diffText = diffText.replace(/<mark>([\s\S]*?)<\/mark>/g, '___MARK_START___$1___MARK_END___');
    
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
    
    // Restore mark tags that were protected
    processedText = processedText.replace(/___MARK_START___([\s\S]*?)___MARK_END___/g, '<mark>$1</mark>');
    
    // Convert newline placeholders back to <br /> tags
    processedText = processedText.replace(/___NEWLINE___/g, '<br />');
    
    // Count mark tags in the processed text to verify they're still present
    const finalMarkTagCount = (processedText.match(/<mark>/g) ?? []).length;
    console.log("[xmlDiffParser] Final number of mark tags:", finalMarkTagCount);
    
    console.log("[xmlDiffParser] Processed text has addition spans:", processedText.includes('ai-addition'));
    console.log("[xmlDiffParser] Processed text has deletion spans:", processedText.includes('ai-deletion'));
    console.log("[xmlDiffParser] Processed text has mark tags:", processedText.includes('<mark>'));
    console.log("[xmlDiffParser] Processed text has <br> tags:", processedText.includes('<br />'));
    console.log("[xmlDiffParser] Final processed text sample:", processedText.substring(0, 150));
    
    return processedText;
  } catch (error) {
    console.error('Error parsing XML diff:', error);
    // Final fallback - simplest possible approach
    let processed = diffText;
    
    // Check for mark tags in the original content
    const hasMarkTags = diffText.includes("<mark>");
    console.log("[xmlDiffParser] Fallback: content has mark tags:", hasMarkTags);
    
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
    
    // Check if mark tags survived the process
    const finalHasMarkTags = processed.includes("<mark>");
    console.log("[xmlDiffParser] Fallback: final content has mark tags:", finalHasMarkTags);
    
    return processed;
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
      if (oldText.includes('\n') ?? newText.includes('\n')) {
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