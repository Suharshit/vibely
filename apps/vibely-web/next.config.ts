import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Turborepo monorepo: transpile shared package ─────────────
  transpilePackages: ["@repo/shared"],

  // ── Image optimization ────────────────────────────────────────
  // WHY configure remotePatterns instead of domains?
  // domains is deprecated in Next.js 13+. remotePatterns is more
  // specific — you can restrict to exact hostnames and path prefixes.
  images: {
    remotePatterns: [
      {
        // ImageKit CDN
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
      {
        // Supabase Storage (avatars and covers are public)
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // ── Security headers ──────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent browsers from MIME-sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Control referrer in cross-origin requests
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy — disable unnecessary browser APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────────
  async redirects() {
    return [];
  },

  // ── Build options ─────────────────────────────────────────────
  // Fail the build on TypeScript errors (good for CI)
  typescript: {
    ignoreBuildErrors: false,
  },

  // ── Experimental ─────────────────────────────────────────────
  experimental: {
    // Improves cold start time on Vercel serverless functions
    serverMinification: true,
  },
};

export default nextConfig;
