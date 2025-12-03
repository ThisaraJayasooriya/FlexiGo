import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
};

// @ts-expect-error - Type mismatch between Next.js 16 and next-pwa types
export default withPWA(nextConfig) as NextConfig;
