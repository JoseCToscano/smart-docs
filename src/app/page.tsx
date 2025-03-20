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
    <div className="min-h-screen relative overflow-hidden bg-emerald-50">
      {/* Fluid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 opacity-70"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,200,100,0.3)_10%,rgba(120,255,200,0.4)_30%,rgba(150,255,180,0.2)_50%,transparent_80%)] blur-xl"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-300/30 to-transparent transform rotate-1 scale-110 origin-bottom-left"></div>
      <div className="absolute inset-0 backdrop-blur-[1px]"></div>

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-sm shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Smart Docs
              </h1>
            </div>
            <div>
              <UserProfile />
            </div>
          </div>
        </nav>
      </header>

      <main className="relative flex items-center justify-center min-h-[85vh]">
        {/* Modal-like Card */}
        <div className="bg-white rounded-xl shadow-xl max-w-xl w-full mx-4 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b">
            <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-800">Documents</h2>
          </div>
          
          {/* Card Content */}
          <div className="p-6">
            <div className="flex justify-center mb-10">
              <div className="w-32 h-32 bg-emerald-50 rounded-xl flex items-center justify-center p-4">
                <svg className="w-full h-full text-emerald-500 transform rotate-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  <path d="M14 3v4a1 1 0 001 1h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-5 mb-8">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-medium mt-0.5">
                  1
                </div>
                <p className="text-gray-600 flex-1">Create and manage intelligent documents with AI assistance</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-medium mt-0.5">
                  2
                </div>
                <p className="text-gray-600 flex-1">Collaborate in real-time with your team from anywhere</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-medium mt-0.5">
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
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700"
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
                <div className="w-6 h-6 border-t-2 border-b-2 border-emerald-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <Button
                themeColor="primary"
                onClick={signIn}
                size="large"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
