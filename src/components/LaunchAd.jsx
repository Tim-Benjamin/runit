import { useState, useEffect } from "react";

const BASE   = import.meta.env.VITE_API_BASE;
const AD_KEY = "runit_ad_session";

export default function LaunchAd() {
  var [ad, setAd]         = useState(null);
  var [visible, setVisible] = useState(false);

  useEffect(function() {
    var shown = sessionStorage.getItem(AD_KEY);
    if (shown) return;
    fetch(BASE + '/api/ads/launch.php')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.ad) {
          setAd(d.ad);
          setVisible(true);
          sessionStorage.setItem(AD_KEY, "1");
        }
      })
      .catch(function() {});
  }, []);

  if (!visible || !ad) return null;

  var close = function() { setVisible(false); };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{ position: "fixed", inset: 0, zIndex: 99998, background: "rgba(0,0,0,0.75)" }}
      />

      {/* Centered card */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 99999,
        width: "calc(100% - 40px)",
        maxWidth: 420,
        background: "#fff",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        maxHeight: "85vh",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Top bar — Dismiss + close */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px 0", flexShrink: 0 }}>
          <button onClick={close}
            style={{ background: "none", border: "none", fontSize: 13, color: "#999", cursor: "pointer", fontFamily: "inherit", padding: "4px 0" }}>
            Dismiss
          </button>
          <button onClick={close}
            style={{ background: "rgba(0,0,0,0.08)", border: "none", width: 30, height: 30, borderRadius: "50%", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "inherit" }}>
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1 }}>

          {/* Image */}
          {ad.type === "image" && ad.url && (
            <img
              src={ad.url}
              alt={ad.caption || "ad"}
              style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 260 }}
            />
          )}

          {/* Text headline */}
          {ad.type === "text" && ad.content && (
            <div style={{ background: ad.bg_color || "#111", padding: "32px 24px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: ad.text_color || "#fff", lineHeight: 1.35 }}>
                {ad.content}
              </div>
            </div>
          )}

          {/* Caption + CTA */}
          <div style={{ padding: "20px 22px 28px", textAlign: "center" }}>
            {ad.caption && (
              <div style={{ fontSize: 15, color: "#444", lineHeight: 1.65, marginBottom: ad.cta_text ? 22 : 0 }}>
                {ad.caption}
              </div>
            )}
            {ad.cta_text && (
              <a
                href={ad.cta_url || "#"}
                onClick={close}
                style={{ display: "block", padding: "15px", borderRadius: 50, background: "#111", color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none", textAlign: "center" }}>
                {ad.cta_text}
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}