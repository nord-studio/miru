import type { NextConfig } from "next";
import { config } from "dotenv"

if (process.env.NODE_ENV === "development") config({ path: "./../../.env" });

const nextConfig: NextConfig = {
  transpilePackages: ["shiki"],
};

export default nextConfig;
