import API_BASE from '../api/config';
import { useState, useEffect, useRef, useCallback } from "react";
import MapView from "./MapView";

export default function LocationSearch({
  label,
  hint,
  value,
  onPick,
  onClear,
  showMap,
  placeholder,
  required,
}) {
  var [query, setQuery]         = useState("");
  var [results, setResults]     = useState([]);
  var [searching, setSearching] = useState(false);
  var [showResults, setShowResults] = useState(false);
  var [gpsLoading, setGpsLoading]   = useState(false);
  var [gpsError, setGpsError]       = useState("");
  var debounceRef                   = useRef(null);
  var wrapperRef                    = useRef(null);

  // Close dropdown on outside click
  useEffect(function() {
    var handler = function(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return function() { document.removeEventListener("mousedown", handler); };
  }, []);

  var search = useCallback(async function(q) {
    if (!q || q.length < 3) { setResults([]); setShowResults(false); return; }
    setSearching(true);
    try {
      var url = "https://nominatim.openstreetmap.org/search"
        + "?q=" + encodeURIComponent(q)
        + "&format=json"
        + "&limit=6"
        + "&countrycodes=gh"
        + "&addressdetails=1";
      var res  = await fetch(url, { headers: { "Accept-Language": "en", "User-Agent": "RunIt-App" } });
      var data = await res.json();
      setResults(data || []);
      setShowResults(true);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }, []);

  var handleInput = function(e) {
    var val = e.target.value;
    setQuery(val);
    if (value) { onClear && onClear(); }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(function() { search(val); }, 500);
  };

  var handleSelect = function(item) {
    var lat  = parseFloat(item.lat);
    var lng  = parseFloat(item.lon);
    var addr = item.display_name;
    // Shorten very long addresses
    var parts = addr.split(",");
    var short = parts.slice(0, 3).join(",").trim();
    onPick({ lat: lat, lng: lng, address: short, fullAddress: addr });
    setQuery(short);
    setResults([]);
    setShowResults(false);
  };

  var useGPS = function() {
    setGpsLoading(true);
    setGpsError("");
    if (!navigator.geolocation) {
      setGpsError("GPS not supported");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async function(pos) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        // Reverse geocode to get address
        try {
          var res  = await fetch(
            "https://nominatim.openstreetmap.org/reverse?lat=" + lat + "&lon=" + lng + "&format=json",
            { headers: { "Accept-Language": "en", "User-Agent": "RunIt-App" } }
          );
          var data = await res.json();
          var addr = data.display_name || ("GPS: " + lat.toFixed(5) + ", " + lng.toFixed(5));
          var parts = addr.split(",");
          var short = parts.slice(0, 3).join(",").trim();
          onPick({ lat: lat, lng: lng, address: short, fullAddress: addr });
          setQuery(short);
        } catch {
          onPick({ lat: lat, lng: lng, address: "GPS: " + lat.toFixed(5) + ", " + lng.toFixed(5) });
          setQuery("GPS: " + lat.toFixed(5) + ", " + lng.toFixed(5));
        }
        setGpsLoading(false);
      },
      function() {
        setGpsError("Location denied");
        setGpsLoading(false);
      }
    );
  };

  var clear = function() {
    setQuery("");
    setResults([]);
    setShowResults(false);
    onClear && onClear();
  };

  return (
    <div ref={wrapperRef} style={{ marginBottom: 14 }}>

      {label && (
        <label style={{ fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
          {label}{required ? " *" : ""}
        </label>
      )}

      {hint && (
        <div style={{ fontSize: 11, color: "var(--runit-muted)", marginBottom: 6, lineHeight: 1.4 }}>{hint}</div>
      )}

      <div style={{ display: "flex", gap: 8 }}>

        {/* Search input */}
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", background: "var(--runit-elevated)", border: "1px solid " + (value ? "rgba(0,201,167,0.35)" : "var(--runit-border)"), borderRadius: 12, overflow: "visible", transition: "border-color 0.2s" }}>
            <span style={{ paddingLeft: 12, fontSize: 16, flexShrink: 0 }}>{value ? "📍" : "🔍"}</span>
            <input
              type="text"
              value={query}
              onChange={handleInput}
              onFocus={function() { if (results.length > 0) setShowResults(true); }}
              placeholder={placeholder || "Search for a location..."}
              style={{ flex: 1, padding: "11px 10px", background: "transparent", border: "none", outline: "none", color: "var(--runit-text)", fontSize: 13, fontFamily: "inherit" }}
            />
            {(query || value) && (
              <button type="button" onClick={clear} style={{ padding: "0 12px", background: "none", border: "none", color: "var(--runit-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>
                ×
              </button>
            )}
            {searching && (
              <div style={{ paddingRight: 12 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,201,167,0.2)", borderTopColor: "var(--runit-accent)", animation: "spin 0.6s linear infinite" }} />
              </div>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showResults && results.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", borderRadius: 12, overflow: "hidden", zIndex: 500, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", maxHeight: 280, overflowY: "auto" }}>
              {results.map(function(item, i) {
                var parts = item.display_name.split(",");
                var main  = parts[0].trim();
                var sub   = parts.slice(1, 4).join(",").trim();
                return (
                  <div
                    key={item.place_id || i}
                    onClick={function() { handleSelect(item); }}
                    style={{ padding: "12px 14px", cursor: "pointer", borderBottom: i < results.length - 1 ? "1px solid var(--runit-border)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(0,201,167,0.07)"; }}
                    onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--runit-text)", marginBottom: 2 }}>{main}</div>
                    {sub && <div style={{ fontSize: 11, color: "var(--runit-muted)", lineHeight: 1.3 }}>{sub}</div>}
                  </div>
                );
              })}
              <div style={{ padding: "8px 14px", background: "var(--runit-surface)", borderTop: "1px solid var(--runit-border)" }}>
                <span style={{ fontSize: 10, color: "var(--runit-muted)" }}>© OpenStreetMap contributors</span>
              </div>
            </div>
          )}

          {showResults && results.length === 0 && query.length >= 3 && !searching && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--runit-elevated)", border: "1px solid var(--runit-border)", borderRadius: 12, padding: "14px", zIndex: 500, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "var(--runit-muted)" }}>No results found. Try a different search.</div>
            </div>
          )}
        </div>

        {/* GPS button */}
        <button
          type="button"
          onClick={useGPS}
          disabled={gpsLoading}
          title="Use my current GPS location"
          style={{ padding: "0 14px", borderRadius: 12, background: "rgba(0,201,167,0.1)", border: "1px solid var(--runit-border)", color: "var(--runit-accent)", fontSize: 12, fontWeight: 600, cursor: gpsLoading ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}
        >
          {gpsLoading ? (
            <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,201,167,0.2)", borderTopColor: "var(--runit-accent)", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
          ) : "📡"}
          {gpsLoading ? "" : " GPS"}
        </button>
      </div>

      {gpsError && (
        <div style={{ fontSize: 11, color: "#ff8080", marginTop: 4 }}>{gpsError}</div>
      )}

      {/* Map preview */}
      {showMap && value && value.lat && value.lng && (
        <div style={{ marginTop: 10, borderRadius: 14, overflow: "hidden" }}>
          <MapView lat={Number(value.lat)} lng={Number(value.lng)} height={180} label={label} />
        </div>
      )}
    </div>
  );
}