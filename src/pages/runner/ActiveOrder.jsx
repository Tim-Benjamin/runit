import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import StatusBadge from "../../components/StatusBadge";
import MapView from "../../components/MapView";
import Spinner from "../../components/Spinner";
import GasFillDeclaration from "../../components/GasFillDeclaration";
import useHaptic from '../../hooks/useHaptic';

const STATUS_FLOW = [
  { key: "accepted",   next: "on_the_way", action: "Mark On The Way" },
  { key: "on_the_way", next: "arrived",    action: "Mark Arrived"    },
  { key: "arrived",    next: "delivered",  action: "Mark Delivered"  },
  { key: "delivered",  next: null,         action: null              },
];

function buildMapsUrl(lat, lng) {
  return "https://www.google.com/maps?q=" + lat + "," + lng;
}

function OrderCard({ order, onStatusUpdate, updating, updatingId, onRefresh }) {
  var [expanded, setExpanded]           = useState(false);
  var [showDeliveryMap, setShowDeliveryMap] = useState(false);
  var [showPickupMap, setShowPickupMap]     = useState(false);
  var [userLocation, setUserLocation]   = useState(null);

  // Send runner GPS every 5 seconds while order is active. Runs regardless
  // of whether the card is expanded — unlike the customer-location fetch
  // below, which is purely a display feature and can wait for the card to
  // be opened, this is the actual data the customer's tracker depends on
  // and must keep flowing in the background.
  useEffect(function() {
    if (!["accepted","on_the_way","arrived"].includes(order.status)) return;
    if (!navigator.geolocation) return;

    var sendRunnerLocation = function() {
      navigator.geolocation.getCurrentPosition(function(pos) {
        var token = localStorage.getItem("runit_token");
        fetch(import.meta.env.VITE_API_BASE + '/api/location/runner_update.php', {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({
            order_id: order.id,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        }).catch(function() {});
      });
    };

    sendRunnerLocation();
    var interval = setInterval(sendRunnerLocation, 5000);
    return function() { clearInterval(interval); };
  }, [order.id, order.status]);

  var stepIndex   = STATUS_FLOW.findIndex(function(s) { return s.key === order.status; });
  var currentStep = STATUS_FLOW[stepIndex] || null;
  var isUpdating  = updating && updatingId === order.id;

  var fetchUserLocation = useCallback(async function() {
    if (!expanded) return;
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(
        import.meta.env.VITE_API_BASE + '/api/location/get.php?order_id=' + order.id,
        { headers: { Authorization: "Bearer " + token } }
      );
      var data = await res.json();
      if (res.ok && data.location) setUserLocation(data.location);
    } catch {}
  }, [order.id, expanded]);

  useEffect(function() {
    if (!expanded) return;
    fetchUserLocation();
    var id = setInterval(fetchUserLocation, 5000);
    return function() { clearInterval(id); };
  }, [expanded, fetchUserLocation]);

  var isGasRefill   = order.category === "Gas Refill";
  var isPickupDrop  = order.category === "Pickup & Drop";
  var fillDeclared  = !!(order.fill_receipt);
  var fillConfirmed = order.fill_confirmed === "1" || order.fill_confirmed === 1;
  var fillDisputed  = order.fill_disputed  === "1" || order.fill_disputed  === 1;

  var canUpdateStatus = function() {
    if (!currentStep || !currentStep.next) return false;
    if (isGasRefill && currentStep.key === "arrived" && !fillDeclared) return false;
    return true;
  };

  return (
    <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, overflow: "hidden", marginBottom: 12 }}>

      {/* ── Card header ── */}
      <div
        onClick={function() { setExpanded(function(e) { return !e; }); }}
        style={{ padding: 18, cursor: "pointer" }}
        onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(0,201,167,0.03)"; }}
        onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1, marginRight: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "var(--runit-muted)", fontWeight: 600 }}>{"Order #" + order.id}</span>
              <StatusBadge status={order.status} />
              {isGasRefill && <span style={{ fontSize: 10, background: "rgba(255,150,50,0.12)", color: "#ff9632", border: "1px solid rgba(255,150,50,0.25)", borderRadius: 50, padding: "1px 8px", fontWeight: 600 }}>Gas Refill</span>}
              {isPickupDrop && <span style={{ fontSize: 10, background: "rgba(80,160,255,0.12)", color: "#50a0ff", border: "1px solid rgba(80,160,255,0.25)", borderRadius: 50, padding: "1px 8px", fontWeight: 600 }}>Pickup & Drop</span>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>
              {order.description.length > 60 ? order.description.slice(0, 60) + "..." : order.description}
            </div>
            <div style={{ fontSize: 12, color: "var(--runit-accent)", fontWeight: 700 }}>
              {"Your cut: GH\u20B5 " + (parseFloat(order.final_fee || order.proposed_fee) * 0.8).toFixed(2)}
            </div>
          </div>
          <span style={{ fontSize: 16, color: "var(--runit-muted)", flexShrink: 0 }}>
            {expanded ? "\u25B2" : "\u25BC"}
          </span>
        </div>

        {/* Gas fill status indicator in header */}
        {isGasRefill && (
          <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 10, background: fillConfirmed ? "rgba(0,201,167,0.08)" : fillDisputed ? "rgba(255,180,0,0.08)" : fillDeclared ? "rgba(80,160,255,0.08)" : "rgba(255,150,50,0.08)", border: "1px solid " + (fillConfirmed ? "rgba(0,201,167,0.2)" : fillDisputed ? "rgba(255,180,0,0.2)" : fillDeclared ? "rgba(80,160,255,0.2)" : "rgba(255,150,50,0.2)"), fontSize: 11, color: fillConfirmed ? "#00c9a7" : fillDisputed ? "#ffb400" : fillDeclared ? "#50a0ff" : "#ff9632", fontWeight: 600 }}>
            {fillConfirmed ? "✅ Fill confirmed by user" : fillDisputed ? "⚠️ Fill disputed — admin reviewing" : fillDeclared ? "🔵 Fill declared — waiting for user confirmation" : "🔥 Fill not yet declared"}
          </div>
        )}
      </div>

      {/* ── Expanded content ── */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--runit-border)", padding: 18 }}>

          {/* Progress dots */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
            {STATUS_FLOW.map(function(step, i) {
              return (
                <div key={step.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ width: i === stepIndex ? 14 : 10, height: i === stepIndex ? 14 : 10, borderRadius: "50%", flexShrink: 0, background: i <= stepIndex ? "var(--runit-accent)" : "var(--runit-elevated)", border: "2px solid " + (i <= stepIndex ? "var(--runit-accent)" : "var(--runit-border)"), transition: "all 0.3s" }} />
                  {i < STATUS_FLOW.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < stepIndex ? "var(--runit-accent)" : "var(--runit-border)" }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Full description */}
          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10, color: "var(--runit-text)" }}>
            {order.description}
          </div>
          {order.notes && (
            <div style={{ fontSize: 12, color: "var(--runit-muted)", fontStyle: "italic", marginBottom: 12, padding: "8px 12px", background: "var(--runit-elevated)", borderRadius: 8 }}>
              {"📝 " + order.notes}
            </div>
          )}

          {/* Gas refill details */}
          {isGasRefill && order.cylinder_size && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 50, background: "rgba(255,150,50,0.08)", border: "1px solid rgba(255,150,50,0.2)", marginBottom: 12 }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontSize: 12, color: "#ff9632", fontWeight: 600 }}>
                {order.cylinder_size.charAt(0).toUpperCase() + order.cylinder_size.slice(1) + " cylinder"}
              </span>
            </div>
          )}

          {/* Pickup & Drop details */}
          {(isPickupDrop || order.pickup_address || order.pickup_phone) && (
            <div style={{ background: "rgba(80,160,255,0.06)", border: "1px solid rgba(80,160,255,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#50a0ff", marginBottom: 8 }}>📦 Pickup Details</div>
              {order.pickup_address && <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 4 }}>{"Pickup: " + order.pickup_address}</div>}
              {order.pickup_phone && (
                <a href={"tel:" + order.pickup_phone} style={{ fontSize: 12, color: "var(--runit-accent)", fontWeight: 600, display: "block" }}>
                  {"📞 Call pickup contact: " + order.pickup_phone}
                </a>
              )}
            </div>
          )}

          {/* Customer info */}
          <div style={{ background: "var(--runit-elevated)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 8, fontWeight: 600 }}>Customer</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{order.user_name || "Customer"}</div>
                <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>{order.user_phone || ""}</div>
              </div>
              {order.user_phone && (
                <a href={"tel:" + order.user_phone} style={{ padding: "8px 16px", borderRadius: 50, background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)", color: "var(--runit-accent)", fontWeight: 600, fontSize: 12, textDecoration: "none" }}>
                  📞 Call
                </a>
              )}
            </div>
          </div>

          {/* Delivery location */}
          {order.delivery_lat && order.delivery_lng && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <a href={buildMapsUrl(order.delivery_lat, order.delivery_lng)} target="_blank" rel="noreferrer"
                  style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, background: "rgba(0,201,167,0.07)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontSize: 12, fontWeight: 500, textDecoration: "none" }}
                >
                  <span>📍</span>
                  <span>{isGasRefill ? "Customer location" : isPickupDrop ? "Drop-off location" : "Delivery location"}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10 }}>Open Maps</span>
                </a>
                <button type="button" onClick={function() { setShowDeliveryMap(function(v) { return !v; }); }}
                  style={{ padding: "8px 12px", borderRadius: 10, background: showDeliveryMap ? "rgba(0,201,167,0.12)" : "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: showDeliveryMap ? "var(--runit-accent)" : "var(--runit-muted)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                >
                  {showDeliveryMap ? "Hide" : "Map"}
                </button>
              </div>
              {showDeliveryMap && (
                <div style={{ borderRadius: 12, overflow: "hidden" }}>
                  <MapView lat={Number(order.delivery_lat)} lng={Number(order.delivery_lng)} height={180} label="Delivery location" />
                </div>
              )}
            </div>
          )}

          {/* Pickup location (Pickup & Drop) */}
          {order.pickup_lat && order.pickup_lng && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <a href={buildMapsUrl(order.pickup_lat, order.pickup_lng)} target="_blank" rel="noreferrer"
                  style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, background: "rgba(80,160,255,0.07)", border: "1px solid var(--runit-border)", color: "#50a0ff", fontSize: 12, fontWeight: 500, textDecoration: "none" }}
                >
                  <span>🚩</span>
                  <span>Pickup location</span>
                  <span style={{ marginLeft: "auto", fontSize: 10 }}>Open Maps</span>
                </a>
                <button type="button" onClick={function() { setShowPickupMap(function(v) { return !v; }); }}
                  style={{ padding: "8px 12px", borderRadius: 10, background: showPickupMap ? "rgba(80,160,255,0.12)" : "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: showPickupMap ? "#50a0ff" : "var(--runit-muted)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                >
                  {showPickupMap ? "Hide" : "Map"}
                </button>
              </div>
              {showPickupMap && (
                <div style={{ borderRadius: 12, overflow: "hidden" }}>
                  <MapView lat={Number(order.pickup_lat)} lng={Number(order.pickup_lng)} height={180} label="Pickup location" />
                </div>
              )}
            </div>
          )}

          {/* Live user location */}
          {userLocation && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--runit-muted)", fontWeight: 600 }}>Customer live location</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--runit-accent)", animation: "pulse 1.5s infinite" }} />
                  <span style={{ fontSize: 10, color: "var(--runit-accent)" }}>Live</span>
                </div>
              </div>
              <div style={{ borderRadius: 12, overflow: "hidden" }}>
                <MapView lat={Number(userLocation.lat)} lng={Number(userLocation.lng)} height={180} label="Customer" />
              </div>
              <div style={{ fontSize: 10, color: "var(--runit-muted)", marginTop: 4 }}>
                {"Updated: " + new Date(userLocation.updated_at).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            </div>
          )}

          {/* Your cut */}
          <div style={{ display: "flex", justifyContent: "space-between", background: "var(--runit-elevated)", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: "var(--runit-muted)" }}>Your cut (80%)</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--runit-accent)" }}>
              {"GH\u20B5 " + (parseFloat(order.final_fee || order.proposed_fee) * 0.8).toFixed(2)}
            </span>
          </div>

          {/* Gas fill declaration — shown when at arrived stage and not yet declared */}
          {isGasRefill && order.status === "arrived" && !fillDeclared && (
            <GasFillDeclaration order={order} onDeclared={onRefresh} />
          )}

          {/* Gas fill declared — show receipt and status */}
          {isGasRefill && fillDeclared && (
            <div style={{ background: fillConfirmed ? "rgba(0,201,167,0.07)" : fillDisputed ? "rgba(255,180,0,0.07)" : "rgba(80,160,255,0.07)", border: "1px solid " + (fillConfirmed ? "rgba(0,201,167,0.2)" : fillDisputed ? "rgba(255,180,0,0.2)" : "rgba(80,160,255,0.2)"), borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: fillConfirmed ? "#00c9a7" : fillDisputed ? "#ffb400" : "#50a0ff", marginBottom: 6 }}>
                {fillConfirmed ? "✅ Fill confirmed" : fillDisputed ? "⚠️ Dispute under review" : "🔵 Fill declared — awaiting user confirmation"}
              </div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 8 }}>
                {"Declared amount: GH\u20B5 " + parseFloat(order.fill_amount || 0).toFixed(2)}
              </div>
              <a href={import.meta.env.VITE_API_BASE + '/uploads/receipts/' + order.fill_receipt} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: "var(--runit-accent)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "var(--runit-elevated)", borderRadius: 10, textDecoration: "none" }}
              >
                <span>🧾</span> View receipt photo
              </a>
            </div>
          )}

          {/* Block status update for gas refill at arrived if not declared */}
          {isGasRefill && currentStep && currentStep.key === "arrived" && !fillDeclared && (
            <div style={{ background: "rgba(255,180,0,0.07)", border: "1px solid rgba(255,180,0,0.25)", borderRadius: 12, padding: "12px 14px", textAlign: "center", fontSize: 13, color: "#ffb400", marginBottom: 12 }}>
              ⚠ Upload receipt and declare fill amount before marking delivered
            </div>
          )}

          {/* Status update button */}
          {canUpdateStatus() && (
            <button onClick={function() { onStatusUpdate(order.id, currentStep.next); }} disabled={isUpdating}
              style={{ width: "100%", padding: "13px", borderRadius: 50, background: isUpdating ? "var(--runit-accent-dark)" : "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 14, border: "none", cursor: isUpdating ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: 10 }}
            >
              {isUpdating ? "Updating..." : currentStep.action}
            </button>
          )}

          {/* Delivered state */}
          {order.status === "delivered" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Delivered!</div>
              <div style={{ color: "var(--runit-muted)", fontSize: 12 }}>
                {"Collect GH\u20B5 " + parseFloat(order.final_fee || order.proposed_fee).toFixed(2) + " cash from customer"}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default function ActiveOrder() {
  var [orders, setOrders]     = useState([]);
  var [loading, setLoading]   = useState(true);
  var [updating, setUpdating] = useState(false);
  var [updatingId, setUpdatingId] = useState(null);
  var [msg, setMsg]           = useState("");
  var [msgType, setMsgType]   = useState("success");
  var navigate                = useNavigate();
  var haptic                  = useHaptic();

  var fetchActiveOrders = useCallback(async function() {
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(import.meta.env.VITE_API_BASE + '/api/orders/list.php', {
        headers: { Authorization: "Bearer " + token },
      });
      var data = await res.json();
      if (res.ok) {
        var active = (data.orders || []).filter(function(o) {
          return ["accepted","on_the_way","arrived","delivered"].includes(o.status);
        });
        setOrders(active);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(function() {
    fetchActiveOrders();
    var id = setInterval(fetchActiveOrders, 8000);
    return function() { clearInterval(id); };
  }, [fetchActiveOrders]);

  var updateStatus = async function(orderId, newStatus) {
    if (newStatus === "delivered") haptic.success();
    else haptic.medium();

    setUpdating(true);
    setUpdatingId(orderId);
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(import.meta.env.VITE_API_BASE + '/api/orders/update_status.php', {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });
      var data = await res.json();
      if (res.ok) {
        setMsg(newStatus === "delivered" ? "Order delivered! Great work." : "Status updated.");
        setMsgType("success");
        fetchActiveOrders();
      } else {
        setMsg(data.error || "Failed to update");
        setMsgType("error");
      }
    } catch {
      setMsg("Connection error");
      setMsgType("error");
    }
    setTimeout(function() { setMsg(""); }, 3000);
    setUpdating(false);
    setUpdatingId(null);
  };

  var inProgress = orders.filter(function(o) { return o.status !== "delivered"; });
  var delivered  = orders.filter(function(o) { return o.status === "delivered"; });

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="Active Orders" subtitle={inProgress.length + " in progress"} />

      <div className="page-content">

        {msg !== "" && (
          <div style={{ background: msgType === "error" ? "rgba(255,80,80,0.1)" : "rgba(0,201,167,0.1)", border: "1px solid " + (msgType === "error" ? "rgba(255,80,80,0.3)" : "var(--runit-border-strong)"), borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: msgType === "error" ? "#ff8080" : "var(--runit-accent)", fontSize: 13, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        {loading && <Spinner />}

        {!loading && orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>No active orders</div>
            <div style={{ color: "var(--runit-muted)", fontSize: 14, marginBottom: 24 }}>Accept an order from the feed to see it here</div>
            <button onClick={function() { navigate("/runner/feed"); }}
              style={{ padding: "12px 28px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Go to Feed
            </button>
          </div>
        )}

        {!loading && inProgress.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "var(--runit-muted)", fontWeight: 600, marginBottom: 12 }}>
              {"In Progress (" + inProgress.length + ")"}
            </div>
            {inProgress.map(function(order) {
              return (
                <OrderCard key={order.id} order={order} onStatusUpdate={updateStatus}
                  updating={updating} updatingId={updatingId} onRefresh={fetchActiveOrders} />
              );
            })}
          </div>
        )}

        {!loading && delivered.length > 0 && (
          <div>
            <div style={{ fontSize: 13, color: "var(--runit-muted)", fontWeight: 600, marginBottom: 12 }}>
              {"Completed Today (" + delivered.length + ")"}
            </div>
            {delivered.map(function(order) {
              return (
                <OrderCard key={order.id} order={order} onStatusUpdate={updateStatus}
                  updating={updating} updatingId={updatingId} onRefresh={fetchActiveOrders} />
              );
            })}
          </div>
        )}

      </div>
      <BottomPillNav />
    </div>
  );
}