// src/components/EmptyState.jsx
export default function EmptyState({ icon = '📭', title, subtitle, action, actionLabel }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '56px 24px',
      animation: 'fadeIn 0.3s ease forwards',
    }}>
      <div style={{
        fontSize: 52, marginBottom: 16,
        filter: 'drop-shadow(0 4px 12px rgba(0,201,167,0.15))',
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: 17, fontWeight: 700,
        color: 'var(--runit-text)', marginBottom: 8,
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          fontSize: 13, color: 'var(--runit-muted)',
          lineHeight: 1.6, marginBottom: action ? 24 : 0,
          maxWidth: 280, margin: '0 auto',
        }}>
          {subtitle}
        </div>
      )}
      {action && (
        <button onClick={action} style={{
          marginTop: 20,
          padding: '12px 28px', borderRadius: 50,
          background: 'var(--runit-accent)', color: '#0a1f1c',
          fontWeight: 700, fontSize: 14, border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,201,167,0.25)',
        }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}