"use client";

import { ReactNode } from "react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F2f5] flex flex-col font-sans text-gray-900 max-w-[1440px] mx-auto px-12">
      <NavBar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
