// src/hooks/usePushNotifications.js
import { useState, useEffect } from 'react';

// Paste your VAPID public key here after running generate_vapid.php
const VAPID_PUBLIC_KEY = localStorage.getItem('runit_vapid_public') || '';

function urlBase64ToUint8Array(base64String) {
  try {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var output  = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; i++) {
      output[i] = rawData.charCodeAt(i);
    }
    return output;
  } catch (e) {
    return null;
  }
}

function isSupported() {
  return (
    'serviceWorker' in navigator &&
    'PushManager'   in window    &&
    'Notification'  in window
  );
}

export default function usePushNotifications() {
  var [permission, setPermission]   = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  var [subscribed, setSubscribed]   = useState(false);
  var [loading, setLoading]         = useState(false);
  var [error, setError]             = useState('');
  var [vapidKey, setVapidKey]       = useState(VAPID_PUBLIC_KEY);

  // On mount: fetch VAPID public key from server + check existing subscription
  useEffect(function() {
    if (!isSupported()) return;

    // Fetch VAPID public key from server
    fetch('http://localhost/runit-backend/api/push/vapid_public.php')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.publicKey) {
          setVapidKey(d.publicKey);
          localStorage.setItem('runit_vapid_public', d.publicKey);
        }
      })
      .catch(function() {});

    // Check if already subscribed
    navigator.serviceWorker.ready.then(function(reg) {
      reg.pushManager.getSubscription().then(function(sub) {
        setSubscribed(!!sub);
      });
    }).catch(function() {});
  }, []);

  var subscribe = async function() {
    if (!isSupported()) {
      setError('Push notifications are not supported in this browser.');
      return false;
    }

    if (!vapidKey) {
      setError('Push service not configured yet. Please try again shortly.');
      return false;
    }

    var key = urlBase64ToUint8Array(vapidKey);
    if (!key) {
      setError('Invalid push configuration. Check VAPID key.');
      return false;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Register service worker
      var reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 2. Request permission
      var perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setError('Notification permission was denied. Please allow notifications in your browser settings.');
        setLoading(false);
        return false;
      }

      // 3. Subscribe to push
      var sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: key,
      });

      // 4. Save subscription to server
      var token = localStorage.getItem('runit_token');
      var res   = await fetch('http://localhost/runit-backend/api/push/subscribe.php', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  'Bearer ' + token,
        },
        body: JSON.stringify(sub.toJSON()),
      });

      if (res.ok) {
        setSubscribed(true);
        setError('');
        setLoading(false);
        return true;
      } else {
        var data = await res.json();
        setError(data.error || 'Failed to save subscription on server.');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Failed: ' + (err.message || 'Unknown error'));
      setLoading(false);
      return false;
    }
  };

  var unsubscribe = async function() {
    setLoading(true);
    try {
      var reg = await navigator.serviceWorker.ready;
      var sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        setSubscribed(false);
      }
    } catch (err) {
      setError('Failed to unsubscribe: ' + err.message);
    }
    setLoading(false);
  };

  return { permission, subscribed, loading, subscribe, unsubscribe, error, isSupported: isSupported() };
}