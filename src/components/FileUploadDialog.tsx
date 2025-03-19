import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogActionsBar } from '@/components/kendo/free';
import { Button } from '@/components/kendo/free';
import { Upload } from '@progress/kendo-react-upload';
import { convertDocxToHtml } from '@/utils/docxConverter';
import { Notification, NotificationGroup } from '@/components/kendo/free';

interface FileUploadDialogProps {
  onClose: () => void;
  onFileProcessed: (html: string) => void;
}

interface CustomFile {
  name: string;
  rawFile?: File;
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
    console.log('File type:', file.rawFile?.type);
    console.log('File extension:', file.extension);
    
    // Check file type
    const isDocx = 
      file.extension === '.docx' || 
      file.name?.toLowerCase().endsWith('.docx') || 
      (file.rawFile && 
       file.rawFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    if (!isDocx) {
      try {
        event.preventDefault();
      } catch (e) {
        // Ignore if preventDefault is not available
      }
      setError('Please select a valid Word document (.docx file)');
    } else if (!file.rawFile) {
      setError('Invalid file data - missing file content');
    } else {
      setFiles([file]);
      setError(null);
      console.log('Valid .docx file selected:', file.name);
    }
  }, []);

  // Process the selected file
  const handleProcessFile = useCallback(async () => {
    if (files.length === 0) {
      setError('Please select a file first');
      return;
    }

    const file = files[0] as CustomFile;
    console.log('file', file, file.rawFile);
    if (!file || !file.rawFile) {
      setError('Invalid file data or missing file content');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Processing file with mammoth...', file.rawFile);
      const result = await convertDocxToHtml(file.rawFile);
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
    <Dialog title="Open Word Document" onClose={onClose} width={500}>
      <div className="p-4">
        <p className="mb-4">
          Select a Word document (.docx) to open in the editor. 
          The document will be converted to HTML format.
        </p>
        
        <Upload
          ref={uploadRef}
          batch={false}
          multiple={false}
          autoUpload={false}
          restrictions={{
            allowedExtensions: ['.docx'],
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