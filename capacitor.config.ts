import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.chanelmunezero.recipe',
  appName: 'Forked',
  webDir: 'out',
  server: {
    // Allow external API requests
    allowNavigation: ['recipe.chanelmunezero.com'],
    // Use native HTTP for external requests (bypasses WKWebView restrictions)
    iosScheme: 'capacitor',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  ios: {
    // Recommended iOS settings
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
  },
}

export default config
