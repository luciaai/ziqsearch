// next.config.js
// Environment configuration is handled through Next.js built-in env support

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['https://localhost:3000'],
  compiler: {
    // if NODE_ENV is production, remove console.log
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
          exclude: ['error'],
        }
        : false,
  },
  experimental: {
    useCache: true,
    optimizePackageImports: ['@phosphor-icons/react', '@daytonaio/sdk'],
    nodeMiddleware: true,
    serverActions: {
      bodySizeLimit: '10mb',
    },
    staleTimes: {
      dynamic: 10,
      static: 30,
    },
    reactCompiler: true,
  },
  transpilePackages: ['geist'],
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/ph',
        destination: 'https://www.producthunt.com/posts/scira',
        permanent: true,
      },
      {
        source: '/raycast',
        destination: 'https://www.raycast.com/zaidmukaddam/scira',
        permanent: true,
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '**',
      },
      // Google Favicon Service - comprehensive patterns
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/s2/favicons/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/s2/favicons',
      },
      // Google Maps Static API
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
