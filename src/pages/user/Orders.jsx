import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import StatusBadge from "../../components/StatusBadge";
import { SkeletonCard } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

const FILTERS = ["All", "Pending", "Active", "Delivered", "Cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("runit_token");
      const res = await fetch("http://localhost/runit-backend/api/orders/list.php", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 8000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const filtered = orders.filter(function(o) {
    if (filter === "All") return true;
    if (filter === "Active") return ["accepted", "on_the_way", "arrived"].includes(o.status);
    if (filter === "Pending") return o.status === "pending";
    if (filter === "Delivered") return o.status === "delivered";
    if (filter === "Cancelled") return o.status === "cancelled";
    return true;
  });

  const searchIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const dotsIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  );

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar
        title="My Orders"
        subtitle={orders.length + " total"}
        actions={[
          { icon: searchIcon, onClick: function() {} },
          { icon: dotsIcon,   onClick: function() {} },
        ]}
      />

      <div className="page-content">

        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {FILTERS.map(function(f) {
            return (
              <button key={f} onClick={function() { setFilter(f); }} style={{
                padding: "7px 16px", borderRadius: 50, fontSize: 12,
                fontWeight: filter === f ? 600 : 400,
                border: "1px solid",
                borderColor: filter === f ? "var(--runit-accent)" : "var(--runit-border)",
                background: filter === f ? "rgba(0,201,167,0.12)" : "transparent",
                color: filter === f ? "var(--runit-accent)" : "var(--runit-muted)",
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
                fontFamily: "inherit",
              }}>{f}</button>
            );
          })}
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(function(i) { return <SkeletonCard key={i} />; })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState
            icon="??"
            title="No orders yet"
            subtitle="Place your first order and a runner will pick it up"
            action={function() { navigate("/place-order"); }}
            actionLabel="Place an Order"
          />
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(function(order) {
              return (
                <div key={order.id}
                  onClick={function() { navigate("/orders/" + order.id); }}
                  style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 18, padding: "16px", cursor: "pointer", transition: "border-color 0.2s" }}
                  onMouseEnter={function(e) { e.currentTarget.style.borderColor = "var(--runit-border-strong)"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.borderColor = "var(--runit-border)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1, marginRight: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>
                        {order.description.length > 65 ? order.description.slice(0, 65) + "..." : order.description}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>{order.category}</div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--runit-border)", paddingTop: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--runit-accent)" }}>
                      {"GH\u20B5 " + parseFloat(order.final_fee || order.proposed_fee).toFixed(2)}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--runit-muted)" }}>
                      {new Date(order.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 99 }}>
        <button onClick={function() { navigate("/place-order"); }} style={{ padding: "13px 32px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 4px 24px rgba(0,201,167,0.3)", whiteSpace: "nowrap" }}>
          + Place Order
        </button>
      </div>

      <BottomPillNav />
    </div>
  );
}
