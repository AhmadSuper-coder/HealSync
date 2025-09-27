import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Re-enabled after performance testing
  experimental: {
    optimizePackageImports: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', 'lucide-react'],
  },
  // Allow all dev origins for Replit proxy
  allowedDevOrigins: [
    "*.replit.dev",
    "*.repl.co",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://dash.jsonformatters.online",
    "https://dash.jsonformatters.online"
  ],

  // Allow all hosts for Replit proxy
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
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