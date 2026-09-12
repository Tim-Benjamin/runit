import { useState, useRef } from "react";

export default function GasFillDeclaration({ order, onDeclared }) {
  var [amount, setAmount]     = useState("");
  var [file, setFile]         = useState(null);
  var [preview, setPreview]   = useState(null);
  var [submitting, setSubmitting] = useState(false);
  var [error, setError]       = useState("");
  var fileRef                 = useRef(null);

  var handleFile = function(e) {
    var f = e.target.files[0];
    if (!f) return;
    setFile(f);
    var reader = new FileReader();
    reader.onload = function(ev) { setPreview(ev.target.result); };
    reader.readAsDataURL(f);
  };

  var handleSubmit = async function() {
    if (!amount || parseFloat(amount) <= 0) { setError("Enter the amount filled"); return; }
    if (!file) { setError("Receipt photo is required"); return; }
    setError("");
    setSubmitting(true);

    try {
      var token = localStorage.getItem("runit_token");
      var fd    = new FormData();
      fd.append("order_id",    order.id);
      fd.append("fill_amount", parseFloat(amount));
      fd.append("receipt",     file);

      var res  = await fetch((import.meta.env.VITE_API_BASE) + "/api/orders/declare_fill.php", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: fd,
      });
      var data = await res.json();
      if (res.ok) { onDeclared && onDeclared(); }
      else setError(data.error || "Failed to submit");
    } catch { setError("Connection error"); }
    setSubmitting(false);
  };

  return (
    <div style={{ background: "rgba(255,150,50,0.06)", border: "1px solid rgba(255,150,50,0.25)", borderRadius: 16, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#ff9632", marginBottom: 12 }}>
        🔥 Declare Gas Fill
      </div>
      <div style={{ fontSize: 12, color: "var(--runit-muted)", lineHeight: 1.5, marginBottom: 14 }}>
        Before returning the cylinder, take a photo of the fill station receipt and declare the amount filled. The user will confirm when the cylinder is returned.
      </div>

      {error && (
        <div style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 10, padding: "10px 12px", marginBottom: 12, color: "#ff8080", fontSize: 12 }}>
          {"⚠ " + error}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
          Amount filled (GH₵) *
        </label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--runit-muted)", fontSize: 13, fontWeight: 600 }}>GH₵</span>
          <input
            type="number" min="0" step="0.01"
            value={amount} onChange={function(e) { setAmount(e.target.value); }}
            placeholder="e.g. 100.00"
            style={{ width: "100%", padding: "11px 14px 11px 48px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 15, fontWeight: 600, outline: "none", fontFamily: "inherit" }}
            onFocus={function(e) { e.target.style.borderColor = "#ff9632"; }}
            onBlur={function(e) { e.target.style.borderColor = "var(--runit-border)"; }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
          Receipt photo *
        </label>

        <div
          onClick={function() { fileRef.current && fileRef.current.click(); }}
          style={{ border: "2px dashed " + (file ? "#ff9632" : "var(--runit-border)"), borderRadius: 12, padding: 16, textAlign: "center", cursor: "pointer", background: "var(--runit-elevated)", transition: "border-color 0.2s" }}
        >
          {preview ? (
            <div>
              <img src={preview} alt="Receipt preview" style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 8, marginBottom: 8, objectFit: "contain" }} />
              <div style={{ fontSize: 11, color: "var(--runit-accent)" }}>Tap to change photo</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 32, marginBottom: 6 }}>📸</div>
              <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 4 }}>Tap to take/upload receipt photo</div>
              <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>Must show amount clearly</div>
            </div>
          )}
        </div>
        <input
          ref={fileRef} type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFile}
          style={{ display: "none" }}
        />
      </div>

      <button onClick={handleSubmit} disabled={submitting || !amount || !file}
        style={{ width: "100%", padding: "12px", borderRadius: 50, background: submitting || !amount || !file ? "var(--runit-accent-dark)" : "#ff9632", color: "#0a1f1c", fontWeight: 700, fontSize: 14, border: "none", cursor: submitting || !amount || !file ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {submitting ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0a1f1c", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
            Submitting...
          </span>
        ) : "📸 Submit Fill Declaration"}
      </button>
    </div>
  );
}