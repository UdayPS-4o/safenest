import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.safenest.mobile',
  appName: 'Safenest',
  webDir: 'dist',
  server: {
    // Load the live production app — no local build needed
    url: 'https://safenest.udayps.com',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
