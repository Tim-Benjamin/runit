import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflinePage() {
  var [isOffline, setIsOffline] = useState(!navigator.onLine);
  var [retrying, setRetrying]   = useState(false);
  var [dots, setDots]           = useState(".");

  useEffect(function() {
    var onOnline  = function() { setIsOffline(false); };
    var onOffline = function() { setIsOffline(true); };
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return function() {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(function() {
    if (!isOffline) return;
    var t = setInterval(function() {
      setDots(function(d) { return d.length >= 3 ? "." : d + "."; });
    }, 500);
    return function() { clearInterval(t); };
  }, [isOffline]);

  var retry = async function() {
    setRetrying(true);
    try {
      var res = await fetch(import.meta.env.VITE_API_BASE + '/api/stories/list.php');
      if (res.ok) { setIsOffline(false); }
    } catch {}
    setRetrying(false);
  };

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 99990, background: "var(--runit-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}
        >
          {/* Animated WiFi icon */}
          <div style={{ marginBottom: 32, position: "relative" }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: 80 }}
            >
              📡
            </motion.div>
            {/* Signal rings */}
            {[1,2].map(function(i) {
              return (
                <motion.div key={i}
                  style={{ position: "absolute", inset: -i * 20, borderRadius: "50%", border: "2px solid rgba(255,80,80,0.2)" }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                />
              );
            })}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ textAlign: "center" }}
          >
            <div style={{ fontWeight: 800, fontSize: 24, color: "var(--runit-text)", marginBottom: 10 }}>
              You're offline
            </div>
            <div style={{ fontSize: 14, color: "var(--runit-muted)", lineHeight: 1.7, marginBottom: 8, maxWidth: 280 }}>
              RunIt needs an internet connection to work. Check your WiFi or mobile data.
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,80,80,0.6)", marginBottom: 32 }}>
              {"Checking connection" + dots}
            </div>

            {/* Connection tips */}
            <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: "14px 20px", marginBottom: 24, width: "100%", maxWidth: 320, textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "var(--runit-muted)", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Quick fixes</div>
              {["Turn WiFi off and on again", "Check your mobile data balance", "Move to an area with better signal", "Try connecting to campus WiFi"].map(function(tip) {
                return (
                  <div key={tip} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--runit-muted)", marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--runit-accent)", flexShrink: 0 }}>•</span>
                    {tip}
                  </div>
                );
              })}
            </div>

            <motion.button
              onClick={retry}
              disabled={retrying}
              whileTap={{ scale: 0.95 }}
              style={{ width: "100%", maxWidth: 320, padding: "14px", borderRadius: 50, background: retrying ? "var(--runit-elevated)" : "var(--runit-accent)", color: retrying ? "var(--runit-muted)" : "#0a1f1c", fontWeight: 700, fontSize: 15, border: "none", cursor: retrying ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {retrying ? "Checking..." : "↻ Try again"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}