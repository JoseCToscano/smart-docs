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
    if (!editorRef.current || !enabled) return;
    
    try {
      // Get the current cursor position and text
      const editor = editorRef.current;
      const editorElement = editor.element;
      
      if (editorElement) {
        const selection = editor.getSelection();
        if (selection) {
          const range = selection.getRangeAt(0);
          const node = range.startContainer;
          
          // Get text from the current paragraph or code block
          let currentText = '';
          if (node && node.textContent) {
            currentText = node.textContent.substring(0, range.startOffset);
          }
          
          // If we have enough context (at least 3 chars), get a suggestion
          if (currentText.length > 3) {
            getSuggestion(currentText);
          } else {
            setSuggestion(null);
          }
        }
      }
    } catch (error) {
      console.error('Error getting editor content:', error);
    }
  }, [editorRef, getSuggestion, enabled]);

  useEffect(() => {
    // Setup event listeners for cursor movement and typing
    if (!editorRef.current || !enabled) return;
    
    const editor = editorRef.current;
    const editorElement = editor.element;
    
    if (editorElement) {
      // Listen for keyup events to trigger suggestions
      editorElement.addEventListener('keyup', handleEditorChange);
      
      return () => {
        editorElement.removeEventListener('keyup', handleEditorChange);
      };
    }
  }, [editorRef, handleEditorChange, enabled]);

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