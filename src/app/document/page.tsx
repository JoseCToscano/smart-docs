"use client";

import { useState, useCallback } from "react";
import { Editor, EditorTools } from "@/components/kendo/premium";
import { Button } from "@/components/kendo/free";
import { arrowsLeftRightIcon, menuIcon } from "@/components/kendo";
import "@progress/kendo-theme-default/dist/all.css";
import DocumentToolbar from "@/components/DocumentToolbar";
import AISidebar from "@/components/AISidebar";
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
  const [showSidebar, setShowSidebar] = useState(true);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

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

  const handleAIPrompt = useCallback((prompt: string) => {
    console.log("AI Prompt:", prompt);
    setIsAIProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsAIProcessing(false);
    }, 2000);
  }, []);

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <DocumentToolbar 
        documentTitle={document.title}
        onTitleChange={handleTitleChange}
        onSave={handleSave}
        onExport={handleExport}
        isSaving={isSaving}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col relative bg-gray-200 pt-8">
          <div className="relative flex-1 overflow-auto">
            <div 
              className="mx-auto shadow-md rounded-sm" 
              style={{ 
                width: showSidebar ? '700px' : '850px',
                transition: 'width 0.3s ease-in-out',
                backgroundColor: '#ffffff',
              }}
            >
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
                  minHeight: 'calc(100vh - 120px)', 
                  padding: '2rem',
                  paddingTop: '1.5rem',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  boxShadow: 'none',
                  border: 'none',
                }}
                defaultContent={document.content}
                onChange={handleContentChange}
              />
            </div>
          </div>
          
          {/* Toggle Sidebar Button */}
          <Button 
            onClick={toggleSidebar}
            themeColor="base"
            rounded="full"
            size="small"
            svgIcon={showSidebar ? arrowsLeftRightIcon : menuIcon}
            className="absolute top-2 right-2 bg-white hover:bg-gray-100 z-10 shadow-sm"
            title={showSidebar ? "Hide AI Assistant" : "Show AI Assistant"}
          />
        </div>
        
        {/* AI Sidebar */}
        {showSidebar && (
          <AISidebar 
            onPromptSubmit={handleAIPrompt}
            isLoading={isAIProcessing}
          />
        )}
      </div>
    </div>
  );
} 