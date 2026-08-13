import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import BottomPillNav from "../../components/BottomPillNav";
import PillNavbar from "../../components/PillNavbar";
import StatusBadge from "../../components/StatusBadge";
import PushPrompt from "../../components/PushPrompt";

export default function UserDashboard() {
  var auth     = useAuth();
  var user     = auth.user;
  var logout   = auth.logout;
  var navigate = useNavigate();
  var [orders, setOrders] = useState([]);

  var fetchOrders = useCallback(async function() {
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch("http://localhost/runit-backend/api/orders/list.php", {
        headers: { Authorization: "Bearer " + token },
      });
      var data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch {}
  }, []);

  useEffect(function() {
    fetchOrders();
    var id = setInterval(fetchOrders, 8000);
    return function() { clearInterval(id); };
  }, [fetchOrders]);

  var active    = orders.filter(function(o) { return ["pending","accepted","on_the_way","arrived"].includes(o.status); });
  var delivered = orders.filter(function(o) { return o.status === "delivered"; });
  var recent    = orders.slice(0, 3);

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>

      <PillNavbar
        title="My Dashboard"
        subtitle={"Welcome back, " + (user && user.name ? user.name.split(" ")[0] : "")}
      />

      <div className="page-content">

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {"Hey " + (user && user.name ? user.name.split(" ")[0] : "") + " 👋"}
          </h1>
          <p style={{ color: "var(--runit-muted)", fontSize: 14 }}>What do you need today?</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Total Orders", value: orders.length },
            { label: "Active",       value: active.length },
            { label: "Delivered",    value: delivered.length },
          ].map(function(stat) {
            return (
              <div key={stat.label} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: "16px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--runit-accent)" }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "var(--runit-muted)", marginTop: 2 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent Orders</h2>
            <button onClick={function() { navigate("/orders"); }} style={{ background: "none", border: "none", color: "var(--runit-accent)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              See all
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recent.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "var(--runit-muted)", fontSize: 14 }}>
                No orders yet — place your first one!
              </div>
            ) : recent.map(function(order) {
              return (
                <div key={order.id}
                  onClick={function() { navigate("/orders/" + order.id); }}
                  style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: "14px 16px", cursor: "pointer", transition: "border-color 0.2s", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
                  onMouseEnter={function(e) { e.currentTarget.style.borderColor = "var(--runit-border-strong)"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.borderColor = "var(--runit-border)"; }}
                >
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>
                      {order.description.length > 55 ? order.description.slice(0, 55) + "..." : order.description}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>
                      {order.category + " \u00B7 GH\u20B5 " + parseFloat(order.final_fee || order.proposed_fee).toFixed(2)}
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 99 }}>
        <button onClick={function() { navigate("/place-order"); }} style={{ padding: "14px 36px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 4px 30px rgba(0,201,167,0.35)", whiteSpace: "nowrap" }}>
          + Place Order
        </button>
      </div>

      <PushPrompt />
      <BottomPillNav />
    </div>
  );
}