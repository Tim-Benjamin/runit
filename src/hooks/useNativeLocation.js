import { Capacitor } from "@capacitor/core";

var isNative = Capacitor.isNativePlatform();

export async function getCurrentPosition() {
  if (isNative) {
    var { Geolocation } = await import("@capacitor/geolocation");
    try {
      var perm = await Geolocation.requestPermissions();
      if (perm.location !== "granted") throw new Error("Location permission denied");
      var pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch(e) {
      throw new Error(e.message || "Location failed");
    }
  } else {
    return new Promise(function(resolve, reject) {
      if (!navigator.geolocation) { reject(new Error("GPS not supported")); return; }
      navigator.geolocation.getCurrentPosition(
        function(pos) { resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        function(err) { reject(new Error(err.message)); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }
}

export function watchPosition(callback) {
  if (isNative) {
    var watchId = null;
    import("@capacitor/geolocation").then(function(mod) {
      mod.Geolocation.watchPosition({ enableHighAccuracy: true }, function(pos, err) {
        if (err) { console.error("[Location] Watch error:", err); return; }
        callback({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }).then(function(id) { watchId = id; });
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
      function(err) { console.error("[Location] Watch error:", err); },
      { enableHighAccuracy: true }
    );
    return function() { navigator.geolocation.clearWatch(id); };
  }
}