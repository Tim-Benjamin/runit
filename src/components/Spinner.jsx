// src/components/Spinner.jsx
export default function Spinner({ size = 40, color = 'var(--runit-accent)' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '60px 0',
    }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `3px solid rgba(0,201,167,0.15)`,
        borderTopColor: color,
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}