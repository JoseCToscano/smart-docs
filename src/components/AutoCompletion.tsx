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

  const handleEditorChange = useCallback(() => {
    console.log("handleEditorChange called");
    if (!editorRef.current || !enabled) return;
    
    try {
      // Get the current cursor position and text
      const editor = editorRef.current;
      
      // Try multiple approaches to access editor content
      let currentText = '';
      let selection = null;
      
      // Method 1: Using editor's getSelection method
      try {
        selection = editor.getSelection();
        if (selection) {
          const range = selection.getRangeAt(0);
          const node = range.startContainer;
          if (node && node.textContent) {
            currentText = node.textContent.substring(0, range.startOffset);
          }
        }
      } catch (e) {
        console.log("Method 1 failed:", e);
      }
      
      // Method 2: Access iframe directly if available
      if (!currentText && editor.iframe) {
        try {
          const iframeDocument = editor.iframe.contentDocument || editor.iframe.contentWindow?.document;
          selection = iframeDocument?.getSelection();
          if (selection) {
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            if (node && node.textContent) {
              currentText = node.textContent.substring(0, range.startOffset);
            }
          }
        } catch (e) {
          console.log("Method 2 failed:", e);
        }
      }
      
      // Method 3: Try to find the iframe in the DOM
      if (!currentText) {
        try {
          const iframe = document.querySelector('.k-editor iframe');
          if (iframe) {
            const iframeDocument = (iframe as HTMLIFrameElement).contentDocument || 
                                 (iframe as HTMLIFrameElement).contentWindow?.document;
            selection = iframeDocument?.getSelection();
            if (selection) {
              const range = selection.getRangeAt(0);
              const node = range.startContainer;
              if (node && node.textContent) {
                currentText = node.textContent.substring(0, range.startOffset);
              }
            }
          }
        } catch (e) {
          console.log("Method 3 failed:", e);
        }
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
  }, [editorRef, getSuggestion, enabled]);

  useEffect(() => {
    // Setup event listeners for cursor movement and typing
    console.log("Setting up editor event listeners", { enabled, hasEditor: Boolean(editorRef.current) });
    if (!editorRef.current || !enabled) return;
    
    const editor = editorRef.current;
    console.log("Editor ref:", editor);
    
    // Try multiple approaches to find the editable area
    
    // 1. Try editor.element (direct approach)
    if (editor.element) {
      console.log("Adding keyup listener to editor.element");
      editor.element.addEventListener('keyup', handleEditorChange);
      return () => editor.element.removeEventListener('keyup', handleEditorChange);
    }
    
    // 2. Try to find iframe (Kendo Editor typically uses an iframe)
    const iframe = editor.iframe || document.querySelector('.k-editor iframe');
    if (iframe) {
      console.log("Found iframe, adding listener to content document");
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDocument) {
        iframeDocument.addEventListener('keyup', handleEditorChange);
        return () => iframeDocument.removeEventListener('keyup', handleEditorChange);
      }
    }
    
    // 3. Try editor's content editable element
    const contentElement = editor.contentElement || document.querySelector('.k-editor-content [contenteditable=true]');
    if (contentElement) {
      console.log("Found content element, adding listener");
      contentElement.addEventListener('keyup', handleEditorChange);
      return () => contentElement.removeEventListener('keyup', handleEditorChange);
    }
    
    // 4. Try to use editor's onChange as a fallback
    if (typeof editor.subscribe === 'function') {
      console.log("Using editor subscribe method");
      const subscription = editor.subscribe(() => {
        handleEditorChange();
      });
      return () => subscription.unsubscribe();
    }
    
    console.error("Could not find any suitable element to attach event listener");
  }, [editorRef, handleEditorChange, enabled]);

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

  const applySuggestion = useCallback(() => {
    if (!suggestion || !editorRef.current) return;
    
    const editor = editorRef.current;
    
    try {
      // Insert the suggestion at the current cursor position
      editor.exec('insertText', { text: suggestion });
      setSuggestion(null);
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  }, [suggestion, editorRef]);

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