"use client";

import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import SearchBar from "@/components/ui/SearchBar";
import NotificationDropdown from "@/components/layout/NotificationDropdown";
import SettingsButton from "@/components/layout/SettingsButton";
import ProfileButton from "@/components/layout/ProfileButton";

export default function NavBar() {
  const pathname = usePathname();

  // Hide nav on specific pages, consistent with previous behavior
  if (
    pathname === "/" ||
    pathname.startsWith("/guest") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/join") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/pricing")
  ) {
    return null;
  }

  return (
    <nav className="w-full h-20 flex items-center justify-between px-6 bg-transparent">
      {/* Left: Logo */}
      <div className="flex-shrink-0">
        <Logo />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex-1 max-w-3xl mx-2 hidden md:block">
          <SearchBar className="w-full shadow-sm rounded-full border-2 border-zinc-300/50" />
        </div>
        <NotificationDropdown />
        <SettingsButton />
        <ProfileButton />
      </div>
    </nav>
  );
}
