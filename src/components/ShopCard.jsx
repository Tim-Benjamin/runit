// src/components/ShopCard.jsx
import { useNavigate } from 'react-router-dom';

const CAT_EMOJI = {
  Food:      '🍔',
  Groceries: '🛒',
  Printing:  '🖨️',
  Pharmacy:  '💊',
  Other:     '📦',
};

export default function ShopCard({ shop }) {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'var(--runit-surface)',
      border: '1px solid var(--runit-border)',
      borderRadius: 20, padding: 18,
      transition: 'border-color 0.2s, transform 0.15s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--runit-border-strong)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--runit-border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

        {/* Emoji icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'var(--runit-elevated)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 26, flexShrink: 0,
        }}>
          {shop.emoji || CAT_EMOJI[shop.category] || '🏪'}
        </div>

        <div style={{ flex: 1 }}>

          {/* Name + category badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--runit-text)' }}>
              {shop.name}
            </div>
            <span style={{
              background: 'rgba(0,201,167,0.08)',
              border: '1px solid var(--runit-border)',
              borderRadius: 50, padding: '2px 10px',
              fontSize: 10, color: 'var(--runit-accent)',
              whiteSpace: 'nowrap', marginLeft: 8,
            }}>{shop.category}</span>
          </div>

          <div style={{ fontSize: 12, color: 'var(--runit-muted)', marginBottom: 2 }}>
            📍 {shop.location_description || shop.location}
          </div>

          {shop.hours && (
            <div style={{ fontSize: 12, color: 'var(--runit-muted)', marginBottom: 10 }}>
              🕐 {shop.hours}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={() => navigate('/place-order?description=Order from ' + encodeURIComponent(shop.name))}
              style={{
                flex: 1, padding: '9px', borderRadius: 50,
                background: 'var(--runit-accent)', color: '#0a1f1c',
                fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
              }}
            >
              Order via Runner
            </button>
            
              href={'tel:' + shop.phone}
              style={{
                padding: '9px 16px', borderRadius: 50,
                background: 'transparent',
                border: '1px solid var(--runit-border)',
                color: 'var(--runit-muted)', fontSize: 12, fontWeight: 500,
              }}
            <a>
              📞 Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}