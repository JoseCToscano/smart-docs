"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Editor, EditorTools } from "@/components/kendo/premium";
import { 
  Button, 
  Input, 
  AppBar, 
  AppBarSection, 
  AppBarSpacer, 
} from "@/components/kendo/free";
import { 
  Splitter,
  SplitterOnChangeEvent,
  SplitterPaneProps,
  Tooltip
} from "@/components/kendo";
import "@progress/kendo-theme-default/dist/all.css";
import "./styles.css";
import Link from "next/link";
import AISidebar, { DocumentChanges, AISidebarHandle } from "@/components/AISidebar";
import { Document as DocType } from "@/types";
import { Window } from "@progress/kendo-react-dialogs";
import { parseXmlDiff, xmlDiffToChanges } from "@/utils/xmlDiffParser";
import FileUploadDialog from "@/components/FileUploadDialog";
import MarginsPopup from "@/components/document-tools/MarginsPopup";
import { PageSize } from "@/components/document-tools/MarginsPopup";
import { pageSizes, getPageSizeInPixels } from "@/utils/getPageSizeInPixels";
import { injectEditorStyles } from "@/utils/injectEditorStyles";
import { normalizeContent } from "@/utils/normalizeContent";
import { findNodeAndOffset } from "@/utils/findNodeAndOffset";
import { UserProfile } from "@/components/UserProfile";
import { updateDocumentTitle, debouncedUpdatePageSettings } from "@/utils/documentService";
import { debounce } from "lodash";

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


export default function DocumentPage({ documentId }: { documentId?: string }) {
  const [document, setDocument] = useState<DocType>({
    title: "Untitled Document",
    content: "<p></p>",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTitleSaving, setIsTitleSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(documentId ? true : false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [helpDialogVisible, setHelpDialogVisible] = useState(false);
  const [fileUploadDialogVisible, setFileUploadDialogVisible] = useState(false);
  const [hasActiveChanges, setHasActiveChanges] = useState(false);
  const [originalContentBeforeChanges, setOriginalContentBeforeChanges] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [showMarginSettings, setShowMarginSettings] = useState(false);
  const [margins, setMargins] = useState({
    left: 24,
    right: 24,
    top: 24,
    bottom: 24
  });
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const marginSettingsRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);
  const aiSidebarRef = useRef<AISidebarHandle>(null);
  const [panes, setPanes] = useState<SplitterPaneProps[]>([
    { collapsible: false, scrollable: true }, // Main editor pane - flexible size (no fixed size)
    { collapsible: true, collapsed: false, size: '30%', min: '350px', max: '40%', scrollable: true, keepMounted: true } // Sidebar with fixed size
  ]);
  // Add a state to track when margins are updated for animation effects
  const [marginUpdateAnimation, setMarginUpdateAnimation] = useState(false);

  // Add handlers for margin changes
  const handleMarginChange = (margin: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    const newMargins = {
      ...margins,
      [margin]: value
    };
    
    setMargins(newMargins);
    setMarginUpdateAnimation(true);
    
    // Save to server if we have a document ID
    const docId = document?.id;
    if (typeof docId === 'string') {
      debouncedUpdatePageSettings(docId, pageSize, newMargins)
    }
    
    setTimeout(() => {
      setMarginUpdateAnimation(false);
    }, 1000);
  };
  
  // Handler for page size changes
  const handlePageSizeChange = (newSize: PageSize) => {
    console.log("[DocumentPage] handlePageSizeChange called with:", newSize);
    
    if (!pageSizes[newSize]) {
      console.warn(`Invalid page size: ${newSize}, defaulting to A4`);
      newSize = "A4";
    }
    
    setPageSize(newSize);
    console.log("[DocumentPage] Page dimensions updated to:", pageSizes[newSize].width, "x", pageSizes[newSize].height, "mm");
    
    // Save to server if we have a document ID
    const documentId = document?.id;
    if (typeof documentId === 'string') {
      debouncedUpdatePageSettings(documentId, newSize, margins)
    }
    
    setMarginUpdateAnimation(true);
    setTimeout(() => {
      setMarginUpdateAnimation(false);
    }, 1000);
  };
  
  const toggleMarginSettings = () => {
    setShowMarginSettings(prev => !prev);
  };

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

  const debouncedUpdateTitle = useCallback(
    debounce(async (id: string, title: string) => {
      try {
        if(title.length > 0) {
          await updateDocumentTitle(id, title);
          setLastSaved(`Last saved at ${new Date().toLocaleTimeString()}`);
        }
      } catch (err) {
        console.error("Error updating document title:", err);
      } finally {
        setIsTitleSaving(false);
      }
    }, 500), // Adjust delay as needed
    []
  );

  const handleTitleChange = useCallback(async(e: any) => {
    const newTitle = e.value;
    
    // Update local state immediately for responsive UI
    setDocument(prev => ({
      ...prev,
      title: newTitle,
    }));
    
    // If we have a document ID, update the title via the API
    if (document.id) {
      setIsTitleSaving(true);
      try {
        await debouncedUpdateTitle(document.id, newTitle);
        // Show last saved indicator
        const now = new Date();
        setLastSaved(`Last saved at ${now.toLocaleTimeString()}`);
      } catch (err) {
        console.error("Error updating document title:", err);
        // Revert to previous title if there was an error
        // This could be enhanced with a toast notification
      } finally {
        setIsTitleSaving(false);
      }
    }
  }, [document.id]);

  // Handle title blur to ensure title is not empty
  const handleTitleBlur = useCallback(() => {
    if (!document.title.trim()) {
      setDocument(prev => ({
        ...prev,
        title: "Untitled Document",
      }));
      
      // If we have a document ID, update the title via the API
      if (document.id) {
        updateDocumentTitle(document.id, "Untitled Document")
          .catch(err => console.error("Error updating document title:", err));
      }
    }
  }, [document.id, document.title]);

  
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

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    
    try {
      const content = getEditorContent();
      const endpoint = document.id 
        ? `/api/document/${document.id}` 
        : "/api/document";
      
      const method = document.id ? "PUT" : "POST";
      const body = document.id 
        ? { title: document.title, content }
        : { title: document.title, content };
        
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save document");
      }
      
      const savedDocument = await response.json();
      
      // Update document state with the saved document
      setDocument(prev => ({
        ...prev,
        id: savedDocument.id,
        updatedAt: new Date(savedDocument.updatedAt),
      }));
      
      // Update last saved time
      const now = new Date();
      setLastSaved(`Last saved at ${now.toLocaleTimeString()}`);
    } catch (err) {
      console.error("Error saving document:", err);
      alert("Failed to save document. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [document.id, document.title, getEditorContent]);


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
    setIsAIProcessing(true);
    
    // Get current content from the editor
    const currentContent = getEditorContent();
    
    // Create a temporary container to normalize the content structure
    const tempContainer = window.document.createElement('div');
    tempContainer.innerHTML = currentContent;
    
    // Clean up editor-specific attributes and containers that don't affect content
    const allElements = tempContainer.querySelectorAll('*');
    allElements.forEach((el: Element) => {
      // Remove contenteditable, translate, and other non-content attributes
      if (el.hasAttribute('contenteditable')) {
        el.removeAttribute('contenteditable');
      }
      if (el.hasAttribute('translate')) {
        el.removeAttribute('translate');
      }
      
      // Remove ProseMirror-specific classes
      if (el.classList?.contains('ProseMirror') || el.classList?.contains('ProseMirror-trailingBreak')) {
        el.classList.remove('ProseMirror');
        el.classList.remove('ProseMirror-trailingBreak');
      }
    });
    
    // Remove empty k-content div wrappers if present
    const kContentDivs = tempContainer.querySelectorAll('div.k-content');
    kContentDivs.forEach((div: Element) => {
      // Only replace if it's just a wrapper
      if (div.parentNode && div.classList.contains('k-content')) {
        // Move all children out to the parent
        while (div.firstChild) {
          div.parentNode.insertBefore(div.firstChild, div);
        }
        // Remove the empty div
        div.parentNode.removeChild(div);
      }
    });
    
    // Save the cleaned original content for later comparison
    setOriginalContentBeforeChanges(tempContainer.innerHTML);
    console.log("[handleAIPrompt] Saved normalized original content", tempContainer.innerHTML.substring(0, 100));
    
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
          content: tempContainer.innerHTML,
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
        containsPlaceholders,
        xmlContent: xmlContent?.substring(0, 200) + "..."
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
            
            /* Make <u> tags inside additions/deletions display properly */
            .ai-addition u, .ai-deletion u, 
            u.ai-addition, u.ai-deletion {
              text-decoration: underline !important;
              display: inline !important;
            }
            
            /* Make <mark> tags inside additions/deletions display properly */
            .ai-addition mark, .ai-deletion mark,
            mark.ai-addition, mark.ai-deletion {
              background-color: #ffff00 !important;
              color: #000000 !important;
              padding: 0 !important;
              display: inline !important;
            }
            
            /* Special styling for marked content within additions - combine both styles */
            .ai-addition mark {
              background-color: rgba(255, 255, 0, 0.7) !important;
              border-bottom: 1px solid rgba(34, 197, 94, 0.5) !important;
            }
            
            /* Ensure mark tags work correctly with spans */
            mark {
              background-color: #ffff00 !important;
              color: #000000 !important;
              padding: 0 !important;
              display: inline !important;
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
      
      // Save the current content as original content if not already set
      if (!originalContentBeforeChanges) {
        const currentContent = getEditorContent();
        // Normalize the content similar to handleAIPrompt
        const tempContainer = window.document.createElement('div');
        tempContainer.innerHTML = currentContent;
        
        // Clean up editor-specific attributes
        const allElements = tempContainer.querySelectorAll('*');
        allElements.forEach((el: Element) => {
          if (el.hasAttribute('contenteditable')) {
            el.removeAttribute('contenteditable');
          }
          if (el.hasAttribute('translate')) {
            el.removeAttribute('translate');
          }
          
          // Remove non-content classes
          if (el.classList?.contains('ProseMirror') || el.classList?.contains('ProseMirror-trailingBreak')) {
            el.classList.remove('ProseMirror');
            el.classList.remove('ProseMirror-trailingBreak');
          }
        });
        
        setOriginalContentBeforeChanges(tempContainer.innerHTML);
        console.log("[applyXmlChangesToEditor] Saved normalized original content");
      }
      
      // Check if there are XML tags in the content
      const hasXmlTags = xmlContent.includes("<addition>") || xmlContent.includes("<deletion>");
      
      let processedContent;
      
      if (hasXmlTags) {
        // Parse XML to HTML with styled spans
        processedContent = parseXmlDiff(xmlContent);
        
        console.log("[DocumentPage] Parsed HTML contains addition spans:", processedContent.includes("ai-addition"));
        console.log("[DocumentPage] Parsed HTML contains deletion spans:", processedContent.includes("ai-deletion"));
      } else {
        // Even if there are no XML tags, we still process the content
        // This handles cases where there were direct HTML changes like adding <u> tags
        processedContent = xmlContent;
        console.log("[DocumentPage] No XML tags found, but still updating content to show changes");
      }
      
      // Make sure the editor is ready
      if (!editorRef.current) {
        console.error("[DocumentPage] Editor reference is not available");
        return;
      }
      
      // Properly update the editor with new content
      updateEditorContent(processedContent);
      
      // Update the hasActiveChanges state
      setTimeout(() => {
        // First try the standard hasAIChanges function which checks for both visual markers and content changes
        const hasChanges = hasAIChanges();
        
        if (hasChanges) {
          setHasActiveChanges(true);
          console.log("[DocumentPage] hasAIChanges detected changes");
        } else if (originalContentBeforeChanges) {
          // If no changes were detected but we have original content, do an explicit content comparison
          const currentContent = getEditorContent();
          const contentChanged = contentHasMeaningfulChanges(originalContentBeforeChanges, currentContent);
          
          setHasActiveChanges(contentChanged);
          console.log("[DocumentPage] Direct content comparison detected changes:", contentChanged);
          
          if (!contentChanged && !hasXmlTags) {
            // If we couldn't find changes at all, but got a response without XML tags
            // (could be identical content returned), clear the original content
            setOriginalContentBeforeChanges(null);
            console.log("[DocumentPage] No changes detected and no XML tags, clearing original content");
          }
        } else {
          setHasActiveChanges(hasChanges);
          console.log("[DocumentPage] Updated hasActiveChanges:", hasChanges);
        }
      }, 100);
      
    } catch (error) {
      console.error("[DocumentPage] Error applying XML changes to editor:", error);
    }
  };
  
  // New helper function to properly update editor content while preserving its functionality
  const updateEditorContent = (newContent: string) => {
    try {
      // Log if the incoming content contains mark tags
      const hasMark = newContent.includes('<mark>');
      console.log("[updateEditorContent] Input content contains mark tags:", hasMark);
      
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
        
        // Special handling for mark tags - ensure they're preserved
        if (el.tagName.toLowerCase() === 'mark') {
          console.log("[updateEditorContent] Preserving mark tag:", el.outerHTML.substring(0, 50));
        }
      });
      
      // Get the cleaned content
      const cleanedContent = tempDiv.innerHTML;
      
      // Verify mark tags are still present after cleaning
      const cleanedHasMark = cleanedContent.includes('<mark>');
      console.log("[updateEditorContent] Cleaned content contains mark tags:", cleanedHasMark);
      
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
            
            // 9. Check if mark tags were preserved after updating
            const finalContent = editorDoc.body.innerHTML;
            const finalHasMark = finalContent.includes('<mark>');
            console.log("[updateEditorContent] Final editor content has mark tags:", finalHasMark);
            
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
      
      // Check for mark tags inside additions
      let hasMarkTags = false;
      additionSpans.forEach(span => {
        if (span.innerHTML.includes('<mark>') || span.innerHTML.includes('</mark>')) {
          hasMarkTags = true;
          console.log("[DocumentPage] Found mark tags inside addition span:", span.innerHTML.substring(0, 50));
        }
      });
      
      console.log("[DocumentPage] Document has mark tags inside additions:", hasMarkTags);
      
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
        const fixedContent = editorContent
          .replace(/<addition>([\s\S]*?)<\/addition>/g, '<span class="ai-addition ai-badge highlight">$1</span>')
          .replace(/<deletion>([\s\S]*?)<\/deletion>/g, '<span class="ai-deletion ai-badge highlight">$1</span>');
          
        editorDoc.body.innerHTML = fixedContent;
        
        // After fixing, refresh the editor again
        reinitializeEditor();
      }
      
      // Check if mark tags are present after all fixes
      const finalContent = editorDoc.body.innerHTML;
      console.log("[DocumentPage] Final content has mark tags:", finalContent.includes('<mark>'));
      
    } catch (error) {
      console.error("[DocumentPage] Error fixing span styling:", error);
    }
  };

  // Update the handleApplyChanges function to handle both formats
  const handleApplyChanges = useCallback((changes: DocumentChanges) => {
    // This handles the original format with structured changes
    applyChangesToEditor(changes);
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
        // Keep the HTML content (including <br> tags and other HTML tags) but remove the span
        const content = addition.innerHTML;
        console.log(`[finalizeChanges] Processing addition with content: ${content.substring(0, 50)}...`);
        
        // Check for mark tags in the content to ensure they're preserved
        const hasMark = content.includes('<mark>') || content.includes('</mark>');
        if (hasMark) {
          console.log(`[finalizeChanges] Addition contains mark tags, ensuring preservation`);
        }
        
        // Create a new temporary container to handle the HTML content properly
        const contentContainer = window.document.createElement('span');
        contentContainer.innerHTML = content;
        
        // Replace the AI addition span with its inner HTML content
        if (addition.parentNode) {
          // Use replaceWith to preserve HTML structure including <br> tags and mark tags
          addition.parentNode.replaceChild(contentContainer, addition);
          
          // Now move all children out of the temporary span to the parent
          // We need to be careful to preserve HTML structure
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
      
      // Log whether the final HTML contains mark tags
      console.log(`[finalizeChanges] Final HTML contains mark tags: ${cleanedHtml.includes('<mark>')}`);
      
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
      
      // Reset the original content since changes are now accepted
      setOriginalContentBeforeChanges(null);
      
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
      
      // Check for mark tags in the content
      const hasMark = tempContainer.innerHTML.includes('<mark>');
      console.log("[revertChanges] Content contains mark tags:", hasMark);
      
      // Step 2: Find and process all AI additions (remove them completely)
      const additions = tempContainer.querySelectorAll('.ai-addition');
      console.log(`[revertChanges] Found ${additions.length} additions to remove`);
      
      additions.forEach((addition) => {
        // Before removing, check if it contains mark tags that might need special handling
        const content = addition.innerHTML;
        const additionHasMark = content.includes('<mark>') || content.includes('</mark>');
        
        if (additionHasMark) {
          console.log("[revertChanges] Addition with mark tags:", content.substring(0, 50));
        }
        
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
        
        // Check if deletion contains mark tags that need preservation
        const deletionHasMark = content.includes('<mark>') || content.includes('</mark>');
        if (deletionHasMark) {
          console.log("[revertChanges] Deletion with mark tags:", content.substring(0, 50));
        }
        
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
      
      // Check if mark tags were preserved in the final content
      const finalHasMark = cleanedHtml.includes('<mark>');
      console.log("[revertChanges] Final content contains mark tags:", finalHasMark);
      
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
      
      // Reset the original content since we've reverted to it
      setOriginalContentBeforeChanges(null);
      
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
  // Helper function to compare HTML content for meaningful differences
  const contentHasMeaningfulChanges = (original: string, current: string): boolean => {
    if (!original || !current) return original !== current;
    
    const normalizedOriginal = normalizeContent(original);
    const normalizedCurrent = normalizeContent(current);
    
    // Log normalized content for debugging
    console.log("[contentHasMeaningfulChanges] Normalized original:", normalizedOriginal.substring(0, 100));
    console.log("[contentHasMeaningfulChanges] Normalized current:", normalizedCurrent.substring(0, 100));
    
    // Compare the normalized contents
    const contentChanged = normalizedOriginal !== normalizedCurrent;
    
    if (contentChanged) {
      // Log the differences for debugging
      console.log("[contentHasMeaningfulChanges] Content has changed");
      
      // You could implement a more detailed diff here to show what changed
      if (normalizedOriginal.length !== normalizedCurrent.length) {
        console.log(
          `[contentHasMeaningfulChanges] Length difference: Original=${normalizedOriginal.length}, Current=${normalizedCurrent.length}`
        );
      }
      
      // Add additional debugging for content comparison
      let mismatchIndex = -1;
      const minLength = Math.min(normalizedOriginal.length, normalizedCurrent.length);
      
      for (let i = 0; i < minLength; i++) {
        if (normalizedOriginal[i] !== normalizedCurrent[i]) {
          mismatchIndex = i;
          break;
        }
      }
      
      if (mismatchIndex >= 0) {
        const contextStart = Math.max(0, mismatchIndex - 20);
        const contextEnd = Math.min(minLength, mismatchIndex + 20);
        
        console.log(
          `[contentHasMeaningfulChanges] First difference at index ${mismatchIndex}:\n` +
          `Original: ...${normalizedOriginal.substring(contextStart, contextEnd)}...\n` +
          `Current: ...${normalizedCurrent.substring(contextStart, contextEnd)}...`
        );
      }
    }
    
    return contentChanged;
  };

  // Helper function to check if there are AI changes in the editor
  const hasAIChanges = useCallback((): boolean => {
    const editorDoc = getEditorDocument();
    if (!editorDoc) {
      return false;
    }
    
    // Find all addition and deletion elements
    const additions = editorDoc.querySelectorAll('.ai-addition');
    const deletions = editorDoc.querySelectorAll('.ai-deletion');
    
    // First check: Are there any visual addition/deletion markers?
    const hasVisualChanges = additions.length > 0 || deletions.length > 0;
    
    // Second check: Compare current content with original content (always do this check)
    if (originalContentBeforeChanges) {
      const currentContent = getEditorContent();
      const contentChanged = contentHasMeaningfulChanges(originalContentBeforeChanges, currentContent);
      
      // If we have either visual changes or content changes, there are AI changes
      return hasVisualChanges || contentChanged;
    }
    
    // If we don't have original content to compare, just return whether there are visual changes
    return hasVisualChanges;
  }, [getEditorDocument, originalContentBeforeChanges, getEditorContent, contentHasMeaningfulChanges]);

  // Update toggleSidebar to work with Splitter
  const toggleSidebar = useCallback(() => {
    // If needed, we could update Splitter props here
    if (!showSidebar) {
      setPanes(prev => [
        { ...prev[0]},
        { ...prev[1], collapsed: false}
      ]);
    }else{
      setPanes(prev => [
        { ...prev[0],},
        { ...prev[1], collapsed: true}
      ]);
    }
    setShowSidebar(currentState => !currentState);
    
    // Debug the state change
    console.log("Toggling sidebar, new state:", !showSidebar);
    
  }, [showSidebar]);

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
    
    // Try to inject styles when editor is available
    if (editorRef.current) {
      setTimeout(() => {
        const editorDoc = getEditorDocument();
        if (!editorDoc) return;
        injectEditorStyles(editorDoc);
      }, 500); // Delay to ensure editor is fully loaded
    }
  }, [editorRef.current]);

  // Effect to detect changes in the editor content that contain AI changes
  useEffect(() => {
    // Check for AI changes and update state
    const checkForAIChanges = () => {
      const hasChanges = hasAIChanges();
      
      // If the editor content has changed but hasAIChanges returns false,
      // let's do a direct comparison
      if (!hasChanges && originalContentBeforeChanges) {
        console.log("[DocumentPage] hasAIChanges returned false, doing direct comparison");
        const currentContent = getEditorContent();
        const contentChanged = contentHasMeaningfulChanges(originalContentBeforeChanges, currentContent);
        
        if (contentChanged) {
          console.log("[DocumentPage] Direct comparison found changes");
          setHasActiveChanges(true);
          return;
        }
      }
      
      setHasActiveChanges(hasChanges);
      console.log("[DocumentPage] Active AI changes detected:", hasChanges);
    };
    
    // Initial check
    checkForAIChanges();
    
    // Set up a mutation observer to watch for changes to the editor content
    const editorDoc = getEditorDocument();
    if (editorDoc) {
      const observer = new MutationObserver((mutations) => {
        // Log some debugging info about the mutations
        console.log("[DocumentPage] Mutation observer triggered with", mutations.length, "mutations");
        
        // For HTML structure changes like adding <u> tags, we need a special check
        const hasStructuralChanges = mutations.some(mutation => {
          // Check for changes related to underline tags
          return Array.from(mutation.addedNodes).some(node => {
            const nodeHTML = node instanceof Element ? node.outerHTML : 
                            (node instanceof Text ? node.textContent : '');
            return nodeHTML && nodeHTML.includes("<u>");
          }) || 
          // Also check for changes to attributes that might indicate a style change
          (mutation.type === 'attributes' && mutation.target instanceof Element && 
           (mutation.target.tagName === 'U' || mutation.target.innerHTML.includes("<u>")));
        });
        
        if (hasStructuralChanges) {
          console.log("[DocumentPage] Detected HTML structure changes (like <u> tags)");
          // Force content comparison
          const currentContent = getEditorContent();
          if (originalContentBeforeChanges) {
            const contentChanged = contentHasMeaningfulChanges(originalContentBeforeChanges, currentContent);
            if (contentChanged) {
              console.log("[DocumentPage] Content changed with HTML structure modifications");
              setHasActiveChanges(true);
              return;
            }
          }
        }
        
        // Standard check
        checkForAIChanges();
      });
      
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
  }, [hasAIChanges, getEditorDocument, originalContentBeforeChanges, getEditorContent, contentHasMeaningfulChanges]);




  // Add a new method to handle opening a document from a file
  const handleOpenFromFile = useCallback(() => {
    setFileUploadDialogVisible(true);
  }, []);

  // Add a method to handle processing the uploaded file content
  const handleFileProcessed = useCallback((html: string) => {
    // First confirm with the user if there are unsaved changes
    if (document.content !== '<p></p>' && !window.confirm('Opening a new document will replace the current content. Any unsaved changes will be lost. Continue?')) {
      return;
    }

    // Update the document with the new content
    setDocument(prev => ({
      ...prev,
      title: prev.title === 'Untitled Document' ? 'Imported Document' : prev.title,
      content: html,
      updatedAt: new Date()
    }));

    // Force a re-render of the editor component with a new key
    setEditorKey(prevKey => prevKey + 1);

    // Reset any active changes
    setHasActiveChanges(false);
    setOriginalContentBeforeChanges(null);

    // Add a confirmation message to the AI sidebar if it's available
    if (aiSidebarRef.current && typeof aiSidebarRef.current.addAIResponse === 'function') {
      aiSidebarRef.current.addAIResponse(
        "I've opened the Word document and converted it to an editable format. You can now edit it like any other document."
      );
    }
  }, [document.content]);

  useEffect(() => {
    console.log("[DocumentPage] Splitter should update with showSidebar =", showSidebar);
  }, [showSidebar]);

  // Add a useEffect to update the editor when margins change
  useEffect(() => {
    // Skip the initial render
    if (editorRef.current && document.content !== "<p></p>") {
      // Force update the editor styling
      const editorDoc = getEditorDocument();
      if (editorDoc && editorDoc.body) {
        editorDoc.body.style.padding = `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`;
        console.log("[DocumentPage] Updated editor margins:", margins);
      }
    }
  }, [margins, getEditorDocument]);

  // Effect to ensure pageSize is always valid
  useEffect(() => {
    // If pageSize is not a valid key in pageSizes, set it to "A4"
    if (!pageSizes[pageSize]) {
      console.warn(`[DocumentPage] Invalid page size: ${pageSize}. Falling back to A4.`);
      setPageSize("A4");
    }
  }, [pageSize]);

  // Calculate page dimensions for container
  const pageDimensions = getPageSizeInPixels(pageSize);

  // Add a function to load the document by ID
  const loadDocument = useCallback(async () => {
    if (!documentId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/document/${documentId}`);
      
      if (!response.ok) {
        throw new Error("Failed to load document");
      }
      
      const data = await response.json();
      setDocument({
        id: data.id,
        title: data.title,
        content: data.content,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        userId: data.userId
      });
      
      // Set page settings if they exist
      if (data.pageSize) {
        setPageSize(data.pageSize);
      }
      if (data.margins) {
        setMargins(data.margins);
      }
      
      // Force a re-render of the editor with the new content
      setEditorKey(prevKey => prevKey + 1);
    } catch (err) {
      console.error("Error loading document:", err);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);
  
  // Load document when component mounts or documentId changes
  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId, loadDocument]);

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
              className="w-64 font-medium border-none"
              aria-label="Document title"
            />
          </Tooltip>
          {isTitleSaving && (
            <span className="text-xs text-gray-500 animate-pulse ml-2">Saving title...</span>
          )}
        </AppBarSection>
        
        <AppBarSpacer />
        
        <AppBarSection>
          {/* Help and AI controls in the top AppBar */}
          <Tooltip anchorElement="target" position="bottom" content={() => "View help documentation"}>
            <Button
              themeColor="base"
              onClick={() => setHelpDialogVisible(true)}
              icon="question-circle"
              className="k-button-md mr-2"
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
              className="k-button-md mr-3"
              title={showSidebar ? "Hide AI Assistant" : "Show AI Assistant"}
            >
              {showSidebar ? "Hide AI" : "Show AI"}
            </Button>
          </Tooltip>
          <UserProfile />
        </AppBarSection>
      </AppBar>

      {/* Main content area with Splitter */}
      <div className="flex-1 overflow-hidden">
        {/* Use Splitter component for resizable panels */}
        <Splitter
          key="main-splitter"
          className="h-full w-full border-8 border-purple-500 fixed top-0"
          orientation="horizontal"
          panes={panes}
          onChange={(e:SplitterOnChangeEvent)=>{
            setPanes(e.newState)
            if(e.newState[1]?.collapsed){
              setShowSidebar(false);
            }else{
              setShowSidebar(true);
            }
          }}
        >
          {/* Main Editor Area */}
          <div className="h-full flex flex-col relative bg-gray-200 border-red-500"
          style={{ height: 'calc(100vh - 56px)' }} // Adjusted for AppBar height
          >

            {/* Document Settings Toolbar */}
            <div className="w-full border-b border-gray-300 bg-white p-2 flex items-center flex-wrap">
              {/* File operations */}
              <div className="flex items-center mr-4">
                <Tooltip anchorElement="target" position="bottom" content={() => "Open a Word document (.docx file)"}>
                  <Button 
                    themeColor="base"
                    onClick={handleOpenFromFile}
                    icon="file"
                    className="k-button-sm mr-2"
                    size="small"
                  >
                    Load from file
                  </Button>
                </Tooltip>
                
                <Tooltip anchorElement="target" position="bottom" content={() => "Save your document to the cloud"}>
                  <Button 
                    themeColor="primary"
                    disabled={isSaving}
                    onClick={handleSave}
                    icon={isSaving ? "refresh" : "save"}
                    className="k-button-sm mr-2"
                    size="small"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </Tooltip>
                
                {/* <Tooltip anchorElement="target" position="bottom" content={() => "Export document as PDF"}>
                  <Button 
                    themeColor="base"
                    onClick={handleExport}
                    icon="pdf"
                    className="k-button-sm"
                    size="small"
                  >
                    Export
                  </Button>
                </Tooltip> */}
              </div>
              
              {/* Separator */}
              <div className="h-6 border-l border-gray-300 mx-3"></div>
              
              {/* Document configuration */}
              <div className="flex items-center">
                <Tooltip anchorElement="target" position="bottom" content={() => "Adjust document margins"}>
                  <Button
                    themeColor="base"
                    onClick={toggleMarginSettings}
                    icon="ruler"
                    className="k-button-sm"
                    size="small"
                    title="Margin Settings"
                  >
                    Page settings
                  </Button>
                </Tooltip>
              </div>
              
              {/* Display last saved time if available */}
              {lastSaved && (
                <div className="ml-auto text-xs text-gray-500 px-2">{lastSaved}</div>
              )}
              
              {/* Margins popup container - positioned at the end to ensure proper layering */}
              <div className="relative" ref={marginSettingsRef}>
                <MarginsPopup
                  marginSettingsRef={marginSettingsRef} 
                  showMarginSettings={showMarginSettings} 
                  setShowMarginSettings={setShowMarginSettings}
                  margins={margins}
                  handleMarginChange={handleMarginChange}
                  pageSize={pageSize || "A4"}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </div>
            <div className="relative flex-1 overflow-auto py-8 border-blue-500">
                {/* Editor Content Area with built-in toolbar */}
              <div 
                className="editor-page-container mx-auto shadow-md relative transition-all duration-500"
                style={{
                  width: pageDimensions.width,
                  height: pageDimensions.height, // Add height property to enforce page size proportions
                  maxWidth: "calc(100vw - 220px)",
                  minHeight: "500px" // Ensure a minimum size regardless of page dimensions
                }}
              >
                {/* Margin guides */}
                <div 
                  className={`absolute inset-0 pointer-events-none border border-dashed ${marginUpdateAnimation ? 'border-blue-500 animate-pulse-margin' : 'border-blue-300'} opacity-50`}
                  style={{
                    top: `${margins.top - 1}px`,
                    right: `${margins.right - 1}px`,
                    bottom: `${margins.bottom - 1}px`,
                    left: `${margins.left - 1}px`,
                    borderWidth: '1px',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                
                {/* Margin indicators */}
                {(marginUpdateAnimation || showMarginSettings) && (
                  <>
                    {/* Top margin indicator */}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium pointer-events-none"
                      style={{ 
                        top: `${margins.top / 2}px`,
                        opacity: marginUpdateAnimation ? 1 : 0.7,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {margins.top}px
                    </div>
                    
                    {/* Right margin indicator */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium pointer-events-none"
                      style={{ 
                        right: `${margins.right / 2}px`,
                        opacity: marginUpdateAnimation ? 1 : 0.7,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {margins.right}px
                    </div>
                    
                    {/* Bottom margin indicator */}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium pointer-events-none"
                      style={{ 
                        bottom: `${margins.bottom / 2}px`,
                        opacity: marginUpdateAnimation ? 1 : 0.7,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {margins.bottom}px
                    </div>
                    
                    {/* Left margin indicator */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium pointer-events-none"
                      style={{ 
                        left: `${margins.left / 2}px`,
                        opacity: marginUpdateAnimation ? 1 : 0.7,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {margins.left}px
                    </div>
                    
                    {/* Page size indicator - always visible */}
                  </>
                )}
                
                {/* Page size indicator - always visible */}
                <div 
                  className="absolute right-0 top-0 -mt-8 bg-blue-50 text-blue-700 px-3 py-1 rounded-tl rounded-tr-none text-xs font-medium pointer-events-none border border-blue-200"
                  style={{
                    opacity: marginUpdateAnimation ? 1 : 0.85,
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {pageSize} ({(pageSizes[pageSize] || pageSizes["A4"]).width} × {(pageSizes[pageSize] || pageSizes["A4"]).height}mm)
                </div>
                
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
                    padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
                    minHeight: `calc(${pageDimensions.height} - ${margins.top}px - ${margins.bottom}px)`, // Set minHeight based on page dimensions
                    height: 'auto', // Allow content to expand if needed
                  }}
                  defaultContent={document.content}
                  onChange={handleContentChange}
                />
              </div>
            </div>
          </div>
          
          {/* AI Sidebar */}
          <div className="">
            <div className=""
                    style={{
                      height: 'calc(100vh - 56px)',
                    }}>
              <AISidebar 
                key="ai-sidebar"
                onPromptSubmit={handleAIPrompt}
                isLoading={isAIProcessing}
                editorRef={editorRef}
                onApplyChanges={handleApplyChanges}
                onFinalizeChanges={finalizeChanges}
                onRevertChanges={revertChanges}
                hasActiveChanges={hasActiveChanges}
                ref={aiSidebarRef}
              />
            </div>
          </div>
        </Splitter>
      </div>

      {/* Add the File Upload Dialog */}
      {fileUploadDialogVisible && (
        <FileUploadDialog
          onClose={() => setFileUploadDialogVisible(false)}
          onFileProcessed={handleFileProcessed}
        />
      )}

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
              <li>Open Word documents (.docx) using the Open File button</li>
            </ul>
          </div>
        </Window>
      )}
    </div>
  );
} 

