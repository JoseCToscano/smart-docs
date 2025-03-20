"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/kendo/free";
import { UserProfile } from "@/components/UserProfile";
import NotificationDemo from "@/components/NotificationDemo";
import DirectNotificationTest from "@/components/DirectNotificationTest";

// Define types for chat messages
type ChatMessage = {
  id: number; 
  sender: 'ai' | 'user';
  message: string;
  visible: boolean;
  typing?: boolean;
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [animationState, setAnimationState] = useState('initial');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'ai', message: "Hello! I'm your document assistant. I can help you create or edit any document.", visible: true }
  ]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation typing text effect - simple implementation
  const [typedText, setTypedText] = useState("");
  const fullText = " Try it out for free!";
  
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(prev => prev + fullText.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
    
    return () => clearInterval(typingInterval);
  }, []);
  
  // Animation coordinating chat and document changes
  useEffect(() => {
    // Clear any existing timers when animation state changes
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (animationState === 'initial') {
      // Initial state - only first message is shown with blank document
      setChatMessages([
        { id: 1, sender: 'ai', message: "Hello! I'm your document assistant. I can help you create or edit any document.", visible: true },
        { id: 2, sender: 'user', message: "I need a simple contractor agreement for a web developer.", visible: false },
        { id: 3, sender: 'ai', message: "I'll create a short contractor agreement for your web developer project right away.", visible: false, typing: false },
        { id: 4, sender: 'user', message: "Thanks! Here's the specific info: Client is TechStart Inc, contractor is Alex Rivera, rate is $85 per hour, invoiced bi-weekly, and payment due within 15 days.", visible: false },
        { id: 5, sender: 'ai', message: "I've updated the agreement with TechStart Inc as the client, Alex Rivera as the contractor, $85/hour rate, bi-weekly invoicing, and 15-day payment terms.", visible: false, typing: false },
        { id: 6, sender: 'user', message: "For the timeline, start date is June 1, 2023, design approval by June 15, development complete by July 20, and final delivery on August 1.", visible: false },
        { id: 7, sender: 'ai', message: "I've added all the timeline information to the contract", visible: false, typing: false }
      ]);
      
      timerRef.current = setTimeout(() => {
        setAnimationState('user-request');
      }, 2000);
    } 
    else if (animationState === 'user-request') {
      // Show user requesting a document
      setChatMessages(prev => prev.map(msg => 
        msg.id === 2 ? {...msg, visible: true} : msg
      ));
      
      timerRef.current = setTimeout(() => {
        setAnimationState('ai-creating');
      }, 2000);
    }
    else if (animationState === 'ai-creating') {
      // Show AI responding and creating document
      setChatMessages(prev => prev.map(msg => 
        msg.id === 3 ? {...msg, visible: true, typing: true} : msg
      ));
      
      timerRef.current = setTimeout(() => {
        setAnimationState('document-initial');
      }, 2000);
    }
    else if (animationState === 'document-initial') {
      // Document shows initial content
      setChatMessages(prev => prev.map(msg => 
        msg.id === 3 ? {...msg, typing: false} : msg
      ));
      
      timerRef.current = setTimeout(() => {
        setAnimationState('user-addition');
      }, 3500);
    }
    else if (animationState === 'user-addition') {
      // User requests addition
      setChatMessages(prev => prev.map(msg => 
        msg.id === 4 ? {...msg, visible: true} : msg
      ));
      
      timerRef.current = setTimeout(() => {
        setAnimationState('ai-adding');
      }, 2000);
    }
    else if (animationState === 'ai-adding') {
      // AI adding new sections
      setChatMessages(prev => prev.map(msg => 
        msg.id === 5 ? {...msg, visible: true, typing: true} : msg
      ));
      
      timerRef.current = setTimeout(() => {
        setAnimationState('document-additions');
      }, 2000);
    }
    else if (animationState === 'document-additions') {
      // Document shows new sections
      setChatMessages(prev => prev.map(msg => 
        msg.id === 5 ? {...msg, typing: false} : msg
      ));
      
      timerRef.current = setTimeout(() => {
        setAnimationState('user-change');
      }, 3000);
    }
    else if (animationState === 'user-change') {
      // User requests change
      setChatMessages(prev => prev.map(msg => 
        msg.id === 6 ? {...msg, visible: true} : msg
      ));
      
      timerRef.current = setTimeout(() => {
        setAnimationState('ai-changing');
      }, 2000);
    }
    else if (animationState === 'ai-changing') {
      // AI making changes
      setChatMessages(prev => prev.map(msg => 
        msg.id === 7 ? {...msg, visible: true, typing: true} : msg
      ));
      
      timerRef.current = setTimeout(() => {
        setAnimationState('document-changes');
      }, 2000);
    }
    else if (animationState === 'document-changes') {
      // Document shows updated content
      setChatMessages(prev => prev.map(msg => 
        msg.id === 7 ? {...msg, typing: false} : msg
      ));
      
      timerRef.current = setTimeout(() => {
        setAnimationState('document-final');
      }, 3500);
    }
    else if (animationState === 'document-final') {
      // Show finalized document
    }
    else if (animationState === 'reset') {
      // Reset to beginning
      timerRef.current = setTimeout(() => {
        setAnimationState('initial');
      }, 1500);
    }
    
    // Clean up on component unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [animationState]);
  
  // Get document state based on animation state
  const documentState = (() => {
    if (['initial', 'user-request', 'ai-creating'].includes(animationState)) {
      return 'blank';
    } else if (['document-initial', 'user-addition', 'ai-adding'].includes(animationState)) {
      return 'initial';
    } else if (['document-additions', 'user-change', 'ai-changing'].includes(animationState)) {
      return 'client-details';
    } else if (['document-changes', 'document-final', 'reset'].includes(animationState)) {
      return 'final';
    } else {
      return 'blank';
    }
  })();
  
  // Redirect to documents page if authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/documents");
    }
  }, [status, router]);
  
  return (
    <>
    <div className="min-h-screen relative overflow-hidden bg-blue-50">
      {/* Fluid Background - applied to entire page */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-300 opacity-70"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.3)_10%,rgba(99,102,241,0.4)_30%,rgba(147,197,253,0.2)_50%,transparent_80%)] blur-xl"></div>
      <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-300/30 to-transparent transform rotate-1 scale-110 origin-bottom-left"></div>
      <div className="fixed inset-0 backdrop-blur-[1px]"></div>

      {/* Header - Blended with page */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-blue-600">
                Smart Docs
              </h1>
            </div>
            <div>
              <UserProfile />
            </div>
          </div>
        </nav>
      </header>

      <main className="relative">
               
    
        
        {/* AI Chat Editor Section - Now more prominent */}
        <section className="pt-12 relative z-10 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 right-[10%] w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-20 left-[10%] w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
              <span className="inline-block px-4 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-full mb-4 shadow-sm">
                AI-Powered Document Editor
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                Create & Edit Documents with <span className="text-blue-600 relative inline-block">
                  AI
                  <svg className="absolute -bottom-2 left-0 w-full h-2 text-blue-200" viewBox="0 0 100 12" preserveAspectRatio="none">
                    <path d="M0,0 Q50,12 100,0" fill="currentColor" />
                  </svg>
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
                Simply describe what you need, and watch as your document transforms in real-time. 
                No more starting from scratch or struggling with formatting.
              </p>

             {/* CTA Button */}
             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 mb-6">
              {status === "authenticated" ? (
                <div className="flex gap-4 justify-center">
                  <Button
                    themeColor="primary"
                    onClick={() => router.push("/documents")}
                    size="large"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-base font-medium shadow-lg"
                    >
                    My Documents
                  </Button>
                  <Button
                    themeColor="base"
                    onClick={() => router.push("/document")}
                    size="large"
                    className="px-8 py-3 text-base font-medium shadow-md"
                    >
                    Create New Document
                  </Button>
                </div>
              ) : status === "loading" ? (
                <div className="flex justify-center items-center py-6">
                  <div className="w-7 h-7 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <Button
                    themeColor="primary"
                    onClick={signIn}
                    size="large"
                    className="relative px-10 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.03] group overflow-hidden"
                  >
                    <span className="relative z-10">Try it out for free</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="absolute -inset-3 bg-gradient-to-r from-blue-400 to-indigo-400 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></span>
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 transition-transform duration-300 group-hover:translate-x-1">
                      <svg className="w-5 h-5 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Button>
                  <a href="#demo" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 py-2 hover:underline transition-all duration-200">
                    See how it works
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </a>
                </>
              )}
            </div>
              </div>
            
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Floating Chat Interface - Left Side */}
              <div className="lg:w-1/2 relative min-h-[500px]">
                {/* Floating decorative elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-blue-100 opacity-40"></div>
                <div className="absolute top-20 -right-4 w-8 h-8 rounded-full bg-indigo-100 opacity-60"></div>
                <div className="absolute bottom-12 left-8 w-10 h-10 rounded-full bg-purple-100 opacity-50"></div>
                
                {/* Chat Message bubbles */}
                <div className="space-y-8 relative">
                  {/* AI Messages and User Responses */}
                  {chatMessages.map((msg, index) => (
                    msg.visible && (
                      <div 
                        key={msg.id}
                        className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end max-w-md ml-auto' : 'max-w-md'} transform transition-all duration-500 hover:-translate-y-1 opacity-0 animate-fade-in`}
                        style={{ 
                          animationDelay: `${index * 0.2}s`, 
                          animationDuration: '0.5s',
                          animationFillMode: 'forwards'
                        }}
                      >
                        {msg.sender === 'ai' && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        )}
                        <div className={`${msg.sender === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                          : 'bg-white text-gray-800 border border-gray-100'} rounded-2xl px-5 py-3 shadow-lg`}>
                          <p>{msg.message}</p>
                          {msg.typing && (
                            <div className="flex gap-2 mt-2">
                              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          )}
                        </div>
                        {msg.sender === 'user' && (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 shadow-md">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
                
                {/* Chat Input */}
                <div className="mt-8 max-w-lg mx-auto">
                  <div className="flex gap-3 items-center bg-white rounded-full py-2 px-4 shadow-lg border border-gray-100">
                    <input 
                      type="text" 
                      placeholder="Type your message here..." 
                      className="flex-1 py-2 px-2 focus:outline-none bg-transparent"
                    />
                    <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-2 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Add restart button */}
                  {animationState === 'document-final' && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => setAnimationState('initial')}
                        className="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded-md px-3 py-1 transition-colors"
                      >
                        Restart Demo
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Document Preview - Right Side */}
              <div className="lg:w-1/2 relative min-h-[500px] perspective-1000">
                {/* Floating decorative elements */}
                <div className="absolute top-12 -right-6 w-12 h-12 rounded-full bg-blue-100 opacity-30"></div>
                <div className="absolute bottom-20 -right-10 w-16 h-16 rounded-full bg-indigo-100 opacity-20"></div>
                
                {/* Floating Document */}
                <div className="relative mx-auto transform-gpu transition-all duration-500 hover:rotate-1 [transform:rotateX(2deg)_rotateY(-1deg)] w-full max-w-xl">
                  {/* Document Controls Bar */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-t-lg shadow-sm border border-gray-200 flex items-center gap-3 w-[85%] max-w-[calc(450px*0.85)]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs font-medium text-gray-600">
                        {documentState === 'blank' ? 'New Document.docx' : 'Web_Developer_Contractor_Agreement.docx'}
                      </span>
                    </div>
                    <div className="text-blue-600 hover:text-blue-800 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Paper Document */}
                  <div className="mx-auto bg-white shadow-xl rounded-md p-6 border border-gray-100 transform transition-all duration-500 
                    [transform-style:preserve-3d] max-w-[450px] aspect-[1/1.414]
                    [box-shadow:0_8px_16px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.1),0_-2px_4px_rgba(0,0,0,0.03)]">
                    
                    {/* Paper texture and edge styling */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-md opacity-60 pointer-events-none"></div>
                    <div className="absolute -left-1 top-10 bottom-10 w-0.5 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 rounded-l-md transform -translate-x-0.5 shadow-sm pointer-events-none"></div>
                    
                    {documentState === 'blank' ? (
                      <div className="h-[calc(100%-12px)] flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-400 text-sm italic text-center max-w-xs">Blank document. Ask the AI assistant to create a document for you.</p>
                        <p className="text-gray-300 text-xs mt-2">Try: "I need a contractor agreement for a web developer"</p>
                      </div>
                    ) : (
                      <>
                        <h1 className={`text-lg font-bold text-center text-gray-800 mb-2 relative ${documentState === 'initial' ? 'animate-fade-in' : ''}`}>
                          CONTRACTOR AGREEMENT
                        </h1>
                        
                        <div className="space-y-3 relative">
                          {/* Parties Section */}
                          <div className={`transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm rounded-lg p-2 ${documentState === 'initial' ? 'animate-fade-in' : ''}`}
                            style={{ animationDelay: '0.2s' }}>
                            <h2 className="text-sm font-semibold text-gray-800 mb-1">1. PARTIES</h2>
                            <p className="text-xs text-gray-700">
                              This Agreement is between <span className={`font-medium ${documentState === 'initial' ? '' : 'bg-yellow-100'}`}>{documentState === 'initial' ? '[CLIENT NAME]' : 'TechStart Inc'}</span> ("Client") and <span className={`font-medium ${documentState === 'initial' ? '' : 'bg-yellow-100'}`}>{documentState === 'initial' ? '[CONTRACTOR NAME]' : 'Alex Rivera'}</span> ("Contractor") dated {new Date().toLocaleDateString()}.
                            </p>
                          </div>
                          
                          {/* Scope Section */}
                          <div className={`transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm rounded-lg p-2 ${documentState === 'initial' ? 'animate-fade-in' : ''}`}
                            style={{ animationDelay: '0.3s' }}>
                            <h2 className="text-sm font-semibold text-gray-800 mb-1">2. SERVICES</h2>
                            <p className="text-xs text-gray-700">
                              Contractor will provide web development services including design, coding, testing, and deployment of website as specified by Client.
                            </p>
                          </div>
                          
                          {/* Compensation Section */}
                          <div className={`transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm rounded-lg p-2 ${documentState === 'initial' ? 'animate-fade-in' : ''}`}
                            style={{ animationDelay: '0.4s' }}>
                            <h2 className="text-sm font-semibold text-gray-800 mb-1">3. COMPENSATION</h2>
                            <p className="text-xs text-gray-700">
                              Client will pay Contractor <span className={`font-medium ${documentState === 'initial' ? '' : 'bg-yellow-100'}`}>{documentState === 'initial' ? '$[RATE]' : '$85'}</span> per hour, invoiced <span className={`font-medium ${documentState === 'initial' ? '' : 'bg-yellow-100'}`}>{documentState === 'initial' ? '[FREQUENCY]' : 'bi-weekly'}</span>. Payment due within <span className={`font-medium ${documentState === 'initial' ? '' : 'bg-yellow-100'}`}>{documentState === 'initial' ? '[DAYS]' : '15'}</span> days of invoice receipt.
                            </p>
                          </div>
                          
                          {/* Timeline Section - Only shown after client details are added */}
                          {(documentState === 'initial' || documentState === 'client-details' || documentState === 'final') && (
                            <div className={`transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm rounded-lg p-2 ${documentState === 'initial' ? 'animate-fade-in' : documentState === 'final' ? 'bg-green-50 border-l-2 border-green-500' : ''}`}
                              style={{ animationDelay: '0.5s' }}>
                              <h2 className="text-sm font-semibold text-gray-800 mb-1">4. TIMELINE</h2>
                              <p className="text-xs text-gray-700 mb-1">
                                The project will be completed according to the following schedule:
                              </p>
                              <ul className="list-disc text-xs pl-4 space-y-0.5 text-gray-700">
                                <li><span className="font-medium">Project Start:</span> <span className={`${documentState === 'final' ? 'bg-yellow-100' : ''}`}>{documentState === 'final' ? 'June 1, 2023' : '[START DATE]'}</span></li>
                                <li><span className="font-medium">Design Approval:</span> <span className={`${documentState === 'final' ? 'bg-yellow-100' : ''}`}>{documentState === 'final' ? 'June 15, 2023' : '[MILESTONE 1]'}</span></li>
                                <li><span className="font-medium">Development Complete:</span> <span className={`${documentState === 'final' ? 'bg-yellow-100' : ''}`}>{documentState === 'final' ? 'July 20, 2023' : '[MILESTONE 2]'}</span></li>
                                <li><span className="font-medium">Final Delivery:</span> <span className={`${documentState === 'final' ? 'bg-yellow-100' : ''}`}>{documentState === 'final' ? 'August 1, 2023' : '[END DATE]'}</span></li>
                              </ul>
                            </div>
                          )}
                          
                          {/* Confidentiality Section */}
                          <div className={`transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm rounded-lg p-2 ${documentState === 'initial' ? 'animate-fade-in' : ''}`}
                            style={{ animationDelay: '0.6s' }}>
                            <h2 className="text-sm font-semibold text-gray-800 mb-1">{(documentState === 'initial' || documentState === 'client-details') ? '5' : '5'}. CONFIDENTIALITY</h2>
                            <p className="text-xs text-gray-700">
                              Contractor agrees to keep confidential all proprietary information, business data, and trade secrets received from Client during the term of this Agreement. Contractor shall not disclose such information to any third party without Client's prior written consent.
                            </p>
                          </div>
                          
                          {/* Signatures */}
                          <div className={`transform transition-all duration-300 hover:-translate-y-1 hover:shadow-sm rounded-lg p-2 ${documentState === 'initial' ? 'animate-fade-in' : ''}`}
                            style={{ animationDelay: '0.8s' }}>
                            <div className="flex justify-between items-center">
                              <div className="text-xs">
                                <p className="font-medium">CLIENT</p>
                                <p className="text-gray-400">________________</p>
                                <p className="text-gray-400 text-[10px]">Date: ________</p>
                              </div>
                              <div className="text-xs">
                                <p className="font-medium">CONTRACTOR</p>
                                <p className="text-gray-400">________________</p>
                                <p className="text-gray-400 text-[10px]">Date: ________</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Document footer with edit indicators */}
                          <div className="pt-2 border-t border-gray-200">
                            {documentState === 'initial' && (
                              <div className="text-xs text-center text-green-600 animate-fade-in">
                                <span>✓ Contract draft created</span>
                              </div>
                            )}
                            
                            {documentState === 'client-details' && (
                              <div className="mt-1 flex items-center justify-center gap-4 text-xs animate-fade-in">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                                  <span>Added client and contractor details</span>
                                </div>
                              </div>
                            )}
                            
                            {documentState === 'final' && (
                              <div className="mt-1 flex items-center justify-center gap-4 text-xs animate-fade-in">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                  <span>Updated timeline with specific dates</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Page number */}
                        <div className="absolute bottom-1 right-1 text-xs text-gray-300">1</div>
                      </>
                    )}
                  </div>
                  
                  {/* Shadow paper underneath - creates depth effect */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-[95%] h-[98%] bg-white rounded-md -z-10
                    opacity-70 shadow-md [transform:rotateX(5deg)] blur-[1px] max-w-[450px] aspect-[1/1.414]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
         {/* Try it out section with zoomed-in document */}
         <section className="py-8 md:py-12 relative z-10 overflow-hidden ">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Zoomed document preview */}
              <div className="relative mx-auto max-w-4xl overflow-hidden">
                {/* Document top part (zoomed in) */}
                <div className="relative mx-auto bg-white rounded-t-lg shadow-xl border border-gray-200 w-full max-w-4xl h-[250px] transform origin-top transition-all scale-105">
                  {/* Document controls bar */}
                  <div className="bg-white border-b border-gray-200 px-6 py-3 rounded-t-lg flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-sm font-medium text-gray-600">New Document.docx</span>
                    </div>
                    <div className="text-blue-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Document content - blank state with typing animation */}
                  <div className="p-4 flex flex-col items-center ">
                    {/* Simple typing animation with JS state */}
                    <div className="relative w-full max-w-md mx-auto">
                      <div className="flex flex-col items-center">
                        <div className="relative inline-flex">
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                            {typedText}
                            <span className="inline-block w-[2px] h-[1.2em] bg-gray-800 ml-1 animate-pulse" 
                                  style={{ animationDuration: '0.75s' }}></span>
                          </h2>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  
                  {/* Document gradient fade at bottom to create cut-off effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none"></div>
                </div>
                
                {/* Decorative elements */}
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
        <section className="relative z-10 py-8 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Smart Docs. All rights reserved.</p>
        </section>
      </main>
    </div>
    </>
  );
}
