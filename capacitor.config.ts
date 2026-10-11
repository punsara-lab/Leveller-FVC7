import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.fvc7.tracker',
  appName: 'FVC7',
  webDir: 'dist',
  // No remote server: the Android app ships the built web assets and runs fully offline.
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0a',
      showSpinner: false
    }
  }
};

export default config;
