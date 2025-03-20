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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Smart Docs</h1>
          <div>
            <UserProfile />
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your documents, smarter than ever
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, edit, and manage your documents with powerful AI assistance. Collaborate with your team and access your documents from anywhere.
          </p>
          
          {status === "authenticated" ? (
            <div className="space-x-4">
              <Button
                themeColor="primary"
                onClick={() => router.push("/documents")}
                size="large"
              >
                My Documents
              </Button>
              <Button
                themeColor="base"
                onClick={() => router.push("/document")}
                size="large"
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
            >
              Sign in to get started
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
