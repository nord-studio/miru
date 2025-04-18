import type { NextConfig } from "next";
import { config } from "dotenv"

if (process.env.NODE_ENV === "development") config({ path: "./../../.env" });

const nextConfig: NextConfig = {
  transpilePackages: ["shiki"],
  modularizeImports: {
    "@radix-ui/react-icons/?(((\\w*)?/?)*)": {
      transform: '@radix-ui/react-icons/{{ matches.[1] }}/{{member}}'
    }
  }
};

export default nextConfig;
