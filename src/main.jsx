import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Capacitor } from '@capacitor/core';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(function(reg) {
        console.log('[SW] Registered:', reg.scope);
        setInterval(function() { reg.update(); }, 3600000);
      })
      .catch(function(err) {
        console.error('[SW] Registration failed:', err);
      });
  });
}

window.__pwaInstallPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  window.__pwaInstallPrompt = e;
  window.dispatchEvent(new Event('pwaInstallReady'));
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

// Hide splash only on native — wait 1.5s so the app fully paints
if (Capacitor.isNativePlatform()) {
  import('@capacitor/splash-screen').then(function(mod) {
    setTimeout(function() {
      mod.SplashScreen.hide({ fadeOutDuration: 400 });
    }, 1500);
  });
}