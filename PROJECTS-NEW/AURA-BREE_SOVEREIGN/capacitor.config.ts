import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.godsimij.aura_bree',
  appName: 'AURA-BREE',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Uncomment for dev if loading from Netlify
    // url: 'https://aura-bree-mobile.netlify.app',
    // cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
