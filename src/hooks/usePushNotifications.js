import { useState, useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";

var BASE = import.meta.env.VITE_API_BASE;

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
  var [error, setError]             = useState(null);
  var subscribeAttempted            = useRef(false);

  var isNative = Capacitor.isNativePlatform();

  useEffect(function() {
    if (isNative) {
      // On native — check if already registered
      import("@capacitor/push-notifications").then(function(mod) {
        var PushNotifications = mod.PushNotifications;
        PushNotifications.checkPermissions().then(function(status) {
          setPermission(status.receive);
          if (status.receive === "granted") setSubscribed(true);
        });
      }).catch(function() {});
    } else {
      // On web
      if (!("Notification" in window)) return;
      setPermission(Notification.permission);
      if (Notification.permission === "granted" && "serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(function(reg) {
          reg.pushManager.getSubscription().then(function(sub) {
            if (sub) { setSubscribed(true); sendWebSubscriptionToServer(sub); }
          });
        });
      }
    }
  }, [isNative]);

  var sendWebSubscriptionToServer = async function(subscription) {
    try {
      var token = localStorage.getItem("runit_token");
      if (!token) return;
      await fetch(BASE + "/api/push/subscribe.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ subscription: subscription }),
      });
    } catch(e) { console.error("[Push] Web subscribe error:", e); }
  };

  var sendFcmTokenToServer = async function(fcmToken) {
    try {
      var token = localStorage.getItem("runit_token");
      if (!token) return;
      var user = JSON.parse(localStorage.getItem("runit_user") || "{}");
      await fetch(BASE + "/api/push/fcm_subscribe.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ fcm_token: fcmToken, role: user.role || "user" }),
      });
      console.log("[Push] FCM token sent to server");
    } catch(e) { console.error("[Push] FCM subscribe error:", e); }
  };

  var subscribe = async function() {
    if (subscribeAttempted.current) return;
    subscribeAttempted.current = true;
    setError(null);

    if (isNative) {
      // Native Capacitor push
      try {
        var { PushNotifications } = await import("@capacitor/push-notifications");

        var permResult = await PushNotifications.requestPermissions();
        setPermission(permResult.receive);

        if (permResult.receive !== "granted") {
          setError("Notification permission denied. Please enable in phone Settings.");
          subscribeAttempted.current = false;
          return;
        }

        await PushNotifications.register();

        PushNotifications.addListener("registration", async function(token) {
          console.log("[Push] FCM token:", token.value);
          await sendFcmTokenToServer(token.value);
          setSubscribed(true);
        });

        PushNotifications.addListener("registrationError", function(err) {
          console.error("[Push] Registration error:", err);
          setError("Failed to register for notifications");
          subscribeAttempted.current = false;
        });

        PushNotifications.addListener("pushNotificationReceived", function(notification) {
          console.log("[Push] Received:", notification);
          var data = notification.data || {};
          if (data.type === "new_order") {
            import("../services/NativePush").then(function(m) { m.playOrderAlert(); });
          }
        });

        PushNotifications.addListener("pushNotificationActionPerformed", function(action) {
          var url = (action.notification.data || {}).url || "/";
          window.location.hash = url;
        });

      } catch(e) {
        console.error("[Push] Native error:", e);
        setError(e.message);
      }
      subscribeAttempted.current = false;

    } else {
      // Web push
      if (!("Notification" in window)) {
        setError("Push notifications are not supported in this browser");
        subscribeAttempted.current = false;
        return;
      }

      try {
        var perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== "granted") {
          setError("Notification permission denied");
          subscribeAttempted.current = false;
          return;
        }

        var reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;

        var keyRes  = await fetch(BASE + "/api/push/vapid_public.php");
        var keyData = await keyRes.json();
        if (!keyData.publicKey) throw new Error("No VAPID key");

        var existing = await reg.pushManager.getSubscription();
        if (existing) {
          await sendWebSubscriptionToServer(existing);
          setSubscribed(true);
          subscribeAttempted.current = false;
          return;
        }

        var subscription = await reg.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
        });
        await sendWebSubscriptionToServer(subscription);
        setSubscribed(true);
      } catch(e) {
        console.error("[Push] Web error:", e);
        setError(e.message);
      }
      subscribeAttempted.current = false;
    }
  };

  return { permission, subscribed, subscribe, error, isNative };
}