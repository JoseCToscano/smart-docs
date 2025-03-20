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
  const { data: session, status } = useSession();
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-gray-50/40 to-purple-50/30"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] blur-[0.5px] opacity-70"></div>
      <div className="absolute inset-0 backdrop-blur-[1px]"></div>
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-sm shadow-md border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Documents</h1>
            <div className="flex items-center space-x-6">
              <Button
                themeColor="primary"
                onClick={handleCreateDocument}
                icon="plus"
                className="transform transition hover:scale-105 active:scale-95 shadow-sm"
              >
                New Document
              </Button>
              <UserProfile />
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
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h2>
              <p className="text-gray-500 mb-6">Create your first document to get started</p>
              <Button
                themeColor="primary"
                onClick={handleCreateDocument}
                icon="plus"
                className="transform transition hover:scale-105 active:scale-95 shadow-sm"
              >
                Create Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <Card key={doc.id} className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/40 overflow-hidden transform hover:-translate-y-1">
                  <CardHeader className="p-5 border-b border-gray-100/40">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {doc.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(doc.updatedAt).toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardActions className="p-4 bg-gray-50/60 backdrop-blur-sm flex justify-between items-center">
                    <Link
                      href={`/document/${doc.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Open
                    </Link>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </CardActions>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 