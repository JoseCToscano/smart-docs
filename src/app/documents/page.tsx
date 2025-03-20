"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/kendo/free";
import { Card, CardHeader, CardTitle, CardActions } from "@progress/kendo-react-layout";
import { UserProfile } from "@/components/UserProfile";
import { DocumentSummary } from "@/types";
import { 
  fetchUserDocuments, 
  createDocument, 
  deleteDocument 
} from "@/utils/documentService";

export default function DocumentsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user's documents
  const getDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load your documents. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (status === "authenticated") {
      getDocuments();
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);
  
  const handleCreateDocument = async () => {
    try {
      const newDocument = await createDocument("Untitled Document");
      router.push(`/document/${newDocument.id}`);
    } catch (err) {
      console.error("Error creating document:", err);
      setError("Failed to create a new document. Please try again.");
    }
  };
  
  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteDocument(id);
      setDocuments((prevDocuments) => 
        prevDocuments.filter((doc) => doc.id !== id)
      );
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Failed to delete the document. Please try again.");
    }
  };
  
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] blur-[0.5px] opacity-70"></div>
        <div className="relative w-8 h-8 border-t-3 border-b-3 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 backdrop-blur-[1px]"></div>
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="border-b border-gray-200/80">
            <div className="max-w-7xl mx-auto">
              {/* Top bar with user profile */}
              <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Link href="/" className="flex items-center group">
                    <span className="flex items-center text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-200">
                      <svg className="h-6 w-6 text-blue-600 group-hover:text-blue-700 transition-colors mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      SmartDocs
                    </span>
                  </Link>
                  <div className="h-6 w-px bg-gradient-to-b from-gray-200 to-gray-300 hidden sm:block"></div>
                  <div className="hidden sm:flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                    <svg className="h-4 w-4 text-gray-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    All Files
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    themeColor="primary"
                    onClick={handleCreateDocument}
                    icon="plus"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-200 shadow-sm hover:shadow"
                  >
                    New Document
                  </Button>
                  <div className="h-8 w-px bg-gradient-to-b from-gray-200 to-gray-300"></div>
                  <UserProfile />
                </div>
              </div>

              
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r shadow-sm mb-6 animate-fadeIn">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-8 h-8 border-t-3 border-b-3 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/40">
              <div className="rounded-full bg-blue-50 p-4 mx-auto w-fit mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h2>
              <p className="text-gray-500 mb-6">Create your first document to get started</p>
              <Button
                themeColor="primary"
                onClick={handleCreateDocument}
                icon="plus"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg text-sm font-medium inline-flex items-center transition-all duration-200 shadow-sm hover:shadow transform hover:scale-105"
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Create new document card */}
              <button
                onClick={handleCreateDocument}
                className="group bg-gradient-to-br from-white/80 to-white rounded-sm border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all duration-200 overflow-hidden aspect-[1/1.4142] relative flex flex-col items-center justify-center p-4 hover:shadow-md"
              >
                <div className="rounded-full bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 p-3 mb-3 transition-all duration-200 shadow-sm group-hover:shadow">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Create New Document</h3>
                <p className="text-xs text-gray-500 text-center mt-1 group-hover:text-gray-600 transition-colors">Click to create a new empty document</p>
              </button>

              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="group bg-gradient-to-br from-white/90 to-white rounded-sm shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden aspect-[1/1.4142] relative"
                >
                  <Link
                    href={`/document/${doc.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Open ${doc.title}`}
                  />
                  {/* Document content */}
                  <div className="p-4 h-full flex flex-col">
                    {/* File type badge */}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center shadow-sm">
                      <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      DOCX
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 mb-1 pr-12 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-[10px] text-gray-500 mb-3">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Preview lines */}
                    <div className="flex-1 space-y-1">
                      <div className="h-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full w-full"></div>
                      <div className="h-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full w-11/12"></div>
                      <div className="h-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full w-full"></div>
                      <div className="h-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full w-10/12"></div>
                      <div className="h-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full w-full"></div>
                      <div className="h-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full w-9/12"></div>
                      <div className="h-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full w-full"></div>
                      <div className="h-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full w-11/12"></div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 mt-auto flex justify-end items-center border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteDocument(doc.id);
                        }}
                        className="inline-flex items-center text-[10px] font-medium text-red-600 hover:text-red-800 relative z-20 hover:bg-red-50 px-2 py-1 rounded-full transition-all duration-200"
                      >
                        <svg className="h-2.5 w-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 