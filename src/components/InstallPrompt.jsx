import { useState, useEffect } from "react";

export function useInstallPrompt() {
  var [canInstall, setCanInstall] = useState(false);
  var [installed,  setInstalled]  = useState(
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );

  useEffect(function() {
    // Check if prompt already captured before mount
    if (window.__pwaInstallPrompt && !installed) {
      setCanInstall(true);
    }

    var onReady = function() {
      if (!installed) setCanInstall(true);
    };

    var onInstalled = function() {
      setInstalled(true);
      setCanInstall(false);
      window.__pwaInstallPrompt = null;
    };

    window.addEventListener("pwaInstallReady", onReady);
    window.addEventListener("appinstalled",    onInstalled);

    return function() {
      window.removeEventListener("pwaInstallReady", onReady);
      window.removeEventListener("appinstalled",    onInstalled);
    };
  }, [installed]);

  var install = async function() {
    var prompt = window.__pwaInstallPrompt;
    if (!prompt) return false;
    prompt.prompt();
    var choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      setCanInstall(false);
      window.__pwaInstallPrompt = null;
      return true;
    }
    return false;
  };

  return { canInstall: canInstall && !installed, installed, install };
}

export default function InstallPrompt() {
  var { canInstall, install } = useInstallPrompt();
  var [dismissed, setDismissed] = useState(
    localStorage.getItem("runit_install_dismissed") === "1"
  );
  var [done, setDone] = useState(false);

  if (!canInstall || dismissed || done) return null;

  var handleInstall = async function() {
    var ok = await install();
    if (ok) setDone(true);
  };

  var handleDismiss = function() {
    localStorage.setItem("runit_install_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 500, padding: 16 }}>
      <div style={{ background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", borderRadius: "24px 24px 20px 20px", padding: "28px 24px 32px", width: "100%", maxWidth: 440, animation: "slideUp 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#0a1f1c", flexShrink: 0 }}>R</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>Add RunIt to Home Screen</div>
            <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>Install for faster access — works like an app</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {[
            { icon: "⚡", text: "Launches instantly from your home screen" },
            { icon: "🔔", text: "Push notifications for order updates" },
            { icon: "📱", text: "Full screen — no browser bar" },
            { icon: "📶", text: "Works even with slow connection" },
          ].map(function(item) {
            return (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--runit-muted)" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleInstall} style={{ flex: 1, padding: "14px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(0,201,167,0.3)" }}>
            📲 Install App
          </button>
          <button onClick={handleDismiss} style={{ padding: "14px 18px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}