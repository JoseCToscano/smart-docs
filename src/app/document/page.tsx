"use client";

import { useState, useCallback, useRef } from "react";
import { Editor, EditorTools } from "@/components/kendo/premium";
import { Button, Input } from "@/components/kendo/free";
import { 
  arrowsLeftRightIcon, 
  menuIcon 
} from "@/components/kendo";
import "@progress/kendo-theme-default/dist/all.css";
import "./styles.css";
import Link from "next/link";
import AISidebar from "@/components/AISidebar";
import AutoCompletion from "@/components/AutoCompletion";
import { Document } from "@/types";

// Import all necessary editor tools
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
  ForeColor,
  BackColor,
  InsertTable,
  AddRowBefore, AddRowAfter,
  AddColumnBefore, AddColumnAfter,
  DeleteRow, DeleteColumn, DeleteTable,
  MergeCells, SplitCell
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
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [autoCompleteEnabled, setAutoCompleteEnabled] = useState(true);
  const editorRef = useRef<any>(null);

  const handleContentChange = (event: any) => {
    setDocument(prev => ({
      ...prev,
      content: event.html,
      updatedAt: new Date()
    }));
  };

  const handleTitleChange = useCallback((e: any) => {
    const newTitle = e.value;
    setDocument(prev => ({
      ...prev,
      title: newTitle,
      updatedAt: new Date()
    }));
  }, []);

  const handleTitleBlur = useCallback(() => {
    // Ensure title is not empty
    if (!document.title.trim()) {
      setDocument(prev => ({
        ...prev,
        title: "Untitled Document",
      }));
    }
  }, [document.title]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    
    // Simulate saving to server
    setTimeout(() => {
      console.log("Document saved:", document);
      setIsSaving(false);
      
      // Update last saved time
      const now = new Date();
      setLastSaved(`Last saved at ${now.toLocaleTimeString()}`);
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
      <div className="bg-white border-b border-gray-200 shadow-sm">
        {/* Document Title and Menu Row */}
        <div className="flex items-center px-4 py-2 border-b border-gray-200">
          <Link href="/" className="flex items-center mr-6">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-blue-600">
              SmartDocs
            </span>
          </Link>
          <Input
            value={document.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            className="w-64 font-medium"
            style={{ 
              border: 'none', 
              boxShadow: 'none', 
              background: 'transparent',
              fontSize: '14px'
            }}
            aria-label="Document title"
          />
          {lastSaved && (
            <span className="ml-4 text-xs text-gray-500">{lastSaved}</span>
          )}
          <div className="ml-auto flex items-center space-x-2">
            <div className="mr-4 flex items-center">
              <input
                type="checkbox"
                id="enableAutoComplete"
                checked={autoCompleteEnabled}
                onChange={(e) => setAutoCompleteEnabled(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="enableAutoComplete" className="text-sm text-gray-600">
                AI Autocomplete
              </label>
            </div>
            <Button 
              themeColor="primary"
              disabled={isSaving}
              onClick={handleSave}
              icon={isSaving ? "refresh" : "save"}
              className="k-button-md"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button 
              themeColor="base"
              onClick={handleExport}
              icon="pdf"
              className="k-button-md"
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col relative bg-gray-200">
          <div className="relative flex-1 overflow-auto pt-6">
            <div className={`editor-page-container mx-auto shadow-md ${showSidebar ? 'sidebar-open' : ''}`}>
              {/* Editor Content Area with built-in toolbar */}
              <Editor
                ref={editorRef}
                tools={[
                  // Text formatting
                  [Bold, Italic, Underline],
                  [ForeColor, BackColor],
                  // Alignment
                  [AlignLeft, AlignCenter, AlignRight],
                  // Lists and indentation
                  [OrderedList, UnorderedList],
                  [Indent, Outdent],
                  // History
                  [Undo, Redo],
                  // Links
                  [EditorLink, Unlink],
                  // Format and styles
                  [FormatBlock],
                  [FontName],
                  [FontSize],
                  // Tables
                  [InsertTable],
                  [AddRowBefore, AddRowAfter, DeleteRow],
                  [AddColumnBefore, AddColumnAfter, DeleteColumn],
                  [DeleteTable],
                  [MergeCells, SplitCell],
                  // Images
                  [InsertImage]
                ]}
                contentStyle={{ 
                  minHeight: 'calc(100vh - 160px)', // Adjusted for toolbar
                  padding: '1.5rem',
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
              
              {/* Add AutoCompletion component */}
              {autoCompleteEnabled && (
                <AutoCompletion 
                  editorRef={editorRef}
                  enabled={autoCompleteEnabled}
                />
              )}
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