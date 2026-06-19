// src/components/MapView.jsx
import { useEffect, useRef } from 'react';

export default function MapView({ lat, lng, height = 220, label = 'Delivery location' }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;

    // Dynamically load Leaflet CSS if not already loaded
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Dynamically load Leaflet JS if not already loaded
    const initMap = () => {
      if (!window.L || !ref.current) return;
      const L = window.L;

      if (mapRef.current) {
        // Map already initialised — just move the marker
        mapRef.current.setView([lat, lng], 16);
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        return;
      }

      // Initialise fresh map
      mapRef.current = L.map(ref.current, { zoomControl: false }).setView([lat, lng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Custom teal marker
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:#00c9a7;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      markerRef.current = L.marker([lat, lng], { icon })
        .addTo(mapRef.current)
        .bindPopup(label);
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      // Don't destroy map on re-render — just let it update
    };
  }, [lat, lng, label]);

  if (!lat || !lng) {
    return (
      <div style={{
        height, borderRadius: 16,
        background: 'var(--runit-elevated)',
        border: '1px solid var(--runit-border)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 8,
      }}>
        <span style={{ fontSize: 28 }}>🗺️</span>
        <span style={{ fontSize: 13, color: 'var(--runit-muted)' }}>No location data</span>
      </div>
    );
  }

  return (
    <div style={{
      height, borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--runit-border)',
      position: 'relative',
    }}>
      <div ref={ref} style={{ height: '100%', width: '100%' }} />
      {/* Open in Google Maps overlay button */}
      
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank" rel="noreferrer"
        style={{
          position: 'absolute', bottom: 10, right: 10, zIndex: 999,
          background: 'rgba(15,46,41,0.85)',
          border: '1px solid var(--runit-border)',
          borderRadius: 50, padding: '6px 14px',
          color: 'var(--runit-accent)', fontSize: 12, fontWeight: 600,
          backdropFilter: 'blur(8px)',
        }}
      <a>
        📍 Open Maps
      </a>
    </div>
  );
}
