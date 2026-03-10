// ============================================================
// apps/web/app/pricing/page.tsx
// ============================================================
// Dedicated pricing page requested by the user.
// Shows 3 tiers: Go, Plus, Pro in a neumorphic design.
// ============================================================
import { NavBarHome } from "@/components/layout/NavBarHome";
import { BottomCTA } from "@/components/landing/BottomCTA";
import Link from "next/link";
import { Check, MirrorRectangular } from "lucide-react";

export const metadata = {
  title: "Pricing | Vibely",
  description: "Simple, transparent pricing for any event size.",
};

const PLANS = [
  {
    name: "Go",
    price: "Free",
    description: "Perfect for small get-togethers and casual hangouts.",
    features: [
      "Up to 50 guests",
      "Standard quality photos",
      "Event active for 24 hours",
      "Basic gallery layout",
    ],
    cta: "Start for Free",
    href: "/signup",
    isPopular: false,
  },
  {
    name: "Plus",
    price: "$19",
    period: "/event",
    description: "Ideal for weddings, parties, and larger celebrations.",
    features: [
      "Up to 500 guests",
      "High-Res original quality",
      "Event active for 1 month",
      "Live slideshow feature",
      "Bulk download for host",
    ],
    cta: "Get Plus",
    href: "/signup",
    isPopular: true,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For professional photographers and event planners.",
    features: [
      "Unlimited guests",
      "Unlimited active events",
      "Custom branding & colors",
      "Analytics dashboard",
      "Priority customer support",
      "Physical prints integration",
    ],
    cta: "Start Pro Trial",
    href: "/signup",
    isPopular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-neumorphic min-h-screen pt-24">
      <NavBarHome />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Simple pricing,{" "}
            <span className="text-violet-600">no surprises.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 leading-relaxed">
            Whether you&apos;re hosting a small dinner or a massive wedding,
            we&apos;ve got a plan that perfectly captures your vibe.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-neumorphic rounded-[2.5rem] p-8 sm:p-10 flex flex-col h-full ${
                plan.isPopular
                  ? "shadow-neumorphic-sm border-2 border-violet-400 transform md:-translate-y-4 md:h-[105%]"
                  : "shadow-neumorphic border border-white/50"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 h-10">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm font-medium text-gray-500">
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex flex-start gap-3">
                    <Check
                      size={18}
                      className="text-violet-600 shrink-0 mt-0.5"
                    />
                    <span className="text-sm text-gray-700 leading-tight">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full text-center py-4 rounded-full text-sm font-semibold transition-all ${
                  plan.isPopular
                    ? "bg-neumorphic-purple text-white shadow-neumorphic border-1 border-white/40 hover:opacity-90 active:scale-95"
                    : "bg-neumorphic text-gray-700 shadow-neumorphic border border-white/40 hover:shadow-neumorphic-sm active:shadow-neumorphic-inner"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>

      <BottomCTA />

      {/* Footer */}
      <footer className="py-8 bg-neumorphic border-t border-white/50 text-center text-sm text-gray-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-gray-500">
            <span className="text-lg">
              <MirrorRectangular />
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
