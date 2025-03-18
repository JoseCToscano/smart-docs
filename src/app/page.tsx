import Link from "next/link";
import NotificationDemo from "@/components/NotificationDemo";
import DirectNotificationTest from "@/components/DirectNotificationTest";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Smart Docs App
        </h1>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 mb-8">
          <Link
            className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
            href="/document"
          >
            <h3 className="text-2xl font-bold">Document Editor →</h3>
            <div className="text-lg">
              Create and edit documents with our powerful Smart Document Editor.
            </div>
          </Link>
          <Link
            className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
            href="https://create.t3.gg/en/introduction"
            target="_blank"
          >
            <h3 className="text-2xl font-bold">Documentation →</h3>
            <div className="text-lg">
              Learn more about Create T3 App, the libraries it uses, and how to
              deploy it.
            </div>
          </Link>
        </div>
        
        <div className="w-full max-w-4xl mx-auto rounded-xl border border-gray-200 p-6 bg-white shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Notification Testing</h2>
          <div className="border-b border-gray-200 pb-6 mb-6">
            <NotificationDemo />
          </div>
          <div className="border-b border-gray-200 pb-6">
            <DirectNotificationTest />
          </div>
        </div>
      </div>
    </main>
  );
}
