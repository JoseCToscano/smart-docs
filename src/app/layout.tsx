import "@/styles/globals.css";
import "@progress/kendo-theme-default/dist/all.css";

import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "next-auth/react";
import { Metadata } from "next";
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: "Document AI",
  description: "Document AI",
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
          <SessionProvider>
            <Toaster />
            {children}
          </SessionProvider>
      </body>
    </html>
  );
}
