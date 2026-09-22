import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  var [email, setEmail]       = useState("");
  var [sent, setSent]         = useState(false);
  var [loading, setLoading]   = useState(false);
  var [error, setError]       = useState("");

  var handleSubmit = async function(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      var res  = await fetch(import.meta.env.VITE_API_BASE + '/api/auth/forgot_password.php', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });
      var data = await res.json();
      if (res.ok) { setSent(true); }
      else setError(data.error || "Something went wrong");
    } catch { setError("Cannot connect to server"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--runit-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ position: "fixed", top: 14, left: 14 }}>
          <Link to="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", background: "rgba(15,46,41,0.8)", border: "0.5px solid rgba(0,201,167,0.2)", backdropFilter: "blur(10px)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "#0a1f1c", margin: "0 auto 12px" }}>R</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "var(--runit-text)", marginBottom: 6 }}>Forgot password?</div>
          <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>Enter your email and we will send a reset link</div>
        </div>

        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 24, padding: 28 }}>

          {sent ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--runit-text)", marginBottom: 8 }}>Check your inbox</div>
              <div style={{ fontSize: 13, color: "var(--runit-muted)", lineHeight: 1.6 }}>
                {"We sent a reset link to "}
                <strong style={{ color: "var(--runit-text)" }}>{email}</strong>
                {". It expires in 1 hour."}
              </div>
              <Link to="/login" style={{ display: "block", marginTop: 24, padding: "12px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 14, textDecoration: "none", textAlign: "center" }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 12, padding: "11px 14px", marginBottom: 16, color: "#ff8080", fontSize: 13 }}>
                  {"⚠ " + error}
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>Email address</label>
                <input type="email" required value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="you@ucc.edu.gh" className="runit-input" />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "14px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 15, border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--runit-muted)" }}>
          Remembered it?{" "}
          <Link to="/login" style={{ color: "var(--runit-accent)", fontWeight: 700 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}