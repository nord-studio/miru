import type { NextConfig } from "next";
import { config } from "dotenv"

config({ path: "./../../.env" })

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/monitors",
        permanent: true
      }
    ]
  },
};

export default nextConfig;
