import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Sidebar from "@/components/Sidebar";

import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My NDIS Portal",
  description: "Manage NDIS participants, providers and invoices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex">
        <ThemeProvider>
          <Sidebar />
          <main className="flex flex-1 flex-col min-w-0 bg-muted-b">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
