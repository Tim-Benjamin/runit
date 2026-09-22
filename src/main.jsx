import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

// Register service worker immediately, before React mounts, so it's
// installing/activating as early as possible rather than waiting on
// a component to request it later.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(function(reg) {
        console.log('[SW] Registered:', reg.scope);
        // Check for updates every hour
        setInterval(function() { reg.update(); }, 3600000);
      })
      .catch(function(err) {
        console.error('[SW] Registration failed:', err);
      });
  });
}

// Capture install prompt BEFORE React mounts — store it globally
window.__pwaInstallPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  window.__pwaInstallPrompt = e;
  // Dispatch custom event so any mounted components can react
  window.dispatchEvent(new Event('pwaInstallReady'));
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

if (Capacitor.isNativePlatform()) {
  // Wait for the next two animation frames so the browser has actually
  // painted the mounted app before hiding the splash — calling hide()
  // immediately after render() can race ahead of the real paint and
  // show a blank flash first. Pairs with launchAutoHide: false in
  // capacitor.config.ts, so this call is what actually controls timing
  // rather than fighting a fixed auto-hide timer.
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      SplashScreen.hide({ fadeOutDuration: 500 });
    });
  });
}