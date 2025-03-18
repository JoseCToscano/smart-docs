"use client";

import { Editor as KendoEditor, EditorTools } from "@progress/kendo-react-editor";

// Re-export the EditorTools for easy access
export { EditorTools };

// Define types for our component props
export interface EditorProps {
  defaultContent?: string;
  contentStyle?: React.CSSProperties;
  onChange?: (event: any) => void;
  tools?: any[][];
  className?: string;
}

/**
 * Wrapper for Kendo UI Editor component (Premium)
 * 
 * @component
 * @example
 * // Basic usage
 * <Editor defaultContent="<p>Hello world</p>" onChange={handleChange} />
 */
export function Editor({
  defaultContent = "",
  contentStyle,
  onChange,
  tools,
  className,
  ...rest
}: EditorProps & React.ComponentProps<typeof KendoEditor>) {
  return (
    <KendoEditor
      defaultContent={defaultContent}
      contentStyle={contentStyle}
      onChange={onChange}
      tools={tools}
      className={className}
      {...rest}
    />
  );
}

export default Editor; 