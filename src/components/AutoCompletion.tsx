import { useCallback, useEffect, useState, useRef } from 'react';
import debounce from 'lodash.debounce';

interface AutoCompletionProps {
  editorRef: React.RefObject<any>;
  enabled: boolean;
}

const AutoCompletion: React.FC<AutoCompletionProps> = ({ editorRef, enabled }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ node: Node | null; offset: number } | null>(null);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const suggestionElementRef = useRef<HTMLSpanElement | null>(null);
  
  // Track whether component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);
  
  // Use a ref to track the current suggestion to avoid dependency issues in effects
  const currentSuggestionRef = useRef<string | null>(null);
  
  // Update the ref when suggestion changes
  useEffect(() => {
    currentSuggestionRef.current = suggestion;
  }, [suggestion]);

  const detectLanguage = (text: string): string => {
    // Simple language detection based on file extension patterns or syntax
    if (text.includes('function') || text.includes('=>') || text.includes('const ')) return 'javascript';
    if (text.includes('def ') || text.includes('import ') || text.includes('class ')) return 'python';
    if (text.includes('#include') || text.includes('int main')) return 'c++';
    return 'text';
  };

  const getSuggestion = useCallback(
    debounce(async (text: string) => {
      if (!text.trim() || !enabled || !isMountedRef.current) {
        return;
      }

      setLoading(true);
      try {
        const language = detectLanguage(text);
        const response = await fetch('/api/autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, language }),
        });

        const data = await response.json();
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          if (response.ok && data.completion) {
            setSuggestion(data.completion);
          } else {
            setSuggestion(null);
          }
        }
      } catch (error) {
        console.error('Error fetching autocompletion:', error);
        if (isMountedRef.current) {
          setSuggestion(null);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }, 500),
    [enabled] // Only depend on enabled, not other state values
  );

  // Get the iframe from the editor - memoize this to avoid recreating on each render
  const getEditorIframe = useCallback(() => {
    if (!editorRef.current) return null;
    
    // According to KendoReact documentation, the editor uses an iframe by default
    // Try to access it through various possible methods
    if (editorRef.current.iframe) {
      return editorRef.current.iframe;
    }

    // If not directly available, try to find it in the DOM
    const editorElement = editorRef.current.element;
    if (editorElement) {
      const iframe = editorElement.querySelector('iframe');
      if (iframe) return iframe;
    }

    // As a fallback, try to find it in the document
    return document.querySelector('.k-editor iframe');
  }, [editorRef]);

  // Get the editor's document
  const getEditorDocument = useCallback(() => {
    const iframe = getEditorIframe();
    if (!iframe) return null;
    
    return iframe.contentDocument || iframe.contentWindow?.document;
  }, [getEditorIframe]);

  // Define a function to show the inline suggestion
  const showInlineSuggestion = useCallback(() => {
    if (!currentSuggestionRef.current || !selectionRange || !cursorPosition) return;
    
    try {
      // Get the editor document
      const doc = getEditorDocument();
      if (!doc) return;
      
      // Remove any existing suggestion element first
      const existingGhost = doc.getElementById('inline-suggestion-ghost');
      if (existingGhost) {
        existingGhost.parentNode?.removeChild(existingGhost);
      }
      
      // Create a span element to hold the suggestion text
      const suggestionElement = doc.createElement('span');
      suggestionElement.id = 'inline-suggestion-ghost';
      suggestionElement.className = 'inline-suggestion-ghost';
      suggestionElement.textContent = currentSuggestionRef.current;
      suggestionElement.style.color = '#9CA3AF'; // Light gray color
      suggestionElement.style.opacity = '0.8';
      suggestionElement.style.pointerEvents = 'none'; // So it doesn't intercept clicks
      suggestionElement.style.position = 'relative';
      suggestionElement.style.fontFamily = 'inherit';
      suggestionElement.style.fontSize = 'inherit';
      
      // Store reference to the element
      suggestionElementRef.current = suggestionElement;
      
      // Insert the suggestion at the cursor position
      const range = selectionRange.cloneRange();
      range.collapse(true); // Collapse to the end
      range.insertNode(suggestionElement);
    } catch (error) {
      console.error('Error showing inline suggestion:', error);
    }
  }, [selectionRange, cursorPosition, getEditorDocument]); // Remove suggestion from dependencies

  // Define a function to remove the inline suggestion
  const removeInlineSuggestion = useCallback(() => {
    try {
      const doc = getEditorDocument();
      if (!doc) return;
      
      const suggestionElement = doc.getElementById('inline-suggestion-ghost');
      if (suggestionElement) {
        suggestionElement.parentNode?.removeChild(suggestionElement);
      }
    } catch (error) {
      console.error('Error removing inline suggestion:', error);
    }
  }, [getEditorDocument]);

  // Define applySuggestion function before it's used in event listeners
  const applySuggestion = useCallback(() => {
    const currentSuggestion = currentSuggestionRef.current;
    if (!currentSuggestion || !editorRef.current) return;
    
    // First, remove the inline suggestion element
    removeInlineSuggestion();
    
    const editor = editorRef.current;
    
    try {
      // Insert the suggestion at the current cursor position
      // According to Telerik docs, we should use the exec command
      editor.exec('insertText', { text: currentSuggestion });
      
      // Clear states in a single batch to avoid multiple renders
      if (isMountedRef.current) {
        setSuggestion(null);
        setCursorPosition(null);
        setSelectionRange(null);
      }
    } catch (error) {
      console.error('Error applying suggestion:', error);
      
      // Fallback: try to insert directly into the document
      try {
        const doc = getEditorDocument();
        if (doc && cursorPosition && cursorPosition.node) {
          const selection = doc.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = doc.createTextNode(currentSuggestion);
            range.insertNode(textNode);
            
            // Move cursor to end of inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Clear states
            if (isMountedRef.current) {
              setSuggestion(null);
              setCursorPosition(null);
              setSelectionRange(null);
            }
          }
        }
      } catch (fallbackError) {
        console.error('Fallback insertion failed:', fallbackError);
      }
    }
  }, [editorRef, getEditorDocument, cursorPosition, removeInlineSuggestion]); // Don't depend on suggestion

  // Use a ref to store the handler to avoid re-creating it on every render
  const handleEditorChangeRef = useRef<() => void>();
  
  // Define the handler function
  handleEditorChangeRef.current = () => {
    if (!editorRef.current || !enabled || !isMountedRef.current) return;
    
    // First, remove any existing inline suggestion
    removeInlineSuggestion();
    
    try {
      // Get the editor document
      const doc = getEditorDocument();
      if (!doc) {
        console.log("Could not get editor document");
        return;
      }
      
      // Get selection from document
      const selection = doc.getSelection();
      if (!selection) {
        console.log("No selection found");
        return;
      }
      
      // Get text from the current selection point
      let currentText = '';
      const range = selection.getRangeAt(0);
      
      // Store the current range for later use when showing the suggestion
      if (isMountedRef.current) {
        setSelectionRange(range.cloneRange());
      
        const node = range.startContainer;
        setCursorPosition({
          node,
          offset: range.startOffset
        });
      }
      
      // Get parent paragraph or element for better context
      const node = range.startContainer;
      let contextNode = node;
      while (contextNode && contextNode.nodeName !== 'P' && 
             contextNode.nodeName !== 'DIV' && 
             contextNode.nodeName !== 'LI' &&
             contextNode !== doc.body) {
        contextNode = contextNode.parentNode;
      }
      
      if (contextNode && contextNode.textContent) {
        // Get all text up to cursor position
        // This is more complex as we need to calculate position within the parent
        const nodeIterator = doc.createNodeIterator(
          contextNode,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let currentNode;
        let reachedTargetNode = false;
        
        while ((currentNode = nodeIterator.nextNode())) {
          if (currentNode === node) {
            // We've reached our target node, add text up to the cursor
            currentText += currentNode.textContent?.substring(0, range.startOffset) || '';
            reachedTargetNode = true;
            break;
          } else {
            // Add the entire content of previous nodes
            currentText += currentNode.textContent || '';
          }
        }
        
        // If we didn't find the target node, use fallback
        if (!reachedTargetNode && node.textContent) {
          currentText = node.textContent.substring(0, range.startOffset);
        }
      } else if (node && node.textContent) {
        // Fallback to just the node text
        currentText = node.textContent.substring(0, range.startOffset);
      }
      
      // If we have enough context (at least 3 chars), get a suggestion
      if (currentText.length > 3) {
        getSuggestion(currentText);
      } else if (isMountedRef.current) {
        setSuggestion(null);
      }
    } catch (error) {
      console.error('Error getting editor content:', error);
    }
  };
  
  // Memoized wrapper function that calls the ref function
  const handleEditorChange = useCallback(() => {
    handleEditorChangeRef.current?.();
  }, []); // No dependencies to avoid recreation

  // Effect to show the inline suggestion when a suggestion is available
  useEffect(() => {
    if (suggestion && !loading) {
      // Add the inline suggestion to the document
      showInlineSuggestion();
    } else {
      // Remove any existing inline suggestion
      removeInlineSuggestion();
    }
  }, [suggestion, loading, showInlineSuggestion, removeInlineSuggestion]);

  // Effect for attaching event listeners - only run once on mount/enabled change
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    console.log("Setting up editor event listeners", { enabled, hasEditor: Boolean(editorRef.current) });
    if (!editorRef.current || !enabled) return;
    
    // Get the editor document
    const doc = getEditorDocument();
    if (!doc) {
      console.log("Could not find editor document to attach events");
      return;
    }
    
    console.log("Found editor document, adding keyup listener");
    
    // Throttled selectionchange handler to prevent too many calls
    const throttledSelectionChange = debounce(() => {
      if (currentSuggestionRef.current && isMountedRef.current) {
        handleEditorChange();
      }
    }, 100);
    
    // Add event listeners to the editor document
    const keyupListener = (e: KeyboardEvent) => {
      // Respond to keyup events that would potentially change text
      if (e.key !== 'Shift' && e.key !== 'Control' && 
          e.key !== 'Alt' && e.key !== 'Meta' &&
          e.key !== 'ArrowUp' && e.key !== 'ArrowDown' &&
          e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' &&
          !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Trigger suggestion on most typing keys, but not on navigation or modifier keys
        handleEditorChange();
      }
    };
    
    // Add specific listener for tab key to accept the suggestion
    const keydownListener = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && currentSuggestionRef.current) {
        // Apply the suggestion on Tab key
        e.preventDefault();
        applySuggestion();
      } else if (e.key === 'Escape' && currentSuggestionRef.current) {
        // Dismiss suggestion on Escape key
        e.preventDefault();
        removeInlineSuggestion();
        if (isMountedRef.current) {
          setSuggestion(null);
        }
      }
    };
    
    // Attach to keyup event
    doc.addEventListener('keyup', keyupListener);
    doc.addEventListener('keydown', keydownListener);
    
    // Also listen for mouseup to handle selection changes
    doc.addEventListener('mouseup', handleEditorChange);
    
    // Also listen for cursor change events - using throttled version
    doc.addEventListener('selectionchange', throttledSelectionChange);
    
    // Clean up function
    return () => {
      // Set flag that component is unmounted
      isMountedRef.current = false;
      
      // Remove event listeners
      doc.removeEventListener('keyup', keyupListener);
      doc.removeEventListener('keydown', keydownListener);
      doc.removeEventListener('mouseup', handleEditorChange);
      doc.removeEventListener('selectionchange', throttledSelectionChange);
      
      // Remove any suggestion elements
      removeInlineSuggestion();
      
      // Cancel any pending debounced calls
      getSuggestion.cancel();
      throttledSelectionChange.cancel();
    };
  }, [editorRef, enabled, getEditorDocument, applySuggestion, removeInlineSuggestion, handleEditorChange, getSuggestion]); // Remove suggestion from deps

  // Add another effect for custom event listener as a fallback approach
  useEffect(() => {
    if (!enabled) return;
    
    console.log("Setting up custom event listener for editor changes");
    
    // Listen for the custom event from document page
    const handleCustomEvent = () => {
      console.log("Custom autocompleteTrigger event received");
      handleEditorChange();
    };
    
    window.addEventListener('autocompleteTrigger', handleCustomEvent);
    
    return () => {
      window.removeEventListener('autocompleteTrigger', handleCustomEvent);
    };
  }, [handleEditorChange, enabled]);

  // Add CSS to the iframe document
  useEffect(() => {
    const doc = getEditorDocument();
    if (!doc) return;
    
    // Check if the style already exists
    if (!doc.getElementById('inline-suggestion-styles')) {
      const styleElement = doc.createElement('style');
      styleElement.id = 'inline-suggestion-styles';
      styleElement.textContent = `
        .inline-suggestion-ghost {
          color: #9CA3AF;
          opacity: 0.8;
          pointer-events: none;
          font-family: inherit;
          font-size: inherit;
        }
      `;
      doc.head.appendChild(styleElement);
    }
  }, [getEditorDocument]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      removeInlineSuggestion();
      getSuggestion.cancel();
    };
  }, [removeInlineSuggestion, getSuggestion]);

  // We don't need the old popup UI anymore, but let's return an empty div
  // to maintain the component structure
  return (
    <div className="inline-autocomplete-container">
      {loading && (
        <div className="autocomplete-status">
          <span className="sr-only">Generating suggestion...</span>
        </div>
      )}
    </div>
  );
};

export default AutoCompletion; 