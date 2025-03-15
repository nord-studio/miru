import type { NextConfig } from "next";
import { config } from "dotenv"

config({ path: "./../../.env" })

const nextConfig: NextConfig = {
  transpilePackages: ["shiki"],
};

export default nextConfig;
