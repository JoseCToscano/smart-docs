"use client";

import { useState } from "react";
import { Editor, EditorTools } from "@progress/kendo-react-editor";
import "@progress/kendo-theme-default/dist/all.css";

const {
  Bold, Italic, Underline,
  AlignLeft, AlignRight, AlignCenter,
  Indent, Outdent,
  OrderedList, UnorderedList,
  Undo, Redo,
  Link, Unlink,
  FormatBlock,
  FontSize,
  FontName,
  InsertImage,
} = EditorTools;

export default function DocumentPage() {
  const [content, setContent] = useState("<p>Start typing your document here...</p>");

  const handleContentChange = (event: any) => {
    setContent(event.html);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Smart Document Editor</h1>
        
        <div className="border rounded-lg overflow-hidden">
          <Editor
            tools={[
              [Bold, Italic, Underline],
              [AlignLeft, AlignCenter, AlignRight],
              [OrderedList, UnorderedList],
              [Indent, Outdent],
              [Undo, Redo],
              [Link, Unlink],
              [FormatBlock],
              [FontName],
              [FontSize],
              [InsertImage],
            ]}
            contentStyle={{ height: 500 }}
            defaultContent={content}
            onChange={handleContentChange}
          />
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Save Document
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            Export as PDF
          </button>
        </div>
      </div>
    </main>
  );
} 