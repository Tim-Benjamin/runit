// src/components/Toast.jsx
import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]); // eslint-disable-line

  if (!visible || !message) return null;

  const colors = {
    success: { bg: 'rgba(0,201,167,0.12)', border: 'var(--runit-border-strong)', color: 'var(--runit-accent)' },
    error:   { bg: 'rgba(255,80,80,0.12)',  border: 'rgba(255,80,80,0.3)',        color: '#ff8080' },
    warning: { bg: 'rgba(255,180,0,0.1)',   border: 'rgba(255,180,0,0.3)',        color: '#ffb400' },
  };

  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed', bottom: 100, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 300,
      background: c.bg,
      border: '1px solid ' + c.border,
      borderRadius: 50, padding: '12px 24px',
      fontSize: 13, fontWeight: 600,
      color: c.color, whiteSpace: 'nowrap',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(12px)',
      animation: 'slideUp 0.3s ease forwards',
      maxWidth: 'calc(100vw - 48px)',
      textAlign: 'center',
    }}>
      {type === 'success' && '✓ '}
      {type === 'error'   && '✕ '}
      {type === 'warning' && '⚠ '}
      {message}
    </div>
  );
}