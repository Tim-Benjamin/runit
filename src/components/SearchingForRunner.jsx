import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MESSAGES = [
  "Looking for nearby runners...",
  "Checking runner availability...",
  "Finding the best match...",
  "Almost there...",
  "Connecting you with a runner...",
];

const TIMEOUT_SECONDS = 300; // 5 minutes

export default function SearchingForRunner({ orderId, onAccepted, onTimeout }) {
  var [msgIdx, setMsgIdx]         = useState(0);
  var [timeLeft, setTimeLeft]     = useState(TIMEOUT_SECONDS);
  var [runner, setRunner]         = useState(null);
  var [accepted, setAccepted]     = useState(false);
  var [timedOut, setTimedOut]     = useState(false);
  var pollRef                     = useRef(null);
  var navigate                    = useNavigate();

  // Rotate messages
  useEffect(function() {
    var t = setInterval(function() {
      setMsgIdx(function(i) { return (i + 1) % MESSAGES.length; });
    }, 2500);
    return function() { clearInterval(t); };
  }, []);

  // Countdown
  useEffect(function() {
    var t = setInterval(function() {
      setTimeLeft(function(s) {
        if (s <= 1) { clearInterval(t); setTimedOut(true); onTimeout && onTimeout(); return 0; }
        return s - 1;
      });
    }, 1000);
    return function() { clearInterval(t); };
  }, [onTimeout]);

  // Poll for runner acceptance
  useEffect(function() {
    if (!orderId) return;
    pollRef.current = setInterval(async function() {
      try {
        var token = localStorage.getItem("runit_token");
        var res   = await fetch(import.meta.env.VITE_API_BASE + '/api/orders/get.php?id=' + orderId, {
          headers: { Authorization: "Bearer " + token },
        });
        var data = await res.json();
        if (data.order && data.order.status !== "pending" && data.order.status !== "scheduled") {
          clearInterval(pollRef.current);
          if (data.order.runner_name) {
            setRunner(data.order);
            setAccepted(true);
            onAccepted && onAccepted(data.order);
          }
        }
      } catch {}
    }, 4000);
    return function() { clearInterval(pollRef.current); };
  }, [orderId, onAccepted]);

  var mins = Math.floor(timeLeft / 60);
  var secs = timeLeft % 60;
  var progress = ((TIMEOUT_SECONDS - timeLeft) / TIMEOUT_SECONDS) * 100;

  if (accepted && runner) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ position: "fixed", inset: 0, zIndex: 9998, background: "var(--runit-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}
      >
        {/* Success burst */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, times: [0, 0.6, 1] }}
          style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(0,201,167,0.15)", border: "3px solid var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, marginBottom: 24 }}
        >
          🏃
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: "var(--runit-text)", textAlign: "center", marginBottom: 6 }}>
            Runner found!
          </div>
          <div style={{ fontSize: 14, color: "var(--runit-muted)", textAlign: "center", marginBottom: 28 }}>
            {runner.runner_name + " is on the way"}
          </div>
        </motion.div>

        {/* Runner card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ width: "100%", maxWidth: 360, background: "var(--runit-surface)", border: "1px solid rgba(0,201,167,0.3)", borderRadius: 24, padding: 22, marginBottom: 24 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, color: "#0a1f1c", flexShrink: 0 }}>
              {runner.runner_name ? runner.runner_name[0].toUpperCase() : "R"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 3 }}>{runner.runner_name}</div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>{runner.delivery_method || "Runner"}</div>
            </div>
            {runner.runner_phone && (
              <a href={"tel:" + runner.runner_phone}
                style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, textDecoration: "none", flexShrink: 0 }}>
                📞
              </a>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--runit-border)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--runit-accent)" }}>
                {"GH₵ " + parseFloat(runner.final_fee || runner.proposed_fee || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: "var(--runit-muted)", marginTop: 2 }}>Delivery fee</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--runit-text)" }}>Cash</div>
              <div style={{ fontSize: 11, color: "var(--runit-muted)", marginTop: 2 }}>Payment</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--runit-text)", textTransform: "capitalize" }}>
                {runner.status ? runner.status.replace(/_/g, " ") : "Accepted"}
              </div>
              <div style={{ fontSize: 11, color: "var(--runit-muted)", marginTop: 2 }}>Status</div>
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={function() { navigate("/orders/" + orderId); }}
          whileTap={{ scale: 0.96 }}
          style={{ width: "100%", maxWidth: 360, padding: "14px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" }}
        >
          Track Order →
        </motion.button>
      </motion.div>
    );
  }

  if (timedOut) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ position: "fixed", inset: 0, zIndex: 9998, background: "var(--runit-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontSize: 72, marginBottom: 24 }}
        >
          😔
        </motion.div>
        <div style={{ fontWeight: 800, fontSize: 22, color: "var(--runit-text)", textAlign: "center", marginBottom: 10 }}>No runner found</div>
        <div style={{ fontSize: 14, color: "var(--runit-muted)", textAlign: "center", lineHeight: 1.7, marginBottom: 32, maxWidth: 280 }}>
          No runner accepted your order within 5 minutes. Your order has been cancelled automatically.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 }}>
          <button onClick={function() { navigate("/place-order"); }}
            style={{ width: "100%", padding: "14px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            Try again
          </button>
          <button onClick={function() { navigate("/orders"); }}
            style={{ width: "100%", padding: "14px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            View my orders
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ position: "fixed", inset: 0, zIndex: 9998, background: "var(--runit-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}
    >
      {/* Sonar rings */}
      <div style={{ position: "relative", width: 200, height: 200, marginBottom: 32 }}>
        {[0, 1, 2, 3].map(function(i) {
          return (
            <motion.div key={i}
              style={{ position: "absolute", inset: i * -30, borderRadius: "50%", border: "2px solid var(--runit-accent)", opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.4, 1.8] }}
              transition={{ duration: 2.5, delay: i * 0.6, repeat: Infinity, ease: "easeOut" }}
            />
          );
        })}

        {/* Center circle */}
        <motion.div
          style={{ position: "absolute", inset: 40, borderRadius: "50%", background: "rgba(0,201,167,0.12)", border: "2px solid rgba(0,201,167,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div style={{ fontSize: 36 }}>🔍</div>
        </motion.div>

        {/* Orbiting runner dots */}
        {[0, 1, 2].map(function(i) {
          return (
            <motion.div key={i}
              style={{ position: "absolute", width: 12, height: 12, borderRadius: "50%", background: "var(--runit-accent)", top: "50%", left: "50%", marginTop: -6, marginLeft: -6 }}
              animate={{ rotate: [i * 120, i * 120 + 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              transformTemplate={function(t) { return "rotate(" + t.rotate + ") translateX(90px)"; }}
            />
          );
        })}
      </div>

      {/* Rotating message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={msgIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          style={{ fontSize: 16, fontWeight: 600, color: "var(--runit-text)", textAlign: "center", marginBottom: 8 }}
        >
          {MESSAGES[msgIdx]}
        </motion.div>
      </AnimatePresence>

      {/* Timer */}
      <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 32 }}>
        {"Auto-cancels in "}
        <span style={{ color: timeLeft < 60 ? "#ff8080" : "var(--runit-accent)", fontWeight: 700, fontFamily: "monospace" }}>
          {mins + ":" + String(secs).padStart(2, "0")}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 320, height: 4, background: "var(--runit-elevated)", borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
        <motion.div
          style={{ height: "100%", borderRadius: 2, background: timeLeft < 60 ? "#ff8080" : "var(--runit-accent)" }}
          animate={{ width: progress + "%" }}
          transition={{ duration: 1 }}
        />
      </div>

      {/* Order summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ width: "100%", maxWidth: 360, background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 18, padding: "14px 18px", marginBottom: 20 }}
      >
        <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 6, fontWeight: 600 }}>Your order</div>
        <div style={{ fontSize: 14, color: "var(--runit-text)", fontWeight: 500 }}>{"Order #" + orderId}</div>
        <div style={{ fontSize: 12, color: "var(--runit-muted)", marginTop: 4 }}>Waiting for a runner to accept...</div>
      </motion.div>

      <button onClick={function() { navigate("/orders/" + orderId); }}
        style={{ fontSize: 13, color: "var(--runit-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
        View order details
      </button>
    </motion.div>
  );
}