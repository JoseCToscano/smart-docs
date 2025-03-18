"use client";

import { useState, useCallback } from "react";
import { Editor, EditorTools } from "@/components/kendo/premium";
import { Button } from "@/components/kendo/free";
import { arrowsLeftRightIcon, menuIcon } from "@/components/kendo";
import "@progress/kendo-theme-default/dist/all.css";
import "./styles.css";
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
      {/* Main App Toolbar */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <DocumentToolbar 
          documentTitle={document.title}
          onTitleChange={handleTitleChange}
          onSave={handleSave}
          onExport={handleExport}
          isSaving={isSaving}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col relative bg-gray-200 pt-8">
          <div className="relative flex-1 overflow-auto">
            <div 
              className="mx-auto shadow-md"
              style={{ 
                width: showSidebar ? '700px' : '850px',
                transition: 'width 0.3s ease-in-out',
              }}
            >
              {/* Editor Container with Custom Toolbar */}
              <div className="bg-white">
                {/* Custom Editor Toolbar */}
                <div className="bg-gray-50 border-b border-gray-200 p-2 rounded-t-sm">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex gap-1 pr-2 border-r border-gray-300">
                      <Button themeColor="base" size="small" icon="bold" title="Bold" />
                      <Button themeColor="base" size="small" icon="italic" title="Italic" />
                      <Button themeColor="base" size="small" icon="underline" title="Underline" />
                    </div>
                    <div className="flex gap-1 pr-2 border-r border-gray-300">
                      <Button themeColor="base" size="small" icon="align-left" title="Align Left" />
                      <Button themeColor="base" size="small" icon="align-center" title="Align Center" />
                      <Button themeColor="base" size="small" icon="align-right" title="Align Right" />
                    </div>
                    <div className="flex gap-1 pr-2 border-r border-gray-300">
                      <Button themeColor="base" size="small" icon="list-ordered" title="Ordered List" />
                      <Button themeColor="base" size="small" icon="list-unordered" title="Unordered List" />
                    </div>
                    <div className="flex gap-1">
                      <Button themeColor="base" size="small" icon="image" title="Insert Image" />
                      <Button themeColor="base" size="small" icon="link-horizontal" title="Insert Link" />
                    </div>
                  </div>
                </div>

                {/* Editor Content Area */}
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
                    minHeight: 'calc(100vh - 200px)', 
                    padding: '2rem',
                    paddingTop: '1.5rem',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    boxShadow: 'none',
                    border: 'none',
                    backgroundColor: '#ffffff',
                  }}
                  defaultContent={document.content}
                  onChange={handleContentChange}
                />
              </div>
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