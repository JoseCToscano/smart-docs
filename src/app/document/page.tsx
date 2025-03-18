"use client";

import { useState, useCallback } from "react";
import { Editor, EditorTools } from "@/components/kendo/premium";
import { Button, Input } from "@/components/kendo/free";
import { 
  arrowsLeftRightIcon, 
  menuIcon,
  boldIcon, 
  italicIcon, 
  underlineIcon, 
  alignLeftIcon, 
  alignCenterIcon, 
  alignRightIcon,
  listOrderedIcon, 
  listUnorderedIcon, 
  indentIcon, 
  outdentIcon,
  imageIcon, 
  linkIcon, 
  tableIcon 
} from "@/components/kendo";
import "@progress/kendo-theme-default/dist/all.css";
import "./styles.css";
import Link from "next/link";
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
  const [lastSaved, setLastSaved] = useState<string | null>(null);

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
        
        {/* Formatting Toolbar */}
        <div className="flex items-center px-4 py-1.5 border-b border-gray-200 overflow-x-auto">
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 pr-2 border-r border-gray-300">
              <Button themeColor="base" size="small" svgIcon={boldIcon} title="Bold" fillMode="flat" />
              <Button themeColor="base" size="small" svgIcon={italicIcon} title="Italic" fillMode="flat" />
              <Button themeColor="base" size="small" svgIcon={underlineIcon} title="Underline" fillMode="flat" />
            </div>
            <div className="flex gap-1 pr-2 border-r border-gray-300">
              <Button themeColor="base" size="small" svgIcon={alignLeftIcon} title="Align Left" fillMode="flat" />
              <Button themeColor="base" size="small" svgIcon={alignCenterIcon} title="Align Center" fillMode="flat" />
              <Button themeColor="base" size="small" svgIcon={alignRightIcon} title="Align Right" fillMode="flat" />
            </div>
            <div className="flex gap-1 pr-2 border-r border-gray-300">
              <Button themeColor="base" size="small" svgIcon={listOrderedIcon} title="Ordered List" fillMode="flat" />
              <Button themeColor="base" size="small" svgIcon={listUnorderedIcon} title="Unordered List" fillMode="flat" />
              <Button themeColor="base" size="small" svgIcon={indentIcon} title="Increase Indent" fillMode="flat" />
              <Button themeColor="base" size="small" svgIcon={outdentIcon} title="Decrease Indent" fillMode="flat" />
            </div>
            <div className="flex gap-1">
              <Button themeColor="base" size="small" svgIcon={imageIcon} title="Insert Image" fillMode="flat" />
              <Button themeColor="base" size="small" svgIcon={linkIcon} title="Insert Link" fillMode="flat" />
              <Button themeColor="base" size="small" svgIcon={tableIcon} title="Insert Table" fillMode="flat" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col relative bg-gray-200">
          <div className="relative flex-1 overflow-auto pt-6">
            <div className={`editor-page-container mx-auto shadow-md ${showSidebar ? 'sidebar-open' : ''}`}>
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
                  minHeight: 'calc(100vh - 110px)', 
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