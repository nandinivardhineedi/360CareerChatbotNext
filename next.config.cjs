const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config if any
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
      "@/lib": path.resolve(__dirname, "lib"),
    };
    return config;
  },
};

module.exports = nextConfig;
