import API_BASE from '../../api/config';
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PillNavbar from "../../components/PillNavbar";
import LocationSearch from "../../components/LocationSearch";

const CATEGORIES = [
  { label: "Food & Drinks", min: 5,  icon: "🍔", desc: "Order food or drinks delivered to you" },
  { label: "Errands",       min: 8,  icon: "🛵", desc: "Send a runner to do an errand for you" },
  { label: "Shopping",      min: 10, icon: "🛍️", desc: "Get items bought and delivered" },
  { label: "Pickup & Drop", min: 15, icon: "📦", desc: "Runner picks up and delivers your item" },
  { label: "Gas Refill",    min: 20, icon: "🔥", desc: "Runner picks up, fills and returns your cylinder" },
  { label: "Custom",        min: 5,  icon: "✨", desc: "Any other request" },
];

const CYLINDER_SIZES = [
  { value: "small",  label: "Small",  desc: "3-6 kg" },
  { value: "medium", label: "Medium", desc: "12-14 kg" },
  { value: "large",  label: "Large",  desc: "25+ kg" },
];

export default function PlaceOrder() {
  var navigate       = useNavigate();
  var [searchParams] = useSearchParams();

  var defaultCat = CATEGORIES.find(function(c) { return c.label === searchParams.get("category"); }) || CATEGORIES[0];

  var [category, setCategory]           = useState(defaultCat.label);
  var [description, setDescription]     = useState(searchParams.get("description") || "");
  var [notes, setNotes]                 = useState("");
  var [fee, setFee]                     = useState(defaultCat.min);
  var [feeError, setFeeError]           = useState("");
  var [cylinderSize, setCylinderSize]   = useState("");
  var [pickupPhone, setPickupPhone]     = useState("");

  // Locations
  var [myLoc, setMyLoc]                       = useState(null);  // user's GPS location (always captured)
  var [deliveryLoc, setDeliveryLoc]           = useState(null);  // where to deliver (my loc or custom)
  var [useCustomDelivery, setUseCustomDelivery] = useState(false);
  var [pickupLoc, setPickupLoc]               = useState(null);  // Pickup & Drop source
  var [locating, setLocating]                 = useState(false);
  var [locError, setLocError]                 = useState("");

  var [submitting, setSubmitting] = useState(false);
  var [error, setError]           = useState("");

  var currentCat = CATEGORIES.find(function(c) { return c.label === category; }) || CATEGORIES[0];

  useEffect(function() {
    setFee(currentCat.min);
    setFeeError("");
  }, [category, currentCat.min]);

  // Auto-capture GPS on mount
  useEffect(function() {
    captureGPS();
  }, []); // eslint-disable-line

  var captureGPS = function() {
    setLocating(true);
    setLocError("");
    if (!navigator.geolocation) { setLocError("GPS not supported by your browser"); setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      async function(pos) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        // Reverse geocode for a readable address
        var address = "Your current location";
        try {
          var res  = await fetch("https://nominatim.openstreetmap.org/reverse?lat=" + lat + "&lon=" + lng + "&format=json", { headers: { "Accept-Language": "en", "User-Agent": "RunIt-App" } });
          var data = await res.json();
          if (data.display_name) {
            var parts = data.display_name.split(",");
            address = parts.slice(0, 3).join(",").trim();
          }
        } catch {}
        var loc = { lat: lat, lng: lng, address: address };
        setMyLoc(loc);
        setDeliveryLoc(loc);
        setLocating(false);
      },
      function() { setLocError("Location access denied. Please allow location access."); setLocating(false); }
    );
  };

  var handleFeeChange = function(val) {
    setFee(val);
    var parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < currentCat.min) {
      setFeeError("Minimum fee for " + category + " is GH\u20B5 " + currentCat.min);
    } else {
      setFeeError("");
    }
  };

  var handleDeliveryToggle = function(useCustom) {
    setUseCustomDelivery(useCustom);
    if (!useCustom) {
      setDeliveryLoc(myLoc);
    } else {
      setDeliveryLoc(null);
    }
  };

  var finalDeliveryLoc = useCustomDelivery ? deliveryLoc : myLoc;

  var handleSubmit = async function(e) {
    e.preventDefault();
    setError("");

    if (!myLoc) { setError("Your GPS location is required. Please allow location access."); return; }
    if (useCustomDelivery && !deliveryLoc) { setError("Please set or search for the drop-off location."); return; }

    var parsedFee = parseFloat(fee);
    if (isNaN(parsedFee) || parsedFee < currentCat.min) {
      setError("Delivery fee must be at least GH\u20B5 " + currentCat.min);
      return;
    }

    var isPickupDrop = category === "Pickup & Drop";
    var isGasRefill  = category === "Gas Refill";

    if (isPickupDrop && !pickupLoc) { setError("Please set or search for the pickup location."); return; }
    if (isGasRefill && !cylinderSize) { setError("Please select your cylinder size."); return; }
    if (!description.trim() && !isGasRefill) { setError("Please describe what you need."); return; }

    var finalDescription = description.trim();
    if (isGasRefill && !finalDescription) {
      finalDescription = "Gas cylinder refill - " + (cylinderSize ? cylinderSize.charAt(0).toUpperCase() + cylinderSize.slice(1) : "") + " cylinder";
    }

    var dest = finalDeliveryLoc || myLoc;

    setSubmitting(true);
    try {
      var token = localStorage.getItem("runit_token");
      var body = {
        description:     finalDescription,
        category:        category,
        notes:           notes || null,
        proposed_fee:    parsedFee,
        delivery_lat:    dest.lat,
        delivery_lng:    dest.lng,
        pickup_lat:      pickupLoc ? pickupLoc.lat  : null,
        pickup_lng:      pickupLoc ? pickupLoc.lng  : null,
        pickup_address:  pickupLoc ? pickupLoc.address : null,
        dropoff_address: useCustomDelivery && deliveryLoc ? deliveryLoc.address : null,
        pickup_phone:    pickupPhone || null,
        cylinder_size:   cylinderSize || null,
      };
      var res  = await fetch("${API_BASE}/api/orders/create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(body),
      });
      var data = await res.json();
      if (!res.ok) setError(data.error || "Failed to place order.");
      else navigate("/orders");
    } catch {
      setError("Cannot connect to server. Make sure XAMPP is running.");
    }
    setSubmitting(false);
  };

  var inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", color: "var(--runit-text)", border: "1px solid var(--runit-border)", fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" };
  var labelStyle = { fontSize: 12, color: "var(--runit-muted)", display: "block", marginBottom: 6, fontWeight: 500 };

  var isPickupDrop = category === "Pickup & Drop";
  var isGasRefill  = category === "Gas Refill";

  return (
    <div style={{ background: "var(--runit-bg)", minHeight: "100vh", color: "var(--runit-text)", paddingBottom: 40 }}>
      <PillNavbar title="Place Order" subtitle="What do you need?" />

      <div className="page-content" style={{ maxWidth: 520, margin: "0 auto" }}>

        {error && (
          <div style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#ff8080", fontSize: 13 }}>
            {"⚠ " + error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── Category ── */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>What type of order?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {CATEGORIES.map(function(cat) {
                var active = category === cat.label;
                return (
                  <button key={cat.label} type="button" onClick={function() { setCategory(cat.label); }}
                    style={{ padding: "12px 10px", borderRadius: 14, border: "1px solid", borderColor: active ? "var(--runit-accent)" : "var(--runit-border)", background: active ? "rgba(0,201,167,0.1)" : "var(--runit-elevated)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: active ? "var(--runit-accent)" : "var(--runit-text)", marginBottom: 2 }}>{cat.label}</div>
                    <div style={{ fontSize: 10, color: "var(--runit-muted)", lineHeight: 1.3 }}>{cat.desc}</div>
                    <div style={{ fontSize: 10, color: active ? "var(--runit-accent)" : "var(--runit-muted)", marginTop: 4, fontWeight: 600 }}>{"min GH\u20B5 " + cat.min}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── GPS status bar ── */}
          <div style={{ padding: "11px 14px", borderRadius: 12, background: "var(--runit-elevated)", border: "1px solid " + (myLoc ? "rgba(0,201,167,0.3)" : "var(--runit-border)"), display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{myLoc ? "📡" : locating ? "⏳" : "⚠️"}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: myLoc ? "var(--runit-accent)" : "#ffb400" }}>
                  {myLoc ? "Your GPS location captured" : locating ? "Capturing your location..." : "GPS location required"}
                </div>
                {myLoc && <div style={{ fontSize: 10, color: "var(--runit-muted)", marginTop: 1 }}>{myLoc.address}</div>}
                {locError && <div style={{ fontSize: 10, color: "#ff8080", marginTop: 1 }}>{locError}</div>}
              </div>
            </div>
            {!myLoc && !locating && (
              <button type="button" onClick={captureGPS} style={{ padding: "6px 12px", borderRadius: 50, background: "rgba(255,180,0,0.12)", border: "1px solid rgba(255,180,0,0.3)", color: "#ffb400", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Retry
              </button>
            )}
          </div>

          {/* ── Delivery destination ── */}
          {!isGasRefill && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{isPickupDrop ? "Drop-off destination *" : "Deliver to *"}</label>

              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button type="button" onClick={function() { handleDeliveryToggle(false); }}
                  style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid", borderColor: !useCustomDelivery ? "var(--runit-accent)" : "var(--runit-border)", background: !useCustomDelivery ? "rgba(0,201,167,0.1)" : "var(--runit-elevated)", color: !useCustomDelivery ? "var(--runit-accent)" : "var(--runit-muted)", fontSize: 13, fontWeight: !useCustomDelivery ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                  📍 My location
                </button>
                <button type="button" onClick={function() { handleDeliveryToggle(true); }}
                  style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid", borderColor: useCustomDelivery ? "var(--runit-accent)" : "var(--runit-border)", background: useCustomDelivery ? "rgba(0,201,167,0.1)" : "var(--runit-elevated)", color: useCustomDelivery ? "var(--runit-accent)" : "var(--runit-muted)", fontSize: 13, fontWeight: useCustomDelivery ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                  🔍 Search location
                </button>
              </div>

              {!useCustomDelivery && myLoc && (
                <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.2)", fontSize: 13, color: "var(--runit-muted)" }}>
                  {"📍 " + myLoc.address}
                </div>
              )}

              {useCustomDelivery && (
                <LocationSearch
                  placeholder="Search for address, building, hostel, area..."
                  hint="Type at least 3 characters to see suggestions"
                  value={deliveryLoc}
                  onPick={setDeliveryLoc}
                  onClear={function() { setDeliveryLoc(null); }}
                  showMap={true}
                />
              )}
            </div>
          )}

          {/* ── Pickup & Drop specific ── */}
          {isPickupDrop && (
            <div style={{ background: "rgba(0,201,167,0.04)", border: "1px solid var(--runit-border)", borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--runit-accent)", marginBottom: 12 }}>📦 Pickup Details</div>

              <LocationSearch
                label="Pickup location (where runner collects)"
                placeholder="Search for pickup location..."
                hint="Where should the runner go to collect the item?"
                value={pickupLoc}
                onPick={setPickupLoc}
                onClear={function() { setPickupLoc(null); }}
                showMap={true}
                required={true}
              />

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Contact phone at pickup (optional)</label>
                <input type="tel" value={pickupPhone} onChange={function(e) { setPickupPhone(e.target.value); }}
                  placeholder="024XXXXXXX — runner calls when they arrive"
                  style={inputStyle}
                  onFocus={function(e) { e.target.style.borderColor = "var(--runit-accent)"; }}
                  onBlur={function(e) { e.target.style.borderColor = "var(--runit-border)"; }}
                />
              </div>
            </div>
          )}

          {/* ── Gas Refill specific ── */}
          {isGasRefill && (
            <div style={{ background: "rgba(255,150,50,0.05)", border: "1px solid rgba(255,150,50,0.2)", borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ff9632", marginBottom: 12 }}>🔥 Cylinder Size *</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                {CYLINDER_SIZES.map(function(sz) {
                  var active = cylinderSize === sz.value;
                  return (
                    <button key={sz.value} type="button" onClick={function() { setCylinderSize(sz.value); }}
                      style={{ padding: "12px 8px", borderRadius: 12, border: "1px solid", borderColor: active ? "#ff9632" : "var(--runit-border)", background: active ? "rgba(255,150,50,0.1)" : "var(--runit-elevated)", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>🔥</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: active ? "#ff9632" : "var(--runit-text)" }}>{sz.label}</div>
                      <div style={{ fontSize: 10, color: "var(--runit-muted)" }}>{sz.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ background: "rgba(255,150,50,0.08)", borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "var(--runit-muted)", lineHeight: 1.5 }}>
                🏍️ Runner comes to your GPS location, collects the cylinder, fills it at the nearest station, and returns it. Fee covers the trip — you pay for the gas separately.
              </div>
            </div>
          )}

          {/* ── Description ── */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              {isPickupDrop ? "What needs to be picked up? *" : isGasRefill ? "Extra instructions (optional)" : "What do you need? *"}
            </label>
            <textarea
              required={!isGasRefill}
              rows={3}
              placeholder={
                isPickupDrop ? "e.g. Pick up a package from my friend at Valco Hall Room 12." :
                isGasRefill  ? "e.g. The cylinder is at the entrance. Please handle carefully." :
                "e.g. Buy 2 meat pies and a Voltic water from the canteen near Senate Building"
              }
              value={description}
              onChange={function(e) { setDescription(e.target.value); }}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              onFocus={function(e) { e.target.style.borderColor = "var(--runit-accent)"; }}
              onBlur={function(e) { e.target.style.borderColor = "var(--runit-border)"; }}
            />
            {isGasRefill && <div style={{ fontSize: 10, color: "var(--runit-muted)", marginTop: 4 }}>Optional — only fill this if you have special instructions.</div>}
          </div>

          {/* ── Notes ── */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Extra notes (optional)</label>
            <textarea rows={2} placeholder="e.g. Call me when you arrive. Room 204." value={notes}
              onChange={function(e) { setNotes(e.target.value); }}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              onFocus={function(e) { e.target.style.borderColor = "var(--runit-accent)"; }}
              onBlur={function(e) { e.target.style.borderColor = "var(--runit-border)"; }}
            />
          </div>

          {/* ── Delivery fee ── */}
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>{"Delivery fee (GH\u20B5) * \u2014 min GH\u20B5 " + currentCat.min + " for " + category}</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--runit-muted)", fontSize: 13, fontWeight: 600 }}>GH₵</span>
              <input type="number" min={currentCat.min} step="0.5" value={fee}
                onChange={function(e) { handleFeeChange(e.target.value); }}
                style={{ ...inputStyle, paddingLeft: 50 }}
                onFocus={function(e) { e.target.style.borderColor = feeError ? "#ff8080" : "var(--runit-accent)"; }}
                onBlur={function(e) { e.target.style.borderColor = feeError ? "#ff8080" : "var(--runit-border)"; }}
              />
            </div>
            {feeError
              ? <div style={{ fontSize: 11, color: "#ff8080", marginTop: 4 }}>{"⚠ " + feeError}</div>
              : <div style={{ fontSize: 11, color: "var(--runit-muted)", marginTop: 4 }}>{"Increase to attract runners faster. Min GH\u20B5 " + currentCat.min + "."}</div>
            }
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[0, 2, 5, 10].map(function(extra) {
              var val    = currentCat.min + extra;
              var active = parseFloat(fee) === val;
              return (
                <button key={extra} type="button" onClick={function() { handleFeeChange(val); }}
                  style={{ padding: "6px 14px", borderRadius: 50, fontSize: 12, border: "1px solid", borderColor: active ? "var(--runit-accent)" : "var(--runit-border)", background: active ? "rgba(0,201,167,0.12)" : "transparent", color: active ? "var(--runit-accent)" : "var(--runit-muted)", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {extra === 0 ? "GH\u20B5 " + val : "+GH\u20B5 " + extra}
                </button>
              );
            })}
          </div>

          {/* ── Summary ── */}
          <div style={{ background: "var(--runit-surface)", border: "1px solid var(--runit-border)", borderRadius: 14, padding: "14px 16px", marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--runit-muted)", marginBottom: 10 }}>Order Summary</div>
            {[
              { label: "Type",      value: currentCat.icon + " " + category },
              !isGasRefill ? { label: "Deliver to", value: useCustomDelivery ? (deliveryLoc ? deliveryLoc.address : "Not set") : (myLoc ? myLoc.address : "Getting GPS...") } : null,
              isGasRefill  ? { label: "Your location", value: myLoc ? myLoc.address : "Getting GPS..." } : null,
              isPickupDrop ? { label: "Pickup",      value: pickupLoc ? pickupLoc.address : "Not set" } : null,
              isGasRefill  ? { label: "Cylinder",    value: cylinderSize ? cylinderSize.charAt(0).toUpperCase() + cylinderSize.slice(1) : "Not selected" } : null,
              { label: "Fee offering", value: "GH\u20B5 " + parseFloat(fee || 0).toFixed(2) },
            ].filter(Boolean).map(function(row) {
              return (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "var(--runit-muted)", flexShrink: 0, marginRight: 10 }}>{row.label}</span>
                  <span style={{ fontWeight: 600, textAlign: "right", color: "var(--runit-text)", fontSize: 11 }}>{row.value}</span>
                </div>
              );
            })}
            <div style={{ borderTop: "1px solid var(--runit-border)", paddingTop: 8, marginTop: 4, fontSize: 11, color: "var(--runit-muted)" }}>
              {"💵 Cash on delivery \u2014 pay your runner when they arrive"}
            </div>
          </div>

          <button type="submit" disabled={submitting || !myLoc || !!feeError}
            style={{ width: "100%", padding: "15px", borderRadius: 50, background: submitting || !myLoc || feeError ? "var(--runit-accent-dark)" : "var(--runit-accent)", color: "#0a1f1c", fontWeight: 700, fontSize: 16, border: "none", cursor: submitting || !myLoc || feeError ? "not-allowed" : "pointer", boxShadow: !myLoc || feeError ? "none" : "0 4px 24px rgba(0,201,167,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}
          >
            {submitting ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0a1f1c", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                Placing order...
              </span>
            ) : !myLoc ? "Waiting for GPS..." : feeError ? "Fix fee to continue" : "Place Order \u2192"}
          </button>

        </form>
      </div>
    </div>
  );
}