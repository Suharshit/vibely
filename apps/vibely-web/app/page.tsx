// ============================================================
// apps/web/app/page.tsx
// ============================================================
// Root route — the first thing users see at vibely.app/
//
// Two behaviors depending on auth state:
//   • Authenticated  → redirect to /dashboard (server-side)
//   • Unauthenticated → render the landing page
//
// WHY a server component?
// We check the session cookie server-side so there's no flash of
// wrong content. Auth users never see the landing page at all.
// ============================================================

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBarHome } from "@/components/layout/NavBarHome";
import { HeroSection } from "@/components/landing/HeroSection";
import { StepsSection } from "@/components/landing/StepsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { BottomCTA } from "@/components/landing/BottomCTA";
import Link from "next/link";
import { Zap } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated users skip straight to their dashboard
  if (user) {
    redirect("/dashboard");
  }

  // ── Landing page for non-authenticated visitors ──────────
  return (
    <div className="bg-neumorphic min-h-screen">
      <NavBarHome />
      <HeroSection />
      <StepsSection />
      <FeaturesSection />
      <BottomCTA />

      {/* Simple Footer directly within page.tsx */}
      <footer className="py-8 bg-neumorphic border-t border-white/50 text-center text-sm text-gray-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-gray-500">
            <span className="text-lg">
              <Zap strokeWidth={2.5} />
            </span>{" "}
            Vibely
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-gray-900 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-gray-900 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="hover:text-gray-900 transition-colors"
            >
              Support
            </Link>
            <Link
              href="/blog"
              className="hover:text-gray-900 transition-colors"
            >
              Blog
            </Link>
          </div>
          <div>
            © {new Date().getFullYear()} Vibely Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
