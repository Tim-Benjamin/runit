import { useState } from "react";

function safeFloat(val) {
  var n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function isTruthy(val) {
  return val === true || val === 1 || val === "1";
}

export default function GasFillConfirmation({ order, onDone }) {
  var [action, setAction]             = useState("");
  var [actualAmount, setActualAmount] = useState("");
  var [note, setNote]                 = useState("");
  var [submitting, setSubmitting]     = useState(false);
  var [error, setError]               = useState("");
  var [done, setDone]                 = useState(false);

  var isConfirmed = isTruthy(order.fill_confirmed);
  var isDisputed  = isTruthy(order.fill_disputed);

  // Already handled — render nothing (parent shows banners)
  if (isConfirmed || isDisputed) return null;

  // No receipt yet — nothing to confirm
  if (!order.fill_receipt) return null;

  if (done) {
    return (
      <div style={{ background: "rgba(0,201,167,0.07)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 16, padding: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 20 }}>✅</span>
        <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>
          {action === "confirm"
            ? "You confirmed the fill. Thank you!"
            : "Dispute submitted. Admin will review within 24 hours."}
        </div>
      </div>
    );
  }

  var handleSubmit = async function() {
    if (!action) { setError("Please choose an action"); return; }
    if (action === "dispute" && (!actualAmount || safeFloat(actualAmount) <= 0)) {
      setError("Enter the actual amount you received"); return;
    }
    if (action === "dispute" && !note.trim()) {
      setError("Please describe what happened"); return;
    }
    setError("");
    setSubmitting(true);

    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch((import.meta.env.VITE_API_BASE) + "/api/orders/confirm_fill.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          order_id:         order.id,
          action:           action,
          confirmed_amount: safeFloat(actualAmount),
          dispute_note:     note,
        }),
      });
      var data = await res.json();
      if (res.ok) {
        setDone(true);
        onDone && onDone();
      } else {
        setError(data.error || "Failed to submit");
      }
    } catch {
      setError("Connection error");
    }
    setSubmitting(false);
  };

  var receiptUrl = (import.meta.env.VITE_API_BASE) + "/uploads/receipts/" + String(order.fill_receipt || "");
  var fillAmt    = safeFloat(order.fill_amount).toFixed(2);

  var linkStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 12,
    background: "var(--runit-elevated)",
    border: "1px solid var(--runit-border)",
    color: "var(--runit-accent)",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    marginBottom: 16,
  };

  var confirmBtnStyle = {
    flex: 1,
    padding: "12px 8px",
    borderRadius: 12,
    border: "1px solid",
    borderColor: action === "confirm" ? "var(--runit-accent)" : "var(--runit-border)",
    background: action === "confirm" ? "rgba(0,201,167,0.1)" : "var(--runit-elevated)",
    color: action === "confirm" ? "var(--runit-accent)" : "var(--runit-muted)",
    fontWeight: action === "confirm" ? 700 : 400,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  var disputeBtnStyle = {
    flex: 1,
    padding: "12px 8px",
    borderRadius: 12,
    border: "1px solid",
    borderColor: action === "dispute" ? "rgba(255,80,80,0.5)" : "var(--runit-border)",
    background: action === "dispute" ? "rgba(255,80,80,0.08)" : "var(--runit-elevated)",
    color: action === "dispute" ? "#ff8080" : "var(--runit-muted)",
    fontWeight: action === "dispute" ? 700 : 400,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  var inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 12,
    background: "var(--runit-elevated)",
    color: "var(--runit-text)",
    border: "1px solid rgba(255,80,80,0.3)",
    fontSize: 14,
    fontWeight: 600,
    outline: "none",
    fontFamily: "inherit",
  };

  var amountWrapStyle = {
    width: "100%",
    padding: "11px 14px 11px 48px",
    borderRadius: 12,
    background: "var(--runit-elevated)",
    color: "var(--runit-text)",
    border: "1px solid rgba(255,80,80,0.3)",
    fontSize: 15,
    fontWeight: 600,
    outline: "none",
    fontFamily: "inherit",
  };

  var submitBtnStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: 50,
    fontWeight: 700,
    fontSize: 14,
    cursor: submitting ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: action === "dispute" ? "rgba(255,80,80,0.15)" : "var(--runit-accent)",
    color: action === "dispute" ? "#ff8080" : "#0a1f1c",
    border: action === "dispute" ? "1px solid rgba(255,80,80,0.3)" : "none",
  };

  return (
    <div style={{ background: "rgba(255,150,50,0.06)", border: "1px solid rgba(255,150,50,0.25)", borderRadius: 20, padding: 20 }}>

      <div style={{ fontSize: 14, fontWeight: 700, color: "#ff9632", marginBottom: 6 }}>
        🔥 Verify Gas Fill
      </div>

      <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 14, lineHeight: 1.5 }}>
        {"Your runner declared they filled "}
        <strong style={{ color: "var(--runit-text)" }}>{"GH₵ " + fillAmt}</strong>
        {" worth of gas. Please verify when the cylinder is returned to you."}
      </div>

      <a href={receiptUrl} target="_blank" rel="noreferrer" style={linkStyle}>
        <span style={{ fontSize: 20 }}>🧾</span>
        <span style={{ flex: 1 }}>View fill station receipt</span>
        <span style={{ fontSize: 11, color: "var(--runit-muted)" }}>Open →</span>
      </a>

      {error !== "" && (
        <div style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 10, padding: "10px 12px", marginBottom: 12, color: "#ff8080", fontSize: 12 }}>
          {"⚠ " + error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          type="button"
          onClick={function() { setAction("confirm"); setError(""); }}
          style={confirmBtnStyle}
        >
          ✅ Correct amount
        </button>
        <button
          type="button"
          onClick={function() { setAction("dispute"); setError(""); }}
          style={disputeBtnStyle}
        >
          ❌ Wrong amount
        </button>
      </div>

      {action === "dispute" && (
        <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>

          <div>
            <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
              Actual amount received (GH₵) *
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--runit-muted)", fontSize: 13 }}>
                GH₵
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={actualAmount}
                onChange={function(e) { setActualAmount(e.target.value); }}
                placeholder="e.g. 80.00"
                style={amountWrapStyle}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
              Describe what happened *
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={function(e) { setNote(e.target.value); }}
              placeholder="e.g. I measured the gas and it appears less than GH₵ 100 worth was filled..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid rgba(255,80,80,0.3)", fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.5, fontFamily: "inherit" }}
            />
          </div>

        </div>
      )}

      {action !== "" && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={submitBtnStyle}
        >
          {submitting ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.15)", borderTopColor: action === "dispute" ? "#ff8080" : "#0a1f1c", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
              Submitting...
            </span>
          ) : action === "dispute" ? "Submit Dispute" : "Confirm Fill ✓"}
        </button>
      )}

    </div>
  );
}