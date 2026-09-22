import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.runitgh.app',
  appName: 'RunIt',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // DEV MODE: pointing the app at the live site so it always loads
    // current code without a rebuild/sync cycle, and so we can tell
    // whether a bug is a stale local build or a real code issue.
    // ⚠ REMOVE both lines below before building a production APK/AAB —
    // a real install should load the bundled dist/ files, not require
    // hitting the server just to render its UI.
    url: 'https://runitgh.com',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration:    2500,
      launchAutoHide:        true,
      launchFadeOutDuration: 500,
      backgroundColor:       '#0a1f1c',
      androidSplashResourceName: 'splash',
      androidScaleType:      'CENTER_CROP',
      showSpinner:           false,
      splashFullScreen:      true,
      splashImmersive:       true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#00c9a7',
      sound: 'order_alert.wav',
    },
  },
  android: {
    buildOptions: {
      keystorePath: 'runit.keystore',
      keystoreAlias: 'runit',
    },
  },
};

export default config;