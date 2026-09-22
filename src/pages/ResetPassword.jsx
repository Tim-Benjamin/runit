import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  var [params]                  = useSearchParams();
  var token                     = params.get("token") || "";
  var navigate                  = useNavigate();
  var [password, setPassword]   = useState("");
  var [confirm, setConfirm]     = useState("");
  var [loading, setLoading]     = useState(false);
  var [error, setError]         = useState("");
  var [done, setDone]           = useState(false);
  var [showPass, setShowPass]   = useState(false);

  useEffect(function() {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  var handleSubmit = async function(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      var res  = await fetch(import.meta.env.VITE_API_BASE + '/api/auth/reset_password.php', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, password: password }),
      });
      var data = await res.json();
      if (res.ok) { setDone(true); setTimeout(function() { navigate("/login"); }, 3000); }
      else setError(data.error || "Reset failed");
    } catch { setError("Cannot connect to server"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--runit-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "#0a1f1c", margin: "0 auto 12px" }}>R</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "var(--runit-text)", marginBottom: 6 }}>Set new password</div>
          <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>Choose a strong password for your account</div>
        </div>

        <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 24, padding: 28 }}>

          {done ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--runit-text)", marginBottom: 8 }}>Password reset!</div>
              <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>Redirecting you to login...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 12, padding: "11px 14px", marginBottom: 16, color: "#ff8080", fontSize: 13 }}>
                  {"⚠ " + error}
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>New password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} required value={password} onChange={function(e) { setPassword(e.target.value); }} placeholder="At least 6 characters" className="runit-input" style={{ paddingRight: 44 }} />
                  <button type="button" onClick={function() { setShowPass(function(p) { return !p; }); }}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--runit-muted)", cursor: "pointer", fontSize: 16, padding: 0, fontFamily: "inherit" }}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>Confirm password</label>
                <input type={showPass ? "text" : "password"} required value={confirm} onChange={function(e) { setConfirm(e.target.value); }} placeholder="Same password again" className="runit-input" />
              </div>

              {/* Strength indicator */}
              {password.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(function(i) {
                      var strength = password.length >= 12 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1;
                      var colors   = ["#ff6060","#ffb400","#00c9a7","#00c9a7"];
                      return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength - 1] : "var(--runit-border)", transition: "background 0.2s" }} />;
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--runit-muted)" }}>
                    {password.length >= 12 ? "Strong" : password.length >= 8 ? "Good" : password.length >= 6 ? "Weak" : "Too short"}
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading || !token}
                style={{ width: "100%", padding: "14px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 15, border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--runit-muted)" }}>
          <Link to="/login" style={{ color: "var(--runit-accent)", fontWeight: 700 }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}