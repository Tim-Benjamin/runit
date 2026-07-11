import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

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