"use client";

import { ReactNode, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileNav from "@/components/dashboard/MobileNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body overflow-x-hidden w-full">
      {/* SideNavBar Component (Desktop) */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"} min-h-screen p-4 lg:p-8 pb-24 md:pb-8 bg-background max-w-7xl mx-auto flex flex-col`}
      >
        {children}
      </main>

      {/* BottomNavBar for Mobile */}
      <MobileNav />
    </div>
  );
}
