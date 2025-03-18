"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Input, Button } from "@/components/kendo/free";
import { Avatar } from "@progress/kendo-react-layout";
import { Popup } from "@progress/kendo-react-popup";

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

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

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const userMenu = (
    <div className="bg-white rounded shadow-lg p-2 min-w-40 border border-gray-200">
      <div className="py-2 px-3 text-sm font-medium border-b border-gray-200 mb-2">
        John Doe
        <div className="text-xs text-gray-500 font-normal">john.doe@example.com</div>
      </div>
      <ul className="space-y-1">
        <li>
          <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded">
            Profile Settings
          </button>
        </li>
        <li>
          <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded">
            My Documents
          </button>
        </li>
        <li className="border-t border-gray-200 mt-1 pt-1">
          <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded text-red-600">
            Sign Out
          </button>
        </li>
      </ul>
    </div>
  );

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
        <div className="ml-3 relative" ref={avatarRef}>
          <div 
            className="cursor-pointer"
            onClick={toggleUserMenu}
            aria-haspopup="true"
            aria-expanded={showUserMenu}
          >
            <Avatar
              type="image"
              size="medium"
              rounded="full"
              style={{ backgroundColor: "#0747A6" }}
              themeColor="info"
            >
              JD
            </Avatar>
          </div>
          <Popup
            anchor={avatarRef.current}
            show={showUserMenu}
            popupClass="popup-content"
            animate={true}
            anchorAlign={{ horizontal: 'right', vertical: 'bottom' }}
            popupAlign={{ horizontal: 'right', vertical: 'top' }}
            onClose={() => setShowUserMenu(false)}
          >
            {userMenu}
          </Popup>
        </div>
      </div>
    </nav>
  );
} 