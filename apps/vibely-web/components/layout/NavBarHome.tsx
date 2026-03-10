"use client";

// ============================================================
// components/layout/NavBarHome.tsx
// ============================================================
// Landing-page navbar — separate from the dashboard NavBar.
// Shows: Logo, anchor links (Features / How It Works / Pricing),
// and a "Create Event" CTA.
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { MirrorRectangular } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "#features", label: "Features", isScroll: true },
  { href: "#how-it-works", label: "How It Works", isScroll: true },
  { href: "/pricing", label: "Pricing", isScroll: false },
];

export function NavBarHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleScrollClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isScroll: boolean
  ) => {
    if (isScroll) {
      e.preventDefault();

      if (pathname !== "/") {
        router.push("/" + href);
        setMenuOpen(false);
        return;
      }

      const targetId = href.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
      setMenuOpen(false);
    } else {
      setMenuOpen(false);
    }
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-6 flex justify-center">
      <nav className="w-full max-w-6xl bg-neumorphic/80 backdrop-blur-md rounded-full shadow-neumorphic flex items-center justify-between px-6 py-3 border border-white/50">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-gray-900 hover:text-violet-600 transition-colors"
        >
          <span className="text-xl">
            <MirrorRectangular />
          </span>
          <span className="text-lg tracking-tight">Vibely</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleScrollClick(e, link.href, link.isScroll)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href="/signup"
            className="inline-flex items-center px-6 py-2.5 bg-neumorphic-purple text-white text-sm font-semibold rounded-full hover:bg-violet-700 transition-colors shadow-neumorphic-sm"
          >
            Create Event
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2.5 rounded-full bg-neumorphic shadow-neumorphic-sm border border-white/50 text-gray-600 focus:shadow-neumorphic-inner transition-shadow"
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
      </nav>

      {/* Mobile menu - Dropdown */}
      {menuOpen && (
        <div className="absolute top-20 left-4 right-4 bg-neumorphic rounded-3xl p-6 shadow-neumorphic border border-white/40 space-y-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleScrollClick(e, link.href, link.isScroll)}
              className="block px-4 py-3 rounded-2xl text-center text-sm font-medium text-gray-700 active:shadow-neumorphic-inner transition-shadow"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4">
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center px-4 py-3 bg-neumorphic-purple shadow-neumorphic-sm text-white text-sm font-semibold rounded-full active:shadow-none transition-all"
            >
              Create Event
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
