"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/kendo/free";
import { UserProfile } from "@/components/UserProfile";
import NotificationDemo from "@/components/NotificationDemo";
import DirectNotificationTest from "@/components/DirectNotificationTest";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documentState, setDocumentState] = useState('initial');
  
  // Animation for document changes
  useEffect(() => {
    if (documentState === 'initial') {
      const timer = setTimeout(() => {
        setDocumentState('adding');
      }, 3000);
      return () => clearTimeout(timer);
    } else if (documentState === 'adding') {
      const timer = setTimeout(() => {
        setDocumentState('deleting');
      }, 3000);
      return () => clearTimeout(timer);
    } else if (documentState === 'deleting') {
      const timer = setTimeout(() => {
        setDocumentState('final');
      }, 3000);
      return () => clearTimeout(timer);
    } else if (documentState === 'final') {
      const timer = setTimeout(() => {
        setDocumentState('initial');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [documentState]);
  
  // Redirect to documents page if authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/documents");
    }
  }, [status, router]);
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-blue-50">
      {/* Fluid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-300 opacity-70"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.3)_10%,rgba(99,102,241,0.4)_30%,rgba(147,197,253,0.2)_50%,transparent_80%)] blur-xl"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-300/30 to-transparent transform rotate-1 scale-110 origin-bottom-left"></div>
      <div className="absolute inset-0 backdrop-blur-[1px]"></div>

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
        {/* Hero and Card Section */}
        <section className="py-16 md:py-24 lg:py-32 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-16">
              {/* Hero Content - Left Side */}
              <div className="lg:w-1/2 lg:pt-8">
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                    Document{" "}
                    <span className="block">Management,</span>
                    <span className="text-blue-600">
                      Reimagined
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                    Experience the future of intelligent document collaboration with AI-powered assistance,
                    real-time editing, and enterprise-grade security.
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center mt-10 mb-6">
                    <div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">99%</div>
                      <div className="text-sm text-gray-600">Uptime</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">10k+</div>
                      <div className="text-sm text-gray-600">Documents</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">2.5k+</div>
                      <div className="text-sm text-gray-600">Users</div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="hidden lg:block absolute -left-12 bottom-10 opacity-30">
                    <div className="w-32 h-32 bg-blue-200 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Card - Right Side with Stacked Effect */}
              <div className="lg:w-1/2 relative perspective-1000">
                {/* Background Cards (Stacked 3D Effect) */}
                <div className="absolute top-8 -left-6 w-full max-w-xl opacity-20 rounded-xl bg-white/80 h-[480px] shadow-sm border border-gray-200/50 [transform:rotateX(8deg)_rotateY(-16deg)_translateZ(-20px)]"></div>
                <div className="absolute top-4 -left-3 w-full max-w-xl opacity-40 rounded-xl bg-white/90 h-[480px] shadow-sm border border-gray-200/70 [transform:rotateX(4deg)_rotateY(-8deg)_translateZ(-10px)]"></div>
                
                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl max-w-xl w-full mx-auto overflow-hidden relative [transform:rotateX(0deg)_rotateY(0deg)_translateZ(0px)] transition-transform duration-300 hover:[transform:rotateX(2deg)_rotateY(-4deg)_translateZ(10px)]">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b bg-white/90">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-medium text-gray-800">Document Editor</h2>
                  </div>
                  
                  {/* Card Content - Document Editor Style */}
                  <div className="p-6 pb-8">
                    {/* Document Preview Area */}
                    <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <div className="flex-1 text-center">
                          <span className="text-xs text-gray-500">Untitled Document.docx</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                        <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                        <div className="h-3 bg-gray-100 rounded w-4/5"></div>
                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-5 mb-8">
                      <div className="flex gap-4 items-start group transition-all hover:-translate-y-1 duration-200">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium mt-0.5">
                          1
                        </div>
                        <p className="text-gray-600 flex-1">Create and format documents with intuitive editing tools</p>
                      </div>
                      <div className="flex gap-4 items-start group transition-all hover:-translate-y-1 duration-200">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium mt-0.5">
                          2
                        </div>
                        <p className="text-gray-600 flex-1">Collaborate in real-time with comments and suggestions</p>
                      </div>
                      <div className="flex gap-4 items-start group transition-all hover:-translate-y-1 duration-200">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium mt-0.5">
                          3
                        </div>
                        <p className="text-gray-600 flex-1">Get AI-powered writing assistance and formatting suggestions</p>
                      </div>
                    </div>
                    
                    {status === "authenticated" ? (
                      <div className="flex flex-col gap-3">
                        <Button
                          themeColor="primary"
                          onClick={() => router.push("/documents")}
                          size="large"
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700"
                        >
                          My Documents
                        </Button>
                        <Button
                          themeColor="base"
                          onClick={() => router.push("/document")}
                          size="large"
                          className="w-full py-3"
                        >
                          Create New Document
                        </Button>
                      </div>
                    ) : status === "loading" ? (
                      <div className="flex justify-center items-center py-4">
                        <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <Button
                        themeColor="primary"
                        onClick={signIn}
                        size="large"
                        className="w-full py-3 bg-red-500 hover:bg-red-600"
                      >
                        Get Started
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* AI Chat Editor Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Edit Documents with AI Chat</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Simply tell our AI assistant what you want to change, and watch as your document transforms in real-time.
              </p>
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
                  {/* AI Message */}
                  <div 
                    className="flex items-start gap-3 max-w-md transform transition-all duration-500 hover:-translate-y-1"
                    data-aos="fade-right"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="bg-white rounded-2xl px-5 py-3 shadow-lg border border-gray-100">
                      <p className="text-gray-800">Hello! I'm your document assistant. How can I help with your document today?</p>
                    </div>
                  </div>
                  
                  {/* User Message */}
                  <div 
                    className="flex items-start gap-3 justify-end max-w-md ml-auto transform transition-all duration-500 hover:-translate-y-1"
                    data-aos="fade-left"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl px-5 py-3 shadow-lg text-white">
                      <p>Can you help me create a meeting agenda for tomorrow's team sync?</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* AI Message */}
                  <div 
                    className="flex items-start gap-3 max-w-md transform transition-all duration-500 hover:-translate-y-1"
                    data-aos="fade-right" 
                    data-aos-delay="200"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="bg-white rounded-2xl px-5 py-3 shadow-lg border border-gray-100">
                      <p className="text-gray-800">Of course! I'll create a meeting agenda template for you. Would you like to include specific topics or just use a standard format?</p>
                    </div>
                  </div>
                  
                  {/* User Message */}
                  <div 
                    className="flex items-start gap-3 justify-end max-w-md ml-auto transform transition-all duration-500 hover:-translate-y-1"
                    data-aos="fade-left"
                    data-aos-delay="200"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl px-5 py-3 shadow-lg text-white">
                      <p>Let's include project updates, roadmap planning, and action items review.</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* AI Message with "typing" animation */}
                  <div 
                    className="flex items-start gap-3 max-w-md transform transition-all duration-500 hover:-translate-y-1"
                    data-aos="fade-right"
                    data-aos-delay="400"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="bg-white rounded-2xl px-5 py-3 shadow-lg border border-gray-100">
                      <p className="text-gray-800">Perfect! I'm creating your meeting agenda now...</p>
                      <div className="flex gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
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
                </div>
              </div>
              
              {/* Document Preview - Right Side */}
              <div className="lg:w-1/2 relative min-h-[500px] perspective-1000">
                {/* Floating decorative elements */}
                <div className="absolute top-12 -right-6 w-12 h-12 rounded-full bg-blue-100 opacity-30"></div>
                <div className="absolute bottom-20 -right-10 w-16 h-16 rounded-full bg-indigo-100 opacity-20"></div>
                
                {/* Floating Document */}
                <div className="relative mx-auto transform-gpu transition-all duration-500 hover:rotate-1 [transform:rotateX(2deg)_rotateY(-1deg)]">
                  {/* Document Controls Bar */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-t-lg shadow-sm border border-gray-200 flex items-center gap-4 w-4/5 max-w-md">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-sm font-medium text-gray-600">Team Meeting Agenda.docx</span>
                    </div>
                    <div className="text-blue-600 hover:text-blue-800 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Paper Document */}
                  <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-md p-10 border border-gray-100 transform transition-all duration-500 
                    [transform-style:preserve-3d]
                    [box-shadow:0_10px_20px_rgba(0,0,0,0.08),0_6px_6px_rgba(0,0,0,0.12),0_-2px_6px_rgba(0,0,0,0.03)]">
                    
                    {/* Paper texture and edge styling */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-md opacity-60 pointer-events-none"></div>
                    <div className="absolute -left-1 top-10 bottom-10 w-1 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 rounded-l-md transform -translate-x-0.5 shadow-sm pointer-events-none"></div>
                    
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-6 relative">Team Meeting Agenda</h1>
                    <p className="text-gray-500 mb-8 text-center text-sm relative">Thursday, July 30, 2024 | 10:00 AM - 11:00 AM | Conference Room A</p>
                    
                    <div className="space-y-8 relative">
                      <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-blue-700 mb-3">1. Project Updates (20 min)</h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li>Status updates from each team lead</li>
                          <li>Blockers and dependencies</li>
                          <li>Timeline adjustments if needed</li>
                          {documentState === 'adding' && (
                            <li className="bg-green-50 border-l-4 border-green-500 pl-2 py-1 text-green-800 animate-pulse">
                              <span className="font-medium">NEW:</span> Review of sprint velocity metrics
                            </li>
                          )}
                          {(documentState === 'deleting' || documentState === 'final') && (
                            <li>Review of sprint velocity metrics</li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-blue-700 mb-3">2. Roadmap Planning (25 min)</h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li>Review Q3 objectives</li>
                          {documentState !== 'initial' && documentState !== 'adding' && (
                            <li className="bg-red-50 border-l-4 border-red-500 pl-2 py-1 text-red-800 line-through opacity-70 animate-pulse">
                              Discuss resource allocation
                            </li>
                          )}
                          {documentState === 'initial' || documentState === 'adding' ? (
                            <li>Discuss resource allocation</li>
                          ) : documentState === 'deleting' || documentState === 'final' ? (
                            <li className="bg-green-50 border-l-4 border-green-500 pl-2 py-1 text-green-800 animate-pulse">
                              <span className="font-medium">NEW:</span> Team capacity planning and allocation
                            </li>
                          ) : null}
                          <li>Prioritize upcoming features</li>
                          {documentState === 'adding' && (
                            <li className="bg-green-50 border-l-4 border-green-500 pl-2 py-1 text-green-800 animate-pulse">
                              <span className="font-medium">NEW:</span> Feature dependencies mapping
                            </li>
                          )}
                          {(documentState === 'deleting' || documentState === 'final') && (
                            <li>Feature dependencies mapping</li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-blue-700 mb-3">3. Action Items Review (15 min)</h2>
                        {documentState === 'deleting' && (
                          <div className="bg-green-50 border-l-4 border-green-500 pl-2 py-1 text-green-800 mb-3 animate-pulse">
                            <span className="font-medium">NEW SECTION INTRO:</span> Focus on accountability and tracking progress
                          </div>
                        )}
                        {documentState === 'final' && (
                          <div className="text-gray-700 mb-3">
                            Focus on accountability and tracking progress
                          </div>
                        )}
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li>Follow-up on last meeting's action items</li>
                          <li>Assign new action items</li>
                          {documentState !== 'initial' && documentState !== 'adding' && (
                            <li className="bg-red-50 border-l-4 border-red-500 pl-2 py-1 text-red-800 line-through opacity-70 animate-pulse">
                              Set deadlines and expectations
                            </li>
                          )}
                          {documentState === 'initial' || documentState === 'adding' ? (
                            <li>Set deadlines and expectations</li>
                          ) : documentState === 'deleting' || documentState === 'final' ? (
                            <li className="bg-green-50 border-l-4 border-green-500 pl-2 py-1 text-green-800 animate-pulse">
                              <span className="font-medium">NEW:</span> Define SMART goals with clear timelines
                            </li>
                          ) : null}
                        </ul>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500 italic">Note: Please come prepared with your updates. Send any materials you'd like to discuss to the team at least 2 hours before the meeting.</p>
                        
                        {/* Diff indicators */}
                        {documentState === 'adding' && (
                          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                              <span>2 additions</span>
                            </div>
                          </div>
                        )}
                        {documentState === 'deleting' && (
                          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                              <span>3 additions</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                              <span>2 deletions</span>
                            </div>
                          </div>
                        )}
                        {documentState === 'final' && (
                          <div className="mt-4 text-xs text-center text-green-600">
                            <span>✓ Changes saved</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Page number */}
                    <div className="absolute bottom-4 right-4 text-sm text-gray-400">1</div>
                  </div>
                  
                  {/* Shadow paper underneath - creates depth effect */}
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-[95%] h-[98%] bg-white rounded-md -z-10
                    opacity-70 shadow-md [transform:rotateX(5deg)] blur-[1px]"></div>
                </div>
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
  );
}
