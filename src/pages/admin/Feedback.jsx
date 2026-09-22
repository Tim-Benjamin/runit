import { useState, useEffect } from "react";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import Spinner from "../../components/Spinner";

const BASE = import.meta.env.VITE_API_BASE;

export default function AdminFeedback() {
  var [tab, setTab]             = useState("gas");
  var [gasReports, setGas]      = useState([]);
  var [ratings, setRatings]     = useState([]);
  var [reports, setReports]     = useState([]);
  var [loading, setLoading]     = useState(true);
  var [resolving, setResolving] = useState(null);
  var [msg, setMsg]             = useState("");
  var [msgType, setMsgType]     = useState("success");

  useEffect(function() { fetchAll(); }, []); // eslint-disable-line

  var fetchAll = async function() {
    setLoading(true);
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(BASE + '/api/admin/feedback.php', {
        headers: { Authorization: "Bearer " + token },
      });
      var data = await res.json();
      if (res.ok) {
        setGas(data.gas_reports || []);
        setRatings(data.ratings  || []);
        setReports(data.reports  || []);
      }
    } catch {}
    setLoading(false);
  };

  var showMsg = function(text, type) {
    setMsg(text);
    setMsgType(type || "success");
    setTimeout(function() { setMsg(""); }, 4000);
  };

  var resolveGas = async function(reportId, action) {
    setResolving(reportId + "_" + action);
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(BASE + '/api/admin/gas_reports.php', {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ report_id: reportId, action: action }),
      });
      var data = await res.json();
      if (res.ok) { showMsg(data.message || "Resolved", "success"); fetchAll(); }
      else         showMsg(data.error    || "Failed",   "error");
    } catch { showMsg("Connection error", "error"); }
    setResolving(null);
  };

  var resolveReport = async function(reportId) {
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(BASE + '/api/admin/feedback.php', {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ report_id: reportId }),
      });
      var data = await res.json();
      if (res.ok) { showMsg("Report resolved", "success"); fetchAll(); }
      else         showMsg(data.error || "Failed", "error");
    } catch { showMsg("Connection error", "error"); }
  };

  var pendingGas  = gasReports.filter(function(r) { return !parseInt(r.resolved); });
  var resolvedGas = gasReports.filter(function(r) { return parseInt(r.resolved);  });

  var TABS = [
    { key: "gas",     label: "⛽ Gas Disputes", count: pendingGas.length },
    { key: "reports", label: "🚩 Reports",       count: reports.filter(function(r) { return r.status === "open"; }).length },
    { key: "ratings", label: "⭐ Ratings",       count: ratings.length },
  ];

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="Feedback" subtitle="Disputes, ratings & reports" />

      <div className="page-content">

        {msg !== "" && (
          <div style={{ background: msgType === "error" ? "rgba(255,80,80,0.08)" : "rgba(0,201,167,0.1)", border: "1px solid " + (msgType === "error" ? "rgba(255,80,80,0.25)" : "var(--runit-border-strong)"), borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: msgType === "error" ? "#ff8080" : "var(--runit-accent)", fontSize: 13, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        {/* Tab pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map(function(t) {
            var active = tab === t.key;
            return (
              <button key={t.key} onClick={function() { setTab(t.key); }}
                style={{ padding: "8px 16px", borderRadius: 50, fontSize: 12, fontWeight: active ? 700 : 400, border: "1px solid", borderColor: active ? "var(--runit-accent)" : "var(--runit-border)", background: active ? "rgba(0,201,167,0.12)" : "transparent", color: active ? "var(--runit-accent)" : "var(--runit-muted)", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                {t.label}
                {t.count > 0 && (
                  <span style={{ background: active ? "var(--runit-accent)" : "rgba(255,180,0,0.2)", color: active ? "#0a1f1c" : "#ffb400", borderRadius: 50, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && <Spinner />}

        {/* ── GAS DISPUTES ── */}
        {!loading && tab === "gas" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {gasReports.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--runit-muted)" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>⛽</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No gas fill disputes</div>
                <div style={{ fontSize: 13 }}>Disputes appear here when users report incorrect fill amounts</div>
              </div>
            )}

            {pendingGas.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--runit-muted)", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {"Pending Review (" + pendingGas.length + ")"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {pendingGas.map(function(r) {
                    var receiptUrl = BASE + '/uploads/receipts/' + String(r.fill_receipt || '');
                    var isBusy     = resolving && resolving.startsWith(String(r.report_id));
                    return (
                      <div key={r.report_id} style={{ background: "var(--runit-surface)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 20, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{"Order #" + r.order_id + " — Gas Fill Dispute"}</div>
                            <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>
                              {r.reported_at ? new Date(r.reported_at).toLocaleString("en-GH") : ""}
                            </div>
                          </div>
                          <span style={{ background: "rgba(255,180,0,0.12)", color: "#ffb400", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 50, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>
                            PENDING
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                          <div style={{ background: "var(--runit-elevated)", borderRadius: 12, padding: "10px 12px" }}>
                            <div style={{ fontSize: 10, color: "var(--runit-muted)", marginBottom: 4, fontWeight: 600 }}>USER</div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.user_name}</div>
                            <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>{r.user_phone}</div>
                          </div>
                          <div style={{ background: "var(--runit-elevated)", borderRadius: 12, padding: "10px 12px" }}>
                            <div style={{ fontSize: 10, color: "var(--runit-muted)", marginBottom: 4, fontWeight: 600 }}>RUNNER</div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{r.runner_name}</div>
                            <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>{r.runner_phone}</div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                          <div style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.15)", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "var(--runit-muted)", marginBottom: 4 }}>Runner declared</div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--runit-accent)" }}>
                              {"GH₵ " + parseFloat(r.fill_amount || 0).toFixed(2)}
                            </div>
                          </div>
                          <div style={{ background: "rgba(255,80,80,0.06)", border: "1px solid rgba(255,80,80,0.15)", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "var(--runit-muted)", marginBottom: 4 }}>User says received</div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "#ff8080" }}>
                              {"GH₵ " + parseFloat(r.confirmed_amount || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {r.dispute_note && (
                          <div style={{ background: "rgba(255,180,0,0.06)", border: "1px solid rgba(255,180,0,0.2)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "var(--runit-text)", lineHeight: 1.5 }}>
                            <span style={{ fontWeight: 600, color: "#ffb400", marginRight: 6 }}>User note:</span>
                            {r.dispute_note}
                          </div>
                        )}

                        {r.fill_receipt && (
                          <a href={receiptUrl} target="_blank" rel="noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 14 }}>
                            <span style={{ fontSize: 18 }}>🧾</span>
                            <span style={{ flex: 1 }}>View runner's fill receipt</span>
                            <span style={{ fontSize: 11, color: "var(--runit-muted)" }}>Open →</span>
                          </a>
                        )}

                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={function() { resolveGas(r.report_id, "resolve_runner"); }} disabled={!!isBusy}
                            style={{ flex: 1, padding: "11px 8px", borderRadius: 50, background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff8080", fontWeight: 700, fontSize: 12, cursor: isBusy ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                            {resolving === r.report_id + "_resolve_runner" ? "Working..." : "🚫 Runner at fault"}
                          </button>
                          <button onClick={function() { resolveGas(r.report_id, "resolve_user"); }} disabled={!!isBusy}
                            style={{ flex: 1, padding: "11px 8px", borderRadius: 50, background: "rgba(0,201,167,0.08)", border: "1px solid rgba(0,201,167,0.25)", color: "#00c9a7", fontWeight: 700, fontSize: 12, cursor: isBusy ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                            {resolving === r.report_id + "_resolve_user" ? "Working..." : "✓ Clear runner"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {resolvedGas.length > 0 && (
              <div style={{ marginTop: pendingGas.length > 0 ? 20 : 0 }}>
                <div style={{ fontSize: 11, color: "var(--runit-muted)", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {"Resolved (" + resolvedGas.length + ")"}
                </div>
                {resolvedGas.map(function(r) {
                  return (
                    <div key={r.report_id} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 14, padding: "14px 16px", marginBottom: 8, opacity: 0.7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{"Order #" + r.order_id}</div>
                        <span style={{ background: "rgba(0,201,167,0.1)", color: "#00c9a7", border: "1px solid rgba(0,201,167,0.25)", borderRadius: 50, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>RESOLVED</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 4 }}>{r.user_name + " vs " + r.runner_name}</div>
                      {r.resolution && <div style={{ fontSize: 12, color: "var(--runit-muted)", fontStyle: "italic" }}>{r.resolution}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS ── */}
        {!loading && tab === "reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reports.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--runit-muted)" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🚩</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>No reports yet</div>
              </div>
            )}
            {reports.map(function(r) {
              return (
                <div key={r.id} style={{ background: "var(--runit-surface)", border: "1px solid " + (r.status === "open" ? "rgba(255,80,80,0.2)" : "var(--runit-border)"), borderRadius: 16, padding: "14px 16px", opacity: r.status === "resolved" ? 0.7 : 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{r.reason ? r.reason.replace(/_/g, " ") : "Report"}</div>
                      <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>
                        {"Order #" + r.order_id + " · " + (r.reported_by_name || "Unknown") + " (" + (r.reporter_role || "?") + ")"}
                      </div>
                    </div>
                    <span style={{ background: r.status === "open" ? "rgba(255,80,80,0.1)" : "rgba(0,201,167,0.1)", color: r.status === "open" ? "#ff8080" : "#00c9a7", border: "1px solid " + (r.status === "open" ? "rgba(255,80,80,0.3)" : "rgba(0,201,167,0.3)"), borderRadius: 50, padding: "3px 10px", fontSize: 10, fontWeight: 700, marginLeft: 8, whiteSpace: "nowrap" }}>
                      {r.status === "open" ? "Open" : "Resolved"}
                    </span>
                  </div>
                  {r.details && (
                    <div style={{ fontSize: 12, color: "var(--runit-muted)", fontStyle: "italic", padding: "8px 12px", background: "var(--runit-elevated)", borderRadius: 8, lineHeight: 1.5, marginBottom: 10 }}>
                      {'"' + r.details + '"'}
                    </div>
                  )}
                  {r.status === "open" && (
                    <button onClick={function() { resolveReport(r.id); }}
                      style={{ width: "100%", padding: "9px", borderRadius: 50, background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.3)", color: "#00c9a7", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      ✓ Mark Resolved
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── RATINGS ── */}
        {!loading && tab === "ratings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ratings.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--runit-muted)" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>⭐</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>No ratings yet</div>
              </div>
            )}
            {ratings.map(function(r) {
              var stars = parseInt(r.stars || 0);
              return (
                <div key={r.id} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{r.user_name}</div>
                      <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>{"→ " + r.runner_name + " · Order #" + r.order_id}</div>
                    </div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(function(s) {
                        return <span key={s} style={{ fontSize: 14, color: s <= stars ? "#ffb400" : "var(--runit-elevated)" }}>★</span>;
                      })}
                    </div>
                  </div>
                  {r.comment && (
                    <div style={{ fontSize: 12, color: "var(--runit-muted)", fontStyle: "italic", lineHeight: 1.5 }}>{'"' + r.comment + '"'}</div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--runit-muted)", marginTop: 6 }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("en-GH") : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      <BottomPillNav />
    </div>
  );
}