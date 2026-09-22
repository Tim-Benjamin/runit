import { useState, useEffect } from "react";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import Spinner from "../../components/Spinner";

export default function AdminPromos() {
  var [promos, setPromos]     = useState([]);
  var [loading, setLoading]   = useState(true);
  var [tab, setTab]           = useState("list");
  var [msg, setMsg]           = useState("");
  var [msgType, setMsgType]   = useState("success");
  var [posting, setPosting]   = useState(false);

  var [code, setCode]         = useState("");
  var [type, setType]         = useState("percent");
  var [value, setValue]       = useState("");
  var [minOrder, setMinOrder] = useState("");
  var [maxUses, setMaxUses]   = useState("");
  var [expiresAt, setExpiresAt] = useState("");

  useEffect(function() { fetchPromos(); }, []);

  var fetchPromos = async function() {
    setLoading(true);
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(import.meta.env.VITE_API_BASE + '/api/admin/promos.php', {
        headers: { Authorization: "Bearer " + token },
      });
      var data = await res.json();
      if (res.ok) setPromos(data.promos || []);
    } catch {}
    setLoading(false);
  };

  var showMsg = function(text, t) {
    setMsg(text); setMsgType(t || "success");
    setTimeout(function() { setMsg(""); }, 4000);
  };

  var createPromo = async function() {
    if (!code || !value) { showMsg("Code and value required", "error"); return; }
    setPosting(true);
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(import.meta.env.VITE_API_BASE + '/api/admin/promos.php', {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ code, type, value: parseFloat(value), min_order: parseFloat(minOrder || 0), max_uses: maxUses || null, expires_at: expiresAt || null }),
      });
      var data = await res.json();
      if (res.ok) {
        showMsg("Promo code created!", "success");
        setCode(""); setValue(""); setMinOrder(""); setMaxUses(""); setExpiresAt("");
        setTab("list"); fetchPromos();
      } else showMsg(data.error || "Failed", "error");
    } catch { showMsg("Connection error", "error"); }
    setPosting(false);
  };

  var togglePromo = async function(id, is_active) {
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(import.meta.env.VITE_API_BASE + '/api/admin/promos.php', {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ id, is_active }),
      });
      if (res.ok) { showMsg("Updated", "success"); fetchPromos(); }
    } catch {}
  };

  var deletePromo = async function(id) {
    if (!window.confirm("Delete this promo code?")) return;
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(import.meta.env.VITE_API_BASE + '/api/admin/promos.php', {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ id }),
      });
      if (res.ok) { showMsg("Deleted", "success"); fetchPromos(); }
    } catch {}
  };

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="Promo Codes" subtitle={promos.length + " codes"} />
      <div className="page-content">

        {msg !== "" && (
          <div style={{ background: msgType === "error" ? "rgba(255,80,80,0.08)" : "rgba(0,201,167,0.1)", border: "1px solid " + (msgType === "error" ? "rgba(255,80,80,0.25)" : "var(--runit-border-strong)"), borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: msgType === "error" ? "#ff8080" : "var(--runit-accent)", fontSize: 13, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ key: "list", label: "📋 Codes" }, { key: "new", label: "＋ New Code" }].map(function(t) {
            var active = tab === t.key;
            return (
              <button key={t.key} onClick={function() { setTab(t.key); }}
                style={{ flex: 1, padding: "10px", borderRadius: 50, border: "1px solid", borderColor: active ? "var(--runit-accent)" : "var(--runit-border)", background: active ? "rgba(0,201,167,0.12)" : "transparent", color: active ? "var(--runit-accent)" : "var(--runit-muted)", fontWeight: active ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "list" && (
          <div>
            {loading && <Spinner />}
            {!loading && promos.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--runit-muted)" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🏷</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>No promo codes yet</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {promos.map(function(p) {
                var isActive  = parseInt(p.is_active);
                var isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                var isFull    = p.max_uses && parseInt(p.uses) >= parseInt(p.max_uses);
                return (
                  <div key={p.id} style={{ background: "var(--runit-surface)", border: "1px solid " + (isActive && !isExpired && !isFull ? "rgba(0,201,167,0.2)" : "var(--runit-border)"), borderRadius: 18, padding: 18, opacity: (!isActive || isExpired || isFull) ? 0.6 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 1, color: "var(--runit-accent)" }}>{p.code}</div>
                        <div style={{ fontSize: 12, color: "var(--runit-muted)", marginTop: 2 }}>
                          {p.type === "percent" ? p.value + "% off" : "GH₵ " + parseFloat(p.value).toFixed(2) + " off"}
                          {parseFloat(p.min_order) > 0 ? " · min GH₵ " + parseFloat(p.min_order).toFixed(2) : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={function() { togglePromo(p.id, isActive ? 0 : 1); }}
                          style={{ padding: "6px 12px", borderRadius: 50, background: isActive ? "rgba(255,80,80,0.08)" : "rgba(0,201,167,0.1)", border: "1px solid " + (isActive ? "rgba(255,80,80,0.2)" : "rgba(0,201,167,0.3)"), color: isActive ? "#ff8080" : "var(--runit-accent)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                          {isActive ? "Disable" : "Enable"}
                        </button>
                        <button onClick={function() { deletePromo(p.id); }}
                          style={{ padding: "6px 10px", borderRadius: 50, background: "transparent", border: "1px solid rgba(255,80,80,0.2)", color: "#ff8080", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                          ✕
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div style={{ background: "var(--runit-elevated)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{p.uses}</div>
                        <div style={{ fontSize: 10, color: "var(--runit-muted)" }}>{"/ " + (p.max_uses || "∞") + " uses"}</div>
                      </div>
                      <div style={{ background: "var(--runit-elevated)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: isExpired ? "#ff8080" : "var(--runit-text)" }}>
                          {p.expires_at ? new Date(p.expires_at).toLocaleDateString("en-GH") : "No expiry"}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--runit-muted)" }}>Expires</div>
                      </div>
                      <div style={{ background: "var(--runit-elevated)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: isActive && !isExpired && !isFull ? "var(--runit-accent)" : "#ff8080" }}>
                          {isFull ? "Maxed out" : isExpired ? "Expired" : isActive ? "Active" : "Disabled"}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--runit-muted)" }}>Status</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "new" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <div>
              <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Code *</label>
              <input type="text" value={code} onChange={function(e) { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"")); }} placeholder="e.g. LAUNCH20" maxLength={20}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 15, outline: "none", fontFamily: "inherit", letterSpacing: 2, fontWeight: 700 }} />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 8, fontWeight: 600 }}>Discount type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["percent","fixed"].map(function(t) {
                  var sel = type === t;
                  return (
                    <button key={t} onClick={function() { setType(t); }}
                      style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1px solid", borderColor: sel ? "var(--runit-accent)" : "var(--runit-border)", background: sel ? "rgba(0,201,167,0.1)" : "var(--runit-elevated)", color: sel ? "var(--runit-accent)" : "var(--runit-muted)", fontWeight: sel ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      {t === "percent" ? "% Percentage" : "GH₵ Fixed amount"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                  {type === "percent" ? "Percentage (%) *" : "Amount (GH₵) *"}
                </label>
                <input type="number" min="0" max={type === "percent" ? 100 : undefined} value={value} onChange={function(e) { setValue(e.target.value); }} placeholder={type === "percent" ? "e.g. 20" : "e.g. 5.00"}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Min order (GH₵)</label>
                <input type="number" min="0" value={minOrder} onChange={function(e) { setMinOrder(e.target.value); }} placeholder="e.g. 5.00"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Max uses (optional)</label>
                <input type="number" min="1" value={maxUses} onChange={function(e) { setMaxUses(e.target.value); }} placeholder="Unlimited"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Expiry date (optional)</label>
                <input type="datetime-local" value={expiresAt} onChange={function(e) { setExpiresAt(e.target.value); }}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
              </div>
            </div>

            {code && value && (
              <div style={{ background: "rgba(0,201,167,0.07)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: "var(--runit-accent)", letterSpacing: 1 }}>{code}</span>
                {" — " + (type === "percent" ? value + "% off" : "GH₵ " + parseFloat(value || 0).toFixed(2) + " off")}
                {minOrder ? " · min order GH₵ " + parseFloat(minOrder).toFixed(2) : ""}
                {maxUses ? " · " + maxUses + " uses max" : " · unlimited uses"}
              </div>
            )}

            <button onClick={createPromo} disabled={posting}
              style={{ width: "100%", padding: "14px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 15, border: "none", cursor: posting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {posting ? "Creating..." : "Create Promo Code"}
            </button>
          </div>
        )}
      </div>
      <BottomPillNav />
    </div>
  );
}