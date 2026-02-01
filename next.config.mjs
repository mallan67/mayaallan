/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    return [
      // Redirect non-www to www for SEO consistency
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "mayaallan.com",
          },
        ],
        destination: "https://www.mayaallan.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
