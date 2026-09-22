import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import Spinner from "../../components/Spinner";

function safe(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return "";
  return String(val);
}

function safeFloat(val) {
  var n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

export default function Receipt() {
  var { id }              = useParams();
  var navigate            = useNavigate();
  var [order, setOrder]   = useState(null);
  var [loading, setLoading] = useState(true);
  var printRef            = useRef(null);

  useEffect(function() {
    var token = localStorage.getItem("runit_token");
    fetch(import.meta.env.VITE_API_BASE + '/api/orders/receipt.php?id=' + id, {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function(r) { return r.json(); })
      .then(function(d) { if (d.order) setOrder(d.order); })
      .catch(function() {})
      .finally(function() { setLoading(false); });
  }, [id]);

  var handlePrint = function() {
    window.print();
  };

  var handleShare = async function() {
    var text = "RunIt Order #" + id + "\n" +
      "Category: " + safe(order.category) + "\n" +
      "Fee: GH₵ " + safeFloat(order.final_fee || order.proposed_fee).toFixed(2) + "\n" +
      "Runner: " + safe(order.runner_name) + "\n" +
      "Status: " + safe(order.status) + "\n" +
      "Date: " + new Date(order.created_at).toLocaleString("en-GH");
    if (navigator.share) {
      await navigator.share({ title: "RunIt Receipt #" + id, text: text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Receipt copied to clipboard");
    }
  };

  if (loading) return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh" }}>
      <PillNavbar title={"Receipt #" + id} subtitle="Order summary" />
      <div className="page-content"><Spinner /></div>
      <BottomPillNav />
    </div>
  );

  if (!order) return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)" }}>
      <PillNavbar title="Receipt" subtitle="Not found" />
      <div className="page-content" style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontWeight: 600 }}>Receipt not found</div>
      </div>
      <BottomPillNav />
    </div>
  );

  var fee        = safeFloat(order.final_fee || order.proposed_fee);
  var commission = fee * 0.2;
  var runnerEarns = fee * 0.8;
  var statusLog  = order.status_log || [];
  var rating     = parseInt(order.rating || 0);

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title={"Receipt #" + id} subtitle="Order summary" />

      <div className="page-content" style={{ maxWidth: 520, margin: "0 auto" }} ref={printRef}>

        {/* Header */}
        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 24, marginBottom: 14, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: order.status === "delivered" ? "rgba(0,201,167,0.15)" : "rgba(255,80,80,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>
            {order.status === "delivered" ? "✅" : "❌"}
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
            {order.status === "delivered" ? "Delivery Complete" : "Order " + safe(order.status)}
          </div>
          <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 16 }}>
            {new Date(order.created_at).toLocaleString("en-GH", { dateStyle: "long", timeStyle: "short" })}
          </div>
          <div style={{ display: "inline-block", background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.25)", borderRadius: 50, padding: "6px 18px", fontSize: 13, fontWeight: 700, color: "var(--runit-accent)" }}>
            {"Order #" + safe(order.id)}
          </div>
        </div>

        {/* Fee breakdown */}
        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 14, fontWeight: 600 }}>Payment Summary</div>
          {[
            { label: "Delivery fee",      value: "GH₵ " + fee.toFixed(2),            bold: false },
            { label: "Platform (20%)",    value: "GH₵ " + commission.toFixed(2),      bold: false, muted: true },
            { label: "Runner earns (80%)", value: "GH₵ " + runnerEarns.toFixed(2),   bold: false, muted: true },
            { label: "Payment method",    value: "Cash on delivery",                   bold: false },
          ].map(function(row) {
            return (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: row.bold ? 15 : 13, fontWeight: row.bold ? 700 : 400, color: row.muted ? "var(--runit-muted)" : "var(--runit-text)", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid var(--runit-border)" }}>
                <span>{row.label}</span>
                <span style={{ fontWeight: row.bold ? 700 : 500 }}>{row.value}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "var(--runit-accent)", paddingTop: 4 }}>
            <span>Total Paid</span>
            <span>{"GH₵ " + fee.toFixed(2)}</span>
          </div>
        </div>

        {/* Order details */}
        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 14, fontWeight: 600 }}>Order Details</div>
          {[
            { label: "Category",     value: safe(order.category) },
            { label: "Description",  value: safe(order.description) },
            order.pickup_address  ? { label: "Pickup",   value: safe(order.pickup_address) }  : null,
            order.dropoff_address ? { label: "Drop-off", value: safe(order.dropoff_address) } : null,
            order.notes           ? { label: "Notes",    value: safe(order.notes) }            : null,
          ].filter(Boolean).map(function(row) {
            return (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid var(--runit-border)" }}>
                <span style={{ color: "var(--runit-muted)", flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontWeight: 500, textAlign: "right" }}>{row.value}</span>
              </div>
            );
          })}
        </div>

        {/* Runner */}
        {order.runner_name && (
          <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 14, fontWeight: 600 }}>Runner</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: rating > 0 ? 14 : 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "#0a1f1c", flexShrink: 0 }}>
                {safe(order.runner_name).charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{safe(order.runner_name)}</div>
                <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>{safe(order.delivery_method) || "Runner"}</div>
              </div>
            </div>
            {rating > 0 && (
              <div style={{ display: "flex", gap: 3, paddingTop: 10, borderTop: "1px solid var(--runit-border)" }}>
                <span style={{ fontSize: 12, color: "var(--runit-muted)", marginRight: 6 }}>Your rating:</span>
                {[1,2,3,4,5].map(function(s) {
                  return <span key={s} style={{ fontSize: 16, color: s <= rating ? "#ffb400" : "var(--runit-elevated)" }}>★</span>;
                })}
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {statusLog.length > 0 && (
          <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 14, fontWeight: 600 }}>Timeline</div>
            {statusLog.map(function(log, i) {
              return (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < statusLog.length - 1 ? 14 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--runit-accent)", flexShrink: 0, marginTop: 3 }} />
                    {i < statusLog.length - 1 && <div style={{ width: 2, flex: 1, background: "var(--runit-border)", margin: "4px 0" }} />}
                  </div>
                  <div style={{ paddingBottom: i < statusLog.length - 1 ? 6 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{safe(log.status).replace(/_/g, " ")}</div>
                    <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>{new Date(log.created_at).toLocaleString("en-GH")}</div>
                    {log.note && <div style={{ fontSize: 11, color: "var(--runit-muted)", fontStyle: "italic", marginTop: 2 }}>{safe(log.note)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleShare}
            style={{ flex: 1, padding: "13px", borderRadius: 50, background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.3)", color: "var(--runit-accent)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            📤 Share
          </button>
          <button onClick={handlePrint}
            style={{ flex: 1, padding: "13px", borderRadius: 50, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            🖨 Print
          </button>
          <button onClick={function() { navigate("/orders"); }}
            style={{ flex: 1, padding: "13px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            ← Back
          </button>
        </div>

      </div>
      <BottomPillNav />
    </div>
  );
}