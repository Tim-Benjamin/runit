import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CURRENT_VERSION = "1.1.0";
const BANNER_KEY      = "runit_version_seen";

const WHATS_NEW = [
  { icon: "⛽", text: "Gas fill accountability with photo receipts" },
  { icon: "📸", text: "Stories and launch ads from admin" },
  { icon: "🏷",  text: "Promo codes and referral rewards" },
  { icon: "⏰", text: "Schedule orders for later" },
  { icon: "🔍", text: "Search and filter your orders" },
  { icon: "🔒", text: "Password reset via email" },
];

export default function VersionBanner() {
  var [visible, setVisible] = useState(false);

  useEffect(function() {
    var seen = localStorage.getItem(BANNER_KEY);
    if (seen !== CURRENT_VERSION) setVisible(true);
  }, []);

  var dismiss = function() {
    localStorage.setItem(BANNER_KEY, CURRENT_VERSION);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          style={{ background: "linear-gradient(135deg, #0d3329, #0a1f1c)", border: "1px solid rgba(0,201,167,0.25)", borderRadius: 20, padding: 20, marginBottom: 16 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ background: "var(--runit-accent)", color: "#0a1f1c", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 50, letterSpacing: 0.5 }}>
                  {"v" + CURRENT_VERSION}
                </div>
                <span style={{ fontSize: 12, color: "var(--runit-accent)", fontWeight: 700 }}>What's new</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--runit-text)" }}>RunIt just got better 🎉</div>
            </div>
            <button onClick={dismiss}
              style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "var(--runit-muted)", width: 28, height: 28, borderRadius: "50%", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", flexShrink: 0 }}>
              ×
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {WHATS_NEW.map(function(item) {
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: WHATS_NEW.indexOf(item) * 0.06 }}
                  style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "rgba(255,255,255,0.75)" }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  {item.text}
                </motion.div>
              );
            })}
          </div>

          <button onClick={dismiss}
            style={{ width: "100%", padding: "11px", borderRadius: 50, background: "rgba(0,201,167,0.15)", border: "1px solid rgba(0,201,167,0.3)", color: "var(--runit-accent)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            Got it, thanks!
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}