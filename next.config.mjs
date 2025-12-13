/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip linting during builds (handled separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Required for static export
  images: {
    unoptimized: true,
  },

  // Trailing slashes for better static file serving
  trailingSlash: true,
}

// Static export for Capacitor iOS builds only
// Run with: STATIC_EXPORT=true npm run build
if (process.env.STATIC_EXPORT === 'true') {
  nextConfig.output = 'export'
}

export default nextConfig