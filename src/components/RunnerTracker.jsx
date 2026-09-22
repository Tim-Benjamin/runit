import { useState, useEffect, useRef } from "react";

const BASE = import.meta.env.VITE_API_BASE;

// Haversine distance in km between two coords
function getDistance(lat1, lng1, lat2, lng2) {
  var R    = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a    = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
             Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatDistance(km) {
  if (km < 0.1) return "Very close";
  if (km < 1)   return Math.round(km * 1000) + "m away";
  return km.toFixed(1) + "km away";
}

function formatETA(km) {
  // Average runner speed ~15km/h on motorbike
  var mins = Math.ceil((km / 15) * 60);
  if (mins < 2)  return "Arriving now";
  if (mins < 60) return "~" + mins + " min away";
  return "~" + Math.ceil(mins / 60) + " hr away";
}

// Animated dot that bounces along a track
function RunnerDot({ progress, color }) {
  return (
    <div style={{ position: "absolute", top: "50%", left: progress + "%", transform: "translate(-50%, -50%)", zIndex: 3, transition: "left 1.5s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      {/* Pulse ring */}
      <div style={{ position: "relative", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, opacity: 0.15, animation: "runnerPulse 1.5s ease-out infinite" }} />
        <div style={{ position: "absolute", inset: 4, borderRadius: "50%", background: color, opacity: 0.25, animation: "runnerPulse 1.5s ease-out infinite 0.3s" }} />
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 8px " + color + "66", position: "relative", zIndex: 1 }}>
          🛵
        </div>
      </div>
    </div>
  );
}

// The track with waypoints
function TrackerTrack({ progress, phase, color, fromLabel, toLabel }) {
  return (
    <div style={{ position: "relative", height: 56, display: "flex", alignItems: "center" }}>
      {/* Track line */}
      <div style={{ position: "absolute", left: 20, right: 20, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: progress + "%", background: "linear-gradient(90deg, " + color + "88, " + color + ")", borderRadius: 2, transition: "width 1.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      {/* From marker */}
      <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, zIndex: 2 }}>
        📍
      </div>

      {/* To marker */}
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, borderRadius: "50%", background: color + "33", border: "2px solid " + color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, zIndex: 2 }}>
        🏠
      </div>

      {/* Runner dot — constrained to track bounds */}
      <div style={{ position: "absolute", left: 20, right: 20, top: 0, bottom: 0, pointerEvents: "none" }}>
        <RunnerDot progress={Math.min(96, Math.max(2, progress))} color={color} />
      </div>

      {/* Labels */}
      <div style={{ position: "absolute", left: 0, top: "100%", marginTop: 6, fontSize: 9, color: "rgba(255,255,255,0.4)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fromLabel}</div>
      <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 6, fontSize: 9, color: color, textAlign: "right", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{toLabel}</div>
    </div>
  );
}

export default function RunnerTracker({ order, compact }) {
  var [runnerLoc, setRunnerLoc]   = useState(null);
  var [userLoc, setUserLoc]       = useState(null);
  var [progress, setProgress]     = useState(0);
  var [distance, setDistance]     = useState(null);
  var [phase, setPhase]           = useState("approaching"); // approaching | at_pickup | going_to_fill | returning | delivering
  var pollRef                     = useRef(null);

  var isGasRefill  = order && order.category === "Gas Refill";
  var isPickupDrop = order && order.category === "Pickup & Drop";
  var status       = order && order.status;

  // Get user's GPS
  useEffect(function() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(function(pos) {
      setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  // Poll runner location
  useEffect(function() {
    if (!order || !order.id) return;
    if (!["accepted","on_the_way","arrived"].includes(status)) return;

    var fetch_location = async function() {
      try {
        var token = localStorage.getItem("runit_token");
        var res   = await fetch(
          BASE + '/api/location/runner_get.php?order_id=' + order.id,
          { headers: { Authorization: "Bearer " + token } }
        );
        var data = await res.json();
        if (data.location && data.location.lat && data.location.lng) {
          setRunnerLoc({
            lat: parseFloat(data.location.lat),
            lng: parseFloat(data.location.lng),
          });
        }
      } catch {}
    };

    fetch_location();
    pollRef.current = setInterval(fetch_location, 5000);
    return function() { clearInterval(pollRef.current); };
  }, [order && order.id, status]);

  // Calculate progress based on status and order type
  useEffect(function() {
    if (!runnerLoc || !userLoc) return;

    var dist = getDistance(runnerLoc.lat, runnerLoc.lng, userLoc.lat, userLoc.lng);
    setDistance(dist);

    if (status === "accepted") {
      // Runner accepted but not moving yet
      setProgress(5);
      setPhase("approaching");
    } else if (status === "on_the_way") {
      if (isGasRefill) {
        // Gas refill has multiple phases based on fill_declared_at
        if (order.fill_receipt) {
          setPhase("returning");
          setProgress(Math.min(95, Math.max(55, 100 - (dist * 20))));
        } else {
          setPhase("going_to_fill");
          setProgress(Math.min(50, Math.max(10, 50 - (dist * 10))));
        }
      } else if (isPickupDrop && order.pickup_address && !order.pickup_confirmed) {
        setPhase("approaching");
        setProgress(Math.min(48, Math.max(5, 50 - (dist * 15))));
      } else {
        setPhase("delivering");
        setProgress(Math.min(95, Math.max(5, 100 - (dist * 20))));
      }
    } else if (status === "arrived") {
      setProgress(98);
      setPhase("arrived");
    }
  }, [runnerLoc, userLoc, status, isGasRefill, isPickupDrop, order]);

  if (!order) return null;
  if (!["accepted","on_the_way","arrived"].includes(status)) return null;

  // Phase config
  var phaseConfig = {
    approaching:   { color: "#f59e0b", fromLabel: "Runner", toLabel: "Your location",    icon: "🏃", text: "Runner is heading to you" },
    going_to_fill: { color: "#ff9632", fromLabel: "Your location", toLabel: "Fill station", icon: "⛽", text: "Runner heading to fill station" },
    returning:     { color: "#00c9a7", fromLabel: "Fill station", toLabel: "Your location", icon: "🔄", text: "Runner returning with your cylinder" },
    delivering:    { color: "#00c9a7", fromLabel: "Pickup point", toLabel: "Your location", icon: "📦", text: "Runner delivering to you" },
    arrived:       { color: "#00c9a7", fromLabel: "Runner", toLabel: "You",               icon: "✅", text: "Runner has arrived!" },
    at_pickup:     { color: "#f59e0b", fromLabel: "Your location", toLabel: "Pickup point", icon: "📦", text: "Runner collecting item" },
  };

  var cfg = phaseConfig[phase] || phaseConfig.approaching;

  if (compact) {
    // Compact version for notification panel / dashboard
    return (
      <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 14, padding: "10px 14px" }}>
        <style>{`
          @keyframes runnerPulse {
            0%   { transform: scale(1);   opacity: 0.4; }
            50%  { transform: scale(1.8); opacity: 0;   }
            100% { transform: scale(1);   opacity: 0;   }
          }
        `}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.icon + " " + cfg.text}</div>
          {distance !== null && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{formatDistance(distance)}</div>
          )}
        </div>
        <TrackerTrack progress={progress} phase={phase} color={cfg.color} fromLabel={cfg.fromLabel} toLabel={cfg.toLabel} />
        {distance !== null && (
          <div style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>{formatETA(distance)}</div>
        )}
      </div>
    );
  }

  // Full version for OrderDetail
  return (
    <div style={{ background: "var(--runit-surface)", border: "1px solid " + cfg.color + "44", borderRadius: 20, padding: 20, overflow: "hidden" }}>
      <style>{`
        @keyframes runnerPulse {
          0%   { transform: scale(1);   opacity: 0.4; }
          50%  { transform: scale(1.8); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0;   }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: cfg.color, marginBottom: 2 }}>
            {cfg.icon + " " + cfg.text}
          </div>
          {distance !== null && (
            <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>
              {formatDistance(distance) + " · " + formatETA(distance)}
            </div>
          )}
        </div>
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 50, padding: "4px 10px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00c9a7", animation: "runnerPulse 1.5s ease-out infinite" }} />
          <span style={{ fontSize: 10, color: "#00c9a7", fontWeight: 700 }}>LIVE</span>
        </div>
      </div>

      {/* Track */}
      <div style={{ marginBottom: 24 }}>
        <TrackerTrack progress={progress} phase={phase} color={cfg.color} fromLabel={cfg.fromLabel} toLabel={cfg.toLabel} />
      </div>

      {/* Gas refill multi-phase indicator */}
      {isGasRefill && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {[
            { key: "approaching",   label: "Collect",  icon: "📥" },
            { key: "going_to_fill", label: "Fill",     icon: "⛽" },
            { key: "returning",     label: "Return",   icon: "📤" },
            { key: "arrived",       label: "Done",     icon: "✅" },
          ].map(function(p, i) {
            var phases    = ["approaching","going_to_fill","returning","arrived"];
            var currentI  = phases.indexOf(phase);
            var isDone    = i < currentI;
            var isNow     = i === currentI;
            return (
              <div key={p.key} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 10, background: isDone ? "rgba(0,201,167,0.1)" : isNow ? "rgba(245,158,11,0.1)" : "var(--runit-elevated)", border: "1px solid " + (isDone ? "rgba(0,201,167,0.3)" : isNow ? "rgba(245,158,11,0.3)" : "var(--runit-border)") }}>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{p.icon}</div>
                <div style={{ fontSize: 9, fontWeight: isNow ? 700 : 400, color: isDone ? "#00c9a7" : isNow ? "#f59e0b" : "var(--runit-muted)" }}>{p.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pickup & Drop multi-phase */}
      {isPickupDrop && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {[
            { key: "approaching", label: "To pickup", icon: "📍" },
            { key: "delivering",  label: "Delivering", icon: "🚀" },
            { key: "arrived",     label: "Arrived",    icon: "✅" },
          ].map(function(p, i) {
            var phases   = ["approaching","delivering","arrived"];
            var currentI = phases.indexOf(phase);
            var isDone   = i < currentI;
            var isNow    = i === currentI;
            return (
              <div key={p.key} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 10, background: isDone ? "rgba(0,201,167,0.1)" : isNow ? "rgba(245,158,11,0.1)" : "var(--runit-elevated)", border: "1px solid " + (isDone ? "rgba(0,201,167,0.3)" : isNow ? "rgba(245,158,11,0.3)" : "var(--runit-border)") }}>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{p.icon}</div>
                <div style={{ fontSize: 9, fontWeight: isNow ? 700 : 400, color: isDone ? "#00c9a7" : isNow ? "#f59e0b" : "var(--runit-muted)" }}>{p.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Runner arrived state */}
      {status === "arrived" && (
        <div style={{ marginTop: 12, background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 12, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>🎉</span>
          <div style={{ fontSize: 13, color: "var(--runit-accent)", fontWeight: 600 }}>
            Your runner has arrived! Get ready to receive your order.
          </div>
        </div>
      )}
    </div>
  );
}