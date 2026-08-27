import API_BASE from '../../api/config';
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import usePushNotifications from "../../hooks/usePushNotifications";
import { useInstallPrompt } from "../../components/InstallPrompt";

export default function UserProfile() {
  var auth       = useAuth();
  var user       = auth.user;
  var logout     = auth.logout;
  var navigate   = useNavigate();
  var push       = usePushNotifications();
  var installPwa = useInstallPrompt();
  var [showLogout, setShowLogout] = useState(false);

  var menuItems = [
    installPwa.canInstall ? {
      icon: "📲", label: "Install App",
      sub: "Add RunIt to your home screen for quick access",
      action: installPwa.install, highlight: true,
    } : null,
    {
      icon: "📦", label: "My Orders",
      sub: "View all your orders",
      action: function() { navigate("/orders"); },
    },
    {
      icon: "🏪", label: "Browse Shops",
      sub: "See vendors near UCC",
      action: function() { navigate("/shops"); },
    },
    {
      icon: push.subscribed ? "🔔" : "🔕",
      label: push.subscribed ? "Notifications: On" : "Enable Notifications",
      sub: push.subscribed
        ? "Tap to turn off push notifications"
        : "Get order updates even when app is closed",
      action: push.subscribed ? push.unsubscribe : push.subscribe,
      highlight: !push.subscribed,
      loading: push.loading,
    },
    {
      icon: "📞", label: "Support",
      sub: "runit@ucc.edu.gh",
      action: function() { window.open("mailto:runit@ucc.edu.gh"); },
    },
  ].filter(Boolean);

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="Profile" subtitle="Account settings" />

      <div className="page-content" style={{ maxWidth: 480, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#0a1f1c", margin: "0 auto 12px" }}>
            {user && user.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{user && user.name}</div>
          <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 8 }}>{user && user.email}</div>
          <span style={{ background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "4px 14px", fontSize: 11, color: "var(--runit-accent)", fontWeight: 600 }}>
            Customer
          </span>
        </div>

        {push.error && (
          <div style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 12, padding: "10px 14px", marginBottom: 16, color: "#ff8080", fontSize: 12 }}>
            {"⚠ " + push.error}
          </div>
        )}

        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>
          {menuItems.map(function(item, i) {
            return (
              <div
                key={item.label}
                onClick={item.loading ? undefined : item.action}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 20px",
                  borderBottom: i < menuItems.length - 1 ? "1px solid var(--runit-border)" : "none",
                  cursor: item.loading ? "not-allowed" : "pointer",
                  background: item.highlight ? "rgba(0,201,167,0.03)" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(0,201,167,0.06)"; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = item.highlight ? "rgba(0,201,167,0.03)" : "transparent"; }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: item.highlight ? "var(--runit-accent)" : "var(--runit-text)" }}>
                    {item.label}
                  </div>
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

        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>
          <div
            onClick={function() { setShowLogout(true); }}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(255,80,80,0.04)"; }}
            onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 22 }}>🚪</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#ff8080" }}>Sign Out</div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>Log out of your account</div>
            </div>
          </div>
        </div>

        {showLogout && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
            <div style={{ background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", borderRadius: 24, padding: 28, width: "100%", maxWidth: 340, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Sign out?</div>
              <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 24 }}>
                You will need to sign in again to place orders.
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
          RunIt v1.0 · Built for UCC 🎓
        </div>
      </div>

      <BottomPillNav />
    </div>
  );
}