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
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { BottomCTA } from "@/components/landing/BottomCTA";
import Link from "next/link";

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
    <>
      <NavBarHome />
      <main className="pt-32 bg-background min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <BottomCTA />
      </main>

      {/* Footer styled as per DESIGN.md */}
      <footer className="py-20 px-6 border-t border-outline-variant/5 bg-surface-dim">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="text-2xl font-bold tracking-tighter text-on-surface mb-6 font-headline">
              Vibely
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Designed for the moments that matter. The premium event photo
              sharing platform for modern creators.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="text-on-surface font-bold text-sm mb-6">
                Product
              </h4>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li>
                  <Link
                    className="hover:text-primary transition-colors"
                    href="#"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary transition-colors"
                    href="#"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary transition-colors"
                    href="#"
                  >
                    Case Studies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-on-surface font-bold text-sm mb-6">
                Support
              </h4>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li>
                  <Link
                    className="hover:text-primary transition-colors"
                    href="#"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary transition-colors"
                    href="#"
                  >
                    Safety
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary transition-colors"
                    href="#"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-on-surface font-bold text-sm mb-6">Social</h4>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li>
                  <Link
                    className="hover:text-primary transition-colors"
                    href="#"
                  >
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary transition-colors"
                    href="#"
                  >
                    TikTok
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary transition-colors"
                    href="#"
                  >
                    Twitter
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-outline-variant/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-label text-on-surface-variant tracking-widest">
            © {new Date().getFullYear()} VIBELY INC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
              public
            </span>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
              shield
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
