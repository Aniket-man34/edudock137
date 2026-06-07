/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "edudock.in" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/share/updates/:slug",
        destination: "/updates/:slug",
        permanent: true,
      },
      {
        source: "/share/pdfs/:slug",
        destination: "/pdfs/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
