"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const UserMenu = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="w-5 h-5 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="bg-white rounded shadow-lg p-4 min-w-40 border border-gray-200">
        <button 
          onClick={() => void signIn("google")}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-lg p-2 min-w-40 border border-gray-200">
      <div className="py-2 px-3 text-sm font-medium border-b border-gray-200 mb-2">
        {session?.user?.name ?? "User"}
        <div className="text-xs text-gray-500 font-normal">{session?.user?.email ?? ""}</div>
      </div>
      <ul className="space-y-1">
        <li>
          <Link 
            href="/settings/profile"
            className={`block w-full text-left px-3 py-1.5 text-sm rounded ${
              pathname === '/settings/profile' 
                ? 'bg-blue-50 text-blue-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            Profile Settings
          </Link>
        </li>
        <li>
          <Link 
            href="/documents" 
            className={`block w-full text-left px-3 py-1.5 text-sm rounded ${
              pathname === '/documents' 
                ? 'bg-blue-50 text-blue-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            My Documents
          </Link>
        </li>
        <li>
          <Link 
            href="/contact" 
            className={`block w-full text-left px-3 py-1.5 text-sm rounded ${
              pathname === '/contact' 
                ? 'bg-blue-50 text-blue-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            Contact us
          </Link>
        </li>
        <li className="border-t border-gray-200 mt-1 pt-1">
          <button 
            onClick={() => void signOut()}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded text-red-600"
          >
            Sign Out
          </button>
        </li>
      </ul>
    </div>
  );
};

