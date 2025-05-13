import type { NextConfig } from "next";
import { config } from "dotenv"

if (process.env.NODE_ENV === "development") config({ path: "./../../.env" });

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["shiki"],
  modularizeImports: {
    "@radix-ui/react-icons/?(((\\w*)?/?)*)": {
      transform: '@radix-ui/react-icons/{{ matches.[1] }}/{{member}}'
    }
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb"
    },
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
