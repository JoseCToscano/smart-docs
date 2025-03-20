"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { TextArea, Button, ProgressBar } from "@/components/kendo/free";

interface PromptCount {
  total: number;
  remaining: number;
  limit: number;
  isPremium: boolean;
}

interface AISidebarProps {
  onPromptSubmit: (prompt: string) => void;
  isLoading?: boolean;
  editorRef?: React.RefObject<any>;
  onApplyChanges?: (changes: DocumentChanges) => void;
  onApplyXmlChanges?: (xmlContent: string) => void;
  onFinalizeChanges?: () => void;
  onRevertChanges?: () => void;
  hasActiveChanges?: boolean;
}

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  suggestions?: DocumentChanges | null;
};

export type DocumentChanges = {
  additions?: { text: string; range?: { start: number; end: number } }[];
  deletions?: { text: string; range?: { start: number; end: number } }[];
  replacements?: { oldText: string; newText: string; range?: { start: number; end: number } }[];
};

export interface AISidebarHandle {
  addAIResponse: (content: string, suggestions?: DocumentChanges | null, containsPlaceholders?: boolean) => void;
}

// Convert to forwardRef to allow the parent component to access methods
const AISidebar = forwardRef<AISidebarHandle, AISidebarProps>(({
  onPromptSubmit, 
  isLoading = false,
  onFinalizeChanges,
  onRevertChanges,
  hasActiveChanges = false
}, ref) => {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "👋 Hi! I'm your AI writing assistant. How can I help you with your document?",
      timestamp: new Date() 
    }
  ]);
  
  // Add artificial progress state
  const [artificialProgress, setArtificialProgress] = useState(0);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [promptCount, setPromptCount] = useState<PromptCount | null>(null);


  // Control artificial progress based on loading state
  useEffect(() => {
    if (isLoading) {
      // Reset progress when loading starts
      setArtificialProgress(0);
      
      // Create interval to update progress
      progressIntervalRef.current = setInterval(() => {
        setArtificialProgress(prev => {
          // Progress formula: faster at first, then slower
          // Max out at 95% to show the process is still working
          if (prev < 70) {
            return prev + Math.random() * 3 + 1; // Faster progress initially
          } else if (prev < 95) {
            return prev + Math.random() * 0.8; // Slower progress later
          }
          return prev; // Stay at 95% until complete
        });
      }, 200);
    } else {
      // Clear interval when loading finishes
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // Reset progress for next time
      setArtificialProgress(0);
    }
    
    // Cleanup interval on component unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isLoading]);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    addAIResponse: (content: string, suggestions?: DocumentChanges | null, containsPlaceholders?: boolean) => {
      const assistantMessage: Message = {
        role: "assistant", 
        content: containsPlaceholders 
          ? `⚠️ Note: Some content may be incomplete due to placeholders in the response.\n\n${content}`
          : content,
        timestamp: new Date(),
        suggestions,
      };
      
      
      setChatHistory(prev => [...prev, assistantMessage]);
    }
  }));

  // Auto-scroll chat to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Add function to fetch prompt count
  const fetchPromptCount = async () => {
    try {
      const response = await fetch('/api/prompts/count');
      if (!response.ok) throw new Error('Failed to fetch prompt count');
      const data = await response.json();
      setPromptCount(data);
    } catch (error) {
      console.error('Error fetching prompt count:', error);
    }
  };

  // Fetch prompt count on mount and after each prompt submission
  useEffect(() => {
    fetchPromptCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (prompt.trim() === "" || isLoading) return;

    // Check if user has remaining prompts
    if (promptCount && promptCount.remaining <= 0) {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: "⚠️ You have reached your limit of free prompts. Please upgrade to continue using the AI assistant.",
        timestamp: new Date()
      }]);
      return;
    }
    
    // Add user message to chat history
    const userMessage: Message = {
      role: "user", 
      content: prompt,
      timestamp: new Date(),
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    
    // Call the parent component's handler
    await onPromptSubmit(prompt);
    
    // Update prompt count after submission
    fetchPromptCount();
    
    // Clear the input
    setPrompt("");
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: any) => {
    setPrompt(e.value);
  };

  // Format time consistently for both server and client
  const formatTime = (date: Date): string => {
    // Use a fixed locale and format options to ensure consistency
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200 w-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
        <p className="text-xs text-gray-500 mt-1">Ask questions or request document changes</p>
        
        {/* Show prompt count only for non-premium users */}
        {promptCount && !promptCount.isPremium && (
          <div className="mt-2 flex items-center justify-between">
            <div className={`text-xs ${
              promptCount.remaining <= 3 ? 'text-red-600' : 
              promptCount.remaining <= 5 ? 'text-orange-600' : 
              'text-gray-600'
            }`}>
              {promptCount.remaining > 0 ? (
                <>
                  <span className="font-medium">{promptCount.remaining}</span> of{' '}
                  <span className="font-medium">{promptCount.limit}</span> free prompts remaining
                </>
              ) : (
                <span className="font-medium">You have reached your limit of free prompts</span>
              )}
            </div>
            <Button
              onClick={() => window.location.href = '/settings/profile'}
              themeColor="primary"
              size="small"
              className="text-xs ml-2"
            >
              Upgrade
            </Button>
          </div>
        )}
      </div>
      
      {/* Chat history - Make sure this takes available space and is scrollable */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ 
          height: 'calc(100% - 180px)', // Account for header and input area
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {chatHistory.map((message, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg ${
              message.role === "user" 
                ? "bg-blue-500 text-white ml-auto max-w-[85%]" 
                : "bg-white border border-gray-200 mr-auto max-w-[90%] shadow-sm"
            }`}
          >
            <div dangerouslySetInnerHTML={{ __html: message.content }}></div>
            {message.suggestions && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs font-medium mb-1">Suggested changes:</div>
                
                {message.suggestions.additions && message.suggestions.additions.length > 0 && (
                  <div className="mb-1">
                    <div className="text-xs text-green-600">Additions:</div>
                    {message.suggestions.additions.map((addition, i) => (
                      <div key={i} className="text-xs rounded p-1 bg-green-50 text-green-800 my-1">
                        <div dangerouslySetInnerHTML={{ 
                          __html: '+ ' + (addition.text.length > 40 
                            ? addition.text.substring(0, 40) + '...' 
                            : addition.text)
                        }}></div>
                      </div>
                    ))}
                  </div>
                )}
                
                {message.suggestions.deletions && message.suggestions.deletions.length > 0 && (
                  <div className="mb-1">
                    <div className="text-xs text-red-600">Deletions:</div>
                    {message.suggestions.deletions.map((deletion, i) => (
                      <div key={i} className="text-xs rounded p-1 bg-red-50 text-red-800 my-1">
                        <div dangerouslySetInnerHTML={{ 
                          __html: '- ' + (deletion.text.length > 40 
                            ? deletion.text.substring(0, 40) + '...' 
                            : deletion.text)
                        }}></div>
                      </div>
                    ))}
                  </div>
                )}
                
                {message.suggestions.replacements && message.suggestions.replacements.length > 0 && (
                  <div className="mb-1">
                    <div className="text-xs text-amber-600">Replacements:</div>
                    {message.suggestions.replacements.map((replacement, i) => (
                      <div key={i} className="text-xs my-1">
                        <div className="rounded p-1 bg-red-50 text-red-800">
                          <div dangerouslySetInnerHTML={{ 
                            __html: '- ' + (replacement.oldText.length > 40 
                              ? replacement.oldText.substring(0, 40) + '...' 
                              : replacement.oldText)
                          }}></div>
                        </div>
                        <div className="rounded p-1 bg-green-50 text-green-800">
                          <div dangerouslySetInnerHTML={{ 
                            __html: '+ ' + (replacement.newText.length > 40 
                              ? replacement.newText.substring(0, 40) + '...' 
                              : replacement.newText)
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add action buttons within the message when there are suggestions */}
                {onFinalizeChanges && onRevertChanges && hasActiveChanges && message.suggestions && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      onClick={onFinalizeChanges}
                      themeColor="success"
                      size="small"
                      className="text-xs"
                      icon="check-circle"
                    >
                      Accept Changes
                    </Button>
                    <Button
                      onClick={onRevertChanges}
                      themeColor="error"
                      size="small"
                      className="text-xs"
                      icon="cancel"
                    >
                      Revert Changes
                    </Button>
                  </div>
                )}
              </div>
            )}
            {message.timestamp && (
              <div className={`text-xs mt-1 ${message.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                {message.timestamp ? formatTime(message.timestamp) : ''}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="bg-white border border-gray-200 p-3 rounded-lg max-w-[90%] mr-auto shadow-sm">
            <div className="mb-2 text-xs text-gray-600 flex justify-between">
              <span>{artificialProgress < 20 ? 'Processing request...' : 'Generating response...'}</span>
            </div>
            <ProgressBar 
              size="small"
              themeColor={artificialProgress < 50 ? 'primary' : artificialProgress < 80 ? 'info' : 'success'}
              animation={true}
              pulseAnimation={true}
              value={artificialProgress}
              min={0}
              max={100}
            />
          </div>
        )}
      </div>
      
      {/* Input area - Fixed at the bottom */}
      <div className="p-4 border-t border-gray-200 bg-white mt-auto">
        {/* Prompt suggestions header and buttons */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs font-medium text-gray-500">Quick prompts</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPrompt("Generate a draft for a employee contract.")}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200 flex items-center gap-1 border border-gray-200/60"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Generate a draft for a employee contract
            </button>
            <button
              onClick={() => setPrompt("Can you help me find and fix any grammatical errors?")}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200 flex items-center gap-1 border border-gray-200/60"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Check grammar
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <TextArea
              value={prompt}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI assistant..."
              disabled={isLoading}
              rows={3}
              minLength={1}
              maxLength={1000}
              style={{ paddingRight: '3rem' }}
              className="w-full"
            />
            <div className="absolute right-2 bottom-2">
              <Button
                type="submit"
                disabled={isLoading || prompt.trim() === ""}
                themeColor="primary"
                rounded="full"
                size="small"
                className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700"
              >
                <svg 
                  className="w-4 h-4 transform transition-transform group-hover:translate-y-[-1px]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </Button>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex justify-between">
            <span>Press Enter to send</span>
            <span>Shift+Enter for new line</span>
          </div>
        </form>
      </div>
    </div>
  );
});

// Add display name for React dev tools
AISidebar.displayName = 'AISidebar';

export default AISidebar; 