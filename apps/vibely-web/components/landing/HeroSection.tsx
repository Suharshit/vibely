"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative px-6 max-w-7xl mx-auto text-center hero-gradient pb-24 pt-32 rounded-xl">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/10 mb-8">
        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
        <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
          New: AI Auto-Curation
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight text-on-surface mb-6 leading-[1.1]">
        Your Memories, <br />
        <span
          className="text-transparent bg-clip-text"
          style={{
            backgroundImage:
              "linear-gradient(to right, #bd9dff, #b28cff, #c38bf5)",
          }}
        >
          Shared Beautifully.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
        Vibely is the digital keepsake for your modern events. High-fidelity
        guest uploads without the friction of app downloads or account creation.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
        <Link
          href={isAuthenticated ? "/events/create" : "/login"}
          className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary-black font-bold rounded-xl text-lg hover:shadow-[0_0_14px_theme(colors.primary/10%)] transition-all transform active:scale-95 flex items-center justify-center"
        >
          Create Your First Event — Free
        </Link>
        <Link
          href="/demo"
          className="w-full sm:w-auto px-8 py-4 glass-card text-on-surface font-semibold rounded-xl text-lg hover:bg-surface-container-highest transition-all border border-outline-variant/10 flex items-center justify-center"
        >
          View Demo Gallery
        </Link>
      </div>

      {/* Product Mockup Container */}
      <div className="relative max-w-5xl mx-auto">
        <div className="relative glass-card rounded-2xl overflow-hidden outline-3 outline-primary shadow-lg shadow-primary/80 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full aspect-video object-cover opacity-90"
            alt="Vibrant event gallery preview with grid of high quality photos"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY0kFnV0GWHF4rhdH92G7TRIqRD2e6ofco0iScB6jUh11dcjZzkWLdFYKzvc3aADjxGXTdfx8aIUyC38ebzvxVeC0e2SG6v6y_2kiCevqtPw4S8LHVHc4po_Tk2-4JKkwWe3XqMq8lnhqv5YvY6c8gtmLk5TFv-u6-XSzb1HDkDrgDEy_3ffkvYH57iNW8G2nVXpTSHqRblko3xx6IgYG4v0GWzlI8AeFlkkA1dsaO9r-053ddutxM1VMS5osLs2zKSOccJ6Qba5P-"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
            <div className="text-left">
              <p className="font-headline font-bold text-2xl">
                Summer Gala 2024
              </p>
              <p className="text-on-surface-variant text-sm">
                482 photos shared by 86 guests
              </p>
            </div>
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="User avatar 1"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRVUIYHI8Uv6SGoUfFt99pnH8DGdgS-6vOKOeBmFipjYn1MPvSvyscfOLH7RjhPQdhcB7cu6WNy-eMQfG63f4uj9EDOM3gkA9N2ADh_LQGa43f1S71yAkfFf4LNZLUvDFuHroQYAx_a-vzYgNWVBdA_iyJOyzR4nwPg1HcXMpvQzuQ8523ODwI-BMfzXI0y4u_4MN76puG0JzDPfczA3aRL1HRJTlDQq8588islELtlazhJ3SHo6SjGssJzJLheSKVkRzDlwRvIfwj"
                />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  alt="User avatar 2"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv5QZu3Mz8avGw2KGyuIq93hBtsQhKla18cuzK4DX__Xzs_Fj5APNOvA-MOzTUaziarbyRLV5K_ZOi1So82gTql2zTc-7vKK2kpGd-ua2NM-y88FY1QhY-Rsa8H5biRLrVIB89fzxy97pQRbKQiKWG6io6Tid74BwmW4YTerKOqREkcWH1nXMzx8JmiYRPlMFhLpePiousT28kiSLxugz9V0W9m5mDyV0bDQZvWBIZqR6TSJeGrO12rjDp3_6jw3t3fX-oBpz_bjyX"
                />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container flex items-center justify-center text-[10px] font-bold text-primary">
                +84
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof mapped into Hero */}
      <section className="pt-24 pb-8 bg-transparent overflow-hidden">
        <p className="text-center text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant mb-10">
          Trusted by event creators globally
        </p>
        <div className="flex justify-center items-center gap-12 md:gap-24 opacity-40 grayscale brightness-200 px-6">
          <span className="text-xl font-headline font-black tracking-tighter">
            LUMINA
          </span>
          <span className="text-xl font-headline font-black tracking-tighter">
            ETHER
          </span>
          <span className="text-xl font-headline font-black tracking-tighter">
            PRISM
          </span>
          <span className="text-xl font-headline font-black tracking-tighter">
            VELVET
          </span>
          <span className="text-xl font-headline font-black tracking-tighter">
            NOVA
          </span>
        </div>
      </section>
    </section>
  );
}
