import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Support isolated build directory when dev server is running concurrently
  distDir: process.env['NEXT_DIST_DIR'] || '.next',

  // Enable React strict mode for improved development experience
  reactStrictMode: true,

  // Transpile monorepo workspace packages
  transpilePackages: ['@numu/database', '@numu/types'],

  // Enable typed routes
  typedRoutes: true,

  // Compiler optimization for lucide-react barrel imports
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Standalone output is recommended for containerized builds (Docker)
  ...(process.env['DOCKER_BUILD'] ? { output: 'standalone' } : {}),

  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    const backendUrl = process.env['BACKEND_URL'] || 'http://localhost:4000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
