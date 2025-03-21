"use client";

import React from 'react';
import { Editor as KendoEditor, EditorTools } from "@progress/kendo-react-editor";

// Re-export the EditorTools for easy access
export { EditorTools };

// Define types for our component props
export interface EditorProps {
  defaultContent?: string;
  contentStyle?: React.CSSProperties;
  onChange?: (event: any) => void;
  onSelectionChange?: (selectedText: string) => void;
  tools?: any[];
  [key: string]: any;
}

/**
 * Editor component that wraps KendoReact Editor
 */
const Editor: React.FC<EditorProps> = ({
  tools,
  contentStyle,
  defaultContent,
  onChange,
  onSelectionChange,
  children,
  ...props
}) => {
  // Add selection change handler
  const handleSelectionChange = () => {
    if (!onSelectionChange) return;
    
    // Get the editor's iframe document
    const iframe = document.querySelector('.k-editor iframe');
    if (!iframe) return;
    
    const iframeDoc = (iframe as HTMLIFrameElement).contentDocument;
    if (!iframeDoc) return;
    
    // Get selected text
    const selection = iframeDoc.getSelection();
    if (!selection) return;
    
    const selectedText = selection.toString().trim();
    if (selectedText) {
      onSelectionChange(selectedText);
    }
  };

  // Add event listener when component mounts
  React.useEffect(() => {
    const iframe = document.querySelector('.k-editor iframe');
    if (!iframe) return;

    const iframeDoc = (iframe as HTMLIFrameElement).contentDocument;
    if (!iframeDoc) return;

    iframeDoc.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      iframeDoc.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [onSelectionChange]);

  return (
    <KendoEditor
      tools={tools}
      contentStyle={contentStyle}
      defaultContent={defaultContent}
      onChange={onChange}
      {...props}
    />
  );
};

export default Editor; 