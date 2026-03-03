import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  );
}
