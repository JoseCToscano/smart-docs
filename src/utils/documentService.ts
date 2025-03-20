/**
 * Document service utility functions for interacting with document API
 */

import { PageSize } from "@/components/document-tools/MarginsPopup";
import { debounce } from "lodash";

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Updates just the title of a document
 * @param documentId The ID of the document to update
 * @param title The new title for the document
 * @returns Promise with the updated document data (id, title, updatedAt)
 */
export async function updateDocumentTitle(documentId: string, title: string) {
  const response = await fetch(`/api/document/${documentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error('Failed to update document title');
  }

  return response.json();
}

/**
 * Deletes a document
 * @param documentId The ID of the document to delete
 * @returns Promise with success status
 */
export async function deleteDocument(documentId: string) {
  const response = await fetch(`/api/document/${documentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete document: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Creates a new document
 * @param title The title for the new document
 * @param content The content for the new document
 * @returns Promise with the created document data
 */
export async function createDocument(title: string, content: string = "<p></p>") {
  const response = await fetch('/api/document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create document: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetches all documents for the current user
 * @returns Promise with an array of document summaries
 */
export async function fetchUserDocuments() {
  const response = await fetch('/api/document');

  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetches a single document by ID
 * @param documentId The ID of the document to fetch
 * @returns Promise with the document data
 */
export async function fetchDocument(documentId: string) {
  const response = await fetch(`/api/document/${documentId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.statusText}`);
  }

  return await response.json();
}

export async function updateDocumentPageSettings(
  documentId: string, 
  pageSize: PageSize, 
  margins: Margins
) {
  const response = await fetch(`/api/document/${documentId}/page-settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pageSize, margins }),
  });

  if (!response.ok) {
    throw new Error('Failed to update document page settings');
  }

  return response.json();
}

// Debounced version of the page settings update
export const debouncedUpdatePageSettings = debounce(
  async (documentId: string, pageSize: PageSize, margins: Margins) => {
    try {
      return await updateDocumentPageSettings(documentId, pageSize, margins);
    } catch (error) {
      console.error('Error updating page settings:', error);
      throw error;
    }
  },
  1000 // 1 second delay
); 