import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bmgkxhbdmoblfdsqtnlk.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  serverExternalPackages: ["@supabase/ssr"],
  // Ensure middleware is properly traced
  outputFileTracingIncludes: {
    "/": ["./middleware.ts"],
  },
};

export default nextConfig;
