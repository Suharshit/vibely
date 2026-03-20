"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function BottomCTA() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto relative rounded-3xl p-16 text-center overflow-hidden border border-primary/10 outline-3 outline-primary/80 hover:outline-primary/60 transition-all duration-300 shadow-lg shadow-primary/80">
        <div className="absolute inset-0 bg-surface-container-high -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 -z-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="text-4xl md:text-5xl font-headline font-extrabold mb-8 tracking-tight text-on-surface">
          Ready to capture the vibe?
        </h2>
        <p className="text-on-surface-variant text-lg mb-12 max-w-lg mx-auto">
          Join thousands of hosts making their events unforgettable. Start your
          first gallery in 30 seconds.
        </p>
        <Link
          href={isAuthenticated ? "/events/create" : "/login"}
          className="inline-block px-10 py-5 bg-gradient-to-r from-primary to-primary-dim text-on-primary-container font-bold rounded-2xl text-xl hover:scale-102 active:scale-98 transition-transform shadow-[0_20px_50px_rgba(189,157,255,0.2)]"
        >
          Create Your First Event — Free
        </Link>
      </div>
    </section>
  );
}
