import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.safenest.mobile',
  appName: 'Safenest',
  webDir: 'dist',
  server: {
    // Required for camera permissions on Android WebView
    androidScheme: 'https',
  },
  android: {
    // Allow WebView to access camera via getUserMedia
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
