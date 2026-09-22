import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CAT_EMOJI = { Food: "🍔", Groceries: "🛒", Printing: "🖨️", Pharmacy: "💊", Other: "📦" };

function getDashboardPath(role) {
  if (role === "runner") return "/runner";
  if (role === "admin")  return "/admin";
  return "/dashboard";
}

function getDashboardLabel(role) {
  if (role === "runner") return "Runner Dashboard";
  if (role === "admin")  return "Admin Panel";
  return "My Dashboard";
}

export default function Home() {
  var navigate      = useNavigate();
  var auth          = useAuth();
  var user          = auth.user;
  var [shops, setShops]       = useState([]);
  var [shopsLoading, setShopsLoading] = useState(true);
  var [activeFilter, setActiveFilter] = useState("All");

  useEffect(function() {
    fetch(import.meta.env.VITE_API_BASE + '/api/shops/list.php')
      .then(function(r) { return r.json(); })
      .then(function(d) { setShops(d.shops || []); })
      .catch(function() {})
      .finally(function() { setShopsLoading(false); });
  }, []);

  var filters = ["All"].concat(
    ["Food","Groceries","Printing","Pharmacy","Other"].filter(function(cat) {
      return shops.some(function(s) { return s.category === cat; });
    })
  );

  var filteredShops = activeFilter === "All"
    ? shops
    : shops.filter(function(s) { return s.category === activeFilter; });

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)" }}>

      {/* ── Desktop nav ── */}
      <nav className="pill-navbar-desktop" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,31,28,0.92)", backdropFilter: "blur(12px)", borderBottom: "0.5px solid var(--runit-border)", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#0a1f1c" }}>R</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>RunIt</span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {["How it works", "Shops", "Become a Runner"].map(function(link) {
            return (
              <a key={link} href={"#" + link.toLowerCase().replace(/ /g, "-")}
                style={{ color: "var(--runit-muted)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={function(e) { e.target.style.color = "var(--runit-accent)"; }}
                onMouseLeave={function(e) { e.target.style.color = "var(--runit-muted)"; }}
              >{link}</a>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {user ? (
            <>
              <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>{"Hi, " + (user.name ? user.name.split(" ")[0] : "there")}</div>
              <Link to={getDashboardPath(user.role)} style={{ padding: "8px 20px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                {getDashboardLabel(user.role)}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: "8px 20px", borderRadius: 50, border: "1px solid var(--runit-accent)", color: "var(--runit-accent)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Login</Link>
              <Link to="/register" style={{ padding: "8px 20px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Mobile nav ── */}
      <div className="mobile-topbar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "none", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(10,31,28,0.95)", backdropFilter: "blur(12px)", borderBottom: "0.5px solid var(--runit-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "#0a1f1c" }}>R</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>RunIt</span>
        </div>
        {user ? (
          <Link to={getDashboardPath(user.role)} style={{ padding: "7px 16px", borderRadius: 50, fontSize: 13, fontWeight: 700, background: "var(--runit-accent)", color: "#0a1f1c", textDecoration: "none" }}>Dashboard</Link>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/login" style={{ padding: "7px 14px", borderRadius: 50, fontSize: 13, fontWeight: 600, border: "1px solid var(--runit-accent)", color: "var(--runit-accent)", textDecoration: "none" }}>Login</Link>
            <Link to="/register" style={{ padding: "7px 14px", borderRadius: 50, fontSize: 13, fontWeight: 600, background: "var(--runit-accent)", color: "#0a1f1c", textDecoration: "none" }}>Join</Link>
          </div>
        )}
      </div>

      {/* ── Hero ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: "clamp(80px,15vw,120px) 24px 80px", background: "radial-gradient(ellipse at 50% 40%, rgba(0,201,167,0.08) 0%, transparent 70%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(0,201,167,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", border: "1px solid rgba(0,201,167,0.09)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "6px 16px", marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--runit-accent)", animation: "pulse 1.5s infinite", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "var(--runit-accent)", fontWeight: 500 }}>Now live at UCC campus</span>
        </div>

        <h1 style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, maxWidth: 700, background: "linear-gradient(135deg, #e8f5f3 0%, #00c9a7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Get anything delivered on campus
        </h1>

        <p style={{ fontSize: "clamp(15px,2vw,18px)", color: "var(--runit-muted)", maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
          Food, errands, gas refills, pickup and drop — describe what you need and a student runner delivers it fast. Cash on delivery.
        </p>

        {user ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link to={getDashboardPath(user.role)} style={{ padding: "14px 32px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 0 30px rgba(0,201,167,0.3)" }}>
              {getDashboardLabel(user.role)}
            </Link>
            <Link to="/orders" style={{ padding: "14px 32px", borderRadius: 50, border: "1px solid var(--runit-border-strong)", color: "var(--runit-text)", fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
              My Orders
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/register" style={{ padding: "14px 32px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 0 30px rgba(0,201,167,0.3)" }}>
              Place an Order
            </Link>
            <a href="#become-a-runner" style={{ padding: "14px 32px", borderRadius: 50, border: "1px solid var(--runit-border-strong)", color: "var(--runit-text)", fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
              Become a Runner
            </a>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 60, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "Active Runners",    value: "50+"      },
            { label: "Orders Delivered",  value: "1,200+"   },
            { label: "Avg Delivery Time", value: "15 min"   },
          ].map(function(stat) {
            return (
              <div key={stat.label} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "10px 22px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--runit-accent)" }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Order categories ── */}
      <section style={{ padding: "80px 24px", background: "rgba(15,46,41,0.4)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, marginBottom: 10 }}>What do you need?</h2>
            <p style={{ color: "var(--runit-muted)", fontSize: 15 }}>Pick a category and place your order in seconds</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
            {[
              { icon: "🍔", label: "Food & Drinks", cat: "Food & Drinks", color: "rgba(255,150,50,0.1)", border: "rgba(255,150,50,0.2)" },
              { icon: "🛵", label: "Errands",       cat: "Errands",       color: "rgba(0,201,167,0.1)",  border: "rgba(0,201,167,0.2)"  },
              { icon: "🛍️", label: "Shopping",     cat: "Shopping",      color: "rgba(150,100,255,0.1)",border: "rgba(150,100,255,0.2)"},
              { icon: "📦", label: "Pickup & Drop", cat: "Pickup & Drop", color: "rgba(80,160,255,0.1)", border: "rgba(80,160,255,0.2)" },
              { icon: "🔥", label: "Gas Refill",    cat: "Gas Refill",    color: "rgba(255,100,50,0.1)", border: "rgba(255,100,50,0.2)" },
              { icon: "✨", label: "Custom",        cat: "Custom",        color: "rgba(255,200,0,0.1)",  border: "rgba(255,200,0,0.2)"  },
            ].map(function(cat) {
              return (
                <div key={cat.label}
                  onClick={function() { user ? navigate("/place-order?category=" + encodeURIComponent(cat.cat)) : navigate("/register"); }}
                  style={{ background: cat.color, border: "1px solid " + cat.border, borderRadius: 20, padding: "24px 16px", textAlign: "center", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={function(e) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{cat.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{cat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Live Marketplace ── */}
      <section id="shops" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, marginBottom: 8 }}>Shops Near UCC</h2>
              <p style={{ color: "var(--runit-muted)", fontSize: 15 }}>Browse vendors — order via runner, pay cash on delivery</p>
            </div>
            <Link to={user ? "/shops" : "/register"} style={{ padding: "10px 22px", borderRadius: 50, border: "1px solid var(--runit-accent)", color: "var(--runit-accent)", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
              See all shops →
            </Link>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
            {filters.map(function(f) {
              return (
                <button key={f} onClick={function() { setActiveFilter(f); }}
                  style={{ padding: "7px 18px", borderRadius: 50, fontSize: 13, fontWeight: activeFilter === f ? 600 : 400, border: "1px solid", borderColor: activeFilter === f ? "var(--runit-accent)" : "var(--runit-border)", background: activeFilter === f ? "rgba(0,201,167,0.12)" : "transparent", color: activeFilter === f ? "var(--runit-accent)" : "var(--runit-muted)", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.2s" }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {shopsLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--runit-muted)" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid rgba(0,201,167,0.2)", borderTopColor: "var(--runit-accent)", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
              Loading shops...
            </div>
          ) : filteredShops.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--runit-muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
              <div style={{ fontSize: 15 }}>No shops listed yet — check back soon!</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {filteredShops.slice(0, 6).map(function(shop) {
                return (
                  <div key={shop.id}
                    style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, overflow: "hidden", transition: "transform 0.2s, border-color 0.2s" }}
                    onMouseEnter={function(e) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--runit-border-strong)"; }}
                    onMouseLeave={function(e) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--runit-border)"; }}
                  >
                    {/* Image */}
                    <div style={{ height: 130, background: "var(--runit-elevated)", position: "relative", overflow: "hidden" }}>
                      {shop.image_url ? (
                        <img src={shop.image_url} alt={shop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
                          {CAT_EMOJI[shop.category] || "🏪"}
                        </div>
                      )}
                      {/* Views badge */}
                      <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(10,31,28,0.8)", borderRadius: 50, padding: "3px 8px", fontSize: 10, color: "var(--runit-text)", fontWeight: 600, backdropFilter: "blur(6px)" }}>
                        {"👁 " + parseInt(shop.total_views || 0).toLocaleString()}
                      </div>
                      {/* Category */}
                      <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,201,167,0.9)", borderRadius: 50, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#0a1f1c" }}>
                        {shop.category}
                      </div>
                    </div>
                    {/* Details */}
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{shop.name}</div>
                      <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 2 }}>{"📍 " + (shop.location_description || shop.location || "")}</div>
                      <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 12 }}>{"📞 " + shop.phone}</div>
                      <button
                        onClick={function() { user ? navigate("/place-order?description=Order from " + encodeURIComponent(shop.name)) : navigate("/register"); }}
                        style={{ width: "100%", padding: "10px", borderRadius: 50, background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s" }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(0,201,167,0.18)"; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = "rgba(0,201,167,0.1)"; }}
                      >
                        Order via Runner
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredShops.length > 6 && (
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <Link to={user ? "/shops" : "/register"} style={{ padding: "12px 28px", borderRadius: 50, border: "1px solid var(--runit-accent)", color: "var(--runit-accent)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                {"View all " + filteredShops.length + " shops →"}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: "80px 24px", background: "rgba(15,46,41,0.4)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, marginBottom: 10 }}>How it works</h2>
            <p style={{ color: "var(--runit-muted)", fontSize: 15 }}>Three steps to get anything delivered</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { step: "01", icon: "📝", title: "Place your order", desc: "Describe what you need, set your location and proposed delivery fee." },
              { step: "02", icon: "🏃", title: "A runner accepts", desc: "A nearby student runner accepts and heads out immediately." },
              { step: "03", icon: "📦", title: "Delivered to you",  desc: "Your runner brings it right to you. Pay the fee in cash." },
            ].map(function(item) {
              return (
                <div key={item.step} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 12, right: 16, fontSize: 44, fontWeight: 800, color: "rgba(0,201,167,0.06)", lineHeight: 1 }}>{item.step}</div>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ color: "var(--runit-muted)", fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why RunIt ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, marginBottom: 10 }}>Why RunIt?</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { icon: "⚡", title: "Fast delivery",    desc: "Runners are already on campus — typical delivery in 10-20 minutes." },
              { icon: "💵", title: "Cash on delivery", desc: "No card or app payment needed. Pay your runner in cash." },
              { icon: "🎓", title: "Student runners",  desc: "Every runner is a verified UCC student earning on their schedule." },
              { icon: "🛡️", title: "Accountable",     desc: "Receipt uploads and fill confirmations keep runners honest." },
            ].map(function(item) {
              return (
                <div key={item.title} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 28, textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ color: "var(--runit-muted)", fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Become a Runner ── */}
      <section id="become-a-runner" style={{ padding: "100px 24px", textAlign: "center", background: "radial-gradient(ellipse at 50% 50%, rgba(0,201,167,0.07) 0%, transparent 70%)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏃</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, marginBottom: 16 }}>Earn money on your own schedule</h2>
          <p style={{ color: "var(--runit-muted)", fontSize: 16, lineHeight: 1.7, marginBottom: 12 }}>
            Accept orders between classes. Walk, bike, or ride. Keep 80% of every delivery fee.
          </p>
          <div style={{ display: "inline-block", background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "8px 20px", marginBottom: 32, fontSize: 14, color: "var(--runit-accent)" }}>
            Earn GH₵ 200–500+ per week
          </div>
          <br />
          <Link to="/register/runner" style={{ display: "inline-block", padding: "16px 40px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 0 40px rgba(0,201,167,0.25)" }}>
            Sign up as a Runner
          </Link>
        </div>
      </section>

      {/* ── Install App ── */}
      {!window.matchMedia("(display-mode: standalone)").matches && (
        <section style={{ padding: "60px 24px", background: "var(--runit-surface)", borderTop: "1px solid var(--runit-border)" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📲</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Install RunIt on your phone</h2>
            <p style={{ color: "var(--runit-muted)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Add to home screen for instant access — no App Store needed.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { icon: "🤖", label: "Android", steps: "Chrome menu → Add to Home Screen" },
                { icon: "🍎", label: "iPhone",  steps: "Safari → Share → Add to Home Screen" },
                { icon: "💻", label: "Desktop", steps: "Click install icon in address bar" },
              ].map(function(item) {
                return (
                  <div key={item.label} style={{ background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: "14px 18px", textAlign: "center", minWidth: 140 }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "var(--runit-muted)", lineHeight: 1.4 }}>{item.steps}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer style={{ background: "var(--runit-surface)", borderTop: "1px solid var(--runit-border)", padding: "40px 24px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a1f1c" }}>R</div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>RunIt</span>
          </div>
          <span style={{ color: "var(--runit-muted)", fontSize: 12 }}>© 2025 RunIt · Built for UCC students 🎓</span>
          <span style={{ color: "var(--runit-muted)", fontSize: 12 }}>runit@ucc.edu.gh</span>
        </div>
      </footer>

    </div>
  );
}