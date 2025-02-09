import type { NextConfig } from "next";

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
