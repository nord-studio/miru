import type { NextConfig } from "next";
import { config } from "dotenv"

if (process.env.NODE_ENV === "development") config({ path: "./../../.env" });

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["shiki"],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb"
    },
    authInterrupts: true,
  },
  generateBuildId: async () => {
    const response = await fetch("https://api.github.com/repos/nord-studio/miru/commits/main");
    if (!response.ok) {
      throw new Error("Failed to fetch the latest commit SHA");
    }
    const data = await response.json();
    return data.sha;
  },
  poweredByHeader: false,
};

export default nextConfig;
