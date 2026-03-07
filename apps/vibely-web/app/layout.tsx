// ============================================================
// apps/web/app/layout.tsx
// ============================================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/layout/NavBar";
import { ToastProvider } from "@/components/layout/Toast";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vibely — Share event photos instantly",
  description:
    "Create events, share a QR code, and collect photos from everyone — no app required for guests.",
  openGraph: {
    title: "Vibely",
    description: "Share event photos instantly — no app required for guests.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <NavBar />
            <main>{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
