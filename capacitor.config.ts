import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.chanelmunezero.recipe',
  appName: 'Recipe',
  webDir: 'out',
  server: {
    // Use the deployed API for all requests
    url: process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : undefined,
    cleartext: true, // Allow HTTP for local dev
  },
  ios: {
    // Recommended iOS settings
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
  },
  plugins: {
    // Plugin configurations will be added as we install them
  },
}

export default config
