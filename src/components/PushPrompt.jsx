import { useState } from "react";
import usePushNotifications from "../hooks/usePushNotifications";

function isBrave() {
  return typeof navigator.brave !== "undefined";
}

export default function PushPrompt() {
  var push = usePushNotifications();
  var [dismissed, setDismissed] = useState(
    localStorage.getItem("runit_push_dismissed") === "1"
  );
  var [done, setDone] = useState(false);

  var dismiss = function() {
    localStorage.setItem("runit_push_dismissed", "1");
    setDismissed(true);
  };

  // Already subscribed or dismissed and done
  if ((push.subscribed || done) && !push.error) return null;

  // Permission denied or not supported — show guide
  if (push.permission === "denied" || !push.isSupported) {
    if (dismissed) return null;
    return (
      <div style={{ position: "fixed", bottom: 90, left: 16, right: 16, zIndex: 200, maxWidth: 480, margin: "0 auto", background: "var(--runit-elevated)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 16, padding: 16, display: "flex", gap: 10, alignItems: "flex-start", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{isBrave() ? "🦁" : "🔕"}</span>
        <div style={{ flex: 1 }}>
          {isBrave() ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#ffb400", marginBottom: 6 }}>Brave Browser — enable notifications</div>
              <div style={{ fontSize: 11, color: "var(--runit-muted)", lineHeight: 1.9 }}>
                1. Click the <strong style={{ color: "var(--runit-text)" }}>🦁 Shields icon</strong> in the address bar<br />
                2. Find <strong style={{ color: "var(--runit-text)" }}>Notifications</strong> and set to <strong style={{ color: "#00c9a7" }}>Allow</strong><br />
                3. Reload the page and enable notifications
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#ffb400", marginBottom: 4 }}>Notifications blocked</div>
              <div style={{ fontSize: 11, color: "var(--runit-muted)", lineHeight: 1.6 }}>
                Click the lock icon in your address bar, set Notifications to Allow, then reload.
              </div>
            </div>
          )}
        </div>
        <button onClick={dismiss} style={{ background: "none", border: "none", color: "var(--runit-muted)", cursor: "pointer", fontSize: 20, flexShrink: 0, lineHeight: 1 }}>x</button>
      </div>
    );
  }

  // Not yet asked — show prompt
  if (dismissed) return null;

  var handleEnable = async function() {
    var ok = await push.subscribe();
    if (ok) setDone(true);
  };

  return (
    <div style={{ position: "fixed", bottom: 90, left: 16, right: 16, zIndex: 200, maxWidth: 480, margin: "0 auto", background: "var(--runit-elevated)", border: "1px solid var(--runit-border-strong)", borderRadius: 20, padding: 18, boxShadow: "0 8px 40px rgba(0,0,0,0.4)", animation: "slideUp 0.3s ease", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <span style={{ fontSize: 28, flexShrink: 0 }}>🔔</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Enable push notifications</div>
        <div style={{ fontSize: 12, color: "var(--runit-muted)", lineHeight: 1.5, marginBottom: push.error ? 6 : 12 }}>
          Get notified on order updates, runner assignments, and fee negotiations — even when the app is closed.
        </div>
        {push.error && (
          <div style={{ fontSize: 11, color: "#ff8080", marginBottom: 8, background: "rgba(255,80,80,0.08)", padding: "8px 10px", borderRadius: 8, lineHeight: 1.4 }}>
            {"⚠ " + push.error}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleEnable} disabled={push.loading}
            style={{ flex: 1, padding: "10px", borderRadius: 50, background: push.loading ? "var(--runit-accent-dark)" : "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 13, border: "none", cursor: push.loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            {push.loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0a1f1c", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                Enabling...
              </span>
            ) : "🔔 Enable"}
          </button>
          <button onClick={dismiss} disabled={push.loading}
            style={{ padding: "10px 16px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}