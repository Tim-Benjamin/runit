import API_BASE from '../../api/config';
import { useState, useEffect, useCallback } from "react";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import { SkeletonCard } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import MapView from "../../components/MapView";

const CAT_COLORS = {
  "Food & Drinks": { bg: "rgba(255,150,50,0.1)",  color: "#ff9632", border: "rgba(255,150,50,0.25)" },
  "Errands":       { bg: "rgba(0,201,167,0.1)",   color: "#00c9a7", border: "rgba(0,201,167,0.25)" },
  "Shopping":      { bg: "rgba(150,100,255,0.1)", color: "#9664ff", border: "rgba(150,100,255,0.25)" },
  "Pickup & Drop": { bg: "rgba(80,160,255,0.1)",  color: "#50a0ff", border: "rgba(80,160,255,0.25)" },
  "Gas Refill":    { bg: "rgba(255,100,50,0.1)",  color: "#ff6432", border: "rgba(255,100,50,0.25)" },
  "Custom":        { bg: "rgba(255,200,0,0.1)",   color: "#ffc800", border: "rgba(255,200,0,0.25)" },
};

function buildMapsUrl(lat, lng) {
  return "https://www.google.com/maps?q=" + lat + "," + lng;
}

function OrderCard({ order, onAccept, onCounter, accepted }) {
  var [expanded, setExpanded]           = useState(false);
  var [showDeliveryMap, setShowDeliveryMap] = useState(false);
  var [showPickupMap, setShowPickupMap]     = useState(false);
  var [isCountering, setIsCountering]   = useState(false);
  var [counterFee, setCounterFee]       = useState("");

  var cat = CAT_COLORS[order.category] || CAT_COLORS["Custom"];

  return (
    <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, overflow: "hidden", transition: "border-color 0.2s" }}
      onMouseEnter={function(e) { e.currentTarget.style.borderColor = "var(--runit-border-strong)"; }}
      onMouseLeave={function(e) { e.currentTarget.style.borderColor = "var(--runit-border)"; }}
    >

      {/* ── Card header (always visible) ── */}
      <div style={{ padding: 18 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ background: cat.bg, color: cat.color, border: "1px solid " + cat.border, borderRadius: 50, padding: "3px 12px", fontSize: 11, fontWeight: 600 }}>
            {order.category}
          </span>
          <span style={{ fontSize: 11, color: "var(--runit-muted)" }}>
            {new Date(order.created_at).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10, color: "var(--runit-text)" }}>
          {order.description.length > 80 ? order.description.slice(0, 80) + "..." : order.description}
        </p>

        {/* ── Delivery location row ── */}
        {order.delivery_lat && order.delivery_lng && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <a href={buildMapsUrl(order.delivery_lat, order.delivery_lng)} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, background: "rgba(0,201,167,0.07)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontSize: 12, fontWeight: 500, textDecoration: "none", flex: 1 }}
              >
                <span>📍</span>
                <span style={{ flex: 1 }}>
                  {order.category === "Gas Refill" ? "Customer location" : order.category === "Pickup & Drop" ? "Drop-off location" : "Delivery location"}
                  {" \u2014 " + parseFloat(order.delivery_lat).toFixed(4) + ", " + parseFloat(order.delivery_lng).toFixed(4)}
                </span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>Maps</span>
              </a>
              <button type="button" onClick={function() { setShowDeliveryMap(function(v) { return !v; }); }}
                style={{ padding: "7px 12px", borderRadius: 10, background: showDeliveryMap ? "rgba(0,201,167,0.15)" : "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: showDeliveryMap ? "var(--runit-accent)" : "var(--runit-muted)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
              >
                {showDeliveryMap ? "Hide map" : "Show map"}
              </button>
            </div>
            {showDeliveryMap && (
              <div style={{ borderRadius: 12, overflow: "hidden" }}>
                <MapView lat={Number(order.delivery_lat)} lng={Number(order.delivery_lng)} height={180} label={order.category === "Gas Refill" ? "Customer location" : "Delivery location"} />
              </div>
            )}
          </div>
        )}

        {/* ── Pickup location row (Pickup & Drop only) ── */}
        {order.pickup_lat && order.pickup_lng && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <a href={buildMapsUrl(order.pickup_lat, order.pickup_lng)} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, background: "rgba(80,160,255,0.07)", border: "1px solid var(--runit-border)", color: "#50a0ff", fontSize: 12, fontWeight: 500, textDecoration: "none", flex: 1 }}
              >
                <span>🚩</span>
                <span style={{ flex: 1 }}>
                  {"Pickup \u2014 " + parseFloat(order.pickup_lat).toFixed(4) + ", " + parseFloat(order.pickup_lng).toFixed(4)}
                </span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>Maps</span>
              </a>
              <button type="button" onClick={function() { setShowPickupMap(function(v) { return !v; }); }}
                style={{ padding: "7px 12px", borderRadius: 10, background: showPickupMap ? "rgba(80,160,255,0.15)" : "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: showPickupMap ? "#50a0ff" : "var(--runit-muted)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
              >
                {showPickupMap ? "Hide map" : "Show map"}
              </button>
            </div>
            {showPickupMap && (
              <div style={{ borderRadius: 12, overflow: "hidden" }}>
                <MapView lat={Number(order.pickup_lat)} lng={Number(order.pickup_lng)} height={180} label="Pickup location" />
              </div>
            )}
          </div>
        )}

        {/* ── Gas refill cylinder info ── */}
        {order.cylinder_size && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 50, background: "rgba(255,100,50,0.08)", border: "1px solid rgba(255,100,50,0.2)", marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>🔥</span>
            <span style={{ fontSize: 12, color: "#ff6432", fontWeight: 600 }}>
              {order.cylinder_size.charAt(0).toUpperCase() + order.cylinder_size.slice(1) + " cylinder"}
            </span>
          </div>
        )}

        {/* ── Fee row ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: "var(--runit-muted)" }}>{"Order #" + order.id}</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--runit-accent)" }}>{"GH\u20B5 " + parseFloat(order.proposed_fee).toFixed(2)}</div>
            <div style={{ fontSize: 10, color: "var(--runit-muted)" }}>{"You keep GH\u20B5 " + (parseFloat(order.proposed_fee) * 0.8).toFixed(2)}</div>
          </div>
        </div>

        {/* ── Expand for more details ── */}
        <button type="button" onClick={function() { setExpanded(function(v) { return !v; }); }}
          style={{ width: "100%", padding: "8px", borderRadius: 10, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}
        >
          {expanded ? "▲ Show less" : "▼ Show full details"}
        </button>

        {expanded && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--runit-text)", marginBottom: 8 }}>{order.description}</p>
            {order.notes && <p style={{ fontSize: 12, color: "var(--runit-muted)", fontStyle: "italic", marginBottom: 8 }}>{"📝 " + order.notes}</p>}
            {order.pickup_address && <p style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 4 }}>{"Pickup notes: " + order.pickup_address}</p>}
            {order.pickup_phone && (
              <a href={"tel:" + order.pickup_phone} style={{ fontSize: 12, color: "var(--runit-accent)", fontWeight: 600 }}>{"📞 Pickup contact: " + order.pickup_phone}</a>
            )}
          </div>
        )}

        {/* ── Counter fee input ── */}
        {isCountering && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 6 }}>Propose a different fee (GH₵):</div>
            <input type="number" value={counterFee} min="1" onChange={function(e) { setCounterFee(e.target.value); }}
              placeholder="e.g. 18"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border-strong)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>
        )}

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={function() {
              if (isCountering && counterFee) { onCounter(order, counterFee); setIsCountering(false); setCounterFee(""); }
              else { onAccept(order); }
            }}
            style={{ flex: 1, padding: "11px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit" }}
          >
            {isCountering && counterFee ? "Propose GH\u20B5 " + counterFee : "Accept Order"}
          </button>

          {!isCountering ? (
            <button onClick={function() { setIsCountering(true); setCounterFee(""); }}
              style={{ padding: "11px 18px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border-strong)", color: "var(--runit-muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
            >Counter</button>
          ) : (
            <button onClick={function() { setIsCountering(false); setCounterFee(""); }}
              style={{ padding: "11px 18px", borderRadius: 50, background: "transparent", border: "1px solid rgba(255,80,80,0.3)", color: "#ff8080", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
            >Cancel</button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function RunnerFeed() {
  var [orders, setOrders]       = useState([]);
  var [loading, setLoading]     = useState(true);
  var [accepted, setAccepted]   = useState([]);
  var [msg, setMsg]             = useState("");
  var [msgType, setMsgType]     = useState("success");
  var [prevCount, setPrevCount] = useState(0);

  var showMsg = function(text, type) {
    setMsg(text); setMsgType(type || "success");
    setTimeout(function() { setMsg(""); }, 4000);
  };

  var fetchFeed = useCallback(async function() {
    try {
      var token = localStorage.getItem("runit_token");
      var res = await fetch("${API_BASE}/api/orders/list.php", {
        headers: { Authorization: "Bearer " + token },
      });
      var data = await res.json();
      if (res.ok) {
        var pending = (data.orders || []).filter(function(o) { return o.status === "pending" && !o.runner_id; });
        setPrevCount(function(prev) {
          if (pending.length > prev && prev > 0) showMsg("New order just arrived!", "success");
          return pending.length;
        });
        setOrders(pending);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(function() {
    fetchFeed();
    var id = setInterval(fetchFeed, 8000);
    return function() { clearInterval(id); };
  }, [fetchFeed]);

  var handleAccept = async function(order) {
    try {
      var token = localStorage.getItem("runit_token");
      var res = await fetch("${API_BASE}/api/orders/accept.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ order_id: order.id }),
      });
      var data = await res.json();
      if (res.ok) { setAccepted(function(a) { return a.concat([order.id]); }); showMsg("Order accepted! Head to Active Orders.", "success"); fetchFeed(); }
      else showMsg(data.error || "Failed to accept", "error");
    } catch { showMsg("Connection error", "error"); }
  };

  var handleCounter = async function(order, fee) {
    var val = parseFloat(fee);
    if (!fee || val < 1) { showMsg("Enter a valid counter fee", "error"); return; }
    try {
      var token = localStorage.getItem("runit_token");
      var res = await fetch("${API_BASE}/api/orders/counter_fee.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ order_id: order.id, counter_fee: val }),
      });
      var data = await res.json();
      if (res.ok) { showMsg("Counter fee sent! Waiting for user approval.", "success"); fetchFeed(); }
      else showMsg(data.error || "Failed", "error");
    } catch { showMsg("Connection error", "error"); }
  };

  var dotsIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  );

  var visibleOrders = orders.filter(function(o) { return !accepted.includes(o.id); });

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="Live Order Feed" subtitle="Refreshes every 8 seconds" actions={[{ icon: dotsIcon, onClick: function() {} }]} />

      <div className="page-content">

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--runit-accent)", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 13, color: "var(--runit-muted)", flex: 1 }}>
            {visibleOrders.length + " pending order" + (visibleOrders.length !== 1 ? "s" : "")}
          </span>
          <button onClick={fetchFeed} style={{ padding: "4px 12px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
            Refresh
          </button>
        </div>

        {msg !== "" && (
          <div style={{ background: msgType === "error" ? "rgba(255,80,80,0.1)" : "rgba(0,201,167,0.1)", border: "1px solid " + (msgType === "error" ? "rgba(255,80,80,0.3)" : "var(--runit-border-strong)"), borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: msgType === "error" ? "#ff8080" : "var(--runit-accent)", fontSize: 13, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1,2,3].map(function(i) { return <SkeletonCard key={i} />; })}
          </div>
        )}

        {!loading && visibleOrders.length === 0 && (
          <EmptyState icon="🎉" title="All caught up!" subtitle="No pending orders right now. Check back soon." action={fetchFeed} actionLabel="Refresh Feed" />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {visibleOrders.map(function(order) {
            return (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onCounter={handleCounter}
                accepted={accepted}
              />
            );
          })}
        </div>

      </div>
      <BottomPillNav />
    </div>
  );
}