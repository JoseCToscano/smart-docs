"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button, Input } from "@/components/kendo/free";
import { Card, CardHeader, CardTitle, CardBody, CardActions } from "@/components/kendo/free/Card";
import { UserProfile } from "@/components/UserProfile";
import { DocumentSummary } from "@/types";
import { 
  fetchUserDocuments, 
  createDocument, 
  deleteDocument, 
  updateDocumentTitle 
} from "@/utils/documentService";

export default function DocumentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  
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
  
  useEffect(() => {
    // Focus the input when editing starts
    if (editingTitleId && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingTitleId]);
  
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
      
      // Remove the deleted document from the state
      setDocuments((prevDocuments) => 
        prevDocuments.filter((doc) => doc.id !== id)
      );
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Failed to delete the document. Please try again.");
    }
  };
  
  const startEditingTitle = (doc: DocumentSummary) => {
    setEditingTitleId(doc.id);
    setNewTitle(doc.title);
  };
  
  const saveDocumentTitle = async () => {
    if (!editingTitleId) return;
    
    try {
      // Only update if the title actually changed
      const doc = documents.find(d => d.id === editingTitleId);
      if (doc && doc.title !== newTitle && newTitle.trim()) {
        const updatedDoc = await updateDocumentTitle(editingTitleId, newTitle);
        
        // Update the document in the list
        setDocuments(prevDocs => 
          prevDocs.map(d => 
            d.id === editingTitleId 
              ? { ...d, title: updatedDoc.title, updatedAt: new Date(updatedDoc.updatedAt) } 
              : d
          )
        );
      }
    } catch (err) {
      console.error("Error updating document title:", err);
      setError("Failed to update the document title. Please try again.");
    } finally {
      setEditingTitleId(null);
      setNewTitle("");
    }
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveDocumentTitle();
    } else if (e.key === 'Escape') {
      setEditingTitleId(null);
      setNewTitle("");
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
              <Card key={doc.id}>
                <CardHeader>
                  {editingTitleId === doc.id ? (
                    <div className="mb-2">
                      <Input
                        ref={titleInputRef}
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.value)}
                        onBlur={saveDocumentTitle}
                        onKeyDown={handleTitleKeyDown}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Press Enter to save, Esc to cancel
                      </div>
                    </div>
                  ) : (
                    <CardTitle>
                      <span 
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => startEditingTitle(doc)}
                        title="Click to edit title"
                      >
                        {doc.title}
                      </span>
                    </CardTitle>
                  )}
                  <p className="text-sm text-gray-500">
                    Last edited: {new Date(doc.updatedAt).toLocaleString()}
                  </p>
                </CardHeader>
                <CardActions>
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
                </CardActions>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 