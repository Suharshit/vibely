import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const imagekitHostname = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  ? new URL(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
      ...(imagekitHostname && imagekitHostname !== "ik.imagekit.io"
        ? [
            {
              protocol: "https" as const,
              hostname: imagekitHostname,
              pathname: "/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: supabaseHostname ?? "example.supabase.co",
        pathname: "/**",
      },
    ],
  },
  transpilePackages: ["@repo/shared"],
};

export default nextConfig;
