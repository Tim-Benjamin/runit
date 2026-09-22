import { Capacitor } from "@capacitor/core";

var BASE     = import.meta.env.VITE_API_BASE;
var _isNative = Capacitor.isNativePlatform();

export var isNative = function() { return _isNative; };

// ── Haptics ──────────────────────────────────────────────────────────────────

async function getHaptics() {
  if (!_isNative) return null;
  try {
    return await import("@capacitor/haptics");
  } catch { return null; }
}

export var hapticLight = async function() {
  var mod = await getHaptics();
  if (mod) { try { await mod.Haptics.impact({ style: mod.ImpactStyle.Light }); } catch {} }
  else if (navigator.vibrate) navigator.vibrate(30);
};

export var hapticMedium = async function() {
  var mod = await getHaptics();
  if (mod) { try { await mod.Haptics.impact({ style: mod.ImpactStyle.Medium }); } catch {} }
  else if (navigator.vibrate) navigator.vibrate(60);
};

export var hapticHeavy = async function() {
  var mod = await getHaptics();
  if (mod) { try { await mod.Haptics.impact({ style: mod.ImpactStyle.Heavy }); } catch {} }
  else if (navigator.vibrate) navigator.vibrate([100, 30, 100]);
};

export var hapticSuccess = async function() {
  var mod = await getHaptics();
  if (mod) { try { await mod.Haptics.notification({ type: mod.NotificationType.Success }); } catch {} }
  else if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
};

export var hapticError = async function() {
  var mod = await getHaptics();
  if (mod) { try { await mod.Haptics.notification({ type: mod.NotificationType.Error }); } catch {} }
  else if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
};

export var playOrderAlert = async function() {
  var mod = await getHaptics();
  if (mod) {
    try {
      await mod.Haptics.vibrate({ duration: 500 });
      await new Promise(function(r) { setTimeout(r, 200); });
      await mod.Haptics.vibrate({ duration: 500 });
      await new Promise(function(r) { setTimeout(r, 200); });
      await mod.Haptics.vibrate({ duration: 1000 });
    } catch {}
  } else if (navigator.vibrate) {
    navigator.vibrate([500, 200, 500, 200, 1000]);
  }
};

// ── Push Notifications ───────────────────────────────────────────────────────

var sendFcmTokenToServer = async function(fcmToken, role) {
  try {
    var token = localStorage.getItem("runit_token");
    if (!token) return;
    await fetch(BASE + "/api/push/fcm_subscribe.php", {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body:    JSON.stringify({ fcm_token: fcmToken, role: role }),
    });
    console.log("[NativePush] FCM token sent to server");
  } catch(e) {
    console.error("[NativePush] Failed to send token:", e);
  }
};

export var registerNativePush = async function(userRole) {
  if (!_isNative) return false;

  try {
    var { PushNotifications } = await import("@capacitor/push-notifications");

    // Check current permission first
    var current = await PushNotifications.checkPermissions();
    console.log("[NativePush] Current permission:", current.receive);

    var permResult = { receive: current.receive };
    if (current.receive === "prompt" || current.receive === "prompt-with-rationale") {
      permResult = await PushNotifications.requestPermissions();
    }

    if (permResult.receive !== "granted") {
      console.warn("[NativePush] Permission not granted:", permResult.receive);
      return false;
    }

    // Remove old listeners to avoid duplicates
    await PushNotifications.removeAllListeners();

    // Register with FCM
    await PushNotifications.register();

    PushNotifications.addListener("registration", async function(token) {
      console.log("[NativePush] FCM token:", token.value);
      await sendFcmTokenToServer(token.value, userRole);
    });

    PushNotifications.addListener("registrationError", function(err) {
      console.error("[NativePush] Registration error:", JSON.stringify(err));
    });

    PushNotifications.addListener("pushNotificationReceived", function(notification) {
      console.log("[NativePush] Foreground notification:", JSON.stringify(notification));
      var data = notification.data || {};
      if (data.type === "new_order") {
        playOrderAlert();
      } else {
        hapticSuccess();
      }
    });

    PushNotifications.addListener("pushNotificationActionPerformed", function(action) {
      var url = (action.notification.data || {}).url || "/";
      console.log("[NativePush] Notification tapped, navigating to:", url);
      window.location.hash = url;
    });

    console.log("[NativePush] Registered successfully");
    return true;

  } catch(e) {
    console.error("[NativePush] registerNativePush error:", e);
    return false;
  }
};