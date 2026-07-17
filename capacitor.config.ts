import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bine.app',
  appName: 'BIne',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
