import { useState, useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";

var BASE      = import.meta.env.VITE_API_BASE;
var _isNative = Capacitor.isNativePlatform();

function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - base64String.length % 4) % 4);
  var base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  var rawData = window.atob(base64);
  var output  = new Uint8Array(rawData.length);
  for (var i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

export default function usePushNotifications() {
  var [permission, setPermission]   = useState("default");
  var [subscribed, setSubscribed]   = useState(false);
  var [loading, setLoading]         = useState(false);
  var [error, setError]             = useState(null);
  var [isSupported, setIsSupported] = useState(true);
  var attempted                     = useRef(false);

  useEffect(function() {
    if (_isNative) {
      // Check native permission status
      import("@capacitor/push-notifications").then(function(mod) {
        mod.PushNotifications.checkPermissions().then(function(status) {
          setPermission(status.receive);
          if (status.receive === "granted") setSubscribed(true);
        }).catch(function(e) {
          console.error("[Push] checkPermissions error:", e);
        });
      }).catch(function() {
        setIsSupported(false);
      });
    } else {
      // Web
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        setIsSupported(false);
        return;
      }
      setPermission(Notification.permission);
      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(function(reg) {
          reg.pushManager.getSubscription().then(function(sub) {
            if (sub) setSubscribed(true);
          });
        });
      }
    }
  }, []);

  var sendTokenToServer = async function(token, type) {
    try {
      var authToken = localStorage.getItem("runit_token");
      if (!authToken) return;
      var user = JSON.parse(localStorage.getItem("runit_user") || "{}");
      var endpoint = type === "fcm"
        ? BASE + "/api/push/fcm_subscribe.php"
        : BASE + "/api/push/subscribe.php";
      var body = type === "fcm"
        ? JSON.stringify({ fcm_token: token, role: user.role || "user" })
        : JSON.stringify({ subscription: token });
      await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + authToken },
        body:    body,
      });
      console.log("[Push] Token sent to server (" + type + ")");
    } catch(e) {
      console.error("[Push] Failed to send token:", e);
    }
  };

  var subscribe = async function() {
    if (attempted.current) return false;
    attempted.current = true;
    setLoading(true);
    setError(null);

    try {
      if (_isNative) {
        var { PushNotifications } = await import("@capacitor/push-notifications");

        var current = await PushNotifications.checkPermissions();
        var perm    = { receive: current.receive };

        if (current.receive !== "granted") {
          perm = await PushNotifications.requestPermissions();
        }

        setPermission(perm.receive);

        if (perm.receive !== "granted") {
          setError("Notification permission denied. Enable in phone Settings → Apps → RunIt → Notifications.");
          setLoading(false);
          attempted.current = false;
          return false;
        }

        await PushNotifications.removeAllListeners();
        await PushNotifications.register();

        PushNotifications.addListener("registration", async function(token) {
          console.log("[Push] FCM token received:", token.value.substring(0, 20) + "...");
          await sendTokenToServer(token.value, "fcm");
          setSubscribed(true);
        });

        PushNotifications.addListener("registrationError", function(err) {
          console.error("[Push] Registration error:", JSON.stringify(err));
          setError("Failed to register for notifications: " + JSON.stringify(err));
          attempted.current = false;
        });

        PushNotifications.addListener("pushNotificationReceived", function(notification) {
          console.log("[Push] Foreground notification:", notification.title);
          var data = notification.data || {};
          if (data.type === "new_order") {
            import("../services/NativePush").then(function(m) { m.playOrderAlert(); });
          } else {
            import("../services/NativePush").then(function(m) { m.hapticSuccess(); });
          }
        });

        PushNotifications.addListener("pushNotificationActionPerformed", function(action) {
          var url = (action.notification.data || {}).url || "/";
          window.location.hash = url;
        });

        setLoading(false);
        return true;

      } else {
        // Web push
        if (!("Notification" in window)) {
          setIsSupported(false);
          setError("Push notifications are not supported in this browser");
          setLoading(false);
          attempted.current = false;
          return false;
        }

        var webPerm = await Notification.requestPermission();
        setPermission(webPerm);

        if (webPerm !== "granted") {
          setError("Notification permission denied");
          setLoading(false);
          attempted.current = false;
          return false;
        }

        var reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;

        var keyRes  = await fetch(BASE + "/api/push/vapid_public.php");
        var keyData = await keyRes.json();
        if (!keyData.publicKey) throw new Error("No VAPID key from server");

        var existing = await reg.pushManager.getSubscription();
        if (existing) {
          await sendTokenToServer(existing, "vapid");
          setSubscribed(true);
          setLoading(false);
          attempted.current = false;
          return true;
        }

        var sub = await reg.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
        });
        await sendTokenToServer(sub, "vapid");
        setSubscribed(true);
        setLoading(false);
        attempted.current = false;
        return true;
      }

    } catch(e) {
      console.error("[Push] subscribe error:", e);
      setError(e.message || "Failed to enable notifications");
      setLoading(false);
      attempted.current = false;
      return false;
    }
  };

  return { permission, subscribed, loading, error, isSupported, subscribe, isNative: _isNative };
}