import { useState, useEffect } from "react";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import Spinner from "../../components/Spinner";

const STATUS_COLORS = {
  active:    { bg: "rgba(0,201,167,0.1)",  color: "#00c9a7", border: "rgba(0,201,167,0.3)"  },
  pending:   { bg: "rgba(255,180,0,0.1)",  color: "#ffb400", border: "rgba(255,180,0,0.3)"  },
  suspended: { bg: "rgba(255,80,80,0.1)",  color: "#ff6060", border: "rgba(255,80,80,0.3)"  },
};

const METHOD_LABEL = {
  foot:      "🚶 On foot",
  bike:      "🚲 Bicycle",
  motorbike: "🛵 Motorbike",
};

export default function AdminRunners() {
  var [runners, setRunners]       = useState([]);
  var [loading, setLoading]       = useState(true);
  var [filter, setFilter]         = useState("all");
  var [expandedId, setExpandedId] = useState(null);
  var [actionMsg, setActionMsg]   = useState("");
  var [msgType, setMsgType]       = useState("success");

  useEffect(function() { fetchRunners(); }, []); // eslint-disable-line

  var fetchRunners = async function() {
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch((import.meta.env.VITE_API_BASE) + "/api/admin/runners.php", {
        headers: { Authorization: "Bearer " + token },
      });
      var data = await res.json();
      if (res.ok) setRunners(data.runners || []);
    } catch {}
    setLoading(false);
  };

  var showMsg = function(text, type) {
    setActionMsg(text);
    setMsgType(type || "success");
    setTimeout(function() { setActionMsg(""); }, 4000);
  };

  var updateRunner = async function(id, status) {
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch((import.meta.env.VITE_API_BASE) + "/api/admin/runners.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ runner_id: id, status: status }),
      });
      var data = await res.json();
      if (res.ok) {
        showMsg(data.message || "Runner updated", "success");
        fetchRunners();
      } else {
        showMsg(data.error || "Failed", "error");
      }
    } catch {
      showMsg("Connection error", "error");
    }
  };

  var filtered = runners.filter(function(r) {
    return filter === "all" || r.status === filter;
  });

  var counts = {
    all:       runners.length,
    active:    runners.filter(function(r) { return r.status === "active";    }).length,
    pending:   runners.filter(function(r) { return r.status === "pending";   }).length,
    suspended: runners.filter(function(r) { return r.status === "suspended"; }).length,
  };

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="Manage Runners" subtitle={runners.length + " total"} />

      <div className="page-content">

        {/* ── Toast ── */}
        {actionMsg !== "" && (
          <div style={{
            background: msgType === "error" ? "rgba(255,80,80,0.08)" : "rgba(0,201,167,0.1)",
            border: "1px solid " + (msgType === "error" ? "rgba(255,80,80,0.25)" : "var(--runit-border-strong)"),
            borderRadius: 12, padding: "12px 16px", marginBottom: 16,
            color: msgType === "error" ? "#ff8080" : "var(--runit-accent)", fontSize: 13, fontWeight: 500,
          }}>
            {actionMsg}
          </div>
        )}

        {/* ── Summary stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Active",    value: counts.active,    color: "#00c9a7" },
            { label: "Pending",   value: counts.pending,   color: "#ffb400" },
            { label: "Suspended", value: counts.suspended, color: "#ff6060" },
          ].map(function(s) {
            return (
              <div key={s.label} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--runit-muted)", marginTop: 2 }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── Filter pills ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {["all","pending","active","suspended"].map(function(f) {
            var active = filter === f;
            return (
              <button key={f} onClick={function() { setFilter(f); }}
                style={{ padding: "7px 16px", borderRadius: 50, fontSize: 12, fontWeight: active ? 600 : 400, border: "1px solid", borderColor: active ? "var(--runit-accent)" : "var(--runit-border)", background: active ? "rgba(0,201,167,0.12)" : "transparent", color: active ? "var(--runit-accent)" : "var(--runit-muted)", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
              >
                {f === "all" ? "All (" + counts.all + ")" : f.charAt(0).toUpperCase() + f.slice(1) + " (" + counts[f] + ")"}
              </button>
            );
          })}
        </div>

        {loading && <Spinner />}

        {/* ── Runner cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(function(runner) {
            var sc       = STATUS_COLORS[runner.status] || STATUS_COLORS.pending;
            var expanded = expandedId === runner.id;
            var outstanding = Math.max(0,
              parseFloat(runner.total_owed    || 0) -
              parseFloat(runner.total_settled || 0)
            );

            return (
              <div key={runner.id} style={{ background: "var(--runit-surface)", border: "1px solid " + (runner.status === "pending" ? "rgba(255,180,0,0.25)" : "var(--runit-border)"), borderRadius: 20, overflow: "hidden" }}>

                {/* ── Card header (always visible) ── */}
                <div
                  onClick={function() { setExpandedId(expanded ? null : runner.id); }}
                  style={{ padding: 18, cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start", transition: "background 0.15s" }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(0,201,167,0.03)"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Avatar */}
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20, color: "#0a1f1c", flexShrink: 0 }}>
                    {runner.name ? runner.name[0].toUpperCase() : "?"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{runner.name}</div>
                    <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{runner.email}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ background: sc.bg, color: sc.color, border: "1px solid " + sc.border, borderRadius: 50, padding: "3px 10px", fontSize: 10, fontWeight: 600 }}>
                        {runner.status}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--runit-muted)" }}>
                        {METHOD_LABEL[runner.delivery_method] || "🚶 On foot"}
                      </span>
                      {parseFloat(runner.avg_rating || 0) > 0 && (
                        <span style={{ fontSize: 11, color: "var(--runit-muted)" }}>
                          {"⭐ " + parseFloat(runner.avg_rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <span style={{ color: "var(--runit-muted)", fontSize: 16, flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
                </div>

                {/* ── Expanded content ── */}
                {expanded && (
                  <div style={{ borderTop: "1px solid var(--runit-border)", padding: 18 }}>

                    {/* Info grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                      {[
                        { label: "Phone",    value: runner.phone         || "—" },
                        { label: "MoMo",     value: runner.momo_number   || "—" },
                        { label: "Method",   value: METHOD_LABEL[runner.delivery_method] || "On foot" },
                        { label: "Orders",   value: String(runner.total_orders || 0) + " delivered" },
                        { label: "Joined",   value: new Date(runner.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" }) },
                        { label: "Debt",     value: outstanding > 0.01 ? "GH₵ " + outstanding.toFixed(2) + " owed" : "✓ Clear" },
                      ].map(function(item) {
                        return (
                          <div key={item.label} style={{ background: "var(--runit-elevated)", borderRadius: 10, padding: "8px 12px" }}>
                            <div style={{ color: "var(--runit-muted)", fontSize: 10, marginBottom: 3 }}>{item.label}</div>
                            <div style={{ fontWeight: 500, fontSize: 12, color: item.label === "Debt" && outstanding > 0.01 ? "#ffb400" : "var(--runit-text)" }}>{item.value}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ratings summary */}
                    {parseFloat(runner.total_ratings || 0) > 0 && (
                      <div style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>⭐</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--runit-accent)" }}>
                            {parseFloat(runner.avg_rating).toFixed(1) + " / 5.0"}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>
                            {runner.total_ratings + " rating" + (parseInt(runner.total_ratings) !== 1 ? "s" : "") + " from customers"}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ID Document */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        ID Document (Ghana Card / Student ID)
                      </div>
                      {runner.id_file_url ? (
                        <div>
                          {String(runner.id_file_url).toLowerCase().endsWith(".pdf") ? (
                            <a href={runner.id_file_url} target="_blank" rel="noreferrer"
                              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                            >
                              <span style={{ fontSize: 24 }}>📄</span>
                              <span style={{ flex: 1 }}>View ID Document (PDF)</span>
                              <span style={{ fontSize: 11, color: "var(--runit-muted)" }}>Open →</span>
                            </a>
                          ) : (
                            <div>
                              <a href={runner.id_file_url} target="_blank" rel="noreferrer">
                                <img
                                  src={runner.id_file_url}
                                  alt={"ID for " + runner.name}
                                  style={{ width: "100%", maxHeight: 240, objectFit: "contain", borderRadius: 12, border: "1px solid var(--runit-border)", background: "var(--runit-elevated)", cursor: "pointer", display: "block" }}
                                  onError={function(e) { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                                />
                                <div style={{ display: "none", padding: "16px", borderRadius: 12, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", alignItems: "center", gap: 8, color: "var(--runit-muted)", fontSize: 13 }}>
                                  <span>⚠</span>
                                  <span>Image could not load — </span>
                                  <a href={runner.id_file_url} target="_blank" rel="noreferrer" style={{ color: "var(--runit-accent)" }}>open directly</a>
                                </div>
                              </a>
                              <div style={{ fontSize: 10, color: "var(--runit-muted)", marginTop: 6 }}>
                                Tap image to open full size · Stored securely for verification
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,80,80,0.06)", border: "1px solid rgba(255,80,80,0.2)", fontSize: 12, color: "#ff8080", display: "flex", alignItems: "center", gap: 8 }}>
                          <span>⚠</span>
                          <span>No ID document uploaded by this runner</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {runner.status === "pending" && (
                        <>
                          <button onClick={function() { updateRunner(runner.id, "active"); }}
                            style={{ flex: 1, padding: "11px", borderRadius: 50, background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)", color: "#00c9a7", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", minWidth: 120 }}>
                            ✓ Approve
                          </button>
                          <button onClick={function() { updateRunner(runner.id, "suspended"); }}
                            style={{ padding: "11px 18px", borderRadius: 50, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", color: "#ff6060", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                            Reject
                          </button>
                        </>
                      )}
                      {runner.status === "active" && (
                        <button onClick={function() { updateRunner(runner.id, "suspended"); }}
                          style={{ flex: 1, padding: "11px", borderRadius: 50, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", color: "#ff6060", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                          Suspend Runner
                        </button>
                      )}
                      {runner.status === "suspended" && (
                        <button onClick={function() { updateRunner(runner.id, "active"); }}
                          style={{ flex: 1, padding: "11px", borderRadius: 50, background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)", color: "#00c9a7", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                          Reinstate Runner
                        </button>
                      )}
                      <a href={"tel:" + (runner.phone || "")}
                        style={{ padding: "11px 16px", borderRadius: 50, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        📞 Call
                      </a>
                    </div>

                  </div>
                )}
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--runit-muted)" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🏃</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No runners here</div>
              <div style={{ fontSize: 13 }}>
                {filter === "all" ? "No runners have registered yet" : "No " + filter + " runners"}
              </div>
            </div>
          )}
        </div>

      </div>
      <BottomPillNav />
    </div>
  );
}