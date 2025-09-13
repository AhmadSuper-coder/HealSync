import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@pages': path.resolve(__dirname, 'page-components'),
    };

    // Fix "process is not defined" errors on client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "process": "process/browser",
        "path": false,
        "fs": false,
        "crypto": false,
      };
    }

    return config;
  },
};

export default nextConfig;