import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import Spinner from "../../components/Spinner";
import Stories from '../../components/Stories';

const FILTERS  = ["All","Food","Groceries","Printing","Pharmacy","Other"];
const CAT_EMOJI = { Food: "🍔", Groceries: "🛒", Printing: "🖨️", Pharmacy: "💊", Other: "📦" };

export default function Shops() {
  var [shops, setShops]     = useState([]);
  var [loading, setLoading] = useState(true);
  var [filter, setFilter]   = useState("All");
  var [search, setSearch]   = useState("");
  var navigate              = useNavigate();

  useEffect(function() {
    fetchShops();
  }, []); // eslint-disable-line

  var fetchShops = async function() {
    setLoading(true);
    try {
      var res  = await fetch(import.meta.env.VITE_API_BASE + '/api/shops/list.php');
      var data = await res.json();
      if (res.ok) setShops(data.shops || []);
    } catch {}
    setLoading(false);
  };

  var filtered = shops.filter(function(s) {
    var matchCat    = filter === "All" || s.category === filter;
    var matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                      (s.location_description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  var searchIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="Shops Near UCC" subtitle="Order via runner" actions={[{ icon: searchIcon, onClick: function() {} }]} />

      <div className="page-content">
        <Stories />
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input
            placeholder="Search shops or locations..."
            value={search} onChange={function(e) { setSearch(e.target.value); }}
            style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: 50, background: "var(--runit-surface)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            onFocus={function(e) { e.target.style.borderColor = "var(--runit-accent)"; }}
            onBlur={function(e) { e.target.style.borderColor = "var(--runit-border)"; }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {FILTERS.map(function(f) {
            return (
              <button key={f} onClick={function() { setFilter(f); }}
                style={{ padding: "7px 16px", borderRadius: 50, fontSize: 12, fontWeight: filter === f ? 600 : 400, border: "1px solid", borderColor: filter === f ? "var(--runit-accent)" : "var(--runit-border)", background: filter === f ? "rgba(0,201,167,0.12)" : "transparent", color: filter === f ? "var(--runit-accent)" : "var(--runit-muted)", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                {f}
              </button>
            );
          })}
        </div>

        {/* Coming soon banner */}
        <div style={{ background: "rgba(0,201,167,0.05)", border: "1px solid var(--runit-border)", borderRadius: 14, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>🏪</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--runit-accent)" }}>Marketplace</div>
            <div style={{ fontSize: 11, color: "var(--runit-muted)" }}>Order via runner · cash on delivery · no card needed</div>
          </div>
        </div>

        {loading && <Spinner />}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--runit-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No shops found</div>
            <div style={{ fontSize: 13 }}>Try a different search or category</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(function(shop) {
            var totalViews = parseInt(shop.total_views || shop.view_count || 0);
            return (
              <div key={shop.id}
                style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 20, overflow: "hidden", transition: "border-color 0.2s" }}
                onMouseEnter={function(e) { e.currentTarget.style.borderColor = "var(--runit-border-strong)"; }}
                onMouseLeave={function(e) { e.currentTarget.style.borderColor = "var(--runit-border)"; }}
              >
                {/* Shop image */}
                <div style={{ height: 130, background: "var(--runit-elevated)", position: "relative", overflow: "hidden" }}>
                  {shop.image_url ? (
                    <img src={shop.image_url} alt={shop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
                      {CAT_EMOJI[shop.category] || "🏪"}
                    </div>
                  )}
                  {/* View count */}
                  <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(10,31,28,0.8)", borderRadius: 50, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(8px)" }}>
                    <span style={{ fontSize: 11 }}>👁</span>
                    <span style={{ fontSize: 10, color: "var(--runit-text)", fontWeight: 600 }}>{totalViews.toLocaleString()}</span>
                  </div>
                  {/* Category badge */}
                  <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(10,31,28,0.8)", borderRadius: 50, padding: "3px 10px", backdropFilter: "blur(8px)" }}>
                    <span style={{ fontSize: 10, color: "var(--runit-accent)", fontWeight: 600 }}>{shop.category}</span>
                  </div>
                </div>

                {/* Shop details */}
                <div style={{ padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{shop.name}</div>
                  <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 2 }}>{"📍 " + (shop.location_description || shop.location || "")}</div>
                  <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 14 }}>{"📞 " + shop.phone}</div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={function() {
                        navigate("/place-order?description=" + encodeURIComponent("Order from " + shop.name) + "&category=Food%20%26%20Drinks");
                      }}
                      style={{ flex: 1, padding: "10px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Order via Runner
                    </button>
                    <a href={"tel:" + shop.phone}
                      style={{ padding: "10px 16px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontSize: 13, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center" }}>
                      📞
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
      <BottomPillNav />
    </div>
  );
}