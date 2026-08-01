/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Legacy — safe to remove once every existing image URL in Firestore
      // has been re-uploaded/migrated to R2.
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Cloudflare R2's free *.r2.dev public dev domain
      { protocol: "https", hostname: "*.r2.dev" },
      // Your own custom domain mapped to the R2 bucket (see README), e.g.
      // media.godsarkmissions.org — set R2_PUBLIC_HOSTNAME in .env.local
      ...(process.env.R2_PUBLIC_HOSTNAME
        ? [{ protocol: "https", hostname: process.env.R2_PUBLIC_HOSTNAME }]
        : []),
    ],
  },
};
module.exports = nextConfig;
