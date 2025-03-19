import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogActionsBar } from '@/components/kendo/free';
import { Button } from '@/components/kendo/free';
import { Upload } from '@progress/kendo-react-upload';
import { convertFileToHtml } from '@/utils/fileConverter';
import { Notification, NotificationGroup } from '@/components/kendo/free';

interface FileUploadDialogProps {
  onClose: () => void;
  onFileProcessed: (html: string) => void;
}

interface CustomFile {
  name: string;
  extension?: string;
  size?: number;
  status?: number;
  uid?: string;
  progress?: number;
  getRawFile?: () => File;
}

export default function FileUploadDialog({ onClose, onFileProcessed }: FileUploadDialogProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadRef = useRef<Upload | null>(null);

  // Handle file selection
  const onFileChange = useCallback((event: any) => {
    setFiles(event.newState);
    setError(null);
  }, []);

  // Validate file before upload
  const onFileSelect = useCallback((event: any) => {
    if (!event.affectedFiles || event.affectedFiles.length === 0) return;
    
    const file = event.affectedFiles[0];
    if (!file) return;
    
    console.log('Selected file:', file);
    // Check if the file has getRawFile method
    const rawFile = file.getRawFile && typeof file.getRawFile === 'function' ? file.getRawFile() : null;
    
    console.log('File methods:', Object.getOwnPropertyNames(file));
    console.log('File extension:', file.extension);
    console.log('Raw file:', rawFile);
    
    // Check file type
    const fileName = file.name?.toLowerCase() || '';
    const fileExtension = file.extension?.toLowerCase() || '';
    
    const isDocx = 
      fileExtension === '.docx' || 
      fileName.endsWith('.docx') || 
      (rawFile && rawFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    const isDoc = 
      fileExtension === '.doc' || 
      fileName.endsWith('.doc') || 
      (rawFile && rawFile.type === 'application/msword');
      
    const isTxt = 
      fileExtension === '.txt' || 
      fileName.endsWith('.txt') || 
      (rawFile && rawFile.type === 'text/plain');
    
    const isSupportedFileType = isDocx || isDoc || isTxt;
    
    if (!isSupportedFileType) {
      try {
        event.preventDefault();
      } catch (e) {
        // Ignore if preventDefault is not available
      }
      setError('Please select a valid document (.docx, .doc, or .txt file)');
    } else if (!rawFile) {
      setError('Invalid file data - missing file content');
    } else {
      setFiles([file]);
      setError(null);
      console.log(`Valid file selected: ${file.name}, type: ${isDocx ? 'docx' : isDoc ? 'doc' : 'txt'}`);
    }
  }, []);

  // Process the selected file
  const handleProcessFile = useCallback(async () => {
    if (files.length === 0) {
      setError('Please select a file first');
      return;
    }

    const file = files[0] as CustomFile;
    console.log('Processing file:', file);
    
    // Get the raw file using the getRawFile method
    let rawFile = null;
    if (file.getRawFile && typeof file.getRawFile === 'function') {
      try {
        rawFile = file.getRawFile();
        console.log('Raw file obtained:', rawFile);
      } catch (err) {
        console.error('Error getting raw file:', err);
      }
    }
    
    if (!file || !rawFile) {
      setError('Invalid file data or missing file content');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Processing file...', rawFile);
      const result = await convertFileToHtml(rawFile);
      console.log('Conversion successful');
      
      // If there are warnings but conversion succeeded, we can still proceed
      if (result.warnings.length > 0) {
        console.warn('Warnings during conversion:', result.warnings);
      }
      
      onFileProcessed(result.html);
      onClose();
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process the file. Please try again with a different file.');
    } finally {
      setIsProcessing(false);
    }
  }, [files, onFileProcessed, onClose]);

  return (
    <Dialog title="Open Document" onClose={onClose} width={500}>
      <div className="p-4">
        <p className="mb-4">
          Select a document to open in the editor. 
          Supported formats: Word documents (.docx, .doc) and text files (.txt).
        </p>
        
        <Upload
          ref={uploadRef}
          batch={false}
          multiple={false}
          autoUpload={false}
          restrictions={{
            allowedExtensions: ['.docx', '.doc', '.txt'],
            maxFileSize: 10485760 // 10MB max
          }}
          files={files as any}
          onAdd={onFileSelect}
          onRemove={() => setFiles([])}
          onStatusChange={onFileChange}
          saveUrl={''}
        />
        
        {error && (
          <NotificationGroup>
            <Notification
              type='error'
              closable={true}
              onClose={() => setError(null)}
              message={error}
            />
          </NotificationGroup>
        )}
      </div>
      
      <DialogActionsBar>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          themeColor="primary"
          onClick={handleProcessFile}
          disabled={isProcessing || files.length === 0}
        >
          {isProcessing ? 'Processing...' : 'Open Document'}
        </Button>
      </DialogActionsBar>
    </Dialog>
  );
} 