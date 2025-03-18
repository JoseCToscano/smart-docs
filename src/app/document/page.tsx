"use client";

import { useState, useCallback, useRef, useEffect, forwardRef } from "react";
import { Editor, EditorTools } from "@/components/kendo/premium";
import { Button, Input } from "@/components/kendo/free";
import { 
  arrowsLeftRightIcon, 
  menuIcon 
} from "@/components/kendo";
import { Splitter } from "@progress/kendo-react-layout";
import "@progress/kendo-theme-default/dist/all.css";
import "./styles.css";
import Link from "next/link";
import AISidebar, { DocumentChanges, AISidebarHandle } from "@/components/AISidebar";
import { Document as DocType } from "@/types";
import DocumentToolbar from "@/components/DocumentToolbar";
import { Window } from "@progress/kendo-react-dialogs";
import { useRouter, useSearchParams } from "next/navigation";
import { parseXmlDiff, xmlDiffToChanges } from "@/utils/xmlDiffParser";

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
  const [document, setDocument] = useState<DocType>({
    title: "Untitled Document",
    content: "<p></p>",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [helpDialogVisible, setHelpDialogVisible] = useState(false);
  const [aiResponse, setAIResponse] = useState<{ text: string, suggestions: DocumentChanges | null }>({ text: "", suggestions: null });
  const editorRef = useRef<any>(null);
  const aiSidebarRef = useRef<AISidebarHandle>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleContentChange = (event: any) => {
    setDocument(prev => ({
      ...prev,
      content: event.html,
      updatedAt: new Date()
    }));

    // Add more detailed logging of editor iframe initialization
    if (editorRef.current) {
      // Get more details about the editor structure
      console.log("[DocumentPage] Editor contentChange event triggered");
      console.log("[DocumentPage] Editor ref keys:", Object.keys(editorRef.current));
      
      // Check editor DOM structure
      if (editorRef.current.element) {
        console.log("[DocumentPage] Editor element found:", editorRef.current.element);
        
        // Try to locate the iframe
        const iframe = editorRef.current.element.querySelector('iframe');
        console.log("[DocumentPage] Editor iframe via element query:", iframe);
        
        if (iframe) {
          console.log("[DocumentPage] Iframe contentDocument:", Boolean(iframe.contentDocument));
          console.log("[DocumentPage] Iframe contentWindow:", Boolean(iframe.contentWindow));
        }
      }
      
      // Direct iframe access attempt
      console.log("[DocumentPage] Editor direct iframe property:", editorRef.current.iframe);
      
      // Try to access document through any available method
      try {
        // Get the iframe using different methods
        let iframeElement = null;
        
        // Method 1: Direct iframe property
        if (editorRef.current.iframe) {
          iframeElement = editorRef.current.iframe;
        } 
        // Method 2: Via element property
        else if (editorRef.current.element?.querySelector) {
          iframeElement = editorRef.current.element.querySelector('iframe');
        }
        // Method 3: DOM query as last resort (only in browser)
        else if (typeof window !== 'undefined') {
          // This will only run in browser context
          const editorElements = window.document.getElementsByClassName('k-editor');
          if (editorElements.length > 0) {
            const firstElement = editorElements[0];
            if (firstElement) {
              const iframes = firstElement.getElementsByTagName('iframe');
              if (iframes.length > 0) {
                iframeElement = iframes[0];
              }
            }
          }
        }
                         
        if (iframeElement) {
          const editorDoc = iframeElement.contentDocument || iframeElement.contentWindow?.document;
          console.log("[DocumentPage] Successfully accessed editor document:", Boolean(editorDoc));
          
          // Check if there's any content in the editor
          if (editorDoc) {
            console.log("[DocumentPage] Editor body:", editorDoc.body.innerHTML.substring(0, 100) + "...");
          }
        } else {
          console.log("[DocumentPage] Could not locate iframe element by any method");
        }
      } catch (err) {
        console.error("[DocumentPage] Error accessing editor document:", err);
      }
      
      // Try to find any info about editor's structure and API
      try {
        if (typeof editorRef.current.getSelection === 'function') {
          console.log("[DocumentPage] Editor has getSelection method");
        }
        
        if (typeof editorRef.current.getDocument === 'function') {
          console.log("[DocumentPage] Editor has getDocument method");
          try {
            const doc = editorRef.current.getDocument();
            console.log("[DocumentPage] Got document via getDocument:", Boolean(doc));
          } catch (e) {
            console.error("[DocumentPage] Error calling getDocument:", e);
          }
        }
      } catch (err) {
        console.error("[DocumentPage] Error examining editor API methods:", err);
      }
    }
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

  // Function to get the editor document and window
  const getEditorDocument = (): Document | null => {
    if (!editorRef.current) return null;
    
    let iframeElement = null;
    
    // Try to get the iframe element
    if (editorRef.current.iframe) {
      iframeElement = editorRef.current.iframe;
    } else if (editorRef.current.element?.querySelector) {
      iframeElement = editorRef.current.element.querySelector('iframe');
    } else if (typeof window !== 'undefined') {
      const editorElements = window.document.getElementsByClassName('k-editor');
      if (editorElements.length > 0) {
        const iframes = (editorElements[0] as HTMLElement).getElementsByTagName('iframe');
        if (iframes.length > 0) {
          iframeElement = iframes[0];
        }
      }
    }
    
    if (iframeElement) {
      return iframeElement.contentDocument || (iframeElement.contentWindow?.document as Document);
    }
    
    return null;
  };

  // Get the editor's content as HTML string
  const getEditorContent = (): string => {
    const doc = getEditorDocument();
    if (doc && doc.body) {
      return doc.body.innerHTML;
    }
    return document.content;
  };

  // Apply changes to the editor
  const applyChangesToEditor = (changes: DocumentChanges) => {
    const editorDoc = getEditorDocument();
    if (!editorDoc) {
      console.error("Failed to get editor document for applying changes");
      return;
    }
    
    try {
      // Get the current selection or create a new one
      let selection = editorDoc.getSelection();
      if (!selection) {
        console.error("Could not get selection from document");
        return;
      }
      
      // Get the editor body to work with
      const editorBody = editorDoc.body;
      const content = editorBody.innerHTML;
      
      // Create a temporary container for manipulating the content
      const tempContainer = editorDoc.createElement('div');
      tempContainer.innerHTML = content;
      
      // Process content replacements (these are prioritized over direct additions/deletions)
      if (changes.replacements && changes.replacements.length > 0) {
        for (const replace of changes.replacements) {
          // Find the text to replace using a basic text search (could be improved with regex)
          // This is a simplified approach - for production, you'd want more advanced text matching
          // that respects HTML structure
          const textNodes = getAllTextNodes(tempContainer);
          let foundAndReplaced = false;
          
          for (const textNode of textNodes) {
            const nodeText = textNode.nodeValue || "";
            if (nodeText.includes(replace.oldText)) {
              // Create elements for highlighting the replaced text
              const span = editorDoc.createElement('span');
              span.className = 'ai-addition ai-badge highlight';
              span.innerHTML = replace.newText;
              
              // Split the text node and insert our highlighted content
              const beforeText = nodeText.substring(0, nodeText.indexOf(replace.oldText));
              const afterText = nodeText.substring(nodeText.indexOf(replace.oldText) + replace.oldText.length);
              
              const beforeNode = editorDoc.createTextNode(beforeText);
              const afterNode = editorDoc.createTextNode(afterText);
              
              // Replace the text node with our three new nodes
              textNode.parentNode?.insertBefore(beforeNode, textNode);
              textNode.parentNode?.insertBefore(span, textNode);
              textNode.parentNode?.insertBefore(afterNode, textNode);
              textNode.parentNode?.removeChild(textNode);
              
              foundAndReplaced = true;
              break;
            }
          }
          
          if (!foundAndReplaced) {
            console.log(`Couldn't find text to replace: ${replace.oldText}`);
          }
        }
      }
      
      // Process additions (inserting at cursor or at the end of the document)
      if (changes.additions && changes.additions.length > 0) {
        for (const addition of changes.additions) {
          // Create a new span element with the addition highlighting
          const span = editorDoc.createElement('span');
          span.className = 'ai-addition ai-badge highlight';
          span.innerHTML = addition.text;
          
          // If there's a range specified, try to insert at that position
          if (addition.range) {
            // Advanced positioning logic would go here
            // For now, we'll simply append to the end
            editorBody.appendChild(span);
          } else {
            // If the selection is collapsed (just a cursor)
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.insertNode(span);
              
              // Move selection to after the inserted content
              range.setStartAfter(span);
              range.setEndAfter(span);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              // Otherwise append to the end
              editorBody.appendChild(span);
            }
          }
        }
      }
      
      // Process deletions (marking text as deleted but not removing it)
      if (changes.deletions && changes.deletions.length > 0) {
        for (const deletion of changes.deletions) {
          // Find the text to delete
          const textNodes = getAllTextNodes(tempContainer);
          let foundAndMarked = false;
          
          for (const textNode of textNodes) {
            const nodeText = textNode.nodeValue || "";
            if (nodeText.includes(deletion.text)) {
              // Create element for highlighting the deleted text
              const span = editorDoc.createElement('span');
              span.className = 'ai-deletion ai-badge highlight';
              span.innerHTML = deletion.text;
              
              // Split the text node and insert our highlighted content
              const beforeText = nodeText.substring(0, nodeText.indexOf(deletion.text));
              const afterText = nodeText.substring(nodeText.indexOf(deletion.text) + deletion.text.length);
              
              const beforeNode = editorDoc.createTextNode(beforeText);
              const afterNode = editorDoc.createTextNode(afterText);
              
              // Replace the text node with our three new nodes
              textNode.parentNode?.insertBefore(beforeNode, textNode);
              textNode.parentNode?.insertBefore(span, textNode);
              textNode.parentNode?.insertBefore(afterNode, textNode);
              textNode.parentNode?.removeChild(textNode);
              
              foundAndMarked = true;
              break;
            }
          }
          
          if (!foundAndMarked) {
            console.log(`Couldn't find text to delete: ${deletion.text}`);
          }
        }
      }
      
      // Update the content in the editor
      if (changes.replacements?.length || changes.additions?.length || changes.deletions?.length) {
        // Get updated content from our temp container
        editorBody.innerHTML = tempContainer.innerHTML;
        
        // Update the document state
        setDocument(prev => ({
          ...prev,
          content: editorBody.innerHTML,
          updatedAt: new Date()
        }));
      }
    } catch (err) {
      console.error("Error applying AI changes to editor:", err);
    }
  };
  
  // Helper function to get all text nodes under a parent element
  const getAllTextNodes = (node: Node): Text[] => {
    const textNodes: Text[] = [];
    
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
    } else {
      const children = node.childNodes;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child) {
          textNodes.push(...getAllTextNodes(child));
        }
      }
    }
    
    return textNodes;
  };

  const handleAIPrompt = useCallback(async (prompt: string) => {
    console.log("AI Prompt:", prompt);
    setIsAIProcessing(true);
    
    // Get current content from the editor
    const currentContent = getEditorContent();
    
    try {
      // Call the Anthropic API through our backend
      const response = await fetch('/api/document/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          content: currentContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error('API call failed');
      }
      
      const data = await response.json();
      
      // Parse the result with XML tags
      const xmlResult = data.result;
      
      // Immediately apply the XML changes to the editor to show highlighting
      applyXmlChangesToEditor(xmlResult);
      
      // Convert XML diff to a structured format for the sidebar
      const changes = xmlDiffToChanges(xmlResult);
      
      // Create response for the AI sidebar
      const responseText = "I've applied the suggested changes to your document. You can see additions highlighted in green and deletions in red.";
      
      setAIResponse({
        text: responseText,
        suggestions: changes
      });
      
      // Add the AI response to the sidebar without the raw XML since it's already applied
      if (aiSidebarRef.current && typeof aiSidebarRef.current.addAIResponse === 'function') {
        aiSidebarRef.current.addAIResponse(responseText, changes);
      }
      
    } catch (error) {
      console.error("Error calling AI API:", error);
      
      // Handle error gracefully with a user-friendly message
      const errorResponse = {
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        suggestions: null
      };
      
      // Add the error response to the sidebar
      if (aiSidebarRef.current && typeof aiSidebarRef.current.addAIResponse === 'function') {
        aiSidebarRef.current.addAIResponse(errorResponse.text, null);
      }
    } finally {
      setIsAIProcessing(false);
    }
  }, []);

  // Enhanced applyXmlChangesToEditor to handle the XML format
  const applyXmlChangesToEditor = (xmlContent: string) => {
    const editorDoc = getEditorDocument();
    if (!editorDoc) {
      console.error("Failed to get editor document for applying changes");
      return;
    }
    
    try {
      // First ensure styles are injected
      const ensureStyles = () => {
        // Check if styles are already injected
        if (!editorDoc.querySelector('style')) {
          // Create a style element using window.document and then append to editor document
          const styleEl = window.document.createElement('style');
          styleEl.textContent = `
            /* AI Diff Highlighting Styles */
            .ai-addition {
              background-color: rgba(34, 197, 94, 0.2) !important; /* Light green */
              color: rgb(22, 101, 52) !important; /* Darker green text for better contrast */
              border-radius: 2px !important;
              border-bottom: 1px solid rgba(34, 197, 94, 0.5) !important;
              text-decoration: none !important;
              padding: 0 2px !important;
              margin: 0 1px !important;
              position: relative !important;
              font-weight: 500 !important; /* Slightly bolder */
              display: inline-block !important;
              white-space: pre-wrap !important; /* Respect line breaks */
            }
            
            .ai-deletion {
              background-color: rgba(239, 68, 68, 0.2) !important; /* Light red */
              color: rgb(153, 27, 27) !important; /* Darker red text for better contrast */
              border-radius: 2px !important;
              border-bottom: 1px solid rgba(239, 68, 68, 0.5) !important;
              text-decoration: line-through !important;
              padding: 0 2px !important;
              margin: 0 1px !important;
              position: relative !important;
              display: inline-block !important;
              white-space: pre-wrap !important; /* Respect line breaks */
            }
            
            /* Ensure <p> tags inside additions/deletions display properly */
            .ai-addition p, .ai-deletion p {
              margin: 0.5em 0 !important;
              display: block !important;
            }

            /* Ensure <br> tags inside additions/deletions display properly */
            .ai-addition br, .ai-deletion br {
              display: block !important;
              content: "" !important;
              margin-top: 0.5em !important;
            }
          `;
          
          // Append style to the head of the iframe document
          editorDoc.head.appendChild(styleEl);
        }
      };
      
      // Ensure styles are present
      ensureStyles();
      
      // Preserve any newlines in the XML content by replacing with placeholder before parsing
      const normalizedXmlContent = xmlContent.replace(/\\n/g, '\n'); // First convert escaped newlines
      
      // Parse XML to HTML with styled spans
      const htmlWithChanges = parseXmlDiff(normalizedXmlContent);
      
      // Update the editor content - using a more compatible approach with Kendo
      // First store the original content
      const originalContent = editorDoc.body.innerHTML;
      
      // Create a temporary div using window.document
      const tempDiv = window.document.createElement('div');
      tempDiv.innerHTML = htmlWithChanges;
      
      // Update the editor content using a method that preserves event handlers and editor state
      if (editorRef.current && typeof editorRef.current.value === 'function') {
        // Try to use the Kendo API if available
        try {
          editorRef.current.value(htmlWithChanges);
          console.log("[DocumentPage] Updated editor content using Kendo API");
        } catch (err) {
          console.error("[DocumentPage] Error updating editor with Kendo API:", err);
          // Fallback to direct DOM manipulation
          editorDoc.body.innerHTML = htmlWithChanges;
        }
      } else {
        // Fallback to direct DOM manipulation
        editorDoc.body.innerHTML = htmlWithChanges;
        
        // Force a refresh of the editor's content
        if (editorRef.current && typeof editorRef.current.refresh === 'function') {
          try {
            editorRef.current.refresh();
            console.log("[DocumentPage] Refreshed editor after direct DOM update");
          } catch (err) {
            console.error("[DocumentPage] Error refreshing editor:", err);
          }
        }
      }
      
      // Update the document state
      setDocument(prev => ({
        ...prev,
        content: htmlWithChanges,
        updatedAt: new Date()
      }));
      
      console.log("[DocumentPage] Successfully applied XML changes to editor");
    } catch (error) {
      console.error("Error applying XML changes to editor:", error);
    }
  };
  
  // Update the handleApplyChanges function to handle both formats
  const handleApplyChanges = useCallback((changes: DocumentChanges) => {
    // This handles the original format with structured changes
    applyChangesToEditor(changes);
  }, []);
  
  // Add a new function to apply XML diff directly
  const handleApplyXmlChanges = useCallback((xmlContent: string) => {
    applyXmlChangesToEditor(xmlContent);
  }, []);

  // Function to finalize and accept all AI changes
  const finalizeChanges = useCallback(() => {
    const editorDoc = getEditorDocument();
    if (!editorDoc) {
      console.error("Failed to get editor document for finalizing changes");
      return;
    }
    
    try {
      // Find all addition and deletion elements
      const additions = editorDoc.querySelectorAll('.ai-addition');
      const deletions = editorDoc.querySelectorAll('.ai-deletion');
      
      // Process additions - keep content but remove highlighting
      additions.forEach((addition: Element) => {
        const parent = addition.parentNode;
        if (!parent) return;
        
        const textContent = addition.textContent || '';
        const textNode = editorDoc.createTextNode(textContent);
        
        // Replace the highlighted element with plain text
        parent.replaceChild(textNode, addition);
      });
      
      // Process deletions - remove them completely
      deletions.forEach((deletion: Element) => {
        const parent = deletion.parentNode;
        if (!parent) return;
        
        // Simply remove the deleted text
        parent.removeChild(deletion);
      });
      
      // Update the document state with the finalized content
      setDocument(prev => ({
        ...prev,
        content: editorDoc.body.innerHTML,
        updatedAt: new Date()
      }));
      
      // Add a confirmation message to the AI sidebar
      if (aiSidebarRef.current && typeof aiSidebarRef.current.addAIResponse === 'function') {
        aiSidebarRef.current.addAIResponse(
          "I've finalized all the suggested changes. Additions have been incorporated, and deletions have been removed."
        );
      }
    } catch (error) {
      console.error("Error finalizing changes:", error);
    }
  }, []);
  
  // Function to revert all AI changes
  const revertChanges = useCallback(() => {
    const editorDoc = getEditorDocument();
    if (!editorDoc) {
      console.error("Failed to get editor document for reverting changes");
      return;
    }
    
    try {
      // Find all addition and deletion elements
      const additions = editorDoc.querySelectorAll('.ai-addition');
      const deletions = editorDoc.querySelectorAll('.ai-deletion');
      
      // Process additions - remove them entirely
      additions.forEach((addition: Element) => {
        const parent = addition.parentNode;
        if (!parent) return;
        
        // Remove the added text
        parent.removeChild(addition);
      });
      
      // Process deletions - keep content but remove highlighting
      deletions.forEach((deletion: Element) => {
        const parent = deletion.parentNode;
        if (!parent) return;
        
        const textContent = deletion.textContent || '';
        const textNode = editorDoc.createTextNode(textContent);
        
        // Replace the highlighted element with plain text
        parent.replaceChild(textNode, deletion);
      });
      
      // Update the document state with the reverted content
      setDocument(prev => ({
        ...prev,
        content: editorDoc.body.innerHTML,
        updatedAt: new Date()
      }));
      
      // Add a confirmation message to the AI sidebar
      if (aiSidebarRef.current && typeof aiSidebarRef.current.addAIResponse === 'function') {
        aiSidebarRef.current.addAIResponse(
          "I've reverted all the suggested changes. The document has been restored to its original state."
        );
      }
    } catch (error) {
      console.error("Error reverting changes:", error);
    }
  }, []);

  // Update toggleSidebar to work with Splitter
  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  // Add a useEffect to manually trigger a focus and autocompletion on initial load
  useEffect(() => {
    // Wait for the editor to be fully initialized
    if (editorRef.current) {
      console.log("[DocumentPage] Editor ref is available in useEffect");
      
      // Try to focus the editor
      try {
        if (typeof editorRef.current.focus === 'function') {
          console.log("[DocumentPage] Focusing editor");
          editorRef.current.focus();
        }
      } catch (err) {
        console.error("[DocumentPage] Error focusing editor:", err);
      }
    }
  }, [editorRef.current ? editorRef.current.id : null]); // Safer dependency that won't cause re-renders

  useEffect(() => {
    // Ensure CSS is injected into the iframe when the editor is ready
    const injectEditorStyles = () => {
      const editorDoc = getEditorDocument();
      if (!editorDoc) return;
      
      // Create a style element using window.document
      const styleEl = window.document.createElement('style');
      styleEl.textContent = `
        /* AI Diff Highlighting Styles */
        .ai-addition {
          background-color: rgba(34, 197, 94, 0.2) !important; /* Light green */
          color: rgb(22, 101, 52) !important; /* Darker green text for better contrast */
          border-radius: 2px !important;
          border-bottom: 1px solid rgba(34, 197, 94, 0.5) !important;
          text-decoration: none !important;
          padding: 0 2px !important;
          margin: 0 1px !important;
          position: relative !important;
          font-weight: 500 !important; /* Slightly bolder */
          display: inline-block !important;
          white-space: pre-wrap !important; /* Respect line breaks */
        }
        
        .ai-deletion {
          background-color: rgba(239, 68, 68, 0.2) !important; /* Light red */
          color: rgb(153, 27, 27) !important; /* Darker red text for better contrast */
          border-radius: 2px !important;
          border-bottom: 1px solid rgba(239, 68, 68, 0.5) !important;
          text-decoration: line-through !important;
          padding: 0 2px !important;
          margin: 0 1px !important;
          position: relative !important;
          display: inline-block !important;
          white-space: pre-wrap !important; /* Respect line breaks */
        }
        
        /* Ensure <p> tags inside additions/deletions display properly */
        .ai-addition p, .ai-deletion p {
          margin: 0.5em 0 !important;
          display: block !important;
        }

        /* Ensure <br> tags inside additions/deletions display properly */
        .ai-addition br, .ai-deletion br {
          display: block !important;
          content: "" !important;
          margin-top: 0.5em !important;
        }
        
        /* Add animation effects to highlight the changes */
        @keyframes pulse-addition {
          0% { background-color: rgba(34, 197, 94, 0.1) !important; }
          50% { background-color: rgba(34, 197, 94, 0.3) !important; }
          100% { background-color: rgba(34, 197, 94, 0.1) !important; }
        }
        
        @keyframes pulse-deletion {
          0% { background-color: rgba(239, 68, 68, 0.1) !important; }
          50% { background-color: rgba(239, 68, 68, 0.3) !important; }
          100% { background-color: rgba(239, 68, 68, 0.1) !important; }
        }
        
        .ai-addition.highlight {
          animation: pulse-addition 2s ease-in-out 3 !important;
        }
        
        .ai-deletion.highlight {
          animation: pulse-deletion 2s ease-in-out 3 !important;
        }
        
        /* Add a small icon to indicate AI-generated changes */
        .ai-badge::after {
          content: "AI";
          position: absolute !important;
          top: -8px !important;
          right: -3px !important;
          font-size: 8px !important;
          background-color: #4285f4 !important;
          color: white !important;
          border-radius: 4px !important;
          padding: 1px 3px !important;
          opacity: 0.8 !important; /* Make it visible by default */
          font-weight: bold !important;
          pointer-events: none !important; /* Prevent it from interfering with clicks */
          z-index: 10 !important;
        }
      `;
      
      // Append style to the head of the iframe document
      editorDoc.head.appendChild(styleEl);
      
      console.log("[DocumentPage] Custom styles injected into editor iframe");
    };
    
    // Try to inject styles when editor is available
    if (editorRef.current) {
      setTimeout(injectEditorStyles, 500); // Delay to ensure editor is fully loaded
    }
  }, [editorRef.current]); // Re-run when editor ref changes

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
            <Button
              themeColor="base"
              onClick={() => setHelpDialogVisible(true)}
              icon="question-circle"
              className="k-button-md"
              title="Show Help"
            >
              Help
            </Button>
            {/* Add the toggle sidebar button to the toolbar */}
            <Button
              themeColor="base"
              onClick={toggleSidebar}
              icon={showSidebar ? "collapse" : "expand"}
              className="k-button-md"
              title={showSidebar ? "Hide AI Assistant" : "Show AI Assistant"}
            >
              {showSidebar ? "Hide AI" : "Show AI"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area with Splitter */}
      <div className="flex-1 overflow-hidden">
        {/* Use Splitter component for resizable panels */}
        <Splitter
          style={{ height: 'calc(100vh - 49px)' }} // Adjust for header height
          orientation="horizontal"
          panes={[
            { collapsible: false, size: showSidebar ? '70%' : '100%' },
            { collapsible: true, collapsed: !showSidebar, size: '30%', min: '250px' }
          ]}
        >
          {/* Main Editor Area */}
          <div className="h-full flex flex-col relative bg-gray-200">
            <div className="relative flex-1 overflow-auto pt-6">
              <div className="editor-page-container mx-auto shadow-md relative">
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
              </div>
            </div>
          </div>
          
          {/* AI Sidebar */}
          <div className="h-full">
            <AISidebar 
              key="ai-sidebar"
              onPromptSubmit={handleAIPrompt}
              isLoading={isAIProcessing}
              editorRef={editorRef}
              onApplyChanges={handleApplyChanges}
              onApplyXmlChanges={handleApplyXmlChanges}
              onFinalizeChanges={finalizeChanges}
              onRevertChanges={revertChanges}
              ref={aiSidebarRef}
            />
          </div>
        </Splitter>
      </div>

      {/* Help Dialog */}
      {helpDialogVisible && (
        <Window
          title="Editor Help"
          onClose={() => setHelpDialogVisible(false)}
          initialHeight={400}
          initialWidth={500}
        >
          <div className="p-3">
            <h3 className="text-lg font-semibold mb-2">Keyboard Shortcuts</h3>
            <ul className="mb-4">
              <li><strong>Ctrl+B</strong>: Bold text</li>
              <li><strong>Ctrl+I</strong>: Italic text</li>
              <li><strong>Ctrl+U</strong>: Underline text</li>
              <li><strong>Ctrl+K</strong>: Insert link</li>
              <li><strong>Ctrl+Shift+7</strong>: Numbered list</li>
              <li><strong>Ctrl+Shift+8</strong>: Bullet list</li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-2">Tips</h3>
            <ul className="mb-4">
              <li>Use the toolbar to format your text and add elements</li>
              <li>Click the AI Assistant button to get help with your document</li>
              <li>All changes are automatically saved</li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-2">AI Features</h3>
            <ul className="mb-4">
              <li>Ask the AI to add, remove, or modify text in your document</li>
              <li>Added content will be highlighted in <span className="bg-green-100 text-green-800 px-1">green</span></li>
              <li>Deleted content will be highlighted in <span className="bg-red-100 text-red-800 px-1">red</span></li>
              <li>Review and accept changes before they become permanent</li>
            </ul>
          </div>
        </Window>
      )}
    </div>
  );
} 