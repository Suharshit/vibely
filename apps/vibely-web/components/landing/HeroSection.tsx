"use client";

// ============================================================
// components/landing/HeroSection.tsx
// ============================================================
// Hero block for the landing page.
// Headline with violet accent, subtitle, two CTA buttons,
// and a phone mockup image.
// ============================================================

import Link from "next/link";
import { PhoneMockup } from "./PhoneMockup";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-neumorphic min-h-screen flex items-center lg:pt-32 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        {/* Text content */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
            Event photos,{" "}
            <span className="text-violet-600">without the chase.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-500 leading-relaxed max-w-lg mx-auto">
            Hosts create an event. Guests scan a QR. Everyone gets the photos
            instantly.
          </p>

          {/* CTA buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-neumorphic-purple text-white text-base font-semibold rounded-full shadow-neumorphic active:shadow-neumorphic-inner hover:opacity-90 active:scale-95 transition-all"
            >
              Create Event
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-neumorphic text-gray-700 text-base font-semibold rounded-full shadow-neumorphic hover:shadow-neumorphic-sm active:shadow-neumorphic-inner transition-all"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Code-based Phone mockup */}
        <div className="mt-16 sm:mt-20 flex justify-center">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
