"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DocumentPage from "../page";

export default function DocumentByIdPage() {
  const router = useRouter();
  const params = useParams();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);
  
  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded mb-6 max-w-md">
          <h2 className="text-lg font-medium mb-2">Error Loading Document</h2>
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.push("/documents")}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Return to Documents
        </button>
      </div>
    );
  }
  
  return <DocumentPage documentId={params?.id as string} />;
} 