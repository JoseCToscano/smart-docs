"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/kendo/free";
import { UserProfile } from "@/components/UserProfile";
import { DocumentSummary } from "@/types";

export default function DocumentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user's documents
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/document");
      
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      
      const data = await response.json();
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
      fetchDocuments();
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);
  
  const handleCreateDocument = async () => {
    try {
      const response = await fetch("/api/document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Untitled Document",
          content: "<p></p>",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create document");
      }
      
      const newDocument = await response.json();
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
      const response = await fetch(`/api/document/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete document");
      }
      
      // Remove the deleted document from the state
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-6 h-6 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">My Documents</h1>
          <div className="flex items-center space-x-4">
            <Button
              themeColor="primary"
              onClick={handleCreateDocument}
              icon="plus"
            >
              New Document
            </Button>
            <UserProfile />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-6 h-6 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h2>
            <p className="text-gray-500 mb-6">Create your first document to get started</p>
            <Button
              themeColor="primary"
              onClick={handleCreateDocument}
              icon="plus"
            >
              Create Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-5">
                  <h2 className="text-lg font-medium text-gray-900 truncate mb-2">
                    {doc.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Last edited: {new Date(doc.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between">
                  <Link
                    href={`/document/${doc.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 