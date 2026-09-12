import { useState, useEffect, useRef } from "react";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import Spinner from "../../components/Spinner";

const CATEGORIES  = ["Food","Groceries","Printing","Pharmacy","Other"];
const CAT_EMOJI   = { Food: "🍔", Groceries: "🛒", Printing: "🖨️", Pharmacy: "💊", Other: "📦" };
const IMG_BASE    = (import.meta.env.VITE_API_BASE) + "/uploads/shops/";
const emptyForm   = { name: "", category: "Food", location_description: "", phone: "" };

export default function AdminShops() {
  var [shops, setShops]       = useState([]);
  var [loading, setLoading]   = useState(true);
  var [showForm, setShowForm] = useState(false);
  var [form, setForm]         = useState(emptyForm);
  var [imageFile, setImageFile] = useState(null);
  var [imagePreview, setImagePreview] = useState(null);
  var [saving, setSaving]     = useState(false);
  var [msg, setMsg]           = useState("");
  var [msgType, setMsgType]   = useState("success");
  var [boostModal, setBoostModal] = useState(null);
  var [boostVal, setBoostVal] = useState("");
  var fileRef                 = useRef(null);

  var showMsg = function(text, type) {
    setMsg(text); setMsgType(type || "success");
    setTimeout(function() { setMsg(""); }, 4000);
  };

  useEffect(function() { fetchShops(); }, []); // eslint-disable-line

  var fetchShops = async function() {
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch((import.meta.env.VITE_API_BASE) + "/api/admin/shops.php", {
        headers: { Authorization: "Bearer " + token },
      });
      var data  = await res.json();
      if (res.ok) setShops(data.shops || []);
    } catch {}
    setLoading(false);
  };

  var handleImage = function(e) {
    var f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    var reader = new FileReader();
    reader.onload = function(ev) { setImagePreview(ev.target.result); };
    reader.readAsDataURL(f);
  };

  var saveShop = async function() {
    if (!form.name || !form.location_description || !form.phone) {
      showMsg("All fields are required", "error"); return;
    }
    setSaving(true);
    try {
      var token = localStorage.getItem("runit_token");
      var fd    = new FormData();
      fd.append("name",                 form.name);
      fd.append("category",             form.category);
      fd.append("location_description", form.location_description);
      fd.append("phone",                form.phone);
      if (imageFile) fd.append("image", imageFile);

      var res  = await fetch((import.meta.env.VITE_API_BASE) + "/api/admin/shops.php", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: fd,
      });
      var data = await res.json();
      if (res.ok) {
        showMsg("Shop added successfully");
        setForm(emptyForm); setImageFile(null); setImagePreview(null);
        setShowForm(false); fetchShops();
      } else {
        showMsg(data.error || "Failed to save", "error");
      }
    } catch { showMsg("Connection error", "error"); }
    setSaving(false);
  };

  var toggleShop = async function(id, currentStatus) {
    var newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      var token = localStorage.getItem("runit_token");
      await fetch((import.meta.env.VITE_API_BASE) + "/api/admin/shops.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchShops();
    } catch {}
  };

  var deleteShop = async function(id) {
    if (!window.confirm("Delete this shop? This cannot be undone.")) return;
    try {
      var token = localStorage.getItem("runit_token");
      await fetch((import.meta.env.VITE_API_BASE) + "/api/admin/shops.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ id }),
      });
      fetchShops();
    } catch {}
  };

  var saveBoost = async function() {
    var val = parseInt(boostVal);
    if (isNaN(val) || val < 0) { showMsg("Enter a valid number", "error"); return; }
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch((import.meta.env.VITE_API_BASE) + "/api/admin/shops.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ id: boostModal.id, boost: val }),
      });
      var data = await res.json();
      if (res.ok) { showMsg("Boost views updated for " + boostModal.name); setBoostModal(null); fetchShops(); }
      else showMsg(data.error || "Failed", "error");
    } catch { showMsg("Connection error", "error"); }
  };

  var inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 14, outline: "none", fontFamily: "inherit" };

  var plusIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="Manage Shops" subtitle={shops.length + " listings"} actions={[{ icon: plusIcon, onClick: function() { setShowForm(true); } }]} />

      <div className="page-content">

        {msg && (
          <div style={{ background: msgType === "error" ? "rgba(255,80,80,0.08)" : "rgba(0,201,167,0.1)", border: "1px solid " + (msgType === "error" ? "rgba(255,80,80,0.25)" : "var(--runit-border-strong)"), borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: msgType === "error" ? "#ff8080" : "var(--runit-accent)", fontSize: 13 }}>
            {msg}
          </div>
        )}

        <button onClick={function() { setShowForm(true); }} style={{ width: "100%", padding: "13px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginBottom: 20, fontFamily: "inherit" }}>
          + Add New Shop
        </button>

        {loading && <Spinner />}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {shops.map(function(shop) {
            var totalViews = parseInt(shop.total_views || 0);
            return (
              <div key={shop.id} style={{ background: "var(--runit-surface)", border: "1px solid " + (shop.status === "inactive" ? "rgba(255,80,80,0.2)" : "var(--runit-border)"), borderRadius: 20, overflow: "hidden", opacity: shop.status === "inactive" ? 0.75 : 1 }}>

                {/* Shop image */}
                <div style={{ height: 140, background: "var(--runit-elevated)", position: "relative", overflow: "hidden" }}>
                  {shop.image_url ? (
                    <img src={shop.image_url} alt={shop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
                      {CAT_EMOJI[shop.category] || "📦"}
                    </div>
                  )}
                  {/* View count badge */}
                  <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(10,31,28,0.85)", borderRadius: 50, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(8px)" }}>
                    <span style={{ fontSize: 12 }}>👁</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--runit-text)" }}>{totalViews.toLocaleString()}</span>
                  </div>
                  {/* Status badge */}
                  <div style={{ position: "absolute", top: 10, left: 10, background: shop.status === "active" ? "rgba(0,201,167,0.9)" : "rgba(255,80,80,0.9)", borderRadius: 50, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "white", backdropFilter: "blur(8px)" }}>
                    {shop.status === "active" ? "ACTIVE" : "INACTIVE"}
                  </div>
                </div>

                {/* Shop details */}
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{shop.name}</div>
                      <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>{"📍 " + shop.location_description}</div>
                      <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>{"📞 " + shop.phone}</div>
                    </div>
                    <span style={{ background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "3px 10px", fontSize: 10, color: "var(--runit-accent)", fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}>
                      {shop.category}
                    </span>
                  </div>

                  {/* View breakdown */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, fontSize: 11, color: "var(--runit-muted)" }}>
                    <span>{"Real views: " + parseInt(shop.view_count || 0).toLocaleString()}</span>
                    <span>·</span>
                    <span style={{ color: "var(--runit-accent)", fontWeight: 600 }}>{"Boosted: +" + parseInt(shop.boost_views || 0).toLocaleString()}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={function() { setBoostModal(shop); setBoostVal(String(shop.boost_views || 0)); }}
                      style={{ flex: 1, padding: "9px", borderRadius: 50, background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      ⬆️ Boost Views
                    </button>
                    <button onClick={function() { toggleShop(shop.id, shop.status); }}
                      style={{ padding: "9px 14px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      {shop.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={function() { deleteShop(shop.id); }}
                      style={{ padding: "9px 14px", borderRadius: 50, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", color: "#ff6060", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && shops.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--runit-muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No shops yet</div>
              <div style={{ fontSize: 13 }}>Add your first shop listing above</div>
            </div>
          )}
        </div>
      </div>

      {/* Add shop modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Add New Shop</div>
              <button onClick={function() { setShowForm(false); setImageFile(null); setImagePreview(null); setForm(emptyForm); }}
                style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "var(--runit-muted)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Image upload */}
              <div>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>Shop photo (optional)</label>
                <div onClick={function() { fileRef.current && fileRef.current.click(); }}
                  style={{ height: 140, background: "var(--runit-elevated)", border: "2px dashed " + (imagePreview ? "var(--runit-accent)" : "var(--runit-border)"), borderRadius: 14, cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ textAlign: "center", color: "var(--runit-muted)" }}>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>📷</div>
                      <div style={{ fontSize: 13 }}>Tap to upload shop photo</div>
                      <div style={{ fontSize: 11, marginTop: 2 }}>JPG, PNG or WebP, max 3MB</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} style={{ display: "none" }} />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>Shop name *</label>
                <input value={form.name} onChange={function(e) { setForm(function(f) { return { ...f, name: e.target.value }; }); }} placeholder="e.g. Auntie Ama's Kitchen" style={inputStyle}
                  onFocus={function(e) { e.target.style.borderColor = "var(--runit-accent)"; }}
                  onBlur={function(e) { e.target.style.borderColor = "var(--runit-border)"; }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>Category *</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {CATEGORIES.map(function(cat) {
                    var active = form.category === cat;
                    return (
                      <button key={cat} type="button" onClick={function() { setForm(function(f) { return { ...f, category: cat }; }); }}
                        style={{ padding: "7px 14px", borderRadius: 50, fontSize: 12, border: "1px solid", borderColor: active ? "var(--runit-accent)" : "var(--runit-border)", background: active ? "rgba(0,201,167,0.12)" : "transparent", color: active ? "var(--runit-accent)" : "var(--runit-muted)", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        {CAT_EMOJI[cat] + " " + cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>Location description *</label>
                <input value={form.location_description} onChange={function(e) { setForm(function(f) { return { ...f, location_description: e.target.value }; }); }} placeholder="e.g. Near Main Gate, UCC" style={inputStyle}
                  onFocus={function(e) { e.target.style.borderColor = "var(--runit-accent)"; }}
                  onBlur={function(e) { e.target.style.borderColor = "var(--runit-border)"; }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>Phone number *</label>
                <input value={form.phone} onChange={function(e) { setForm(function(f) { return { ...f, phone: e.target.value }; }); }} placeholder="024XXXXXXX" style={inputStyle}
                  onFocus={function(e) { e.target.style.borderColor = "var(--runit-accent)"; }}
                  onBlur={function(e) { e.target.style.borderColor = "var(--runit-border)"; }}
                />
              </div>

              <button onClick={saveShop} disabled={saving}
                style={{ width: "100%", padding: "14px", borderRadius: 50, background: saving ? "var(--runit-accent-dark)" : "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 15, border: "none", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4 }}
              >
                {saving ? "Saving..." : "Add Shop"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boost views modal */}
      {boostModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
          <div style={{ background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", borderRadius: 24, padding: 28, width: "100%", maxWidth: 380 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>⬆️ Boost Views</div>
            <div style={{ fontSize: 13, color: "var(--runit-muted)", marginBottom: 4 }}>{boostModal.name}</div>
            <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 16, lineHeight: 1.5 }}>
              Set the total boosted view count for this shop. This adds to real organic views to boost confidence for new visitors.
            </div>

            <div style={{ background: "var(--runit-surface)", borderRadius: 12, padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 4 }}>Real Views</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--runit-text)" }}>{parseInt(boostModal.view_count || 0).toLocaleString()}</div>
              </div>
              <div style={{ width: 1, background: "var(--runit-border)" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 4 }}>Boosted</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--runit-accent)" }}>{parseInt(boostModal.boost_views || 0).toLocaleString()}</div>
              </div>
              <div style={{ width: 1, background: "var(--runit-border)" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 4 }}>Total Shown</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--runit-accent)" }}>{(parseInt(boostModal.view_count || 0) + parseInt(boostModal.boost_views || 0)).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>Set boost views to:</label>
              <input type="number" min="0" value={boostVal} onChange={function(e) { setBoostVal(e.target.value); }}
                style={{ ...inputStyle, fontSize: 18, fontWeight: 700 }}
                onFocus={function(e) { e.target.style.borderColor = "var(--runit-accent)"; }}
                onBlur={function(e) { e.target.style.borderColor = "var(--runit-border)"; }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {[100, 500, 1000, 5000, 10000].map(function(preset) {
                return (
                  <button key={preset} type="button" onClick={function() { setBoostVal(String(preset)); }}
                    style={{ padding: "6px 12px", borderRadius: 50, fontSize: 11, border: "1px solid var(--runit-border)", background: boostVal === String(preset) ? "rgba(0,201,167,0.12)" : "transparent", color: boostVal === String(preset) ? "var(--runit-accent)" : "var(--runit-muted)", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {preset >= 1000 ? (preset / 1000) + "K" : preset}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveBoost} style={{ flex: 1, padding: "12px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                Save Boost
              </button>
              <button onClick={function() { setBoostModal(null); }} style={{ padding: "12px 18px", borderRadius: 50, background: "transparent", border: "1px solid var(--runit-border)", color: "var(--runit-muted)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomPillNav />
    </div>
  );
}