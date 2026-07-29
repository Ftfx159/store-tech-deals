/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: '*.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
    ],
  },
  serverExternalPackages: ['amazon-paapi'],
  typescript: { ignoreBuildErrors: true },
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;
