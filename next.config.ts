import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['next-auth'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}
export default nextConfig