// Normalize both contents
export const normalizeContent = (html: string): string => {
    // Pre-process: Add a special marker to preserve formatting tags
    let processed = html
      // Mark important formatting tags with a unique identifier
      .replace(/<\/?u>/g, '___UTAG___')
      .replace(/<\/?i>/g, '___ITAG___')
      .replace(/<\/?b>/g, '___BTAG___')
      .replace(/<\/?strong>/g, '___STRONGTAG___')
      .replace(/<\/?em>/g, '___EMTAG___')
      .replace(/<\/?mark>/g, '___MARKTAG___'); // Add handling for mark tags
    
    // Apply standard normalization
    processed = processed
      // Remove all whitespace between tags
      .replace(/>\s+</g, '><')
      // Convert all whitespace sequences to a single space
      .replace(/\s+/g, ' ')
      // Normalize self-closing tags
      .replace(/<([^>]+)\/>/g, '<$1></\$1>')
      // Make all tags lowercase
      .replace(/<\/?([A-Z]+)/g, (match) => match.toLowerCase())
      // Remove any id/class attributes that might be auto-generated
      .replace(/\s(id|class)="[^"]*"/g, '')
      // Remove specific Kendo and ProseMirror classes that don't affect content
      .replace(/\sclass="ProseMirror.*?"/g, '')
      .replace(/\scontenteditable="(true|false)"/g, '')
      .replace(/\stranslate="[^"]*"/g, '')
      // Remove any div containers that might be added by the editor but don't change content
      .replace(/<div class="k-content ProseMirror".*?>(.*?)<\/div>/g, '$1')
      // Restore the formatting tags
      .replace(/___UTAG___/g, '<u>')
      .replace(/___\/UTAG___/g, '</u>')
      .replace(/___ITAG___/g, '<i>')
      .replace(/___\/ITAG___/g, '</i>')
      .replace(/___BTAG___/g, '<b>')
      .replace(/___\/BTAG___/g, '</b>')
      .replace(/___STRONGTAG___/g, '<strong>')
      .replace(/___\/STRONGTAG___/g, '</strong>')
      .replace(/___EMTAG___/g, '<em>')
      .replace(/___\/EMTAG___/g, '</em>')
      .replace(/___MARKTAG___/g, '<mark>') // Restore mark tags
      .replace(/___\/MARKTAG___/g, '</mark>') // Restore mark end tags
      // Trim the result
      .trim();
    
    return processed;
  };