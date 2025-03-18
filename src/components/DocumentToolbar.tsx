"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";

interface DocumentToolbarProps {
  documentTitle: string;
  onTitleChange: (newTitle: string) => void;
  onSave: () => void;
  onExport: () => void;
  isSaving?: boolean;
}

export default function DocumentToolbar({
  documentTitle,
  onTitleChange,
  onSave,
  onExport,
  isSaving = false
}: DocumentToolbarProps) {
  const [title, setTitle] = useState(documentTitle);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    setTitle(documentTitle);
  }, [documentTitle]);

  useEffect(() => {
    // Auto-save effect (could be implemented later)
    const interval = setInterval(() => {
      const now = new Date();
      setLastSaved(`Last saved at ${now.toLocaleTimeString()}`);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleTitleChange = (e: any) => {
    setTitle(e.value);
    onTitleChange(e.value);
  };

  const handleTitleBlur = () => {
    // Ensure title is not empty
    if (!title.trim()) {
      setTitle("Untitled Document");
      onTitleChange("Untitled Document");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 flex justify-between items-center">
      <div className="flex items-center">
        <Link href="/" className="flex items-center mr-6">
          <span className="self-center text-xl font-semibold whitespace-nowrap text-blue-600">
            SmartDocs
          </span>
        </Link>
        <Input
          value={title}
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
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          themeColor="primary"
          disabled={isSaving}
          onClick={onSave}
          icon={isSaving ? "refresh" : "save"}
          className="k-button-md"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button 
          themeColor="base"
          onClick={onExport}
          icon="pdf"
          className="k-button-md"
        >
          Export
        </Button>
      </div>
    </nav>
  );
} 