import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Link from "next/link";

// Force all pages using this layout to be rendered dynamically at request
// time, not statically at build time. This prevents prerendering from
// attempting to initialise the Supabase client (which requires env vars
// that are intentionally absent during CI builds).
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vibely - Event Photo Sharing",
  description:
    "Event-centric photo sharing platform for seamless event photography",
  keywords: ["events", "photos", "sharing", "QR code", "upload", "vibely"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Vibely - Event Photo Sharing",
    description: "Share event photos effortlessly",
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
      <body className={inter.className}>
        <AuthProvider>
          <nav className="bg-white shadow w-full p-4 flex justify-center space-x-8">
            <Link href="/dashboard">Events</Link>
            <Link href="/vault">Vault</Link>
            <Link href="/profile">Profile</Link>
          </nav>
          <main className="min-h-screen bg-gray-50">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
