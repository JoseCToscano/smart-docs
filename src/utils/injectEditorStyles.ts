export const injectEditorStyles = (editorDoc?: Document | null) => {
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