import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent workspace root inference warning from parent lockfile
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
