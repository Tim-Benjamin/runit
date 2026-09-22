import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.runitgh.app',
  appName: 'RunIt',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration:        0,
      launchAutoHide:            false,
      backgroundColor:           '#0a1f1c',
      androidSplashResourceName: 'splash',
      androidScaleType:          'CENTER_CROP',
      showSpinner:               false,
      splashFullScreen:          false,
      splashImmersive:           false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon:  'ic_stat_icon_config_sample',
      iconColor:  '#00c9a7',
      sound:      'order_alert.wav',
    },
  },
  android: {
    buildOptions: {
      keystorePath:  'runit.keystore',
      keystoreAlias: 'runit',
    },
  },
};

export default config;