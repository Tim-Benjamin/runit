import { Capacitor } from "@capacitor/core";

var _isNative = Capacitor.isNativePlatform();

export async function getCurrentPosition() {
  if (_isNative) {
    var { Geolocation } = await import("@capacitor/geolocation");

    // Check current status
    var status = await Geolocation.checkPermissions();
    console.log("[Location] Permission status:", status.location);

    if (status.location === "denied") {
      throw new Error(
        "Location permission denied. Go to Settings → Apps → RunIt → Permissions → Location and enable it."
      );
    }

    // Request if not granted
    if (status.location !== "granted") {
      var result = await Geolocation.requestPermissions({ permissions: ["location"] });
      if (result.location !== "granted") {
        throw new Error("Location permission is required to place orders.");
      }
    }

    // Now get position — retry up to 3 times
    var attempts = 0;
    while (attempts < 3) {
      try {
        var pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });
        return { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch(e) {
        attempts++;
        if (attempts >= 3) throw new Error("Could not get location. Please check GPS is on.");
        await new Promise(function(r) { setTimeout(r, 1000); });
      }
    }

  } else {
    return new Promise(function(resolve, reject) {
      if (!navigator.geolocation) {
        reject(new Error("GPS not supported by your browser")); return;
      }
      navigator.geolocation.getCurrentPosition(
        function(pos) { resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        function(err) {
          var msg = "Location access denied.";
          if (err.code === 1) msg = "Location denied. Please allow it in browser settings.";
          if (err.code === 2) msg = "Location unavailable. Please check GPS is on.";
          if (err.code === 3) msg = "Location timed out. Please try again.";
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }
}

export function watchPosition(callback, onError) {
  if (_isNative) {
    var watchId = null;
    import("@capacitor/geolocation").then(function(mod) {
      mod.Geolocation.watchPosition(
        { enableHighAccuracy: true },
        function(pos, err) {
          if (err) { if (onError) onError(err.message); return; }
          callback({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      ).then(function(id) { watchId = id; });
    });
    return function() {
      if (watchId !== null) {
        import("@capacitor/geolocation").then(function(mod) {
          mod.Geolocation.clearWatch({ id: watchId });
        });
      }
    };
  } else {
    var id = navigator.geolocation.watchPosition(
      function(pos) { callback({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
      function(err) { if (onError) onError(err.message); },
      { enableHighAccuracy: true }
    );
    return function() { navigator.geolocation.clearWatch(id); };
  }
}