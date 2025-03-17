"use client";

import { useState, useCallback } from "react";
import { Editor, EditorTools } from "@progress/kendo-react-editor";
import "@progress/kendo-theme-default/dist/all.css";
import DocumentToolbar from "@/components/DocumentToolbar";
import { Document } from "@/types";

const {
  Bold, Italic, Underline,
  AlignLeft, AlignRight, AlignCenter,
  Indent, Outdent,
  OrderedList, UnorderedList,
  Undo, Redo,
  Link: EditorLink, Unlink,
  FormatBlock,
  FontSize,
  FontName,
  InsertImage,
} = EditorTools;

export default function DocumentPage() {
  const [document, setDocument] = useState<Document>({
    title: "Untitled Document",
    content: "<p>Start typing your document here...</p>",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleContentChange = (event: any) => {
    setDocument(prev => ({
      ...prev,
      content: event.html,
      updatedAt: new Date()
    }));
  };

  const handleTitleChange = useCallback((newTitle: string) => {
    setDocument(prev => ({
      ...prev,
      title: newTitle,
      updatedAt: new Date()
    }));
  }, []);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    
    // Simulate saving to server
    setTimeout(() => {
      console.log("Document saved:", document);
      setIsSaving(false);
    }, 1500);
  }, [document]);

  const handleExport = useCallback(() => {
    console.log("Exporting document...");
    // PDF export functionality could be implemented here
    alert("Export functionality will be implemented in a future update.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DocumentToolbar 
        documentTitle={document.title}
        onTitleChange={handleTitleChange}
        onSave={handleSave}
        onExport={handleExport}
        isSaving={isSaving}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        <Editor
          tools={[
            [Bold, Italic, Underline],
            [AlignLeft, AlignCenter, AlignRight],
            [OrderedList, UnorderedList],
            [Indent, Outdent],
            [Undo, Redo],
            [EditorLink, Unlink],
            [FormatBlock],
            [FontName],
            [FontSize],
            [InsertImage],
          ]}
          contentStyle={{ 
            height: 'calc(100vh - 60px)', 
            padding: '2rem',
            paddingTop: '1.5rem',
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '850px',
            margin: '0 auto',
            boxShadow: 'none',
            border: 'none',
            backgroundColor: '#ffffff'
          }}
          defaultContent={document.content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  );
} 