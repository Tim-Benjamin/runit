import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import StatusBadge from "../../components/StatusBadge";
import { SkeletonCard } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import Stories from '../../components/Stories';

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  var [search, setSearch]             = useState("");
  var [statusFilter, setStatusFilter] = useState("");
  var [catFilter, setCatFilter]       = useState("");
  var [dateFrom, setDateFrom]         = useState("");
  var [dateTo, setDateTo]             = useState("");
  var [page, setPage]                 = useState(1);
  var [totalPages, setTotalPages]     = useState(1);

  var fetchOrders = async function() {
    setLoading(true);
    try {
      var token  = localStorage.getItem("runit_token");
      var params = new URLSearchParams();
      if (search)       params.set("search",    search);
      if (statusFilter) params.set("status",    statusFilter);
      if (catFilter)    params.set("category",  catFilter);
      if (dateFrom)     params.set("date_from", dateFrom);
      if (dateTo)       params.set("date_to",   dateTo);
      params.set("page", String(page));

      var res  = await fetch(import.meta.env.VITE_API_BASE + '/api/orders/list.php?' + params.toString(), {
        headers: { Authorization: "Bearer " + token },
      });
      var data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(function() {
    fetchOrders();
    var id = setInterval(fetchOrders, 8000);
    return function() { clearInterval(id); };
  }, [search, statusFilter, catFilter, dateFrom, dateTo, page]); // eslint-disable-line

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
        subtitle={total + " total"}
        actions={[
          { icon: searchIcon, onClick: function() {} },
          { icon: dotsIcon,   onClick: function() {} },
        ]}
      />

      <div className="page-content">
        <Stories />

        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--runit-muted)" }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={function(e) { setSearch(e.target.value); setPage(1); }}
            placeholder="Search orders..."
            style={{ width: "100%", padding: "11px 14px 11px 42px", borderRadius: 50, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
          {["","scheduled","pending","accepted","on_the_way","arrived","delivered","cancelled"].map(function(s) {
            var sel   = statusFilter === s;
            var label = s === "" ? "All" : s.replace(/_/g, " ");
            return (
              <button key={s} onClick={function() { setStatusFilter(s); setPage(1); }}
                style={{ padding: "6px 14px", borderRadius: 50, fontSize: 11, fontWeight: sel ? 700 : 400, border: "1px solid", borderColor: sel ? "var(--runit-accent)" : "var(--runit-border)", background: sel ? "rgba(0,201,167,0.12)" : "transparent", color: sel ? "var(--runit-accent)" : "var(--runit-muted)", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", textTransform: "capitalize" }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
          {["","Food & Drinks","Errands","Shopping","Pickup & Drop","Gas Refill","Custom"].map(function(c) {
            var sel = catFilter === c;
            return (
              <button key={c} onClick={function() { setCatFilter(c); setPage(1); }}
                style={{ padding: "6px 14px", borderRadius: 50, fontSize: 11, fontWeight: sel ? 700 : 400, border: "1px solid", borderColor: sel ? "var(--runit-accent)" : "var(--runit-border)", background: sel ? "rgba(0,201,167,0.12)" : "transparent", color: sel ? "var(--runit-accent)" : "var(--runit-muted)", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {c || "All categories"}
              </button>
            );
          })}
        </div>

        {/* Date range */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input type="date" value={dateFrom} onChange={function(e) { setDateFrom(e.target.value); setPage(1); }}
            style={{ flex: 1, padding: "9px 12px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
          <input type="date" value={dateTo} onChange={function(e) { setDateTo(e.target.value); setPage(1); }}
            style={{ flex: 1, padding: "9px 12px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
          {(dateFrom || dateTo) && (
            <button onClick={function() { setDateFrom(""); setDateTo(""); setPage(1); }}
              style={{ padding: "9px 14px", borderRadius: 12, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff8080", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              ✕
            </button>
          )}
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(function(i) { return <SkeletonCard key={i} />; })}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <EmptyState
            icon="??"
            title="No orders yet"
            subtitle="Place your first order and a runner will pick it up"
            action={function() { navigate("/place-order"); }}
            actionLabel="Place an Order"
          />
        )}

        {!loading && orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map(function(order) {
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
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <StatusBadge status={order.status} />
                      {order.is_scheduled && order.status === "scheduled" && (
                        <span style={{ background: "rgba(255,180,0,0.12)", color: "#ffb400", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 50, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                          {"⏰ " + new Date(order.scheduled_for).toLocaleString("en-GH", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      )}
                    </div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
            <button onClick={function() { setPage(function(p) { return Math.max(1, p - 1); }); }} disabled={page === 1}
              style={{ padding: "8px 16px", borderRadius: 50, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: page === 1 ? "var(--runit-muted)" : "var(--runit-text)", fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              ← Prev
            </button>
            <span style={{ padding: "8px 16px", fontSize: 13, color: "var(--runit-muted)" }}>
              {page + " / " + totalPages}
            </span>
            <button onClick={function() { setPage(function(p) { return Math.min(totalPages, p + 1); }); }} disabled={page === totalPages}
              style={{ padding: "8px 16px", borderRadius: 50, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: page === totalPages ? "var(--runit-muted)" : "var(--runit-text)", fontSize: 13, cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              Next →
            </button>
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