"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Feed", icon: "grid_view" },
    { href: "/dashboard/events", label: "Gallery", icon: "photo_library" },
    { href: "/vault", label: "Vault", icon: "cloud_done" },
    { href: "/dashboard/profile", label: "Profile", icon: "person" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 bg-background/90 backdrop-blur-2xl z-[100] md:hidden rounded-t-3xl shadow-[0_-8px_30px_rgb(189,157,255,0.04)] ring-1 ring-white/5">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-5 py-2 transition-all duration-200 rounded-2xl ${
              isActive
                ? "bg-primary/10 text-primary scale-110"
                : "text-on-surface-variant active:bg-surface-container-high scale-100"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span
              className={`font-body text-[10px] uppercase tracking-[0.1em] mt-1 ${isActive ? "font-bold" : "font-medium"}`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
