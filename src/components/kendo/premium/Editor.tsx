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
  tools?: any[];
  children?: React.ReactNode;
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
  children,
  ...props
}) => {
  return (
    <KendoEditor
      tools={tools}
      contentStyle={contentStyle}
      defaultContent={defaultContent}
      onChange={onChange}
      {...props}
    >
      {children}
    </KendoEditor>
  );
};

export default Editor; 