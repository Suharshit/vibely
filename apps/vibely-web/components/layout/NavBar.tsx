"use client";

// ============================================================
// apps/web/components/layout/NavBar.tsx
// ============================================================
// Responsive top navigation bar.
// Desktop: horizontal links
// Mobile: hamburger menu with slide-down drawer
// ============================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/dashboard", label: "Events", emoji: "📅" },
  { href: "/vault", label: "Vault", emoji: "🔖" },
  { href: "/profile", label: "Profile", emoji: "👤" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("users")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setUserName(data.name);
            setAvatarUrl(data.avatar_url);
          }
        });
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Hide nav on guest and auth pages
  if (
    pathname.startsWith("/guest") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/join")
  )
    return null;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-gray-900 hover:text-violet-600 transition-colors"
          >
            <span className="text-lg">📸</span>
            <span className="text-base">Vibely</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-base">{link.emoji}</span>
                {link.label}
              </Link>
            ))}

            {/* Avatar + sign out */}
            <div className="ml-2 flex items-center gap-2 pl-2 border-l border-gray-100">
              <div className="w-7 h-7 rounded-full bg-violet-100 overflow-hidden">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                    width={28}
                    height={28}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-violet-700">
                    {userName?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{link.emoji}</span>
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <span>↩</span>
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
