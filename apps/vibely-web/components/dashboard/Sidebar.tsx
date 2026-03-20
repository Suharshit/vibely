"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [userName, setUserName] = useState("Host");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      // Initial metadata check
      if (user.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }
      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }

      // Fresh DB fetch for accuracy
      supabase
        .from("users")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            if (data.name) setUserName(data.name);
            if (data.avatar_url) setAvatarUrl(data.avatar_url);
          }
        });
    });
  }, []);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/dashboard/events", label: "My Events", icon: "calendar_today" },
    { href: "/vault", label: "Vault", icon: "auto_awesome_motion" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "leaderboard" },
    { href: "/dashboard/settings", label: "Settings", icon: "settings" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <aside
      className={`h-screen fixed left-0 top-0 overflow-y-auto bg-surface-container-low flex flex-col p-2 gap-1 z-40 hidden md:flex transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`px-2 py-4 flex flex-col ${isCollapsed ? "items-center" : ""}`}
      >
        <div className="flex items-center justify-between mb-6 w-full">
          {!isCollapsed && (
            <Link
              href="/"
              className="block text-xl font-black text-primary font-headline tracking-tighter"
            >
              Vibely
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant ${isCollapsed ? "mx-auto" : ""}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span className="material-symbols-outlined text-xl">
              {isCollapsed ? "menu_open" : "menu"}
            </span>
          </button>
        </div>

        <div
          className={`flex items-center gap-3 px-2 mb-6 group cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10 shrink-0 overflow-hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="w-full h-full object-cover"
                alt="User avatar"
                src={avatarUrl}
              />
            ) : (
              <span className="text-sm font-bold text-primary font-headline">
                {getInitials(userName)}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface font-headline leading-tight truncate">
                {userName}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-primary font-label">
                Premium Plan
              </p>
            </div>
          )}
        </div>

        <nav className="space-y-1 w-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 hover:translate-x-1 ${
                  isCollapsed ? "justify-center px-0" : ""
                } ${
                  isActive
                    ? "bg-surface-container-high text-primary border-l-4 border-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <span
                  className="material-symbols-outlined shrink-0 text-xl"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-headline text-sm truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className={`mt-auto px-2 pb-4 space-y-1 w-full ${isCollapsed ? "flex flex-col items-center" : ""}`}
      >
        <Link
          href="/events/create"
          className={`w-full py-4 mb-4 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dim text-on-primary-container rounded-xl font-bold text-sm font-headline shadow-lg shadow-primary/10 hover:shadow-primary/30 active:scale-95 transition-all outline-none ${
            isCollapsed ? "px-0" : ""
          }`}
          title={isCollapsed ? "Create Event" : ""}
        >
          <span className="material-symbols-outlined text-xl">
            {isCollapsed ? "add" : "add_circle"}
          </span>
          {!isCollapsed && <span className="ml-2">Create</span>}
        </Link>

        <Link
          href="/help"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:translate-x-1 ${
            isCollapsed ? "justify-center px-0" : ""
          } ${
            pathname === "/help"
              ? "bg-surface-container-high text-primary"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
          title={isCollapsed ? "Help" : ""}
        >
          <span className="material-symbols-outlined shrink-0 text-xl">
            help
          </span>
          {!isCollapsed && <span className="font-headline text-sm">Help</span>}
        </Link>

        <button
          onClick={() => signOut()}
          className={`w-full flex items-center gap-3 px-4 py-3 border border-error/50 text-error bg-transparent hover:bg-error/10 rounded-xl transition-all duration-200 active:scale-95 ${
            isCollapsed ? "justify-center px-0 border-none" : ""
          }`}
          title={isCollapsed ? "Logout" : ""}
        >
          <span className="material-symbols-outlined shrink-0 text-xl">
            logout
          </span>
          {!isCollapsed && (
            <span className="font-headline text-sm">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}
