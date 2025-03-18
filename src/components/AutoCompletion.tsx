import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash.debounce';

interface AutoCompletionProps {
  editorRef: React.RefObject<any>;
  enabled: boolean;
}

const AutoCompletion: React.FC<AutoCompletionProps> = ({ editorRef, enabled }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const detectLanguage = (text: string): string => {
    // Simple language detection based on file extension patterns or syntax
    if (text.includes('function') || text.includes('=>') || text.includes('const ')) return 'javascript';
    if (text.includes('def ') || text.includes('import ') || text.includes('class ')) return 'python';
    if (text.includes('#include') || text.includes('int main')) return 'c++';
    return 'text';
  };

  const getSuggestion = useCallback(
    debounce(async (text: string) => {
      if (!text.trim() || !enabled) {
        setSuggestion(null);
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
        if (response.ok && data.completion) {
          setSuggestion(data.completion);
        } else {
          setSuggestion(null);
        }
      } catch (error) {
        console.error('Error fetching autocompletion:', error);
        setSuggestion(null);
      } finally {
        setLoading(false);
      }
    }, 500),
    [enabled]
  );

  // Get the iframe from the editor
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

  // Define applySuggestion function before it's used in event listeners
  const applySuggestion = useCallback(() => {
    if (!suggestion || !editorRef.current) return;
    
    const editor = editorRef.current;
    
    try {
      // Insert the suggestion at the current cursor position
      // According to Telerik docs, we should use the exec command
      editor.exec('insertText', { text: suggestion });
      setSuggestion(null);
    } catch (error) {
      console.error('Error applying suggestion:', error);
      
      // Fallback: try to insert directly into the document
      try {
        const doc = getEditorDocument();
        if (doc) {
          const selection = doc.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = doc.createTextNode(suggestion);
            range.insertNode(textNode);
            
            // Move cursor to end of inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
            
            setSuggestion(null);
          }
        }
      } catch (fallbackError) {
        console.error('Fallback insertion failed:', fallbackError);
      }
    }
  }, [suggestion, editorRef, getEditorDocument]);

  const handleEditorChange = useCallback(() => {
    console.log("handleEditorChange called");
    if (!editorRef.current || !enabled) return;
    
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
      const node = range.startContainer;
      
      // Get parent paragraph or element for better context
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
        let offset = 0;
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
      
      console.log("Current text extracted:", currentText);
      
      // If we have enough context (at least 3 chars), get a suggestion
      if (currentText.length > 3) {
        getSuggestion(currentText);
      } else {
        setSuggestion(null);
      }
    } catch (error) {
      console.error('Error getting editor content:', error);
    }
  }, [editorRef, getSuggestion, enabled, getEditorDocument]);

  useEffect(() => {
    // Setup event listeners for cursor movement and typing
    console.log("Setting up editor event listeners", { enabled, hasEditor: Boolean(editorRef.current) });
    if (!editorRef.current || !enabled) return;
    
    // Get the editor document
    const doc = getEditorDocument();
    if (!doc) {
      console.log("Could not find editor document to attach events");
      return;
    }
    
    console.log("Found editor document, adding keyup listener");
    
    // Add event listeners to the editor document
    const eventListener = (e: KeyboardEvent) => {
      // Respond to keyup events that would potentially change text
      if (e.key === 'Tab' && suggestion) {
        // Apply the suggestion on Tab key
        e.preventDefault();
        applySuggestion();
      } else if (e.key === 'Escape' && suggestion) {
        // Dismiss suggestion on Escape key
        e.preventDefault();
        setSuggestion(null);
      } else if (e.key !== 'Shift' && e.key !== 'Control' && 
                e.key !== 'Alt' && e.key !== 'Meta' &&
                e.key !== 'ArrowUp' && e.key !== 'ArrowDown' &&
                e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' &&
                !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Trigger suggestion on most typing keys, but not on navigation or modifier keys
        handleEditorChange();
      }
    };
    
    // Attach to keyup event
    doc.addEventListener('keyup', eventListener);
    
    // Also listen for mouseup to handle selection changes
    doc.addEventListener('mouseup', handleEditorChange);
    
    return () => {
      doc.removeEventListener('keyup', eventListener);
      doc.removeEventListener('mouseup', handleEditorChange);
    };
  }, [editorRef, handleEditorChange, enabled, getEditorDocument, suggestion, applySuggestion]);

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

  // Add keyboard shortcut handlers for Tab and Escape
  useEffect(() => {
    if (!suggestion || !enabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && suggestion) {
        e.preventDefault();
        applySuggestion();
      } else if (e.key === 'Escape' && suggestion) {
        e.preventDefault();
        setSuggestion(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [suggestion, enabled, applySuggestion]);

  return (
    <div className="autocomplete-container">
      {loading && (
        <div className="autocomplete-loading">
          <span>Generating suggestion...</span>
        </div>
      )}
      
      {!loading && suggestion && (
        <div className="autocomplete-suggestion">
          <div className="suggestion-content">
            <span className="suggestion-text">{suggestion}</span>
          </div>
          <div className="suggestion-actions">
            <button 
              onClick={applySuggestion} 
              className="suggestion-accept-btn"
              title="Accept suggestion (Tab)"
            >
              Apply
            </button>
            <button 
              onClick={() => setSuggestion(null)} 
              className="suggestion-reject-btn"
              title="Reject suggestion (Esc)"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoCompletion; 