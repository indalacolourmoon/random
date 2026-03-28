import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb"
    },
    //@ts-ignore
    turbopack: {
      root: "./"
    }
  },
  images: {
    qualities: [75, 90, 100]
  }
};

export default nextConfig;