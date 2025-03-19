import mammoth from 'mammoth';

/**
 * Converts various document formats (.docx, .doc, .txt) to HTML content for use in the editor
 * 
 * @param file The document file to convert (.docx, .doc, or .txt)
 * @returns Promise containing the HTML content and any warnings
 */
export async function convertFileToHtml(file: File | Blob): Promise<{ html: string; warnings: string[] }> {
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
    
    // Log file information if available
    const fileInfo = file instanceof File ? 
      `name: ${file.name}, size: ${file.size}, type: ${file.type}` : 
      `size: ${file.size}, type: ${file.type || 'unknown'}`;
      
    console.log('Converting file:', fileInfo);
    
    // Determine file type
    const fileName = file instanceof File ? file.name.toLowerCase() : '';
    const fileType = file.type;
    
    // Process based on file type
    if (
      fileName.endsWith('.docx') || 
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // Handle DOCX files with mammoth
      processDocxFile(file, resolve, reject);
    } else if (
      fileName.endsWith('.doc') || 
      fileType === 'application/msword'
    ) {
      // Handle DOC files with mammoth (may have limited compatibility)
      processDocxFile(file, resolve, reject);
    } else if (
      fileName.endsWith('.txt') || 
      fileType === 'text/plain'
    ) {
      // Handle TXT files with simple text processor
      processTextFile(file, resolve, reject);
    } else {
      reject(new Error(`Unsupported file type: ${fileType || fileName}. Please use .docx, .doc, or .txt files.`));
    }
  });
}

/**
 * Process Word documents (.docx, .doc) using mammoth
 */
function processDocxFile(
  file: File | Blob, 
  resolve: (value: { html: string; warnings: string[] }) => void, 
  reject: (reason: Error) => void
) {
  const reader = new FileReader();
  
  reader.onload = async (event) => {
    try {
      if (!event.target?.result) {
        throw new Error('Failed to read file');
      }
      
      const arrayBuffer = event.target.result as ArrayBuffer;
      console.log('File loaded as ArrayBuffer, size:', arrayBuffer.byteLength);
      
      // Convert the ArrayBuffer to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      // Apply any necessary transformations to make the HTML compatible with the editor
      const processedHtml = processHtmlForEditor(result.value);
      
      console.log('Word document conversion successful, HTML length:', processedHtml.length);
      
      resolve({ 
        html: processedHtml, 
        warnings: result.messages.map(msg => msg.message) 
      });
    } catch (error) {
      console.error('Error converting Word document to HTML:', error);
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
}

/**
 * Process plain text files (.txt) by converting to simple HTML
 */
function processTextFile(
  file: File | Blob,
  resolve: (value: { html: string; warnings: string[] }) => void,
  reject: (reason: Error) => void
) {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      if (!event.target?.result) {
        throw new Error('Failed to read text file');
      }
      
      // Get the text content
      const textContent = event.target.result as string;
      console.log('Text file loaded, length:', textContent.length);
      
      // Convert plain text to HTML
      // - Preserve line breaks
      // - Escape HTML characters
      // - Wrap in paragraph tags
      let html = '';
      
      if (textContent.trim()) {
        // Split by newlines and create paragraphs
        const paragraphs = textContent.split(/\r?\n\r?\n/);
        html = paragraphs
          .map(para => {
            // Handle line breaks within paragraphs
            const lines = para.split(/\r?\n/).map(line => {
              // Escape HTML special characters
              return escapeHtml(line.trim());
            });
            return `<p>${lines.join('<br>')}</p>`;
          })
          .join('\n');
      } else {
        html = '<p></p>';
      }
      
      console.log('Text file conversion successful, HTML length:', html.length);
      
      resolve({ 
        html, 
        warnings: [] 
      });
    } catch (error) {
      console.error('Error converting text file to HTML:', error);
      reject(new Error(`Failed to convert text file: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  };
  
  reader.onerror = (event) => {
    console.error('File reader error:', event);
    reject(new Error('Failed to read text file. Please check that the file is not corrupted.'));
  };
  
  // Start reading the file as text
  try {
    reader.readAsText(file);
  } catch (error) {
    console.error('Error reading file as text:', error);
    reject(new Error(`Failed to read text file: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

// For backward compatibility
export const convertDocxToHtml = convertFileToHtml; 