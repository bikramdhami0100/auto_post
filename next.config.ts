import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  trailingSlash: true,
};

export default nextConfig;
