import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '**', // Allow all paths from ImageKit
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '**', // Allow all paths from Placehold.co
      },
    ],
  },
};

export default nextConfig;
