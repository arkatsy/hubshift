const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    domains: [
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com",
      "fkkxzbkztdbqwcjltgcs.supabase.co",
    ],
  },
}

module.exports = withBundleAnalyzer(nextConfig)
