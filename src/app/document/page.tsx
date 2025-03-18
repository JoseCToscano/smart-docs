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
  const [hasActiveChanges, setHasActiveChanges] = useState(false);
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
              
              // Preserve newlines by replacing them with <br> tags
              const textWithPreservedNewlines = replace.newText.replace(/\n/g, '<br />');
              span.innerHTML = textWithPreservedNewlines;
              
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
          
          // Preserve newlines by replacing them with <br> tags
          const textWithPreservedNewlines = addition.text.replace(/\n/g, '<br />');
          span.innerHTML = textWithPreservedNewlines;
          
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
              
              // Preserve newlines by replacing them with <br> tags
              const textWithPreservedNewlines = deletion.text.replace(/\n/g, '<br />');
              span.innerHTML = textWithPreservedNewlines;
              
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
    
    // Enhance the prompt to explicitly address newline handling and placeholders
    const enhancedPrompt = `${prompt}
    
IMPORTANT GUIDELINES:
1. When including line breaks in your response, please use actual newlines (\\n), not the literal text "___NEWLINE___".
2. NEVER use placeholders like "[... rest of the document remains the same ...]". Always include the complete document with only the changes marked using XML tags.
3. Be precise with your XML tags - only mark the specific text that changes.`;
    
    try {
      // Call the Anthropic API through our backend
      const response = await fetch('/api/document/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          content: currentContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error('API call failed');
      }
      
      const data = await response.json();
      
      // Extract both parts of the response
      const { xmlContent, userMessage, containsPlaceholders } = data;
      
      console.log("[DocumentPage] Received response:", {
        hasXmlContent: Boolean(xmlContent) && xmlContent.length > 0,
        userMessage: userMessage?.substring(0, 100) + "...",
        containsPlaceholders
      });
      
      // Only apply XML changes if there are any
      let changes = null;
      
      if (xmlContent && xmlContent.length > 0) {
        console.log("[DocumentPage] Applying XML changes to editor");
        
        // Pre-process the content: replace literal ___NEWLINE___ with actual newlines
        let processedXmlContent = xmlContent.replace(/___NEWLINE___/g, '\n');
        
        // Check for possible placeholder patterns that might remain
        const placeholderPatterns = [
          /\[\s*\.\.\.\s*rest of the document remains the same\s*\.\.\.\s*\]/gi,
          /\[\s*\.\.\.\s*unchanged content\s*\.\.\.\s*\]/gi,
          /\[\s*\.\.\.\s*remaining content unchanged\s*\.\.\.\s*\]/gi,
          /\[\s*\.\.\.\s*original text continues\s*\.\.\.\s*\]/gi,
          /\[\s*\.\.\.\s*document continues as before\s*\.\.\.\s*\]/gi
        ];
        
        // Remove any remaining placeholders
        for (const pattern of placeholderPatterns) {
          processedXmlContent = processedXmlContent.replace(pattern, '');
        }
        
        // Apply the XML changes to the editor to show highlighting
        applyXmlChangesToEditor(processedXmlContent);
        
        // Convert XML diff to a structured format for the sidebar
        changes = xmlDiffToChanges(processedXmlContent);
      }
      
      // Use the actual user message from the response
      let responseText = userMessage || "I've processed your request.";
      
      // Add a notification if placeholders were detected
      if (containsPlaceholders) {
        responseText = "Note: I had to process some placeholders in the response. The changes may not be complete or fully accurate. " + responseText;
      }
      
      setAIResponse({
        text: responseText,
        suggestions: changes
      });
      
      // Add the AI response to the sidebar
      if (aiSidebarRef.current && typeof aiSidebarRef.current.addAIResponse === 'function') {
        aiSidebarRef.current.addAIResponse(responseText, changes, containsPlaceholders);
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
  }, [getEditorContent]);

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
        if (!editorDoc.querySelector('style#ai-diff-styles')) {
          // Create a style element using window.document and then append to editor document
          const styleEl = window.document.createElement('style');
          styleEl.id = 'ai-diff-styles';
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
              display: inline !important;
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
              display: inline !important;
              white-space: pre-wrap !important; /* Respect line breaks */
            }
            
            /* Make sure all spans are properly displayed */
            span.ai-addition, span.ai-deletion {
              display: inline !important;
            }
            
            /* Ensure <br> tags inside additions/deletions display properly */
            .ai-addition br, .ai-deletion br {
              display: block !important;
              content: "" !important;
              margin-top: 0.5em !important;
            }
            
            /* Make <p> tags inside additions/deletions display properly as blocks */
            .ai-addition p, .ai-deletion p {
              display: block !important;
              margin: 0.5em 0 !important;
            }
          `;
          
          // Append style to the head of the iframe document
          editorDoc.head.appendChild(styleEl);
          console.log("[DocumentPage] Injected AI diff styles into editor document");
        }
      };
      
      // Ensure styles are present
      ensureStyles();
      
      console.log("[DocumentPage] Processing XML content, length:", xmlContent.length);
      console.log("[DocumentPage] XML content contains addition tags:", xmlContent.includes("<addition>"));
      console.log("[DocumentPage] XML content contains deletion tags:", xmlContent.includes("<deletion>"));
      
      // Check if there are actual changes to apply
      if (!xmlContent.includes("<addition>") && !xmlContent.includes("<deletion>")) {
        console.log("[DocumentPage] No XML tags found in content, nothing to apply");
        return;
      }
      
      // Parse XML to HTML with styled spans
      const htmlWithChanges = parseXmlDiff(xmlContent);
      
      console.log("[DocumentPage] Parsed HTML contains addition spans:", htmlWithChanges.includes("ai-addition"));
      console.log("[DocumentPage] Parsed HTML contains deletion spans:", htmlWithChanges.includes("ai-deletion"));
      
      // Make sure the editor is ready
      if (!editorRef.current) {
        console.error("[DocumentPage] Editor reference is not available");
        return;
      }
      
      // Try using the most reliable method to update the editor content
      try {
        // Method 1: Use editorRef.current.value if available (most reliable)
        if (typeof editorRef.current.value === 'function') {
          editorRef.current.value(htmlWithChanges);
          console.log("[DocumentPage] Updated editor content using value() method");
        }
        // Method 2: Use setHTML if available
        else if (typeof editorRef.current.setHTML === 'function') {
          editorRef.current.setHTML(htmlWithChanges);
          console.log("[DocumentPage] Updated editor content using setHTML() method");
        }
        // Method 3: Direct DOM manipulation as last resort
        else {
          editorDoc.body.innerHTML = htmlWithChanges;
          console.log("[DocumentPage] Updated editor content using direct DOM manipulation");
        }
        
        // Force a refresh if available
        if (typeof editorRef.current.refresh === 'function') {
          setTimeout(() => {
            editorRef.current.refresh();
            console.log("[DocumentPage] Refreshed editor after content update");
          }, 50);
        }
        
        // Update the document state
        setDocument(prev => ({
          ...prev,
          content: htmlWithChanges,
          updatedAt: new Date()
        }));
        
        // Post-process the editor to fix any styling issues
        setTimeout(() => {
          fixSpanStyling(editorDoc);
          
          // Update the hasActiveChanges state based on whether we have any AI changes
          const hasChanges = hasAIChanges();
          setHasActiveChanges(hasChanges);
          console.log("[DocumentPage] Updated hasActiveChanges:", hasChanges);
        }, 100);
        
      } catch (err) {
        console.error("[DocumentPage] Error updating editor content:", err);
        // Fallback to direct DOM manipulation
        try {
          editorDoc.body.innerHTML = htmlWithChanges;
          console.log("[DocumentPage] Used direct DOM manipulation as fallback");
          
          // Update the document state
          setDocument(prev => ({
            ...prev,
            content: htmlWithChanges,
            updatedAt: new Date()
          }));
          
          // Update hasActiveChanges
          setTimeout(() => {
            const hasChanges = hasAIChanges();
            setHasActiveChanges(hasChanges);
          }, 100);
        } catch (domErr) {
          console.error("[DocumentPage] Failed to update editor content:", domErr);
        }
      }
    } catch (error) {
      console.error("[DocumentPage] Error applying XML changes to editor:", error);
    }
  };
  
  // Helper function to fix any styling issues with the spans
  const fixSpanStyling = (editorDoc: Document) => {
    try {
      // Find all addition and deletion spans
      const additionSpans = editorDoc.querySelectorAll('.ai-addition');
      const deletionSpans = editorDoc.querySelectorAll('.ai-deletion');
      
      console.log("[DocumentPage] Found spans to fix:", {
        additions: additionSpans.length,
        deletions: deletionSpans.length
      });
      
      // Make sure all spans have the correct display style
      [...additionSpans, ...deletionSpans].forEach(span => {
        // Ensure inline display
        (span as HTMLElement).style.display = 'inline';
        // Add the highlight class if missing
        if (!span.classList.contains('highlight')) {
          span.classList.add('highlight');
        }
        // Add the badge class if missing
        if (!span.classList.contains('ai-badge')) {
          span.classList.add('ai-badge');
        }
      });
      
      // Check for and fix any XML tags that weren't properly converted
      const editorContent = editorDoc.body.innerHTML;
      if (editorContent.includes('<addition>') || editorContent.includes('<deletion>')) {
        console.log("[DocumentPage] Found unconverted XML tags, fixing...");
        
        // Apply a direct fix
        let fixedContent = editorContent
          .replace(/<addition>([\s\S]*?)<\/addition>/g, '<span class="ai-addition ai-badge highlight">$1</span>')
          .replace(/<deletion>([\s\S]*?)<\/deletion>/g, '<span class="ai-deletion ai-badge highlight">$1</span>');
          
        editorDoc.body.innerHTML = fixedContent;
      }
    } catch (error) {
      console.error("[DocumentPage] Error fixing span styling:", error);
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
      console.log("[finalizeChanges] Starting to process changes");
      
      // Find all addition and deletion elements
      const additions = editorDoc.querySelectorAll('.ai-addition');
      const deletions = editorDoc.querySelectorAll('.ai-deletion');
      
      console.log(`[finalizeChanges] Found ${additions.length} additions and ${deletions.length} deletions`);
      
      // Process additions - keep content but remove highlighting
      additions.forEach((addition: Element, index) => {
        const parent = addition.parentNode;
        if (!parent) return;
        
        console.log(`[finalizeChanges] Processing addition #${index + 1}:`);
        console.log(`[finalizeChanges] Original innerHTML: ${addition.innerHTML.substring(0, 100)}...`);
        console.log(`[finalizeChanges] Contains <br>: ${addition.innerHTML.includes('<br')}`)
        
        // Instead of using textContent which loses formatting,
        // we'll create a document fragment to preserve HTML elements like <br />
        const tempDiv = editorDoc.createElement('div');
        
        // Ensure any literal newlines are converted to <br> tags
        const contentWithLineBreaks = ensureLineBreaks(addition.innerHTML);
        tempDiv.innerHTML = contentWithLineBreaks;
        
        // Create a document fragment to hold all the child nodes
        const fragment = editorDoc.createDocumentFragment();
        
        // Move all child nodes to the fragment, which will preserve <br> tags
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        // Replace the highlighted element with our fragment that preserves line breaks
        parent.replaceChild(fragment, addition);
      });
      
      // Process deletions - remove them completely
      deletions.forEach((deletion: Element) => {
        const parent = deletion.parentNode;
        if (!parent) return;
        
        // Simply remove the deleted text
        parent.removeChild(deletion);
      });
      
      console.log("[finalizeChanges] Changes applied successfully");
      
      // Get the updated content with proper line breaks
      const updatedContent = ensureLineBreaks(editorDoc.body.innerHTML);
      
      // Update the document state with the finalized content
      setDocument(prev => ({
        ...prev,
        content: updatedContent,
        updatedAt: new Date()
      }));
      
      // Update the hasActiveChanges state
      setHasActiveChanges(false);
      
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
      console.log("[revertChanges] Starting to process changes");
      
      // Find all addition and deletion elements
      const additions = editorDoc.querySelectorAll('.ai-addition');
      const deletions = editorDoc.querySelectorAll('.ai-deletion');
      
      console.log(`[revertChanges] Found ${additions.length} additions and ${deletions.length} deletions`);
      
      // Process additions - remove them entirely
      additions.forEach((addition: Element) => {
        const parent = addition.parentNode;
        if (!parent) return;
        
        // Remove the added text
        parent.removeChild(addition);
      });
      
      // Process deletions - keep content but remove highlighting
      deletions.forEach((deletion: Element, index) => {
        const parent = deletion.parentNode;
        if (!parent) return;
        
        console.log(`[revertChanges] Processing deletion #${index + 1}:`);
        console.log(`[revertChanges] Original innerHTML: ${deletion.innerHTML.substring(0, 100)}...`);
        console.log(`[revertChanges] Contains <br>: ${deletion.innerHTML.includes('<br')}`)
        
        // Instead of using textContent which loses formatting,
        // we'll create a document fragment to preserve HTML elements like <br />
        const tempDiv = editorDoc.createElement('div');
        
        // Ensure any literal newlines are converted to <br> tags
        const contentWithLineBreaks = ensureLineBreaks(deletion.innerHTML);
        tempDiv.innerHTML = contentWithLineBreaks;
        
        // Create a document fragment to hold all the child nodes
        const fragment = editorDoc.createDocumentFragment();
        
        // Move all child nodes to the fragment, which will preserve <br> tags
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        // Replace the highlighted element with our fragment that preserves line breaks
        parent.replaceChild(fragment, deletion);
      });
      
      console.log("[revertChanges] Changes reverted successfully");
      
      // Get the updated content with proper line breaks
      const updatedContent = ensureLineBreaks(editorDoc.body.innerHTML);
      
      // Update the document state with the reverted content
      setDocument(prev => ({
        ...prev,
        content: updatedContent,
        updatedAt: new Date()
      }));
      
      // Update the hasActiveChanges state
      setHasActiveChanges(false);
      
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

  // Helper function to check if there are AI changes in the editor
  const hasAIChanges = useCallback((): boolean => {
    const editorDoc = getEditorDocument();
    if (!editorDoc) {
      return false;
    }
    
    // Find all addition and deletion elements
    const additions = editorDoc.querySelectorAll('.ai-addition');
    const deletions = editorDoc.querySelectorAll('.ai-deletion');
    
    // Return true if there are any additions or deletions
    return additions.length > 0 || deletions.length > 0;
  }, [getEditorDocument]);

  // Helper function to ensure line breaks are properly converted to <br> tags
  const ensureLineBreaks = (htmlContent: string): string => {
    // First handle any literal newlines (these can come from innerHTML sometimes depending on the browser)
    let content = htmlContent.replace(/\n/g, '<br />');
    
    // Also handle any remaining ___NEWLINE___ placeholders that might be in the content
    content = content.replace(/___NEWLINE___/g, '<br />');
    
    // Log the transformation
    console.log('[ensureLineBreaks] Processed line breaks, contains <br>:', content.includes('<br'));
    
    return content;
  };

  // Update toggleSidebar to work with Splitter
  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
    
    // If needed, we could update Splitter props here
    // but it should automatically update based on the showSidebar state
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

  // Effect to detect changes in the editor content that contain AI changes
  useEffect(() => {
    // Check for AI changes and update state
    const checkForAIChanges = () => {
      const hasChanges = hasAIChanges();
      setHasActiveChanges(hasChanges);
      console.log("[DocumentPage] Active AI changes detected:", hasChanges);
    };
    
    // Initial check
    checkForAIChanges();
    
    // Set up a mutation observer to watch for changes to the editor content
    const editorDoc = getEditorDocument();
    if (editorDoc) {
      const observer = new MutationObserver(checkForAIChanges);
      
      // Observe the editor body for changes
      observer.observe(editorDoc.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
      
      // Clean up observer when component unmounts
      return () => {
        observer.disconnect();
      };
    }
  }, [hasAIChanges, getEditorDocument]);

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
            { collapsible: false }, // Main editor pane - flexible size (no fixed size)
            { collapsible: true, collapsed: !showSidebar, size: '30%', min: '250px' } // Sidebar with fixed size
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
              hasActiveChanges={hasActiveChanges}
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