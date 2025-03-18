import "@/styles/globals.css";
import "@progress/kendo-theme-default/dist/all.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { NotificationProvider } from "@/utils/notificationService";

export const metadata: Metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
