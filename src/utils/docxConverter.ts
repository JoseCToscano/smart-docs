import mammoth from 'mammoth';

/**
 * Converts a .docx file to HTML content for use in the editor
 * 
 * @param file The Word (.docx) file to convert
 * @returns Promise containing the HTML content and any warnings
 */
export async function convertDocxToHtml(file: File): Promise<{ html: string; warnings: string[] }> {
  return new Promise((resolve, reject) => {
    // Validate the file parameter
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    if (!(file instanceof Blob)) {
      reject(new Error(`Invalid file object: expected a File/Blob object but got ${typeof file}`));
      return;
    }
    
    console.log('Converting file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Read the file as an ArrayBuffer
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const arrayBuffer = event.target.result as ArrayBuffer;
        console.log('File loaded as ArrayBuffer, size:', arrayBuffer.byteLength);
        
        // Convert the ArrayBuffer to HTML
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        // Apply any necessary transformations to make the HTML compatible with the editor
        const processedHtml = processHtmlForEditor(result.value);
        
        console.log('Conversion successful, HTML length:', processedHtml.length);
        
        resolve({ 
          html: processedHtml, 
          warnings: result.messages.map(msg => msg.message) 
        });
      } catch (error) {
        console.error('Error converting docx to HTML:', error);
        reject(new Error(`Failed to convert document: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = (event) => {
      console.error('File reader error:', event);
      reject(new Error('Failed to read file. Please check that the file is not corrupted.'));
    };
    
    // Start reading the file as an ArrayBuffer
    try {
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file as ArrayBuffer:', error);
      reject(new Error(`Failed to read file as ArrayBuffer: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

/**
 * Process the HTML to ensure it's compatible with the Kendo editor
 */
function processHtmlForEditor(html: string): string {
  // Apply any necessary transformations to make the HTML work well in the editor
  // This could include:
  // 1. Ensuring proper paragraph tags are used
  // 2. Cleaning up styles that might conflict with the editor
  // 3. Converting specific Word elements to their HTML equivalents
  
  let processedHtml = html;
  
  // Ensure the content has at least one paragraph if empty
  if (!processedHtml.trim()) {
    processedHtml = '<p></p>';
  }
  
  // Remove Word-specific classes and styles that might cause issues
  processedHtml = processedHtml
    // Remove Word specific span styles
    .replace(/<span style="[^"]*mso-[^"]*"[^>]*>(.*?)<\/span>/g, '$1')
    // Remove Word specific class attributes
    .replace(/ class="(Mso[^"]*)"/g, '')
    // Remove empty paragraphs that might cause issues
    .replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>')
    // Convert Word specific lists to standard HTML lists
    .replace(/<p style="[^"]*mso-list:[^"]*"[^>]*>(.*?)<\/p>/g, '<li>$1</li>')
    // Ensure we have only one <p> tag per paragraph (Word often nests them)
    .replace(/<p[^>]*><p[^>]*>(.*?)<\/p><\/p>/g, '<p>$1</p>')
    // Convert Word headings to proper HTML headings
    .replace(/<p[^>]*><strong><span[^>]*>([^<]+)<\/span><\/strong><\/p>/g, '<h2>$1</h2>')
    // Fix Word's weird table styles
    .replace(/ border="1"| cellspacing="0"| cellpadding="0"/g, '');
  
  return processedHtml;
} 