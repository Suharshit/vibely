"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function NavBarHome() {
  const { isAuthenticated } = useAuth();

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-[#0e0e13]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter text-[#f8f5fd] font-headline flex items-center gap-2"
        >
          Vibely
        </Link>
        <div className="hidden md:flex items-center space-x-8 font-headline font-medium tracking-tight">
          <Link
            className="text-primary font-semibold border-b-2 border-primary pb-1"
            href="#features"
          >
            Features
          </Link>
          <a
            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            onClick={handlePricingClick}
          >
            Pricing
          </a>
          <Link
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            href={isAuthenticated ? "/dashboard" : "/login"}
          >
            Gallery
          </Link>
          <Link
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            href={isAuthenticated ? "/vault" : "/login"}
          >
            Vault
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="hidden sm:block text-on-surface-variant hover:text-on-surface font-medium transition-colors text-sm"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-primary text-on-primary-container px-5 py-2.5 rounded-xl font-bold text-sm hover:translate-y-[-1px] transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
