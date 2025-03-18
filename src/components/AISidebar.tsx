"use client";

import { useState, useRef, useEffect } from "react";
import { TextArea, Button } from "@/components/kendo/free";

interface AISidebarProps {
  onPromptSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
};

export default function AISidebar({ onPromptSubmit, isLoading = false }: AISidebarProps) {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "👋 Hi! I'm your AI writing assistant. How can I help you with your document?",
      timestamp: new Date() 
    }
  ]);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll chat to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (prompt.trim() === "" || isLoading) return;
    
    // Add user message to chat history
    const userMessage: Message = {
      role: "user", 
      content: prompt,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    
    // Call the parent component's handler
    onPromptSubmit(prompt);
    
    // Clear the input
    setPrompt("");
    
    // Simulate AI response (this will be replaced with actual AI integration)
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant", 
        content: "I'll help you with that! This is a placeholder response. In the future, I'll be able to help you edit your document, answer questions, and provide suggestions.",
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, assistantMessage]);
    }, 1000);
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

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200 w-80">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
        <p className="text-xs text-gray-500 mt-1">Ask questions or request document changes</p>
      </div>
      
      {/* Chat history */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
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
            <div>{message.content}</div>
            {message.timestamp && (
              <div className={`text-xs mt-1 ${message.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="bg-white border border-gray-200 p-3 rounded-lg max-w-[90%] mr-auto shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-white">
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
                icon="caret-alt-up"
                className="p-2"
              />
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
} 