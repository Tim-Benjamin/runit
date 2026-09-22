import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import usePushNotifications from "../../hooks/usePushNotifications";
import { useInstallPrompt } from "../../components/InstallPrompt";

export default function RunnerProfile() {
  var auth       = useAuth();
  var user       = auth.user;
  var logout     = auth.logout;
  var navigate   = useNavigate();
  var push       = usePushNotifications();
  var installPwa = useInstallPrompt();
  var isNative   = Capacitor.isNativePlatform();

  var [showLogout, setShowLogout]     = useState(false);
  var [testResult, setTestResult]     = useState("");
  var [testLoading, setTestLoading]   = useState(false);

  var methodLabel = { foot: "🚶 On foot", bike: "🚲 Bicycle", motorbike: "🛵 Motorbike" };

  var menuItems = [
    installPwa.canInstall ? {
      icon: "📲", label: "Install App",
      sub: "Add RunIt to your home screen — get order alerts faster",
      action: installPwa.install, highlight: true,
    } : null,
    {
      icon: "📊", label: "My Earnings",
      sub: "View income, ratings and debt",
      action: function() { navigate("/runner/earnings"); },
    },
    {
      icon: "📦", label: "Active Orders",
      sub: "Check your current deliveries",
      action: function() { navigate("/runner/active"); },
    },
    {
      icon: "📞", label: "Support",
      sub: "runit@ucc.edu.gh",
      action: function() { window.open("mailto:runit@ucc.edu.gh"); },
    },
  ].filter(Boolean);

  // Test native push registration
  var testNativePush = async function() {
    setTestLoading(true);
    setTestResult("Starting...");
    try {
      if (!isNative) {
        setTestResult("❌ Not running as native app. isNativePlatform() = false. Make sure server.url is set in capacitor.config.ts.");
        setTestLoading(false);
        return;
      }

      setTestResult("✓ Native platform detected\nChecking permissions...");
      var { PushNotifications } = await import("@capacitor/push-notifications");

      var current = await PushNotifications.checkPermissions();
      setTestResult("✓ Native platform\nPermission: " + current.receive + "\nRequesting...");

      var req = await PushNotifications.requestPermissions();
      setTestResult("✓ Native platform\nPermission after request: " + req.receive + "\nRegistering with FCM...");

      if (req.receive !== "granted") {
        setTestResult("❌ Permission denied: " + req.receive + "\nGo to phone Settings → Apps → RunIt → Notifications → Enable");
        setTestLoading(false);
        return;
      }

      await PushNotifications.removeAllListeners();
      await PushNotifications.register();

      PushNotifications.addListener("registration", async function(token) {
        var shortToken = token.value.substring(0, 40) + "...";
        setTestResult("✅ FCM TOKEN RECEIVED!\n" + shortToken + "\n\nSending to server...");

        // Send to server
        try {
          var authToken = localStorage.getItem("runit_token");
          var res = await fetch("https://runitgh.com/runit-backend/api/push/fcm_subscribe.php", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + authToken },
            body: JSON.stringify({ fcm_token: token.value, role: "runner" }),
          });
          var data = await res.json();
          if (res.ok) {
            setTestResult("✅ FCM TOKEN SAVED TO SERVER!\nToken: " + shortToken + "\n\nNotifications should work now. Ask admin to send a test.");
          } else {
            setTestResult("✅ Token received but server error: " + (data.error || res.status) + "\nToken: " + shortToken);
          }
        } catch(e) {
          setTestResult("✅ Token received but couldn't reach server: " + e.message + "\nToken: " + shortToken);
        }
        setTestLoading(false);
      });

      PushNotifications.addListener("registrationError", function(err) {
        setTestResult("❌ FCM Registration Error:\n" + JSON.stringify(err) + "\n\nMake sure google-services.json is in android/app/ and the app was built with it.");
        setTestLoading(false);
      });

      // Timeout after 15 seconds
      setTimeout(function() {
        setTestLoading(false);
        if (testResult.startsWith("Starting") || testResult.includes("Registering")) {
          setTestResult("⏱ Timed out waiting for FCM token.\nCheck that google-services.json is correct and Firebase project has Android app registered.");
        }
      }, 15000);

    } catch(e) {
      setTestResult("❌ Error: " + e.message);
      setTestLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="My Profile" subtitle="Runner account" />

      <div className="page-content" style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Avatar */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#0a1f1c", margin: "0 auto 12px" }}>
            {user && user.name ? user.name[0].toUpperCase() : "R"}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{user && user.name}</div>
          <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 8 }}>{user && user.email}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={{ background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "4px 14px", fontSize: 11, color: "var(--runit-accent)", fontWeight: 600 }}>
              Runner
            </span>
            <span style={{ background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "4px 14px", fontSize: 11, color: "var(--runit-accent)", fontWeight: 600 }}>
              {methodLabel[user && user.delivery_method] || "🚶 On foot"}
            </span>
          </div>
        </div>

        {/* Online status */}
        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Online Status</div>
            <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>You are visible in the feed</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)", borderRadius: 50, padding: "6px 14px" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--runit-accent)", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 12, color: "var(--runit-accent)", fontWeight: 600 }}>Online</span>
          </div>
        </div>

        {/* Push Notifications Toggle */}
        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: "16px 18px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,201,167,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                🔔
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Push Notifications</div>
                <div style={{ fontSize: 11, color: "var(--runit-muted)", marginTop: 2 }}>
                  {push.loading ? "Please wait..." :
                   push.subscribed ? "Enabled — receiving new order alerts" :
                   push.permission === "denied" ? "Blocked — enable in phone Settings" :
                   isNative ? "Disabled — tap to enable native alerts" :
                   "Disabled — tap to enable"}
                </div>
              </div>
            </div>
            {push.permission === "denied" ? (
              <span style={{ fontSize: 11, color: "#ff8080", fontWeight: 600 }}>Blocked</span>
            ) : (
              <button
                onClick={push.subscribed ? push.unsubscribe : push.subscribe}
                disabled={push.loading}
                style={{ width: 50, height: 28, borderRadius: 50, border: "none", cursor: push.loading ? "not-allowed" : "pointer", background: push.subscribed ? "var(--runit-accent)" : "var(--runit-elevated)", position: "relative", transition: "background 0.25s", flexShrink: 0 }}
              >
                <div style={{ position: "absolute", top: 4, left: push.subscribed ? 26 : 4, width: 20, height: 20, borderRadius: "50%", background: push.subscribed ? "#0a1f1c" : "var(--runit-muted)", transition: "left 0.25s" }} />
              </button>
            )}
          </div>

          {push.error && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#ff8080", background: "rgba(255,80,80,0.08)", borderRadius: 8, padding: "8px 12px" }}>
              {"⚠ " + push.error}
            </div>
          )}

          {push.permission === "denied" && (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--runit-muted)", lineHeight: 1.5 }}>
              {isNative
                ? "Go to phone Settings → Apps → RunIt → Notifications → Enable"
                : "Open browser settings → Site settings → Notifications → find runitgh.com → Allow"}
            </div>
          )}
        </div>

        {/* Warning if not subscribed */}
        {!push.subscribed && !push.loading && (
          <div style={{ background: "rgba(255,180,0,0.07)", border: "1px solid rgba(255,180,0,0.25)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div style={{ fontSize: 12, color: "var(--runit-muted)", lineHeight: 1.5 }}>
              <strong style={{ color: "#ffb400" }}>Enable notifications</strong> to get instant alerts when new orders arrive — critical for runners!
            </div>
          </div>
        )}

        {/* ── Native Push Debug Tool ── */}
        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            🔧 Notification Diagnostics
          </div>
          <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 12 }}>
            {"Platform: " + (isNative ? "✅ Native Android/iOS" : "🌐 Web browser")}
          </div>

          <button
            onClick={testNativePush}
            disabled={testLoading}
            style={{ width: "100%", padding: "11px", borderRadius: 50, background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)", color: "var(--runit-accent)", fontWeight: 700, fontSize: 13, cursor: testLoading ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: testResult ? 12 : 0 }}
          >
            {testLoading ? "Testing..." : "🔔 Test Push Registration"}
          </button>

          {testResult !== "" && (
            <div style={{ background: "var(--runit-elevated)", borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "var(--runit-muted)", whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "monospace" }}>
              {testResult}
            </div>
          )}
        </div>

        {/* Menu items */}
        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>
          {menuItems.map(function(item, i) {
            return (
              <div
                key={item.label}
                onClick={item.loading ? undefined : item.action}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: i < menuItems.length - 1 ? "1px solid var(--runit-border)" : "none", cursor: item.loading ? "not-allowed" : "pointer", background: item.highlight ? "rgba(0,201,167,0.03)" : "transparent", transition: "background 0.15s" }}
                onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(0,201,167,0.06)"; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = item.highlight ? "rgba(0,201,167,0.03)" : "transparent"; }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: item.highlight ? "var(--runit-accent)" : "var(--runit-text)" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>{item.sub}</div>
                </div>
                {item.loading ? (
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(0,201,167,0.2)", borderTopColor: "var(--runit-accent)", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />
                ) : (
                  <span style={{ color: "var(--runit-muted)", fontSize: 16 }}>›</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Sign out */}
        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, overflow: "hidden" }}>
          <div
            onClick={function() { setShowLogout(true); }}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(255,80,80,0.04)"; }}
            onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 22 }}>🚪</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#ff8080" }}>Sign Out</div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>Log out of your runner account</div>
            </div>
          </div>
        </div>

        {/* Logout modal */}
        {showLogout && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
            <div style={{ background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", borderRadius: 24, padding: 28, width: "100%", maxWidth: 340, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Sign out?</div>
              <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 24 }}>
                You will not receive new orders while signed out.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={function() { setShowLogout(false); }} style={{ flex: 1, padding: "12px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-text)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={function() { logout(); navigate("/"); }} style={{ flex: 1, padding: "12px", borderRadius: 50, background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff8080", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "var(--runit-muted)" }}>
          RunIt v1.1 · Built for UCC 🎓
        </div>

      </div>
      <BottomPillNav />
    </div>
  );
}