import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

var BASE = import.meta.env.VITE_API_BASE;

// Check if running as native app
export var isNative = function() {
  return Capacitor.isNativePlatform();
};

// Register for native push notifications
export var registerNativePush = async function(userRole) {
  if (!isNative()) return false;

  try {
    // Request permission
    var permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.log('[NativePush] Permission denied');
      return false;
    }

    // Local notification permission is separate from push permission
    // (required on iOS, and gates visibility on Android 13+) — request it
    // up front so playOrderAlert()'s schedule() call isn't silently a no-op.
    try {
      await LocalNotifications.requestPermissions();
    } catch (e) {
      console.error('[NativePush] Local notification permission error:', e);
    }

    // Listeners must be attached BEFORE calling register() — the
    // 'registration' event (carrying the FCM token) can fire as soon as
    // register() kicks off native registration, and if it fires before
    // the listener exists, the token is missed entirely.
    PushNotifications.addListener('registration', async function(token) {
      console.log('[NativePush] FCM token:', token.value);
      await sendFcmTokenToServer(token.value, userRole);
    });

    PushNotifications.addListener('registrationError', function(err) {
      console.error('[NativePush] Registration error:', err);
    });

    // Handle notification received while app is open
    PushNotifications.addListener('pushNotificationReceived', async function(notification) {
      console.log('[NativePush] Received:', notification);
      var data = notification.data || {};

      if (data.type === 'new_order' && userRole === 'runner') {
        // Play the order ringtone-style alert
        await playOrderAlert();
      } else {
        // Regular vibration for other notifications
        await hapticSuccess();
      }
    });

    // Handle notification tap
    PushNotifications.addListener('pushNotificationActionPerformed', function(action) {
      var data = action.notification.data || {};
      var url  = data.url || '/';
      // Bridge into React Router — this runs outside the React tree, so it
      // can't call useNavigate() directly. Something with router access
      // (e.g. a listener in App.jsx) needs to pick this event up and call
      // navigate(url) itself.
      window.dispatchEvent(new CustomEvent('capacitor-navigate', { detail: { url } }));
    });

    // Register with FCM — after all listeners are attached
    await PushNotifications.register();

    return true;
  } catch(e) {
    console.error('[NativePush] Setup error:', e);
    return false;
  }
};

// Send FCM token to your PHP backend
var sendFcmTokenToServer = async function(fcmToken, role) {
  try {
    var token = localStorage.getItem('runit_token');
    if (!token) return;
    await fetch(BASE + '/api/push/fcm_subscribe.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ fcm_token: fcmToken, role: role }),
    });
    console.log('[NativePush] FCM token sent to server');
  } catch(e) {
    console.error('[NativePush] Failed to send token:', e);
  }
};

// ── Haptics — lazily imported so a haptics-specific load failure can't
// take down push registration above, which doesn't need this module at all. ──
async function getHaptics() {
  if (!isNative()) return null;
  try {
    var mod = await import('@capacitor/haptics');
    return mod;
  } catch (e) {
    console.error('[NativePush] Haptics module failed to load:', e);
    return null;
  }
}

// Ringtone-style alert for new orders (runners)
export var playOrderAlert = async function() {
  if (!isNative()) return;

  try {
    var mod = await getHaptics();
    if (mod) {
      // Urgent vibration pattern — like Uber driver alert
      // On Android this ignores silent mode for high-priority channels
      await mod.Haptics.vibrate({ duration: 500 });
      await new Promise(function(r) { setTimeout(r, 200); });
      await mod.Haptics.vibrate({ duration: 500 });
      await new Promise(function(r) { setTimeout(r, 200); });
      await mod.Haptics.vibrate({ duration: 1000 });
    } else if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 1000]);
    }

    // Show local notification with sound (this plays even on silent for HIGH priority channel)
    await LocalNotifications.schedule({
      notifications: [{
        id:       Date.now(),
        title:    '🏃 New Order Available!',
        body:     'Tap to view and accept the order',
        sound:    'order_alert.wav',
        channelId: 'order_alerts',
        extra: { type: 'new_order' },
        schedule: { at: new Date(Date.now() + 100) },
      }]
    });
  } catch(e) {
    console.error('[NativePush] Alert error:', e);
  }
};

// Standard haptic for buttons
export var hapticLight = async function() {
  var mod = await getHaptics();
  if (mod) {
    await mod.Haptics.impact({ style: mod.ImpactStyle.Light });
  } else if (navigator.vibrate) {
    navigator.vibrate(30);
  }
};

export var hapticMedium = async function() {
  var mod = await getHaptics();
  if (mod) {
    await mod.Haptics.impact({ style: mod.ImpactStyle.Medium });
  } else if (navigator.vibrate) {
    navigator.vibrate(60);
  }
};

export var hapticHeavy = async function() {
  var mod = await getHaptics();
  if (mod) {
    await mod.Haptics.impact({ style: mod.ImpactStyle.Heavy });
  } else if (navigator.vibrate) {
    navigator.vibrate([100, 30, 100]);
  }
};

export var hapticSuccess = async function() {
  var mod = await getHaptics();
  if (mod) {
    await mod.Haptics.notification({ type: mod.NotificationType.Success });
  } else if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50]);
  }
};

export var hapticError = async function() {
  var mod = await getHaptics();
  if (mod) {
    await mod.Haptics.notification({ type: mod.NotificationType.Error });
  } else if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  }
};