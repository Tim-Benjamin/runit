import API_BASE from '../api/config';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const shops = [
  { id: 1, name: "Auntie Ama's Kitchen", category: "Food", location: "Near Main Gate", phone: "0241234567", emoji: "🍛" },
  { id: 2, name: "Campus Prints", category: "Printing", location: "Science Junction", phone: "0557654321", emoji: "🖨️" },
  { id: 3, name: "QuickMart Groceries", category: "Groceries", location: "Commercial Area", phone: "0201122334", emoji: "🛒" },
  { id: 4, name: "MedPlus Pharmacy", category: "Pharmacy", location: "Near Health Centre", phone: "0269988776", emoji: "💊" },
  { id: 5, name: "Kofi Bites", category: "Food", location: "Valco Flats", phone: "0243344556", emoji: "🌮" },
  { id: 6, name: "UCC Bookshop", category: "Other", location: "Main Campus", phone: "0331234567", emoji: "📚" },
];

const categories = ["All", "Food", "Groceries", "Printing", "Pharmacy", "Other"];

function getDashboardPath(role) {
  if (role === "runner") return "/runner";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

function getDashboardLabel(role) {
  if (role === "runner") return "Runner Dashboard";
  if (role === "admin") return "Admin Panel";
  return "My Dashboard";
}

export default function Home() {
  var [activeFilter, setActiveFilter] = useState("All");
  var navigate = useNavigate();
  var auth = useAuth();
  var user = auth.user;

  var filtered = activeFilter === "All" ? shops : shops.filter(function (s) { return s.category === activeFilter; });

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)" }}>

      <nav className="pill-navbar-desktop" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,31,28,0.85)", backdropFilter: "blur(12px)", borderBottom: "0.5px solid var(--runit-border)", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#0a1f1c" }}>R</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>RunIt</span>
        </div>

        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {["Home", "Shops", "How it works", "Become a Runner"].map(function (link) {
            return (
              <a key={link} href={"#" + link.toLowerCase().replace(/ /g, "-")} style={{ color: "var(--runit-muted)", fontSize: 14 }}
                onMouseEnter={function (e) { e.target.style.color = "var(--runit-accent)"; }}
                onMouseLeave={function (e) { e.target.style.color = "var(--runit-muted)"; }}
              >{link}</a>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {user ? (
            <>
              <div style={{ fontSize: 13, color: "var(--runit-muted)", marginRight: 4 }}>
                {"Hi, " + (user.name ? user.name.split(" ")[0] : "there")}
              </div>
              <Link to={getDashboardPath(user.role)} style={{ padding: "8px 20px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontSize: 14, fontWeight: 700 }}>
                {getDashboardLabel(user.role)}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: "8px 20px", borderRadius: 50, border: "1px solid var(--runit-accent)", color: "var(--runit-accent)", fontSize: 14, fontWeight: 500 }}>Login</Link>
              <Link to="/register" style={{ padding: "8px 20px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontSize: 14, fontWeight: 600 }}>Register</Link>
            </>
          )}
        </div>
      </nav>

      <div className="mobile-topbar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(10,31,28,0.92)", backdropFilter: "blur(12px)", borderBottom: "0.5px solid var(--runit-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "#0a1f1c" }}>R</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>RunIt</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {user ? (
            <Link to={getDashboardPath(user.role)} style={{ padding: "7px 16px", borderRadius: 50, fontSize: 13, fontWeight: 700, background: "var(--runit-accent)", color: "#0a1f1c" }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ padding: "7px 16px", borderRadius: 50, fontSize: 13, fontWeight: 600, border: "1px solid var(--runit-accent)", color: "var(--runit-accent)" }}>Login</Link>
              <Link to="/register" style={{ padding: "7px 16px", borderRadius: 50, fontSize: 13, fontWeight: 600, background: "var(--runit-accent)", color: "#0a1f1c" }}>Register</Link>
            </>
          )}
        </div>
      </div>

      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: "clamp(80px,15vw,120px) 24px 80px", background: "radial-gradient(ellipse at 50% 40%, rgba(0,201,167,0.08) 0%, transparent 70%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(0,201,167,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(0,201,167,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "6px 16px", marginBottom: 24 }}>
          <span style={{ fontSize: 12, color: "var(--runit-accent)", fontWeight: 500 }}>🎓 Built for UCC Students</span>
        </div>

        <h1 style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, maxWidth: 700, background: "linear-gradient(135deg, #e8f5f3 0%, #00c9a7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Get anything delivered on campus
        </h1>

        <p style={{ fontSize: 18, color: "var(--runit-muted)", maxWidth: 500, lineHeight: 1.6, marginBottom: 40 }}>
          Food, errands, shopping — describe what you need and a runner delivers it to you. Fast. Cash on delivery.
        </p>

        {user ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link to={getDashboardPath(user.role)} style={{ padding: "14px 32px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 16, boxShadow: "0 0 30px rgba(0,201,167,0.3)" }}>
              {getDashboardLabel(user.role)}
            </Link>
            <Link to="/orders" style={{ padding: "14px 32px", borderRadius: 50, border: "1px solid var(--runit-border-strong)", color: "var(--runit-text)", fontWeight: 600, fontSize: 16 }}>
              My Orders
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/register" style={{ padding: "14px 32px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 16, boxShadow: "0 0 30px rgba(0,201,167,0.3)" }}>Place an Order</Link>
            <a href="#become-a-runner" style={{ padding: "14px 32px", borderRadius: 50, border: "1px solid var(--runit-border-strong)", color: "var(--runit-text)", fontWeight: 600, fontSize: 16 }}>Become a Runner</a>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 60, flexWrap: "wrap", justifyContent: "center" }}>
          {[{ label: "Active Runners", value: "50+" }, { label: "Orders Delivered", value: "1,200+" }, { label: "Avg Delivery Time", value: "15 min" }].map(function (stat) {
            return (
              <div key={stat.label} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "10px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--runit-accent)" }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>How it works</h2>
          <p style={{ color: "var(--runit-muted)", fontSize: 16 }}>Three simple steps to get anything delivered</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {[
            { step: "01", icon: "📝", title: "Place your order", desc: "Describe exactly what you need — food, an errand, shopping. Set your location and proposed fee." },
            { step: "02", icon: "🏃", title: "A runner accepts", desc: "A nearby runner sees your order, accepts it, and heads out immediately." },
            { step: "03", icon: "📦", title: "Delivered to you", desc: "Your runner brings it right to you. Pay the agreed fee in cash. Done." },
          ].map(function (item) {
            return (
              <div key={item.step} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 16, right: 16, fontSize: 48, fontWeight: 800, color: "rgba(0,201,167,0.06)", lineHeight: 1 }}>{item.step}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: "var(--runit-muted)", fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="shops" style={{ padding: "80px 24px", background: "rgba(15,46,41,0.4)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>What do you need?</h2>
            <p style={{ color: "var(--runit-muted)", fontSize: 16 }}>Pick a category to get started</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {[
              { icon: "🍔", label: "Food & Drinks", color: "rgba(255,150,50,0.1)", border: "rgba(255,150,50,0.2)" },
              { icon: "🛵", label: "Errands", color: "rgba(0,201,167,0.1)", border: "rgba(0,201,167,0.2)" },
              { icon: "🛍️", label: "Shopping", color: "rgba(150,100,255,0.1)", border: "rgba(150,100,255,0.2)" },
              { icon: "📦", label: "Pickup & Drop", color: "rgba(80,160,255,0.1)", border: "rgba(80,160,255,0.2)" },
              { icon: "🔥", label: "Gas Refill", color: "rgba(255,100,50,0.1)", border: "rgba(255,100,50,0.2)" },
              { icon: "✨", label: "Custom", color: "rgba(255,200,0,0.1)", border: "rgba(255,200,0,0.2)" },
            ].map(function (cat) {
              return (
                <div key={cat.label}
                  onClick={function () { user ? navigate("/place-order?category=" + encodeURIComponent(cat.label)) : navigate("/register"); }}
                  style={{ background: cat.color, border: "1px solid " + cat.border, borderRadius: 20, padding: "28px 20px", textAlign: "center", cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700 }}>Shops Near UCC</h2>
          <span style={{ background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "4px 14px", fontSize: 12, color: "var(--runit-muted)" }}>Marketplace coming soon</span>
        </div>
        <p style={{ color: "var(--runit-muted)", marginBottom: 28, fontSize: 15 }}>Browse vendors — order through a runner, pay cash on delivery</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
          {categories.map(function (cat) {
            return (
              <button key={cat} onClick={function () { setActiveFilter(cat); }} style={{ padding: "8px 18px", borderRadius: 50, border: "1px solid", borderColor: activeFilter === cat ? "var(--runit-accent)" : "var(--runit-border)", background: activeFilter === cat ? "rgba(0,201,167,0.15)" : "transparent", color: activeFilter === cat ? "var(--runit-accent)" : "var(--runit-muted)", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                {cat}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(function (shop) {
            return (
              <div key={shop.id} style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, padding: 20, transition: "border-color 0.2s" }}
                onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--runit-border-strong)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--runit-border)"; }}
              >
                <div style={{ width: "100%", height: 100, background: "var(--runit-elevated)", borderRadius: 12, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                  {shop.emoji}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{shop.name}</div>
                    <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>{"📍 " + shop.location}</div>
                  </div>
                  <span style={{ background: "rgba(0,201,167,0.1)", borderRadius: 50, padding: "3px 10px", fontSize: 11, color: "var(--runit-accent)", border: "1px solid var(--runit-border)", whiteSpace: "nowrap" }}>{shop.category}</span>
                </div>
                <a href={"tel:" + shop.phone} style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 12 }}>{"📞 " + shop.phone}</a>
                <button onClick={function () { user ? navigate("/place-order?description=Order from " + shop.name) : navigate("/register"); }}
                  style={{ width: "100%", padding: "10px", borderRadius: 50, background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Order via Runner
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: "80px 24px", background: "rgba(15,46,41,0.4)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Why RunIt?</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            {[
              { icon: "⚡", title: "Fast delivery", desc: "Runners are already on campus — typical delivery in 10-20 minutes." },
              { icon: "💵", title: "Cash on delivery", desc: "No card, no app payment. Pay your runner in cash when they arrive." },
              { icon: "🎓", title: "Runners", desc: "Every runner, which can also be a UCC student earning on their own schedule." },
              { icon: "🛡️", title: "Safe & reliable", desc: "All runners are verified with Ghana Card or Student ID." },
            ].map(function (item) {
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

      <section id="become-a-runner" style={{ padding: "100px 24px", textAlign: "center", background: "radial-gradient(ellipse at 50% 50%, rgba(0,201,167,0.07) 0%, transparent 70%)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏃</div>
          <h2 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>Earn money on your own schedule</h2>
          <p style={{ color: "var(--runit-muted)", fontSize: 16, lineHeight: 1.6, marginBottom: 12 }}>
            Accept orders between classes. Walk, bike, or ride. Keep 80% of every delivery fee.
          </p>
          <div style={{ display: "inline-block", background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "8px 20px", marginBottom: 32, fontSize: 14, color: "var(--runit-accent)" }}>
            Earn GH₵ 200–500+ per week
          </div>
          <br />
          <Link to="/register/runner" style={{ display: "inline-block", padding: "16px 40px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 16, boxShadow: "0 0 40px rgba(0,201,167,0.25)" }}>
            Sign up as a Runner
          </Link>
        </div>
      </section>

      {/* Install app banner */}
      {!window.matchMedia('(display-mode: standalone)').matches && (
        <section style={{ padding: '60px 24px', background: 'var(--runit-surface)', borderTop: '1px solid var(--runit-border)' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📲</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Install RunIt on your phone</h2>
            <p style={{ color: 'var(--runit-muted)', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
              Add RunIt to your home screen for instant access — works like a native app, no App Store needed.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                { icon: '🤖', label: 'Android', steps: 'Chrome menu → Add to Home Screen' },
                { icon: '🍎', label: 'iPhone', steps: 'Safari → Share → Add to Home Screen' },
                { icon: '💻', label: 'Desktop', steps: 'Click install icon in address bar' },
              ].map(function (item) {
                return (
                  <div key={item.label} style={{ background: 'var(--runit-elevated)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '16px 20px', textAlign: 'center', minWidth: 160 }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--runit-muted)', lineHeight: 1.4 }}>{item.steps}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--runit-muted)' }}>
              No download required · Always up to date · Works offline
            </div>
          </div>
        </section>
      )}

      <footer style={{ background: "var(--runit-surface)", borderTop: "1px solid var(--runit-border)", padding: "48px 24px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--runit-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a1f1c" }}>R</div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>RunIt</span>
              </div>
              <p style={{ color: "var(--runit-muted)", fontSize: 13, lineHeight: 1.6 }}>On-demand delivery for the University of Cape Coast community.</p>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Quick Links</div>
              {["Home", "How it works", "Become a Runner", "Login", "Register"].map(function (link) {
                return <div key={link} style={{ marginBottom: 8 }}><a href="#" style={{ color: "var(--runit-muted)", fontSize: 13 }}>{link}</a></div>;
              })}
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Contact</div>
              <p style={{ color: "var(--runit-muted)", fontSize: 13, lineHeight: 1.8 }}>RunIt<br />Cape Coast, Ghana / Accra<br />runit@gmail.com.rn</p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--runit-border)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "var(--runit-muted)", fontSize: 12 }}>© 2026 RunIt. All rights reserved.</span>
            {/* <span style={{ color: "var(--runit-muted)", fontSize: 12 }}>Built for UCC students🎓</span> */}
          </div>
        </div>
      </footer>
    </div>
  );
}