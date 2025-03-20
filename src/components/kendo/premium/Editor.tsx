"use client";

import React from 'react';
import { Editor as KendoEditor, EditorTools, EditorProps as KendoEditorProps } from "@progress/kendo-react-editor";

// Re-export the EditorTools for easy access
export { EditorTools };

// Define types for our component props
export interface EditorProps extends KendoEditorProps {
  children?: React.ReactNode;
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
    />
  );
};

export default Editor; 