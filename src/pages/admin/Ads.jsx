import { useState, useEffect } from "react";
import PillNavbar from "../../components/PillNavbar";
import BottomPillNav from "../../components/BottomPillNav";
import Spinner from "../../components/Spinner";

const BASE = import.meta.env.VITE_API_BASE;

export default function AdminAds() {
  var [ads, setAds]           = useState([]);
  var [loading, setLoading]   = useState(true);
  var [tab, setTab]           = useState("list");
  var [type, setType]         = useState("image");
  var [caption, setCaption]   = useState("");
  var [textContent, setTextContent] = useState("");
  var [ctaText, setCtaText]   = useState("");
  var [ctaUrl, setCtaUrl]     = useState("");
  var [bgColor, setBgColor]   = useState("#111111");
  var [textColor, setTextColor] = useState("#ffffff");
  var [file, setFile]         = useState(null);
  var [preview, setPreview]   = useState(null);
  var [posting, setPosting]   = useState(false);
  var [msg, setMsg]           = useState("");
  var [msgType, setMsgType]   = useState("success");

  useEffect(function() { fetchAds(); }, []);

  var fetchAds = async function() {
    setLoading(true);
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(BASE + '/api/admin/ads.php', {
        headers: { Authorization: "Bearer " + token },
      });
      var data = await res.json();
      if (res.ok) setAds(data.ads || []);
    } catch {}
    setLoading(false);
  };

  var showMsg = function(text, t) {
    setMsg(text); setMsgType(t || "success");
    setTimeout(function() { setMsg(""); }, 4000);
  };

  var handleFile = function(e) {
    var f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  var postAd = async function() {
    if (type === "image" && !file)       { showMsg("Please select an image", "error"); return; }
    if (type === "text" && !textContent) { showMsg("Enter text content", "error"); return; }
    if (!caption)                        { showMsg("Caption is required", "error"); return; }
    setPosting(true);
    try {
      var token = localStorage.getItem("runit_token");
      var fd    = new FormData();
      fd.append("type",         type);
      fd.append("caption",      caption);
      fd.append("cta_text",     ctaText);
      fd.append("cta_url",      ctaUrl);
      fd.append("bg_color",     bgColor);
      fd.append("text_color",   textColor);
      fd.append("text_content", textContent);
      if (file) fd.append("image", file);

      var res  = await fetch(BASE + '/api/admin/ads.php', {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: fd,
      });
      var data = await res.json();
      if (res.ok) {
        showMsg("Ad saved! It will show on next app open.", "success");
        setCaption(""); setTextContent(""); setCtaText(""); setCtaUrl("");
        setFile(null); setPreview(null);
        setTab("list"); fetchAds();
      } else { showMsg(data.error || "Failed", "error"); }
    } catch { showMsg("Connection error", "error"); }
    setPosting(false);
  };

  var deleteAd = async function(id) {
    if (!window.confirm("Delete this ad?")) return;
    try {
      var token = localStorage.getItem("runit_token");
      var res   = await fetch(BASE + '/api/admin/ads.php', {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ id: id }),
      });
      var data = await res.json();
      if (res.ok) { showMsg("Ad deleted", "success"); fetchAds(); }
      else showMsg(data.error || "Failed", "error");
    } catch { showMsg("Connection error", "error"); }
  };

  var COLORS = ["#111111","#0a1f1c","#1a1a2e","#16213e","#533483","#e94560","#f5a623","#2ecc71","#3498db","#ffffff"];

  var activeAd = ads.find(function(a) { return parseInt(a.is_active); });

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 100 }}>
      <PillNavbar title="Launch Ad" subtitle="Shown on app open" />

      <div className="page-content">

        {msg !== "" && (
          <div style={{ background: msgType === "error" ? "rgba(255,80,80,0.08)" : "rgba(0,201,167,0.1)", border: "1px solid " + (msgType === "error" ? "rgba(255,80,80,0.25)" : "var(--runit-border-strong)"), borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: msgType === "error" ? "#ff8080" : "var(--runit-accent)", fontSize: 13, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        {/* Active ad notice */}
        {activeAd && (
          <div style={{ background: "rgba(0,201,167,0.07)", border: "1px solid rgba(0,201,167,0.2)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📢</span>
            <div style={{ flex: 1, fontSize: 13 }}>
              <span style={{ color: "var(--runit-accent)", fontWeight: 700 }}>Ad is live. </span>
              <span style={{ color: "var(--runit-muted)" }}>Users see it when they open the app. Posting a new one replaces it.</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ key: "list", label: "📋 Current Ad" }, { key: "new", label: "＋ New Ad" }].map(function(t) {
            var isActive = tab === t.key;
            return (
              <button key={t.key} onClick={function() { setTab(t.key); }}
                style={{ flex: 1, padding: "10px", borderRadius: 50, border: "1px solid", borderColor: isActive ? "var(--runit-accent)" : "var(--runit-border)", background: isActive ? "rgba(0,201,167,0.12)" : "transparent", color: isActive ? "var(--runit-accent)" : "var(--runit-muted)", fontWeight: isActive ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── AD LIST ── */}
        {tab === "list" && (
          <div>
            {loading && <Spinner />}
            {!loading && ads.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--runit-muted)" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📢</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No launch ad set</div>
                <div style={{ fontSize: 13 }}>Create one and it will show when users open the app</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ads.map(function(ad) {
                var isActive = parseInt(ad.is_active);
                return (
                  <div key={ad.id} style={{ background: "var(--runit-surface)", border: "1px solid " + (isActive ? "rgba(0,201,167,0.25)" : "var(--runit-border)"), borderRadius: 18, overflow: "hidden", opacity: isActive ? 1 : 0.55 }}>

                    {/* Image preview */}
                    {ad.type === "image" && ad.url && (
                      <img src={ad.url} alt="ad" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                    )}

                    {/* Text preview */}
                    {ad.type === "text" && (
                      <div style={{ background: ad.bg_color || "#111", padding: "24px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: ad.text_color || "#fff", lineHeight: 1.4 }}>{ad.content}</div>
                      </div>
                    )}

                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                            {isActive
                              ? <span style={{ color: "var(--runit-accent)" }}>● Active</span>
                              : <span style={{ color: "var(--runit-muted)" }}>Inactive</span>}
                          </div>
                          {ad.caption && <div style={{ fontSize: 12, color: "var(--runit-muted)", lineHeight: 1.5 }}>{ad.caption}</div>}
                          {ad.cta_text && <div style={{ fontSize: 11, color: "var(--runit-accent)", marginTop: 4 }}>CTA: {ad.cta_text}</div>}
                        </div>
                        <button onClick={function() { deleteAd(ad.id); }}
                          style={{ padding: "7px 12px", borderRadius: 50, background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff8080", fontSize: 11, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                          Delete
                        </button>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--runit-muted)" }}>
                        {"Created " + new Date(ad.created_at).toLocaleDateString("en-GH")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── NEW AD ── */}
        {tab === "new" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {activeAd && (
              <div style={{ background: "rgba(255,180,0,0.07)", border: "1px solid rgba(255,180,0,0.25)", borderRadius: 12, padding: "11px 14px", fontSize: 12, color: "#ffb400" }}>
                ⚠ Saving a new ad will replace the current active one
              </div>
            )}

            {/* Type */}
            <div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 10, fontWeight: 600 }}>Ad type</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["image","text"].map(function(t) {
                  var icons = { image: "🖼", text: "✏️" };
                  var sel   = type === t;
                  return (
                    <button key={t} onClick={function() { setType(t); setFile(null); setPreview(null); }}
                      style={{ flex: 1, padding: "14px 8px", borderRadius: 14, border: "1px solid", borderColor: sel ? "var(--runit-accent)" : "var(--runit-border)", background: sel ? "rgba(0,201,167,0.1)" : "var(--runit-elevated)", color: sel ? "var(--runit-accent)" : "var(--runit-muted)", fontSize: 13, fontWeight: sel ? 700 : 400, cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 26 }}>{icons[t]}</span>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image upload */}
            {type === "image" && (
              <div>
                <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 8, fontWeight: 600 }}>Upload image (max 10MB)</div>
                <label style={{ display: "block", border: "2px dashed var(--runit-border)", borderRadius: 16, overflow: "hidden", cursor: "pointer", background: "var(--runit-elevated)", minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {preview
                    ? <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }} />
                    : <div style={{ textAlign: "center", padding: 24 }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🖼</div>
                        <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>Tap to choose image</div>
                      </div>
                  }
                  <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
                </label>
              </div>
            )}

            {/* Text content */}
            {type === "text" && (
              <div>
                <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 8, fontWeight: 600 }}>Headline text *</div>
                <textarea rows={3} value={textContent} onChange={function(e) { setTextContent(e.target.value); }} placeholder="e.g. It's not too late to double your impact!"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 15, outline: "none", resize: "vertical", fontFamily: "inherit" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 6 }}>Background</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {COLORS.map(function(c) {
                        return <div key={c} onClick={function() { setBgColor(c); }} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: bgColor === c ? "3px solid var(--runit-accent)" : "3px solid transparent", boxSizing: "border-box" }} />;
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 6 }}>Text color</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {["#ffffff","#000000","#00c9a7","#ffb400","#ff8080"].map(function(c) {
                        return <div key={c} onClick={function() { setTextColor(c); }} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: textColor === c ? "3px solid var(--runit-accent)" : "3px solid #444", boxSizing: "border-box" }} />;
                      })}
                    </div>
                  </div>
                </div>

                {textContent && (
                  <div style={{ marginTop: 12, borderRadius: 14, padding: "20px 16px", background: bgColor, textAlign: "center" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: textColor, lineHeight: 1.4 }}>{textContent}</div>
                  </div>
                )}
              </div>
            )}

            {/* Caption / body text */}
            <div>
              <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 8, fontWeight: 600 }}>Body text *</div>
              <textarea rows={3} value={caption} onChange={function(e) { setCaption(e.target.value); }} placeholder="e.g. A generous donor just added a $150,000 match this month. When you give GH₵25 it doubles!"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
            </div>

            {/* CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--runit-muted)", fontWeight: 600 }}>Call to action (optional)</div>
              <input type="text" value={ctaText} onChange={function(e) { setCtaText(e.target.value); }} placeholder="Button text — e.g. Give Now, Order Now, Learn More"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
              <input type="text" value={ctaUrl} onChange={function(e) { setCtaUrl(e.target.value); }} placeholder="Link URL — e.g. https://... or /orders"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            </div>

            {/* Live preview */}
            {(caption || (type === "text" && textContent)) && (
              <div>
                <div style={{ fontSize: 12, color: "var(--runit-muted)", marginBottom: 8, fontWeight: 600 }}>Preview</div>
                <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--runit-border)" }}>
                  {type === "image" && preview && (
                    <img src={preview} alt="preview" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                  )}
                  {type === "text" && textContent && (
                    <div style={{ background: bgColor, padding: "28px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: textColor, lineHeight: 1.4 }}>{textContent}</div>
                    </div>
                  )}
                  <div style={{ background: "#fff", padding: "20px 20px 24px", textAlign: "center" }}>
                    {caption && <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: ctaText ? 20 : 0 }}>{caption}</div>}
                    {ctaText && (
                      <div style={{ padding: "14px", borderRadius: 50, background: "#111", color: "#fff", fontWeight: 700, fontSize: 15 }}>{ctaText}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button onClick={postAd} disabled={posting}
              style={{ width: "100%", padding: "14px", borderRadius: 50, background: "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 15, border: "none", cursor: posting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {posting ? "Saving..." : "Save & Activate Ad"}
            </button>

          </div>
        )}

      </div>
      <BottomPillNav />
    </div>
  );
}