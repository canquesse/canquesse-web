import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static output — Cloudflare Pages serves plain files, so the site has
  // no server surface at all. Requires every route to be client-rendered.
  output: "export",
  // Trailing slashes keep Cloudflare Pages' static routing predictable
  // (/about -> /about/index.html).
  trailingSlash: true,
  // next/image's optimizer needs a server; static export has none.
  images: { unoptimized: true },
  // Hide the Next.js dev indicator (the floating "N" badge, dev-only).
  devIndicators: false,
  // Pin the workspace root so the stray lockfile in the home directory
  // doesn't confuse Turbopack (silences the dev "1 Issue" warning).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
