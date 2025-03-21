import "@/styles/globals.css";
import "@progress/kendo-theme-default/dist/all.css";

import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import { Toaster } from 'react-hot-toast'
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Smart Document Editor",
  description: "AI Document Editor: Edit your documents with ease",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
          <Providers>
            <Toaster />
            {children}
          </Providers>
      </body>
    </html>
  );
}
