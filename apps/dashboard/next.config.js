/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@oneatlas/ui",
    "@oneatlas/db",
    "@oneatlas/deployment",
    "@oneatlas/integrations",
    "@oneatlas/metadata",
    "@oneatlas/ai",
    "@oneatlas/workflows"
  ]
};

module.exports = nextConfig;
