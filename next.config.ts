import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['next-auth'],
}
export default nextConfig