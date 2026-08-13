import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TYPE_META = {
  accepted:    { color: "#00c9a7", label: "Accepted" },
  on_the_way:  { color: "#7090ff", label: "On The Way" },
  arrived:     { color: "#c060ff", label: "Arrived" },
  delivered:   { color: "#00c9a7", label: "Delivered" },
  cancelled:   { color: "#ff6060", label: "Cancelled" },
  counter_fee: { color: "#ffb400", label: "Fee Proposal" },
  new_order:   { color: "#00c9a7", label: "New Order" },
  new_runner:  { color: "#ffb400", label: "New Runner" },
  new_orders:  { color: "#9664ff", label: "Orders" },
};

function timeAgo(time) {
  var diff = Math.floor((Date.now() - new Date(time)) / 1000);
  if (diff < 60)    return diff + "s ago";
  if (diff < 3600)  return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

function getSince() {
  var stored = localStorage.getItem("runit_notif_since");
  if (stored) return stored;
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
}

function saveSince(val) {
  localStorage.setItem("runit_notif_since", val);
}

export default function NotificationBell() {
  var auth     = useAuth();
  var user     = auth.user;
  var navigate = useNavigate();

  var [notifs, setNotifs]   = useState([]);
  var [open, setOpen]       = useState(false);
  var [unread, setUnread]   = useState(0);
  var [badge, setBadge]     = useState(false);
  var panelRef              = useRef(null);
  var prevIdsRef            = useRef([]);

  useEffect(function() {
    fetchNotifs();
    var id = setInterval(fetchNotifs, 8000);
    return function() { clearInterval(id); };
  }, []); // eslint-disable-line

  useEffect(function() {
    var handler = function(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return function() { document.removeEventListener("mousedown", handler); };
  }, []);

  var fetchNotifs = async function() {
    try {
      var since = getSince();
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(
        "http://localhost/runit-backend/api/notifications/list.php?since=" + encodeURIComponent(since),
        { headers: { Authorization: "Bearer " + token } }
      );
      var data = await res.json();
      if (res.ok) {
        var newNotifs = data.notifications || [];
        var newIds    = newNotifs.map(function(n) { return n.id; });
        var prevIds   = prevIdsRef.current;
        var hasNew    = newIds.some(function(id) { return !prevIds.includes(id); });
        if (hasNew && prevIds.length > 0) {
          setBadge(true);
          setTimeout(function() { setBadge(false); }, 3000);
        }
        prevIdsRef.current = newIds;
        setNotifs(newNotifs);
        if (!open) setUnread(newNotifs.length);
      }
    } catch {}
  };

  var handleNotifClick = function(notif) {
    setOpen(false);
    if (notif.order_id) {
      if (user && user.role === "user")   navigate("/orders/" + notif.order_id);
      if (user && user.role === "runner") navigate("/runner/active");
      if (user && user.role === "admin")  navigate("/admin/orders");
    } else {
      if (user && user.role === "admin")  navigate("/admin/runners");
    }
  };

  var clearAll = function() {
    var now = new Date().toISOString().slice(0, 19).replace("T", " ");
    saveSince(now);
    prevIdsRef.current = [];
    setNotifs([]);
    setUnread(0);
    setOpen(false);
  };

  var handleOpen = function() {
    setOpen(function(o) { return !o; });
    setUnread(0);
  };

  return (
    <div ref={panelRef} style={{ position: "relative" }}>

      <button
        onClick={handleOpen}
        style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(15,46,41,0.80)", border: "0.5px solid rgba(0,201,167,0.18)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", flexShrink: 0 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unread > 0 && (
          <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#ff6060", border: "1.5px solid var(--runit-bg)" }} />
        )}
        {badge && (
          <div style={{ position: "absolute", inset: -3, borderRadius: "50%", border: "2px solid var(--runit-accent)", animation: "pulse 0.8s ease" }} />
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", top: 48, right: 0, width: 340, maxHeight: 460, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.4)", zIndex: 200 }}>

          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--runit-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
              {notifs.length > 0 && (
                <span style={{ background: "rgba(0,201,167,0.15)", color: "var(--runit-accent)", borderRadius: 50, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                  {notifs.length}
                </span>
              )}
            </div>
            {notifs.length > 0 && (
              <button onClick={clearAll} style={{ background: "none", border: "none", color: "var(--runit-muted)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                Clear all
              </button>
            )}
          </div>

          <div style={{ overflowY: "auto", maxHeight: 400 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>No new notifications</div>
              </div>
            ) : notifs.map(function(notif) {
              var meta = TYPE_META[notif.type] || { color: "var(--runit-accent)", label: "Update" };
              return (
                <div
                  key={notif.id}
                  onClick={function() { handleNotifClick(notif); }}
                  style={{ padding: "12px 16px", borderBottom: "1px solid var(--runit-border)", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", transition: "background 0.15s" }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(0,201,167,0.05)"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{notif.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{notif.title}</span>
                      {notif.order_id && (
                        <span style={{ background: "rgba(0,201,167,0.1)", color: "var(--runit-accent)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "1px 8px", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>
                          {"#" + notif.order_id}
                        </span>
                      )}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ background: meta.color + "22", color: meta.color, borderRadius: 50, padding: "1px 8px", fontSize: 10, fontWeight: 600 }}>
                        {meta.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--runit-muted)", lineHeight: 1.4, marginBottom: 4 }}>
                      {notif.body}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--runit-muted)" }}>
                      {timeAgo(notif.time)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}