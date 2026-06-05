/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removed to allow API routes and Middleware
  // ESLint config (eslint-config-next) targets a newer eslint than installed; don't fail the build on lint.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  turbopack: {
    root: '.',
  },
};

export default nextConfig;
