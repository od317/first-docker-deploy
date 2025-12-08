import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    API_URL: process.env.API_URL,
  },
  output: "standalone", // ← CRITICAL for Docker production
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://backend:8000"
        }/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

// for testing bundle analyzer
// /** @type {import('next').NextConfig} */
// import type { NextConfig } from "next";

// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

// const nextConfig: NextConfig = {
//   /* config options here */
//   env: {
//     API_URL: process.env.API_URL,
//   },
// };

// module.exports = withBundleAnalyzer(nextConfig)
