import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import ReportForm from '../../components/ReportForm';

const STATUS_FLOW = [
  { key: "accepted", next: "on_the_way", action: "Mark On The Way" },
  { key: "on_the_way", next: "arrived", action: "Mark Arrived" },
  { key: "arrived", next: "delivered", action: "Mark Delivered" },
  { key: "delivered", next: null, action: null },
];

function buildMapsUrl(lat, lng) {
  return "https://www.google.com/maps?q=" + lat + "," + lng;
}

function OrderCard(props) {
  var order = props.order;
  var onUpdate = props.onUpdate;
  var [expanded, setExpanded] = useState(props.defaultExpanded || false);
  var [updating, setUpdating] = useState(false);
  var [msg, setMsg] = useState("");
  var [userLocation, setUserLocation] = useState(null);

  var stepIndex = STATUS_FLOW.findIndex(function (s) { return s.key === order.status; });
  var currentStep = STATUS_FLOW.find(function (s) { return s.key === order.status; });

  var fetchLocation = useCallback(async function () {
    try {
      var token = localStorage.getItem("runit_token");
      var res = await fetch(
        "http://localhost/runit-backend/api/location/get.php?order_id=" + order.id,
        { headers: { Authorization: "Bearer " + token } }
      );
      var data = await res.json();
      if (res.ok && data.location) setUserLocation(data.location);
    } catch { }
  }, [order.id]);

  useEffect(function () {
    if (!expanded) return;
    if (!["accepted", "on_the_way", "arrived"].includes(order.status)) return;
    fetchLocation();
    var id = setInterval(fetchLocation, 5000);
    return function () { clearInterval(id); };
  }, [expanded, order.status, fetchLocation]);

  var updateStatus = async function (newStatus) {
    setUpdating(true);
    try {
      var token = localStorage.getItem("runit_token");
      var res = await fetch("http://localhost/runit-backend/api/orders/update_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ order_id: order.id, status: newStatus }),
      });
      var data = await res.json();
      if (res.ok) {
        setMsg(newStatus === "delivered" ? "Order delivered! Collect cash from customer." : "Status updated.");
        if (onUpdate) onUpdate();
      } else {
        setMsg(data.error || "Failed to update");
      }
    } catch { setMsg("Connection error"); }
    setTimeout(function () { setMsg(""); }, 3000);
    setUpdating(false);
  };

  var statusColors = {
    accepted: "#00c9a7",
    on_the_way: "#7090ff",
    arrived: "#c060ff",
    delivered: "#00c9a7",
  };

  var borderColor = statusColors[order.status] ? statusColors[order.status] + "44" : "var(--runit-border)";

  return (
    <div style={{ background: "var(--runit-surface)", border: "1px solid " + borderColor, borderRadius: 20, overflow: "hidden", marginBottom: 12 }}>

      <div
        onClick={function () { setExpanded(function (e) { return !e; }); }}
        style={{ padding: "16px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ flex: 1, marginRight: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "var(--runit-muted)", fontWeight: 600 }}>{"Order #" + order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <div style={{ fontSize: 13, color: "var(--runit-text)", lineHeight: 1.4 }}>
            {order.description.length > 60 ? order.description.slice(0, 60) + "..." : order.description}
          </div>
          <div style={{ fontSize: 12, color: "var(--runit-accent)", fontWeight: 700, marginTop: 4 }}>
            {"Your cut: GH\u20B5 " + (parseFloat(order.final_fee || order.proposed_fee) * 0.8).toFixed(2)}
          </div>
        </div>
        <div style={{ fontSize: 18, color: "var(--runit-muted)", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
          v
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid var(--runit-border)", padding: "16px 18px" }}>

          {msg !== "" && (
            <div style={{ background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border-strong)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "var(--runit-accent)", fontSize: 13 }}>
              {msg}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
            {STATUS_FLOW.map(function (step, i) {
              var isDone = i <= stepIndex;
              return (
                <div key={step.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ width: i === stepIndex ? 14 : 10, height: i === stepIndex ? 14 : 10, borderRadius: "50%", flexShrink: 0, background: isDone ? "var(--runit-accent)" : "var(--runit-elevated)", border: "2px solid " + (isDone ? "var(--runit-accent)" : "var(--runit-border)"), transition: "all 0.3s" }} />
                  {i < STATUS_FLOW.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < stepIndex ? "var(--runit-accent)" : "var(--runit-border)" }} />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10, color: "var(--runit-text)" }}>
            {order.description}
          </div>

          {order.notes && (
            <div style={{ fontSize: 12, color: "var(--runit-muted)", fontStyle: "italic", marginBottom: 12, padding: "8px 12px", background: "var(--runit-elevated)", borderRadius: 8 }}>
              {"Note: " + order.notes}
            </div>
          )}

          {(order.pickup_address || order.dropoff_address || order.pickup_phone || order.cylinder_size) && (
            <div style={{ background: "var(--runit-elevated)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--runit-accent)", marginBottom: 6 }}>
                {order.category === "Pickup & Drop" ? "📦 Pickup & Drop Details" : "🔥 Gas Refill Details"}
              </div>
              {order.cylinder_size && (
                <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 4 }}>
                  {"Cylinder size: " + order.cylinder_size.charAt(0).toUpperCase() + order.cylinder_size.slice(1)}
                </div>
              )}
              {order.pickup_address && (
                <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 4 }}>{"Pickup: " + order.pickup_address}</div>
              )}
              {order.dropoff_address && (
                <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 4 }}>{"Drop note: " + order.dropoff_address}</div>
              )}
              {order.pickup_phone && (
                <a href={"tel:" + order.pickup_phone} style={{ fontSize: 12, color: "var(--runit-accent)", fontWeight: 600 }}>
                  {"📞 Call pickup contact: " + order.pickup_phone}
                </a>
              )}
              {order.pickup_lat && order.pickup_lng && (
                <a href={"https://www.google.com/maps?q=" + order.pickup_lat + "," + order.pickup_lng} target="_blank" rel="noreferrer"
                  style={{ display: "block", marginTop: 8, padding: "8px 12px", borderRadius: 10, background: "rgba(0,201,167,0.08)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontSize: 12, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
                  📍 Open pickup location in Maps
                </a>
              )}
            </div>
          )}

          <div style={{ background: "var(--runit-elevated)", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 8, fontWeight: 600 }}>Customer</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{order.user_name || "Customer"}</div>
                <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>{order.user_phone || ""}</div>
              </div>
              {order.user_phone && (
                <a href={"tel:" + order.user_phone} style={{ padding: "8px 16px", borderRadius: 50, background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)", color: "var(--runit-accent)", fontWeight: 600, fontSize: 12 }}>
                  📞 Call
                </a>
              )}
            </div>
          </div>

          {userLocation && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--runit-muted)", fontWeight: 600 }}>Customer live location</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--runit-accent)", animation: "pulse 1.5s infinite" }} />
                  <span style={{ fontSize: 10, color: "var(--runit-accent)" }}>Live</span>
                </div>
              </div>
              <a
                href={buildMapsUrl(userLocation.lat, userLocation.lng)}
                target="_blank"
                rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(0,201,167,0.07)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontSize: 12, fontWeight: 500, textDecoration: "none" }}
              >
                <span>{"📍 " + parseFloat(userLocation.lat).toFixed(4) + ", " + parseFloat(userLocation.lng).toFixed(4)}</span>
                <span style={{ marginLeft: "auto", fontSize: 11 }}>Open Maps</span>
              </a>
              <div style={{ fontSize: 10, color: "var(--runit-muted)", marginTop: 4 }}>
                {"Last update: " + new Date(userLocation.updated_at).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            </div>
          )}

          {order.delivery_lat && order.delivery_lng && (
            <div style={{ marginBottom: 14 }}>
              <a
                href={buildMapsUrl(order.delivery_lat, order.delivery_lng)}
                target="_blank"
                rel="noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", borderRadius: 12, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
              >
                📍 Open Delivery Location in Maps
              </a>
            </div>
          )}

          {currentStep && currentStep.next && (
            <button
              onClick={function () { updateStatus(currentStep.next); }}
              disabled={updating}
              style={{ width: "100%", padding: "13px", borderRadius: 50, background: updating ? "var(--runit-accent-dark)" : "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 14, border: "none", cursor: updating ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {updating ? "Updating..." : currentStep.action}
            </button>
          )}

          {order.status === "delivered" && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Order delivered!</div>
              <div style={{ color: "var(--runit-muted)", fontSize: 13 }}>
                {"Collect GH\u20B5 " + parseFloat(order.final_fee || order.proposed_fee).toFixed(2) + " cash from customer"}
              </div>
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <ReportForm orderId={order.id} role="runner" />
          </div>

        </div>
      )}
    </div>
  );
}

export default function ActiveOrder() {
  var [orders, setOrders] = useState([]);
  var [loading, setLoading] = useState(true);
  var navigate = useNavigate();

  var fetchActiveOrders = useCallback(async function () {
    try {
      var token = localStorage.getItem("runit_token");
      var res = await fetch("http://localhost/runit-backend/api/orders/list.php", {
        headers: { Authorization: "Bearer " + token },
      });
      var data = await res.json();
      if (res.ok) {
        var active = (data.orders || []).filter(function (o) {
          return ["accepted", "on_the_way", "arrived"].includes(o.status);
        });
        setOrders(active);
      }
    } catch { }
    setLoading(false);
  }, []);

  useEffect(function () {
    fetchActiveOrders();
    var id = setInterval(fetchActiveOrders, 8000);
    return function () { clearInterval(id); };
  }, [fetchActiveOrders]);

  var phoneIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.09 1.18 2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar
        title="Active Orders"
        subtitle={loading ? "Loading..." : orders.length + " active"}
        actions={[{ icon: phoneIcon, onClick: function () { } }]}
      />

      <div className="page-content">

        {loading && <Spinner />}

        {!loading && orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>No active orders</div>
            <div style={{ color: "var(--runit-muted)", fontSize: 14, marginBottom: 24 }}>
              Accept an order from the feed to see it here
            </div>
            <button
              onClick={function () { navigate("/runner/feed"); }}
              style={{ padding: "12px 28px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Go to Feed
            </button>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div>
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--runit-accent)", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 13, color: "var(--runit-muted)" }}>
                {orders.length + " order" + (orders.length !== 1 ? "s" : "") + " in progress — tap to expand"}
              </span>
            </div>

            {orders.map(function (order, index) {
              return (
                <OrderCard
                  key={order.id}
                  order={order}
                  defaultExpanded={index === 0}
                  onUpdate={fetchActiveOrders}
                />
              );
            })}
          </div>
        )}

      </div>
      <BottomPillNav />
    </div>
  );
}