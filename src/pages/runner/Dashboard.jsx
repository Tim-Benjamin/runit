import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import StatusBadge from "../../components/StatusBadge";
import PushPrompt from "../../components/PushPrompt";

export default function RunnerDashboard() {
  var auth     = useAuth();
  var user     = auth.user;
  var navigate = useNavigate();
  var [earnings, setEarnings] = useState(null);
  var [orders, setOrders]     = useState([]);
  var [isOnline, setIsOnline] = useState(false);
  var [toggling, setToggling] = useState(false);

  var fetchData = useCallback(async function() {
    try {
      var token = localStorage.getItem("runit_token");
      var [eRes, oRes] = await Promise.all([
        fetch(import.meta.env.VITE_API_BASE + '/api/runner/earnings.php', { headers: { Authorization: 'Bearer ' + token } }),
        fetch(import.meta.env.VITE_API_BASE + '/api/orders/list.php',    { headers: { Authorization: 'Bearer ' + token } }),
      ]);
      var eData = await eRes.json();
      var oData = await oRes.json();
      if (eRes.ok) setEarnings(eData);
      if (oRes.ok) setOrders(oData.orders || []);
    } catch {}
  }, []);

  useEffect(function() {
    fetchData();
    var id = setInterval(fetchData, 8000);
    return function() { clearInterval(id); };
  }, [fetchData]);

  // Load online status on mount
  useEffect(function() {
    var token = localStorage.getItem("runit_token");
    fetch(import.meta.env.VITE_API_BASE + '/api/runner/profile.php', {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.runner) setIsOnline(!!parseInt(d.runner.is_online));
      })
      .catch(function() {});
  }, []);

  var toggleOnline = async function() {
    setToggling(true);
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(import.meta.env.VITE_API_BASE + '/api/runner/toggle_online.php', {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ is_online: !isOnline }),
      });
      var data = await res.json();
      if (res.ok) {
        setIsOnline(data.is_online);
        if (window.navigator.vibrate) window.navigator.vibrate(data.is_online ? [50, 30, 50] : [100]);
      }
    } catch {}
    setToggling(false);
  };

  var outstanding = Math.max(0,
    parseFloat((earnings && earnings.totals && earnings.totals.total_platform_cut) || 0) -
    parseFloat((earnings && earnings.totals && earnings.totals.total_settled)      || 0)
  );

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>

      <PillNavbar
        title="Runner Dashboard"
        subtitle={(user && user.name ? user.name.split(" ")[0] : "") + " \u00B7 " + (isOnline ? "Online" : "Offline")}
      />

      <div className="page-content">

        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              {"Hey " + (user && user.name ? user.name.split(" ")[0] : "") + " 🏃"}
            </h1>
            <p style={{ color: "var(--runit-muted)", fontSize: 14 }}>
              {isOnline ? "You\u2019re online and ready" : "You\u2019re currently offline"}
            </p>
          </div>
          <div style={{ background: isOnline ? "rgba(0,201,167,0.12)" : "rgba(255,80,80,0.08)", border: "1px solid " + (isOnline ? "rgba(0,201,167,0.3)" : "rgba(255,80,80,0.25)"), borderRadius: 50, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: isOnline ? "var(--runit-accent)" : "#ff6060" }} />
            <span style={{ fontSize: 12, color: isOnline ? "var(--runit-accent)" : "#ff6060", fontWeight: 600 }}>{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>

        {/* ── Online/Offline Toggle ── */}
        <div style={{ background: isOnline ? "rgba(0,201,167,0.08)" : "rgba(255,80,80,0.06)", border: "1px solid " + (isOnline ? "rgba(0,201,167,0.25)" : "rgba(255,80,80,0.2)"), borderRadius: 20, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: isOnline ? "#00c9a7" : "#ff6060", boxShadow: isOnline ? "0 0 8px #00c9a7" : "none", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: isOnline ? "var(--runit-accent)" : "#ff6060" }}>
                {isOnline ? "You are Online" : "You are Offline"}
              </div>
              <div style={{ fontSize: 11, color: "var(--runit-muted)", marginTop: 1 }}>
                {isOnline ? "Orders are showing in your feed" : "You won't receive any orders"}
              </div>
            </div>
          </div>
          <button onClick={toggleOnline} disabled={toggling}
            style={{ padding: "9px 18px", borderRadius: 50, fontWeight: 700, fontSize: 13, border: "none", cursor: toggling ? "not-allowed" : "pointer", fontFamily: "inherit", background: isOnline ? "rgba(255,80,80,0.12)" : "rgba(0,201,167,0.15)", color: isOnline ? "#ff6060" : "var(--runit-accent)", transition: "all 0.2s" }}>
            {toggling ? "..." : isOnline ? "Go Offline" : "Go Online"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }}>
          {[
            { label: "This Week",      value: (earnings && earnings.week && earnings.week.week_orders) || 0 },
            { label: "Earned",         value: "GH\u20B5 " + parseFloat((earnings && earnings.week && earnings.week.week_earned) || 0).toFixed(2) },
            { label: "Commission Due", value: "GH\u20B5 " + outstanding.toFixed(2) },
          ].map(function(stat) {
            return (
              <div key={stat.label} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: "16px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--runit-accent)" }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: "var(--runit-muted)", marginTop: 2, lineHeight: 1.3 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "linear-gradient(135deg, rgba(0,201,167,0.12), rgba(0,121,107,0.08))", border: "1px solid var(--runit-border-strong)", borderRadius: 20, padding: 20, marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>New orders waiting</div>
            <div style={{ color: "var(--runit-muted)", fontSize: 13 }}>Check the live feed to accept</div>
          </div>
          <button onClick={function() { navigate("/runner/feed"); }} style={{ padding: "10px 20px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            View Feed
          </button>
        </div>

        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Recent Orders</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--runit-muted)", fontSize: 14 }}>
                No orders yet — check the feed!
              </div>
            ) : orders.slice(0, 5).map(function(order) {
              return (
                <div key={order.id} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>
                      {order.description.length > 50 ? order.description.slice(0, 50) + "..." : order.description}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>
                      {new Date(order.created_at).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" }) + " \u00B7 GH\u20B5 " + parseFloat(order.final_fee || order.proposed_fee).toFixed(2)}
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <PushPrompt />
      <BottomPillNav />
    </div>
  );
}