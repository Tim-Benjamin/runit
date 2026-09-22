import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: 1,
    emoji: "🚀",
    gradient: "linear-gradient(135deg, #0a1f1c 0%, #0d3329 100%)",
    accent: "#00c9a7",
    title: "Welcome to RunIt",
    subtitle: "Campus delivery, reimagined",
    description: "Get anything delivered on the UCC campus — food, errands, shopping, gas refills and more. Fast, reliable, cash on delivery.",
    visual: "hero",
  },
  {
    id: 2,
    emoji: "📦",
    gradient: "linear-gradient(135deg, #0a1f1c 0%, #1a0d3d 100%)",
    accent: "#7c3aed",
    title: "Place an Order",
    subtitle: "Simple. Fast. Flexible.",
    description: "Choose a category, describe what you need, set your pickup and drop-off, and propose a fair fee. Runners come to you.",
    visual: "order",
    steps: ["Choose category", "Describe your need", "Set location", "Propose fee"],
  },
  {
    id: 3,
    emoji: "🏃",
    gradient: "linear-gradient(135deg, #0a1f1c 0%, #1f1a0a 100%)",
    accent: "#f59e0b",
    title: "Runners Accept",
    subtitle: "Real people. Real fast.",
    description: "Verified campus runners see your order and accept in seconds. Track their location live as they make their way to you.",
    visual: "runner",
  },
  {
    id: 4,
    emoji: "💵",
    gradient: "linear-gradient(135deg, #0a1f1c 0%, #0a1f12 100%)",
    accent: "#10b981",
    title: "Pay on Delivery",
    subtitle: "No cards. No stress.",
    description: "Pay cash directly to your runner when they arrive. No online payments, no subscriptions. Simple and transparent.",
    visual: "payment",
  },
  {
    id: 5,
    emoji: "⭐",
    gradient: "linear-gradient(135deg, #0a1f1c 0%, #1f0a1a 100%)",
    accent: "#ec4899",
    title: "Rate & Repeat",
    subtitle: "Community-powered trust.",
    description: "Rate your runner after every delivery. Top runners get more orders. Your feedback keeps the platform safe and reliable.",
    visual: "rating",
  },
];

const SEEN_KEY = "runit_onboarding_done";

function HeroVisual({ accent }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Pulsing rings */}
      {[1,2,3].map(function(i) {
        return (
          <motion.div key={i}
            style={{ position: "absolute", width: 80 + i * 60, height: 80 + i * 60, borderRadius: "50%", border: "1px solid " + accent, opacity: 0.15 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
          />
        );
      })}
      {/* Center logo */}
      <motion.div
        style={{ width: 80, height: 80, borderRadius: 24, background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800, color: "#0a1f1c", zIndex: 1 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        R
      </motion.div>
      {/* Orbiting icons */}
      {["🍔","📦","⛽","🛵"].map(function(icon, i) {
        var angle  = (i / 4) * Math.PI * 2;
        var radius = 100;
        var x      = Math.cos(angle) * radius;
        var y      = Math.sin(angle) * radius;
        return (
          <motion.div key={icon}
            style={{ position: "absolute", fontSize: 24, left: "50%", top: "50%", marginLeft: x - 16, marginTop: y - 16 }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
          >
            {icon}
          </motion.div>
        );
      })}
    </div>
  );
}

function OrderVisual({ accent, steps }) {
  var [activeStep, setActiveStep] = useState(0);
  useEffect(function() {
    var t = setInterval(function() {
      setActiveStep(function(s) { return (s + 1) % steps.length; });
    }, 1000);
    return function() { clearInterval(t); };
  }, [steps.length]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      {steps.map(function(step, i) {
        var isActive = i === activeStep;
        var isDone   = i < activeStep;
        return (
          <motion.div key={step}
            animate={{ x: isActive ? 8 : 0, opacity: isDone ? 0.4 : 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "80%", background: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)", border: "1px solid " + (isActive ? accent : "rgba(255,255,255,0.08)"), borderRadius: 14, padding: "12px 16px" }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: isDone ? accent : isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: isDone ? "#0a1f1c" : "#fff", flexShrink: 0, transition: "all 0.3s" }}>
              {isDone ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#fff" : "rgba(255,255,255,0.6)" }}>{step}</span>
            {isActive && (
              <motion.div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: accent }}
                animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function RunnerVisual({ accent }) {
  var [pos, setPos] = useState(0);
  useEffect(function() {
    var t = setInterval(function() {
      setPos(function(p) { return p >= 100 ? 0 : p + 1; });
    }, 40);
    return function() { clearInterval(t); };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      {/* Map-like track */}
      <div style={{ width: "80%", position: "relative" }}>
        <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
          <motion.div style={{ height: "100%", background: accent, borderRadius: 2, width: pos + "%" }}
            transition={{ duration: 0.04 }} />
        </div>
        {/* Runner dot */}
        <motion.div style={{ position: "absolute", top: -14, left: pos + "%", marginLeft: -16, fontSize: 28 }}>
          🛵
        </motion.div>
        {/* Start/end markers */}
        <div style={{ position: "absolute", top: -8, left: 0, width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>📍</div>
        <div style={{ position: "absolute", top: -8, right: 0, width: 20, height: 20, borderRadius: "50%", background: accent + "33", border: "2px solid " + accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🏠</div>
      </div>
      {/* Runner card */}
      <motion.div
        style={{ width: "75%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center" }}
        animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, color: "#0a1f1c", flexShrink: 0 }}>K</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>Kwame A.</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>⭐ 4.9 · On the way</div>
        </div>
        <div style={{ fontSize: 20 }}>📞</div>
      </motion.div>
    </div>
  );
}

function PaymentVisual({ accent }) {
  var [step, setStep] = useState(0);
  useEffect(function() {
    var t = setInterval(function() { setStep(function(s) { return (s + 1) % 3; }); }, 1500);
    return function() { clearInterval(t); };
  }, []);

  var steps = [
    { icon: "📦", label: "Order delivered", color: accent },
    { icon: "💵", label: "Pay cash to runner", color: "#f59e0b" },
    { icon: "✅", label: "Done!", color: "#10b981" },
  ];

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: "center" }}
        >
          <div style={{ fontSize: 64, marginBottom: 12 }}>{steps[step].icon}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: steps[step].color }}>{steps[step].label}</div>
        </motion.div>
      </AnimatePresence>
      <div style={{ display: "flex", gap: 8 }}>
        {steps.map(function(s, i) {
          return <div key={i} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 4, background: i === step ? accent : "rgba(255,255,255,0.2)", transition: "all 0.3s" }} />;
        })}
      </div>
    </div>
  );
}

function RatingVisual({ accent }) {
  var [rating, setRating] = useState(0);
  useEffect(function() {
    var t = setTimeout(function() {
      var i = 0;
      var interval = setInterval(function() {
        i++;
        setRating(i);
        if (i >= 5) { clearInterval(interval); setTimeout(function() { setRating(0); }, 1500); }
      }, 300);
    }, 500);
    return function() { clearTimeout(t); };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <motion.div
        style={{ width: 72, height: 72, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}
        animate={{ rotate: rating > 0 ? [0, -10, 10, 0] : 0 }}
        transition={{ duration: 0.3 }}
      >
        {rating === 5 ? "😁" : rating >= 3 ? "😊" : "😐"}
      </motion.div>
      <div style={{ display: "flex", gap: 8 }}>
        {[1,2,3,4,5].map(function(s) {
          return (
            <motion.div key={s}
              animate={{ scale: s <= rating ? [1, 1.4, 1] : 1, color: s <= rating ? "#fbbf24" : "rgba(255,255,255,0.2)" }}
              transition={{ duration: 0.3, delay: s <= rating ? (s - 1) * 0.05 : 0 }}
              style={{ fontSize: 36, color: s <= rating ? "#fbbf24" : "rgba(255,255,255,0.2)" }}
            >
              ★
            </motion.div>
          );
        })}
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Rate your runner</div>
    </div>
  );
}

function SlideVisual({ slide }) {
  if (slide.visual === "hero")    return <HeroVisual    accent={slide.accent} />;
  if (slide.visual === "order")   return <OrderVisual   accent={slide.accent} steps={slide.steps} />;
  if (slide.visual === "runner")  return <RunnerVisual  accent={slide.accent} />;
  if (slide.visual === "payment") return <PaymentVisual accent={slide.accent} />;
  if (slide.visual === "rating")  return <RatingVisual  accent={slide.accent} />;
  return null;
}

export function useOnboarding() {
  var done = localStorage.getItem(SEEN_KEY);
  return !done;
}

export default function Onboarding({ onDone }) {
  var [idx, setIdx]         = useState(0);
  var [direction, setDir]   = useState(1);
  var slide                 = SLIDES[idx];
  var isLast                = idx === SLIDES.length - 1;

  var goNext = function() {
    if (isLast) { localStorage.setItem(SEEN_KEY, "1"); onDone && onDone(); return; }
    setDir(1); setIdx(function(i) { return i + 1; });
  };

  var goPrev = function() {
    if (idx === 0) return;
    setDir(-1); setIdx(function(i) { return i - 1; });
  };

  var skip = function() {
    localStorage.setItem(SEEN_KEY, "1"); onDone && onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 99999, overflow: "hidden" }}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -60 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, background: slide.gradient, display: "flex", flexDirection: "column" }}
        >
          {/* Skip button */}
          {!isLast && (
            <div style={{ position: "absolute", top: 20, right: 20, zIndex: 2 }}>
              <button onClick={skip}
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", padding: "6px 16px", borderRadius: 50, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                Skip
              </button>
            </div>
          )}

          {/* Visual area */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, minHeight: 0 }}>
            <SlideVisual slide={slide} />
          </div>

          {/* Text + controls */}
          <div style={{ padding: "28px 28px 48px", flexShrink: 0 }}>

            {/* Emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              style={{ fontSize: 40, marginBottom: 12 }}
            >
              {slide.emoji}
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{ fontSize: 12, fontWeight: 700, color: slide.accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}
            >
              {slide.subtitle}
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}
            >
              {slide.title}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 32 }}
            >
              {slide.description}
            </motion.div>

            {/* Progress dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {SLIDES.map(function(s, i) {
                return (
                  <motion.div
                    key={s.id}
                    animate={{ width: i === idx ? 24 : 8, background: i === idx ? slide.accent : "rgba(255,255,255,0.2)" }}
                    style={{ height: 8, borderRadius: 4 }}
                    transition={{ duration: 0.3 }}
                    onClick={function() { setDir(i > idx ? 1 : -1); setIdx(i); }}
                  />
                );
              })}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              {idx > 0 && (
                <button onClick={goPrev}
                  style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 20, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  ←
                </button>
              )}
              <motion.button
                onClick={goNext}
                whileTap={{ scale: 0.96 }}
                style={{ flex: 1, height: 52, borderRadius: 50, background: slide.accent, color: "#0a1f1c", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {isLast ? "Start using RunIt 🚀" : "Next →"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}