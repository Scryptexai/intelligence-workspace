import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Brand logos, entity marks and event thumbnails are hot-linked SVGs/JPEGs.
    // dangerouslyAllowSVG is safe here because every source is a static brand
    // asset (simpleicons, brand CDNs, Wikimedia, Pexels) — never user input.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "proicons.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "cryptologos.zenobank.io" },
      { protocol: "https", hostname: "curve.finance" },
      { protocol: "https", hostname: "logotyp.us" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;
