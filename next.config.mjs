/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removed to allow API routes and Middleware
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
