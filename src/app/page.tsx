"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/kendo/free";
import { UserProfile } from "@/components/UserProfile";
import NotificationDemo from "@/components/NotificationDemo";
import DirectNotificationTest from "@/components/DirectNotificationTest";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
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

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-sm shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                    Document Management,{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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

              {/* Card - Right Side */}
              <div className="lg:w-1/2">
                {/* Modal-like Card */}
                <div className="bg-white rounded-xl shadow-xl max-w-xl w-full mx-auto overflow-hidden">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-medium text-gray-800">Documents</h2>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex justify-center mb-10">
                      <div className="w-32 h-32 bg-blue-50 rounded-xl flex items-center justify-center p-4">
                        <svg className="w-full h-full text-blue-500 transform rotate-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          <path d="M14 3v4a1 1 0 001 1h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="space-y-5 mb-8">
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium mt-0.5">
                          1
                        </div>
                        <p className="text-gray-600 flex-1">Create and manage intelligent documents with AI assistance</p>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium mt-0.5">
                          2
                        </div>
                        <p className="text-gray-600 flex-1">Collaborate in real-time with your team from anywhere</p>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium mt-0.5">
                          3
                        </div>
                        <p className="text-gray-600 flex-1">Access enterprise-grade security and version control</p>
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
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700"
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
        
        {/* Footer */}
        <section className="relative z-10 py-8 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Smart Docs. All rights reserved.</p>
        </section>
      </main>
    </div>
  );
}
