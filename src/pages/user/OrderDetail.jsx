import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import RatingForm from '../../components/RatingForm';
import ReportForm from '../../components/ReportForm';

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: "??" },
  { key: "accepted", label: "Runner Assigned", icon: "??" },
  { key: "on_the_way", label: "On The Way", icon: "??" },
  { key: "arrived", label: "Arrived", icon: "??" },
  { key: "delivered", label: "Delivered", icon: "?" },
];

const ACTIVE = ["pending", "accepted", "on_the_way", "arrived"];

function safeStr(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return "";
  return String(val);
}

export default function OrderDetail() {
  var params = useParams();
  var id = params.id;
  var navigate = useNavigate();

  var [order, setOrder] = useState(null);
  var [loading, setLoading] = useState(true);
  var [cancelling, setCancelling] = useState(false);
  var [error, setError] = useState("");
  var [feeMsg, setFeeMsg] = useState("");
  var [newFeeAlert, setNewFeeAlert] = useState(false);
  var locationInterval = useRef(null);
  var pollInterval = useRef(null);
  var prevCounterFee = useRef(null);

  var fetchOrder = useCallback(async function () {
    try {
      var token = localStorage.getItem("runit_token");
      var res = await fetch("http://localhost/runit-backend/api/orders/get.php?id=" + id, {
        headers: { Authorization: "Bearer " + token },
      });
      var data = await res.json();
      if (res.ok && data.order) {
        var incoming = data.order;
        // Detect new counter fee proposal
        if (
          incoming.counter_fee &&
          parseFloat(incoming.counter_fee) > 0 &&
          prevCounterFee.current !== incoming.counter_fee &&
          prevCounterFee.current !== null
        ) {
          setNewFeeAlert(true);
          setTimeout(function () { setNewFeeAlert(false); }, 5000);
        }
        prevCounterFee.current = incoming.counter_fee;
        setOrder(incoming);
      } else if (!res.ok) {
        setError(safeStr(data.error) || "Order not found");
      }
    } catch {
      setError("Connection error. Make sure XAMPP is running.");
    }
    setLoading(false);
  }, [id]);

  useEffect(function () {
    fetchOrder();
    return function () {
      if (locationInterval.current) clearInterval(locationInterval.current);
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [fetchOrder]);

  useEffect(function () {
    if (!order) return;
    if (ACTIVE.includes(order.status)) {
      if (!pollInterval.current) {
        pollInterval.current = setInterval(fetchOrder, 6000);
      }
      if (order.status !== "pending") {
        if (!locationInterval.current) {
          sendLocation();
          locationInterval.current = setInterval(sendLocation, 5000);
        }
      }
    } else {
      if (locationInterval.current) { clearInterval(locationInterval.current); locationInterval.current = null; }
      if (pollInterval.current) { clearInterval(pollInterval.current); pollInterval.current = null; }
    }
  }, [order && order.status, fetchOrder]); // eslint-disable-line

  var sendLocation = function () {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(function (pos) {
      var token = localStorage.getItem("runit_token");
      fetch("http://localhost/runit-backend/api/location/update.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ order_id: parseInt(id), lat: pos.coords.latitude, lng: pos.coords.longitude }),
      }).catch(function () { });
    });
  };

  var cancelOrder = async function () {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      var token = localStorage.getItem("runit_token");
      var res = await fetch("http://localhost/runit-backend/api/orders/cancel.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ order_id: parseInt(id) }),
      });
      var data = await res.json();
      if (res.ok) fetchOrder();
      else setError(safeStr(data.error) || "Failed to cancel");
    } catch { setError("Connection error"); }
    setCancelling(false);
  };

  var handleFeeResponse = async function (action) {
    try {
      var token = localStorage.getItem("runit_token");
      var res = await fetch("http://localhost/runit-backend/api/orders/approve_fee.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ order_id: parseInt(id), action: action }),
      });
      var data = await res.json();
      if (res.ok) {
        setFeeMsg(action === "approve" ? "Fee accepted! Runner is on the way." : "Fee declined. Order is back in the feed.");
        setTimeout(function () { setFeeMsg(""); }, 4000);
        prevCounterFee.current = null;
        fetchOrder();
      } else {
        setError(safeStr(data.error) || "Failed");
      }
    } catch { setError("Connection error"); }
  };

  var stepIndex = STATUS_STEPS.findIndex(function (s) { return s.key === (order && order.status); });

  if (loading) {
    return (
      <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)" }}>
        <PillNavbar title={"Order #" + id} subtitle="Order details" />
        <div className="page-content" style={{ maxWidth: 560, margin: "0 auto" }}><Spinner /></div>
        <BottomPillNav />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)" }}>
        <PillNavbar title={"Order #" + id} subtitle="Order details" />
        <div className="page-content" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>??</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{error || "Order not found"}</div>
          <button onClick={function () { navigate("/orders"); }} style={{ marginTop: 16, padding: "11px 24px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            Back to Orders
          </button>
        </div>
        <BottomPillNav />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title={"Order #" + id} subtitle="Order details" />

      <div className="page-content" style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {error !== "" && (
            <div style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 12, padding: "12px 16px", color: "#ff8080", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{"? " + error}</span>
              <button onClick={function () { setError(""); }} style={{ background: "none", border: "none", color: "#ff8080", cursor: "pointer", fontSize: 18, fontFamily: "inherit" }}>x</button>
            </div>
          )}

          {feeMsg !== "" && (
            <div style={{ background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border-strong)", borderRadius: 12, padding: "12px 16px", color: "var(--runit-accent)", fontSize: 13, fontWeight: 500 }}>
              {"? " + feeMsg}
            </div>
          )}

          {newFeeAlert && (
            <div style={{ background: "rgba(255,180,0,0.1)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 12, padding: "12px 16px", color: "#ffb400", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span>??</span>
              <span>A runner just proposed a new delivery fee! See below.</span>
            </div>
          )}

          {parseFloat(order.counter_fee || 0) > 0 && order.status === "pending" && (
            <div style={{ background: "rgba(255,180,0,0.08)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 20, padding: 20 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>??</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#ffb400", marginBottom: 6 }}>Runner proposed a different fee</div>
                  <div style={{ fontSize: 13, color: "var(--runit-muted)", lineHeight: 1.6 }}>
                    {"A runner wants to deliver this for GH\u20B5 " + parseFloat(order.counter_fee).toFixed(2) + " instead of your proposed GH\u20B5 " + parseFloat(order.proposed_fee).toFixed(2) + "."}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={function () { handleFeeResponse("approve"); }} style={{ flex: 1, padding: "11px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  {"? Accept GH\u20B5 " + parseFloat(order.counter_fee).toFixed(2)}
                </button>
                <button onClick={function () { handleFeeResponse("decline"); }} style={{ padding: "11px 18px", borderRadius: 50, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", color: "#ff8080", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Decline
                </button>
              </div>
            </div>
          )}

          <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Order Status</span>
              <StatusBadge status={safeStr(order.status)} />
            </div>

            {order.status !== "cancelled" ? (
              <div>
                {STATUS_STEPS.map(function (step, i) {
                  var isDone = i <= stepIndex;
                  var isActive = i === stepIndex;
                  return (
                    <div key={step.key} style={{ display: "flex", gap: 14 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: isDone ? "rgba(0,201,167,0.15)" : "var(--runit-elevated)", border: "2px solid " + (isDone ? "var(--runit-accent)" : "var(--runit-border)"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                          {step.icon}
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div style={{ width: 2, minHeight: 28, background: i < stepIndex ? "var(--runit-accent)" : "var(--runit-border)", margin: "4px 0" }} />
                        )}
                      </div>
                      <div style={{ paddingTop: 8, paddingBottom: i < STATUS_STEPS.length - 1 ? 20 : 0 }}>
                        <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isDone ? "var(--runit-text)" : "var(--runit-muted)" }}>
                          {step.label}
                        </div>
                        {isActive && (
                          <div style={{ fontSize: 11, color: "var(--runit-accent)", marginTop: 2 }}>Current status</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "12px 0", color: "#ff8080", fontSize: 14 }}>This order was cancelled</div>
            )}
          </div>

          <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 20 }}>
            <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 12, fontWeight: 600 }}>Order Details</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>{safeStr(order.description)}</div>
            {order.notes && (
              <div style={{ fontSize: 13, color: "var(--runit-muted)", fontStyle: "italic", marginBottom: 14, padding: "10px 14px", background: "var(--runit-elevated)", borderRadius: 10 }}>
                {"?? " + safeStr(order.notes)}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Category", value: safeStr(order.category) },
                { label: "Proposed Fee", value: "GH\u20B5 " + parseFloat(order.proposed_fee || 0).toFixed(2) },
                { label: "Final Fee", value: order.final_fee ? "GH\u20B5 " + parseFloat(order.final_fee).toFixed(2) : "Pending" },
                order.pickup_address ? { label: "Pickup location", value: safeStr(order.pickup_address) } : null,
                order.dropoff_address ? { label: "Drop-off notes", value: safeStr(order.dropoff_address) } : null,
                order.pickup_phone ? { label: "Pickup contact", value: safeStr(order.pickup_phone) } : null,
                order.cylinder_size ? { label: "Cylinder size", value: safeStr(order.cylinder_size).charAt(0).toUpperCase() + safeStr(order.cylinder_size).slice(1) } : null,
                { label: "Status", value: safeStr(order.status).replace(/_/g, " ") },
                { label: "Placed", value: new Date(order.created_at).toLocaleString("en-GH") },
              ].filter(Boolean).map(function (item) {
                return (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid var(--runit-border)", paddingBottom: 8 }}>
                    <span style={{ color: "var(--runit-muted)" }}>{item.label}</span>
                    <span style={{ fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {order.runner_name && (
            <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 12, fontWeight: 600 }}>Your Runner</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "#0a1f1c" }}>
                    {safeStr(order.runner_name).charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{safeStr(order.runner_name)}</div>
                    <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>{safeStr(order.delivery_method) || "Runner"}</div>
                  </div>
                </div>
                <a href={"tel:" + safeStr(order.runner_phone)} style={{ padding: "10px 16px", borderRadius: 50, background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)", color: "var(--runit-accent)", fontWeight: 600, fontSize: 13 }}>
                  ?? Call
                </a>
              </div>
            </div>
          )}

          <div style={{ background: "rgba(0,201,167,0.05)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 18, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22 }}>??</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Cash on delivery</div>
              <div style={{ fontSize: 13, color: "var(--runit-muted)", lineHeight: 1.5 }}>
                {"Pay your runner GH\u20B5 " + parseFloat(order.final_fee || order.proposed_fee || 0).toFixed(2) + " in cash when they arrive."}
              </div>
            </div>
          </div>

          {/* Rating — shown once when delivered */}
          {order.status === 'delivered' && (
            <RatingForm orderId={parseInt(id)} />
          )}

          {/* Report issue */}
          {['accepted', 'on_the_way', 'arrived', 'delivered'].includes(order.status) && (
            <ReportForm orderId={parseInt(id)} role="user" />
          )}

          {order.status === "pending" && !order.counter_fee && (
            <button onClick={cancelOrder} disabled={cancelling} style={{ width: "100%", padding: "13px", borderRadius: 50, background: "transparent", border: "1px solid rgba(255,80,80,0.3)", color: "#ff8080", fontWeight: 600, fontSize: 14, cursor: cancelling ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}

          <button onClick={function () { navigate("/orders"); }} style={{ width: "100%", padding: "12px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            Back to Orders
          </button>

        </div>
      </div>
      <BottomPillNav />
    </div>
  );
}
