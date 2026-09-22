// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  var [user, setUser]       = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    var stored = localStorage.getItem('runit_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { localStorage.removeItem('runit_user'); }
    }
    setLoading(false);
  }, []);

  var login = function(userData, token) {
    localStorage.setItem('runit_token', token);
    localStorage.setItem('runit_user', JSON.stringify(userData));
    setUser(userData);

    if (Capacitor.isNativePlatform()) {
      // Native Android/iOS — use FCM via NativePush
      setTimeout(function() {
        import('../services/NativePush').then(function(mod) {
          mod.registerNativePush(userData.role);
        }).catch(function(e) {
          console.error('[Auth] NativePush import failed:', e);
        });
      }, 1000);
    } else {
      // Web — use VAPID push
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setTimeout(function() {
          import('../hooks/usePushNotifications').then(function(mod) {
            // usePushNotifications is a hook so we can't call it here directly.
            // Instead dispatch an event that PushPrompt.jsx listens for
            // and calls subscribe() from inside the React tree.
            window.dispatchEvent(new CustomEvent('runit-auto-subscribe'));
          }).catch(function() {});
        }, 2000);
      }
    }
  };

  var logout = function() {
    localStorage.removeItem('runit_token');
    localStorage.removeItem('runit_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}