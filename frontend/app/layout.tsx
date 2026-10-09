import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "CivicTriage AI — AI + Blockchain Civic Complaints",
  description:
    "AI-powered civic complaint triage with blockchain-backed audit trail",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="noise antialiased">
        <ToastProvider>
          <Navbar />
          <div className="relative z-10">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}