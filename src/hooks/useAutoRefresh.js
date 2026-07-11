// src/hooks/useAutoRefresh.js
import { useEffect, useRef } from 'react';

export default function useAutoRefresh(callback, intervalMs = 8000, enabled = true) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const tick = () => callbackRef.current();
    tick(); // immediate call
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}