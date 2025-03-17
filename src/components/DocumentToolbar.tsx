"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onTitleChange(e.target.value);
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
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          className="bg-transparent border-none outline-none font-medium text-gray-700 hover:bg-gray-100 focus:bg-gray-100 p-1 rounded max-w-xs"
          aria-label="Document title"
        />
        {lastSaved && (
          <span className="ml-4 text-xs text-gray-500">{lastSaved}</span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button 
          className={`px-4 py-1.5 text-sm text-white rounded transition flex items-center ${
            isSaving ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
        <button 
          className="px-4 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          onClick={onExport}
        >
          Export
        </button>
      </div>
    </nav>
  );
} 