"use client";

import { useState, useCallback, useRef, useEffect, forwardRef } from "react";
import { Editor, EditorTools } from "@/components/kendo/premium";
import { 
  Button, 
  Input, 
  AppBar, 
  AppBarSection, 
  AppBarSpacer, 
  AppBarSeparator 
} from "@/components/kendo/free";
import { 
  arrowsLeftRightIcon, 
  menuIcon,
  Avatar,
  Splitter,
  Popup,
  Tooltip
} from "@/components/kendo";
import "@progress/kendo-theme-default/dist/all.css";
import "./styles.css";
import Link from "next/link";
import AISidebar, { DocumentChanges, AISidebarHandle } from "@/components/AISidebar";
import { Document as DocType } from "@/types";
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
  const [editorKey, setEditorKey] = useState(0);
  const editorRef = useRef<any>(null);
  const aiSidebarRef = useRef<AISidebarHandle>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

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

  // Helper function to find a node and offset within container based on absolute character offset
  const findNodeAndOffset = (container: HTMLElement, targetOffset: number): { node: Node; offset: number } | null => {
    // Walks through all text nodes in the container and finds the one containing the target offset
    let currentOffset = 0;
    
    const walkNodes = (node: Node): { node: Node; offset: number } | null => {
      // If this is a text node, check if the target offset is within it
      if (node.nodeType === Node.TEXT_NODE) {
        const length = node.textContent?.length || 0;
        
        // If the target offset is within this text node, return it
        if (currentOffset <= targetOffset && targetOffset <= currentOffset + length) {
          return {
            node,
            offset: targetOffset - currentOffset
          };
        }
        
        // Otherwise, advance the offset
        currentOffset += length;
        return null;
      }
      
      // Otherwise, recurse into child nodes
      const childNodes = node.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        const result = walkNodes(childNodes[i] as Node);
        if (result) {
          return result;
        }
      }
      
      return null;
    };
    
    return walkNodes(container);
  };

  // Apply changes to the editor
  const applyChangesToEditor = (changes: DocumentChanges | null) => {
    if (!changes) {
      console.log("[DocumentPage] No changes to apply to editor");
      return;
    }

    try {
      // Get the current editor document
      const editorDoc = getEditorDocument();
      if (!editorDoc) {
        console.error("[DocumentPage] Failed to get editor document");
        return;
      }

      // Create a new container to work with the HTML
      const tempContainer = window.document.createElement('div');
      
      // Get the current content
      const currentHTML = editorDoc.body.innerHTML;
      tempContainer.innerHTML = currentHTML;
      
      // Track if we made any changes
      let hasChanges = false;
      
      // Process replacements (highest priority)
      if (changes.replacements && changes.replacements.length > 0) {
        console.log("[DocumentPage] Applying replacements:", changes.replacements);
        
        for (const replacement of changes.replacements) {
          const { oldText, newText } = replacement;
          
          // Create a span for the new text
          const span = window.document.createElement('span');
          span.className = 'ai-addition';
          span.innerHTML = newText.replace(/\n/g, '<br />');
          
          // Find the text to replace
          const textNodes = Array.from(tempContainer.querySelectorAll('*'))
            .filter((node: Element) => 
              node.nodeType === Node.TEXT_NODE || 
              (node.children && node.children.length === 0)
            )
            .map((node: Element) => node.textContent || '')
            .join('');
            
          const textContent = tempContainer.textContent || '';
          const index = textContent.indexOf(oldText);
          
          if (index !== -1) {
            // We need more advanced logic here to replace text that spans multiple nodes
            // For simplicity, we're just going to update the whole HTML for now
            const htmlContent = tempContainer.innerHTML;
            const newHtml = htmlContent.replace(
              oldText,
              `<span class="ai-addition">${newText.replace(/\n/g, '<br />')}</span>`
            );
            tempContainer.innerHTML = newHtml;
            hasChanges = true;
          }
        }
      }
      
      // Process additions
      if (changes.additions && changes.additions.length > 0) {
        console.log("[DocumentPage] Applying additions:", changes.additions);
        hasChanges = true;
        
        // For this simplified version, we'll just append additions to the end
        // A more complex version would use the range property to insert at the correct position
        for (const addition of changes.additions) {
          const { text, range } = addition;
          
          // Create span for the addition
          const span = window.document.createElement('span');
          span.className = 'ai-addition';
          span.innerHTML = text.replace(/\n/g, '<br />');
          
          // Append to the end or try to use the range
          if (range) {
            // Try to find where to insert using the simplified range
            // This is a simplified approach - production code would be more sophisticated
            const position = range.start;
            const nodeInfo = findNodeAndOffset(tempContainer, position);
            
            if (nodeInfo) {
              const { node, offset } = nodeInfo;
              
              if (node.nodeType === Node.TEXT_NODE) {
                // Split the text node
                const textNode = node as Text;
                const beforeText = textNode.nodeValue?.substring(0, offset) || '';
                const afterText = textNode.nodeValue?.substring(offset) || '';
                
                const beforeNode = window.document.createTextNode(beforeText);
                const afterNode = window.document.createTextNode(afterText);
                
                const parent = textNode.parentNode;
                if (parent) {
                  parent.insertBefore(beforeNode, textNode);
                  parent.insertBefore(span, textNode);
                  parent.insertBefore(afterNode, textNode);
                  parent.removeChild(textNode);
                }
              } else {
                // Insert into element
                const children = node.childNodes;
                if (offset >= 0 && offset <= children.length) {
                  node.insertBefore(span, children[offset] || null);
                } else {
                  node.appendChild(span);
                }
              }
            } else {
              // Fallback: append to the end
              tempContainer.appendChild(span);
            }
          } else {
            // If no range is specified, append to the end
            tempContainer.appendChild(span);
          }
        }
      }
      
      // Process deletions
      if (changes.deletions && changes.deletions.length > 0) {
        console.log("[DocumentPage] Applying deletions:", changes.deletions);
        hasChanges = true;
        
        for (const deletion of changes.deletions) {
          const { text, range } = deletion;
          
          // Create span for the deletion
          const span = window.document.createElement('span');
          span.className = 'ai-deletion';
          span.innerHTML = text.replace(/\n/g, '<br />');
          
          // Try to use the range if available
          if (range) {
            // Find the range in the content
            const startPos = range.start;
            const endPos = range.end;
            
            const startInfo = findNodeAndOffset(tempContainer, startPos);
            
            if (startInfo) {
              const { node, offset } = startInfo;
              
              if (node.nodeType === Node.TEXT_NODE) {
                // Split the text node
                const textNode = node as Text;
                const beforeText = textNode.nodeValue?.substring(0, offset) || '';
                
                // Calculate where deletion ends
                const length = endPos - startPos;
                const afterText = textNode.nodeValue?.substring(offset + length) || '';
                
                const beforeNode = window.document.createTextNode(beforeText);
                const afterNode = window.document.createTextNode(afterText);
                
                const parent = textNode.parentNode;
                if (parent) {
                  parent.insertBefore(beforeNode, textNode);
                  parent.insertBefore(span, textNode);
                  parent.insertBefore(afterNode, textNode);
                  parent.removeChild(textNode);
                }
              } else {
                // For now, just insert the deletion marker at the position
                const children = node.childNodes;
                if (offset >= 0 && offset <= children.length) {
                  node.insertBefore(span, children[offset] || null);
                } else {
                  node.appendChild(span);
                }
              }
            } else {
              // Fallback: append to the end
              tempContainer.appendChild(span);
            }
          } else {
            // If no range is provided, try to find the text in the content
            const textContent = tempContainer.textContent || '';
            const index = textContent.indexOf(text);
            
            if (index !== -1) {
              // Use a simple string replacement for now
              // A more advanced implementation would carefully handle DOM nodes
              const htmlContent = tempContainer.innerHTML;
              const newHtml = htmlContent.replace(
                text,
                `<span class="ai-deletion">${text.replace(/\n/g, '<br />')}</span>`
              );
              tempContainer.innerHTML = newHtml;
            } else {
              // Fallback: append to the end
              tempContainer.appendChild(span);
            }
          }
        }
      }
      
      // If we made changes, update the editor
      if (hasChanges) {
        // Get the updated HTML and update the editor
        const updatedHTML = tempContainer.innerHTML;
        console.log("[DocumentPage] Applying updated HTML to editor");
        
        // Update editor content using our new method
        updateEditorContent(updatedHTML);
        
        // Set the has changes flag
        setHasActiveChanges(true);
      } else {
        console.log("[DocumentPage] No changes were applied to the editor");
      }
      
    } catch (err) {
      console.error("[DocumentPage] Error applying changes to editor:", err);
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
              user-select: auto !important;
              -webkit-user-select: auto !important;
              -moz-user-select: auto !important;
              pointer-events: auto !important;
              cursor: text !important;
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
              user-select: auto !important;
              -webkit-user-select: auto !important;
              -moz-user-select: auto !important;
              pointer-events: auto !important;
              cursor: text !important;
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
      
      // Properly update the editor with new content
      updateEditorContent(htmlWithChanges);
      
      // Update the hasActiveChanges state
      setTimeout(() => {
        const hasChanges = hasAIChanges();
        setHasActiveChanges(hasChanges);
        console.log("[DocumentPage] Updated hasActiveChanges:", hasChanges);
      }, 100);
      
    } catch (error) {
      console.error("[DocumentPage] Error applying XML changes to editor:", error);
    }
  };
  
  // New helper function to properly update editor content while preserving its functionality
  const updateEditorContent = (newContent: string) => {
    try {
      // Create a temporary div to sanitize the content
      const tempDiv = window.document.createElement('div');
      tempDiv.innerHTML = newContent;
      
      // Clean up any problematic elements or attributes that might interfere with the editor
      const allElements = tempDiv.querySelectorAll('*');
      allElements.forEach((el: Element) => {
        // Remove any contenteditable attributes as they can interfere with the editor
        if (el.hasAttribute('contenteditable')) {
          el.removeAttribute('contenteditable');
        }
        
        // Remove any inline event handlers - with proper null check for attributes
        const attributes = el.attributes;
        if (attributes) {
          for (let i = attributes.length - 1; i >= 0; i--) {
            const attr = attributes[i];
            if (attr && attr.name && attr.name.startsWith('on')) {
              el.removeAttribute(attr.name);
            }
          }
        }
      });
      
      // Get the cleaned content
      const cleanedContent = tempDiv.innerHTML;
      
      console.log("[DocumentPage] Updating editor with cleaned content");
      
      // Get the editor document
      const editorDoc = getEditorDocument();
      if (!editorDoc || !editorDoc.body) {
        console.error("[DocumentPage] Cannot get editor document");
        return;
      }
      
      // Find the first text node function to help with selection later
      const findFirstTextNode = (node: Node): Node | null => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          return node;
        }
        
        let result: Node | null = null;
        const children = node.childNodes;
        for (let i = 0; i < children.length && !result; i++) {
          // Use childNodes[i] directly, which is always a Node
          const childNode = children[i] as Node;
          result = findFirstTextNode(childNode);
        }
        
        return result;
      };
      
      // The proper way to update the content based on Kendo React documentation
      try {
        // 1. Temporarily disable contentEditable to prevent Kendo from interfering
        editorDoc.body.contentEditable = 'false';
        
        // 2. Update the content
        editorDoc.body.innerHTML = cleanedContent;
        
        // 3. Wait a moment to ensure content is properly set
        setTimeout(() => {
          try {
            // 4. Re-enable editing
            editorDoc.body.contentEditable = 'true';
            
            // 5. Force Kendo to recognize content by simulating user interaction
            // Clear any current selection
            if (editorDoc.getSelection()) {
              editorDoc.getSelection()?.removeAllRanges();
            }
            
            // Create a new selection at the beginning of the document
            const range = editorDoc.createRange();
            const firstTextNode = findFirstTextNode(editorDoc.body);
            
            if (firstTextNode) {
              range.setStart(firstTextNode, 0);
              range.setEnd(firstTextNode, 0);
              
              // Apply the selection
              const selection = editorDoc.getSelection();
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
            
            // 6. Manually trigger focus and a click to make sure toolbar buttons work
            editorDoc.body.focus();
            
            // 7. Simulate mouse events to force toolbar refresh
            const mouseUpEvent = new MouseEvent('mouseup', {
              bubbles: true,
              cancelable: true,
              view: editorDoc.defaultView
            });
            
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: editorDoc.defaultView
            });
            
            editorDoc.body.dispatchEvent(mouseUpEvent);
            editorDoc.body.dispatchEvent(clickEvent);
            
            // 8. Update the document state
            setDocument(prev => ({
              ...prev,
              content: cleanedContent,
              updatedAt: new Date()
            }));
            
            console.log("[DocumentPage] Editor content updated successfully using Kendo's approach");
          } catch (innerErr) {
            console.error("[DocumentPage] Error during final editor setup:", innerErr);
          }
        }, 50);
      } catch (err) {
        console.error("[DocumentPage] Error updating editor content with Kendo approach:", err);
        
        // Fallback to direct content update
        try {
          editorDoc.body.innerHTML = cleanedContent;
          
          // Update the document state
          setDocument(prev => ({
            ...prev,
            content: cleanedContent,
            updatedAt: new Date()
          }));
        } catch (fallbackErr) {
          console.error("[DocumentPage] Error in fallback editor update:", fallbackErr);
        }
      }
    } catch (err) {
      console.error("[DocumentPage] Error in updateEditorContent:", err);
    }
  };
  
  // Helper function to reinitialize the editor and ensure toolbar works
  const reinitializeEditor = () => {
    if (!editorRef.current) return;
    
    try {
      // Attempt to use editor's built-in methods if available
      if (typeof editorRef.current.recreate === 'function') {
        editorRef.current.recreate();
        console.log("[DocumentPage] Editor recreated");
      } else if (typeof editorRef.current.refresh === 'function') {
        editorRef.current.refresh();
        console.log("[DocumentPage] Editor refreshed");
      }
      
      // Make sure the document is editable
      const editorDoc = getEditorDocument();
      if (editorDoc) {
        // Ensure the document is properly in design mode
        editorDoc.designMode = 'on';
        
        // Ensure the body is contenteditable
        if (editorDoc.body) {
          editorDoc.body.contentEditable = 'true';
        }
        
        // Force a focus to activate the editor
        if (typeof editorRef.current.focus === 'function') {
          setTimeout(() => {
            editorRef.current.focus();
          }, 100);
        }
        
        // Manually dispatch a click event on the editor to ensure it's activated
        try {
          const editorEl = editorRef.current.element;
          if (editorEl) {
            const event = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            editorEl.dispatchEvent(event);
          }
        } catch (err) {
          console.log("[DocumentPage] Error dispatching click event:", err);
        }
      }
      
      // Post-process editor spans to ensure they don't interfere with editing
      setTimeout(() => {
        fixSpanStyling(getEditorDocument());
      }, 100);
      
    } catch (err) {
      console.error("[DocumentPage] Error reinitializing editor:", err);
    }
  };
  
  // Helper function to fix any styling issues with the spans
  const fixSpanStyling = (editorDoc: Document | null) => {
    if (!editorDoc) return;
    
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
        
        // Ensure it's part of the text flow and can be edited
        (span as HTMLElement).style.userSelect = 'auto';
        (span as HTMLElement).style.pointerEvents = 'auto';
        (span as HTMLElement).style.cursor = 'text';
        
        // Remove any contenteditable=false that might interfere
        if (span.hasAttribute('contenteditable')) {
          span.removeAttribute('contenteditable');
        }
        
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
        
        // After fixing, refresh the editor again
        reinitializeEditor();
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
    console.log("[finalizeChanges] Starting to process changes");
    
    try {
      // Get the editor document
      const editorDoc = getEditorDocument();
      if (!editorDoc) {
        console.error("[finalizeChanges] Failed to get editor document");
        return;
      }
      
      // Step 1: Create a temporary container to work with the content
      const tempContainer = window.document.createElement('div');
      tempContainer.innerHTML = editorDoc.body.innerHTML;
      
      // Step 2: Find and process all AI additions (keep content, remove highlighting)
      const additions = tempContainer.querySelectorAll('.ai-addition');
      console.log(`[finalizeChanges] Found ${additions.length} additions to apply`);
      
      additions.forEach((addition) => {
        // Keep the HTML content (including <br> tags) but remove the span
        const content = addition.innerHTML;
        
        // Create a new temporary container to handle the HTML content properly
        const contentContainer = window.document.createElement('span');
        contentContainer.innerHTML = content;
        
        // Replace the AI addition span with its inner HTML content
        if (addition.parentNode) {
          // Use replaceWith to preserve HTML structure including <br> tags
          addition.parentNode.replaceChild(contentContainer, addition);
          
          // Now move all children out of the temporary span to the parent
          while (contentContainer.firstChild && contentContainer.parentNode) {
            contentContainer.parentNode.insertBefore(contentContainer.firstChild, contentContainer);
          }
          
          // Remove the empty temporary container
          if (contentContainer.parentNode) {
            contentContainer.parentNode.removeChild(contentContainer);
          }
        }
      });
      
      // Step 3: Find and process all AI deletions (remove them completely)
      const deletions = tempContainer.querySelectorAll('.ai-deletion');
      console.log(`[finalizeChanges] Found ${deletions.length} deletions to remove`);
      
      deletions.forEach((deletion) => {
        if (deletion.parentNode) {
          deletion.parentNode.removeChild(deletion);
        }
      });
      
      // Step 4: Get the clean HTML with changes applied
      const cleanedHtml = tempContainer.innerHTML;
      
      // Step 5: Save this content to the state so it will be used for the new editor
      setDocument(prev => ({
        ...prev,
        content: cleanedHtml,
        updatedAt: new Date()
      }));
      
      // Step 6: Force a full remount of the editor by changing a key
      // This is handled in the render method with the editorKey state
      
      // Step 7: Update state to reflect no more active changes
      setHasActiveChanges(false);
      
      // Step 8: Add a confirmation message to the AI sidebar
      if (aiSidebarRef.current && typeof aiSidebarRef.current.addAIResponse === 'function') {
        aiSidebarRef.current.addAIResponse(
          "I've applied all the suggested changes. Additions have been incorporated, and deletions have been removed."
        );
      }
      
      // Step 9: Force a re-render of the editor component with a new key
      setEditorKey(prevKey => prevKey + 1);
      
    } catch (error) {
      console.error("[finalizeChanges] Error processing changes:", error);
    }
  }, [getEditorDocument]);
  
  // Function to revert all AI changes
  const revertChanges = useCallback(() => {
    console.log("[revertChanges] Starting to revert changes");
    
    try {
      // Get the editor document
      const editorDoc = getEditorDocument();
      if (!editorDoc) {
        console.error("[revertChanges] Failed to get editor document");
        return;
      }
      
      // Step 1: Create a temporary container to work with the content
      const tempContainer = window.document.createElement('div');
      tempContainer.innerHTML = editorDoc.body.innerHTML;
      
      // Step 2: Find and process all AI additions (remove them completely)
      const additions = tempContainer.querySelectorAll('.ai-addition');
      console.log(`[revertChanges] Found ${additions.length} additions to remove`);
      
      additions.forEach((addition) => {
        if (addition.parentNode) {
          addition.parentNode.removeChild(addition);
        }
      });
      
      // Step 3: Find and process all AI deletions (keep content, remove highlighting)
      const deletions = tempContainer.querySelectorAll('.ai-deletion');
      console.log(`[revertChanges] Found ${deletions.length} deletions to restore`);
      
      deletions.forEach((deletion) => {
        // Keep the HTML content (including <br> tags) but remove the span
        const content = deletion.innerHTML;
        
        // Create a new temporary container to handle the HTML content properly
        const contentContainer = window.document.createElement('span');
        contentContainer.innerHTML = content;
        
        // Replace the AI deletion span with its inner HTML content
        if (deletion.parentNode) {
          // Use replaceWith to preserve HTML structure including <br> tags
          deletion.parentNode.replaceChild(contentContainer, deletion);
          
          // Now move all children out of the temporary span to the parent
          while (contentContainer.firstChild && contentContainer.parentNode) {
            contentContainer.parentNode.insertBefore(contentContainer.firstChild, contentContainer);
          }
          
          // Remove the empty temporary container
          if (contentContainer.parentNode) {
            contentContainer.parentNode.removeChild(contentContainer);
          }
        }
      });
      
      // Step 4: Get the clean HTML with changes reverted
      const cleanedHtml = tempContainer.innerHTML;
      
      // Step 5: Update the document state with the clean content
      setDocument(prev => ({
        ...prev,
        content: cleanedHtml,
        updatedAt: new Date()
      }));
      
      // Step 6: Force a full remount of the editor by changing a key
      // This is handled in the render method with the editorKey state
      
      // Step 7: Update state to reflect no more active changes
      setHasActiveChanges(false);
      
      // Step 8: Add a confirmation message to the AI sidebar
      if (aiSidebarRef.current && typeof aiSidebarRef.current.addAIResponse === 'function') {
        aiSidebarRef.current.addAIResponse(
          "I've reverted all the suggested changes. The document has been restored to its original state."
        );
      }
      
      // Step 9: Force a re-render of the editor component with a new key
      setEditorKey(prevKey => prevKey + 1);
      
    } catch (error) {
      console.error("[revertChanges] Error reverting changes:", error);
    }
  }, [getEditorDocument]);

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Main App Toolbar */}
      <AppBar position="sticky" themeColor="light">
        <AppBarSection>
          <Link href="/" className="flex items-center mr-6">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-blue-600">
              SmartDocs
            </span>
          </Link>
          <Tooltip anchorElement="target" position="bottom" content={() => document.title}>
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
          </Tooltip>
          {lastSaved && (
            <span className="ml-4 text-xs text-gray-500">{lastSaved}</span>
          )}
        </AppBarSection>
        
        <AppBarSpacer />
        
        <AppBarSection>
          <Tooltip anchorElement="target" position="bottom" content={() => "Save your document to the cloud"}>
            <Button 
              themeColor="primary"
              disabled={isSaving}
              onClick={handleSave}
              icon={isSaving ? "refresh" : "save"}
              className="k-button-md"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </Tooltip>
          
          <AppBarSeparator />
          
          <Tooltip anchorElement="target" position="bottom" content={() => "Export document as PDF"}>
            <Button 
              themeColor="base"
              onClick={handleExport}
              icon="pdf"
              className="k-button-md"
            >
              Export
            </Button>
          </Tooltip>
          
          <Tooltip anchorElement="target" position="bottom" content={() => "View help documentation"}>
            <Button
              themeColor="base"
              onClick={() => setHelpDialogVisible(true)}
              icon="question-circle"
              className="k-button-md"
              title="Show Help"
            >
              Help
            </Button>
          </Tooltip>
          
          <Tooltip anchorElement="target" position="bottom" content={() => showSidebar ? "Hide AI Assistant sidebar" : "Show AI Assistant sidebar"}>
            <Button
              themeColor="base"
              onClick={toggleSidebar}
              icon={showSidebar ? "collapse" : "expand"}
              className="k-button-md"
              title={showSidebar ? "Hide AI Assistant" : "Show AI Assistant"}
            >
              {showSidebar ? "Hide AI" : "Show AI"}
            </Button>
          </Tooltip>
          
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
                showTooltip={true}
                tooltip="John Doe - Account Settings"
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
        </AppBarSection>
      </AppBar>

      {/* Main content area with Splitter */}
      <div className="flex-1 overflow-hidden">
        {/* Use Splitter component for resizable panels */}
        <Splitter
          style={{ height: 'calc(100vh - 56px)' }} // Adjusted for AppBar height
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
                  key={`editor-instance-${editorKey}`}
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
                    border: 'none',
                    boxShadow: 'none',
                    padding: '24px',
                    minHeight: 'calc(100vh - 164px)', // Adjusted for AppBar height
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
          title="SmartDocs Help"
          onClose={() => setHelpDialogVisible(false)}
          initialWidth={600}
          initialHeight={400}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">How to use SmartDocs</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Click anywhere in the document to start writing</li>
              <li>Use the toolbar to format your text and add elements</li>
              <li>The AI assistant can help you with writing and editing</li>
              <li>Save your work regularly using the Save button</li>
              <li>Export to PDF when you're ready to share your document</li>
            </ul>
          </div>
        </Window>
      )}
    </div>
  );
} 