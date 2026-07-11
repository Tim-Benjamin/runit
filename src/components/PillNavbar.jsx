import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const pillStyle = {
  background: "rgba(15,46,41,0.80)",
  border: "0.5px solid rgba(0,201,167,0.18)",
  borderRadius: 50,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function DotsMenu({ items }) {
  var [open, setOpen] = useState(false);
  var menuRef         = useRef(null);

  useEffect(function() {
    var handler = function(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return function() { document.removeEventListener("mousedown", handler); };
  }, []);

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={function() { setOpen(function(o) { return !o; }); }}
        style={{ ...pillStyle, width: 40, height: 40, cursor: "pointer", border: "0.5px solid rgba(0,201,167,0.18)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {open && (
        <div style={{ position: "absolute", top: 48, right: 0, minWidth: 180, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 300 }}>
          {items.map(function(item, i) {
            return (
              <button
                key={i}
                onClick={function() { setOpen(false); item.onClick(); }}
                style={{ width: "100%", padding: "12px 16px", background: "transparent", border: "none", borderBottom: i < items.length - 1 ? "1px solid var(--runit-border)" : "none", color: item.danger ? "#ff8080" : "var(--runit-text)", fontSize: 14, fontWeight: item.danger ? 600 : 400, cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s" }}
                onMouseEnter={function(e) { e.currentTarget.style.background = item.danger ? "rgba(255,80,80,0.07)" : "rgba(0,201,167,0.05)"; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PillNavbar({ title, subtitle, avatar, actions = [], showBell = true, menuItems }) {
  var navigate     = useNavigate();
  var auth         = useAuth();
  var user         = auth.user;
  var logout       = auth.logout;

  var defaultMenuItems = [
    {
      icon: "👤",
      label: "My Profile",
      danger: false,
      onClick: function() {
        if (user && user.role === "user")   navigate("/profile");
        if (user && user.role === "runner") navigate("/runner/profile");
        if (user && user.role === "admin")  navigate("/admin");
      },
    },
    {
      icon: "📦",
      label: user && user.role === "runner" ? "Active Orders" : user && user.role === "admin" ? "All Orders" : "My Orders",
      danger: false,
      onClick: function() {
        if (user && user.role === "user")   navigate("/orders");
        if (user && user.role === "runner") navigate("/runner/active");
        if (user && user.role === "admin")  navigate("/admin/orders");
      },
    },
    {
      icon: "🚪",
      label: "Sign Out",
      danger: true,
      onClick: function() {
        if (window.confirm("Sign out of RunIt?")) {
          logout();
          navigate("/");
        }
      },
    },
  ];

  var resolvedMenuItems = menuItems || defaultMenuItems;

  var filteredActions = (actions || []).filter(function(action) {
    return action && action.icon && typeof action.icon !== "string";
  });

  return (
    <>
      <div
        className="pill-navbar-desktop"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", pointerEvents: "none" }}
      >
        <button
          onClick={function() { navigate(-1); }}
          style={{ ...pillStyle, width: 40, height: 40, flexShrink: 0, cursor: "pointer", pointerEvents: "all", border: "0.5px solid rgba(0,201,167,0.18)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div style={{ ...pillStyle, flex: 1, gap: 10, padding: "0 16px", height: 40, justifyContent: "flex-start", pointerEvents: "all" }}>
          {avatar && (
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--runit-accent)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0a1f1c" }}>
              {avatar}
            </div>
          )}
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--runit-text)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 9, color: "var(--runit-muted)", lineHeight: 1.2, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {showBell && user && (
          <div style={{ pointerEvents: "all" }}>
            <NotificationBell />
          </div>
        )}

        {filteredActions.map(function(action, i) {
          return (
            <button key={i} onClick={action.onClick} style={{ ...pillStyle, width: 40, height: 40, flexShrink: 0, cursor: "pointer", pointerEvents: "all", border: "0.5px solid rgba(0,201,167,0.18)" }}>
              {action.icon}
            </button>
          );
        })}

        <div style={{ pointerEvents: "all" }}>
          <DotsMenu items={resolvedMenuItems} />
        </div>
      </div>

      <div className="pill-navbar-mobile" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "none", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(10,31,28,0.92)", borderBottom: "0.5px solid var(--runit-border)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <button onClick={function() { navigate(-1); }} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(15,46,41,0.8)", border: "0.5px solid rgba(0,201,167,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div style={{ flex: 1, textAlign: "center", padding: "0 10px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--runit-text)", lineHeight: 1.2 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 10, color: "var(--runit-muted)", marginTop: 1 }}>{subtitle}</div>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {showBell && user && <NotificationBell />}
          <DotsMenu items={resolvedMenuItems} />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .pill-navbar-desktop { display: none !important; }
          .pill-navbar-mobile  { display: flex !important; }
        }
      `}</style>
    </>
  );
}