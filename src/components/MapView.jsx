import { useEffect, useRef, useState } from "react";

function buildMapsUrl(lat, lng) {
  return "https://www.google.com/maps?q=" + lat + "," + lng;
}

export default function MapView({ lat, lng, height, label }) {
  var h        = height || 220;
  var mapRef   = useRef(null);
  var mapInst  = useRef(null);
  var markerRef = useRef(null);
  var [ready, setReady] = useState(false);
  var [err, setErr]     = useState(false);

  // Validate coords first — never try to render with bad data
  var validLat = lat !== null && lat !== undefined && !isNaN(parseFloat(lat));
  var validLng = lng !== null && lng !== undefined && !isNaN(parseFloat(lng));
  var valid    = validLat && validLng;

  useEffect(function() {
    if (!valid) return;

    var destroyed = false;

    function initMap(L) {
      if (destroyed || !mapRef.current) return;
      try {
        if (mapInst.current) {
          // Map already exists — just update view
          mapInst.current.setView([parseFloat(lat), parseFloat(lng)], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([parseFloat(lat), parseFloat(lng)]);
          }
          return;
        }

        var map = L.map(mapRef.current, {
          zoomControl:       false,
          attributionControl: false,
          dragging:          true,
          scrollWheelZoom:   false,
        }).setView([parseFloat(lat), parseFloat(lng)], 16);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

        var icon = L.divIcon({
          className: "",
          html: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#00c9a7;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>',
          iconSize:   [28, 28],
          iconAnchor: [14, 28],
        });

        markerRef.current = L.marker([parseFloat(lat), parseFloat(lng)], { icon: icon }).addTo(map);
        if (label) markerRef.current.bindPopup(label);

        mapInst.current = map;
        if (!destroyed) setReady(true);
      } catch (e) {
        if (!destroyed) setErr(true);
      }
    }

    // Load Leaflet CSS once
    if (!document.getElementById("leaflet-css")) {
      var link  = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (window.L) {
      initMap(window.L);
    } else if (!document.getElementById("leaflet-js")) {
      var script    = document.createElement("script");
      script.id     = "leaflet-js";
      script.src    = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = function() { if (!destroyed) initMap(window.L); };
      script.onerror = function() { if (!destroyed) setErr(true); };
      document.head.appendChild(script);
    } else {
      // Script tag exists but may still be loading
      var waited = 0;
      var poll = setInterval(function() {
        waited += 100;
        if (window.L) { clearInterval(poll); initMap(window.L); }
        if (waited > 5000) { clearInterval(poll); if (!destroyed) setErr(true); }
      }, 100);
    }

    return function() {
      destroyed = true;
      // Do NOT destroy the map instance — just mark destroyed
      // so re-renders just update position instead of recreating
    };
  }, [valid, lat, lng, label]);

  // Update marker position when lat/lng changes without remounting
  useEffect(function() {
    if (!valid || !mapInst.current || !markerRef.current) return;
    try {
      var latlng = [parseFloat(lat), parseFloat(lng)];
      markerRef.current.setLatLng(latlng);
      mapInst.current.setView(latlng, 16);
    } catch (e) {}
  }, [lat, lng, valid]);

  if (!valid) {
    return (
      <div style={{ height: h, borderRadius: 14, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ fontSize: 28 }}>🗺️</span>
        <span style={{ fontSize: 13, color: "var(--runit-muted)" }}>No location data</span>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ height: h, borderRadius: 14, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ fontSize: 28 }}>🗺️</span>
        <a href={buildMapsUrl(lat, lng)} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--runit-accent)", fontWeight: 600 }}>Open in Google Maps</a>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: h, borderRadius: 14, overflow: "hidden", border: "1px solid var(--runit-border)" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />

      {!ready && (
        <div style={{ position: "absolute", inset: 0, background: "var(--runit-elevated)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid rgba(0,201,167,0.2)", borderTopColor: "var(--runit-accent)", animation: "spin 0.7s linear infinite", margin: "0 auto 8px" }} />
            <div style={{ fontSize: 12, color: "var(--runit-muted)" }}>Loading map...</div>
          </div>
        </div>
      )}

      <a
        href={buildMapsUrl(lat, lng)}
        target="_blank"
        rel="noreferrer"
        style={{ position: "absolute", bottom: 10, right: 10, zIndex: 999, background: "rgba(15,46,41,0.9)", border: "1px solid var(--runit-border)", borderRadius: 50, padding: "5px 12px", color: "var(--runit-accent)", fontSize: 11, fontWeight: 600, backdropFilter: "blur(8px)", textDecoration: "none" }}
      >
        📍 Open Maps
      </a>
    </div>
  );
}