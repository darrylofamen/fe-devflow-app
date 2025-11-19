import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enables the React Compiler (formerly React Forget), which automatically
  // memoizes components and optimizes re-renders. This is stable in Next.js 16
  // and improves performance without needing manual useMemo/useCallback.
  reactCompiler: true,

  experimental: {
    // Enables Turbopack's filesystem cache during development.
    // This stores compiled artifacts on disk so that subsequent dev server
    // launches and hot reloads are significantly faster.
    // Still experimental in Next.js 16.
    turbopackFileSystemCacheForDev: true,
  },

  serverExternalPackages: ["pino", "pino-pretty"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
