// src/pages/user/Shops.jsx
import API_BASE from '../../api/config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';

const FILTERS = ['All', 'Food', 'Groceries', 'Printing', 'Pharmacy', 'Other'];

const shops = [
  { id: 1, name: "Auntie Ama's Kitchen", category: 'Food', location: 'Near Main Gate', phone: '0241234567', emoji: '🍛', hours: 'Mon–Sat 7am–8pm' },
  { id: 2, name: 'Campus Prints', category: 'Printing', location: 'Science Junction', phone: '0557654321', emoji: '🖨️', hours: 'Mon–Fri 8am–6pm' },
  { id: 3, name: 'QuickMart Groceries', category: 'Groceries', location: 'Commercial Area', phone: '0201122334', emoji: '🛒', hours: 'Daily 6am–10pm' },
  { id: 4, name: 'MedPlus Pharmacy', category: 'Pharmacy', location: 'Near Health Centre', phone: '0269988776', emoji: '💊', hours: 'Mon–Sat 8am–9pm' },
  { id: 5, name: 'Kofi Bites', category: 'Food', location: 'Valco Flats', phone: '0243344556', emoji: '🌮', hours: 'Daily 11am–10pm' },
  { id: 6, name: 'UCC Bookshop', category: 'Other', location: 'Main Campus', phone: '0331234567', emoji: '📚', hours: 'Mon–Fri 8am–5pm' },
];

export default function Shops() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = shops.filter(s => {
    const matchCat    = filter === 'All' || s.category === filter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const searchIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', color: 'var(--runit-text)', paddingBottom: 100 }}>
      <PillNavbar title="Shops Near UCC" subtitle="Order via runner · cash on delivery" actions={[{ icon: searchIcon, onClick: () => {} }]} />

      <div className="page-content">

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            placeholder="Search shops or locations..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 50, background: 'var(--runit-surface)', color: 'var(--runit-text)', border: '1px solid var(--runit-border)', fontSize: 14, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--runit-border)'}
          />
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--runit-muted)' }}>🔍</span>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: 50, fontSize: 12, fontWeight: filter === f ? 600 : 400, border: '1px solid', borderColor: filter === f ? 'var(--runit-accent)' : 'var(--runit-border)', background: filter === f ? 'rgba(0,201,167,0.12)' : 'transparent', color: filter === f ? 'var(--runit-accent)' : 'var(--runit-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Coming soon banner */}
        <div style={{ background: 'rgba(0,201,167,0.05)', border: '1px solid var(--runit-border)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>🏪</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--runit-accent)' }}>Marketplace coming soon</div>
            <div style={{ fontSize: 11, color: 'var(--runit-muted)' }}>For now, order via runner — call the shop or describe what you need</div>
          </div>
        </div>

        {/* Shop cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(shop => (
            <div key={shop.id} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 20, padding: 18, transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--runit-border-strong)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--runit-border)'}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--runit-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {shop.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{shop.name}</div>
                    <span style={{ background: 'rgba(0,201,167,0.08)', border: '1px solid var(--runit-border)', borderRadius: 50, padding: '2px 10px', fontSize: 10, color: 'var(--runit-accent)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                      {shop.category}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--runit-muted)', marginBottom: 2 }}>📍 {shop.location}</div>
                  <div style={{ fontSize: 12, color: 'var(--runit-muted)', marginBottom: 12 }}>🕐 {shop.hours}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate('/place-order?description=Order from ' + shop.name + '&category=Food %26 Drinks')}
                      style={{ flex: 1, padding: '9px', borderRadius: 50, background: 'var(--runit-accent)', color: '#0a1f1c', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}
                    >
                      Order via Runner
                    </button>
                    <a href={'tel:' + shop.phone} style={{ padding: '9px 16px', borderRadius: 50, background: 'transparent', border: '1px solid var(--runit-border)', color: 'var(--runit-muted)', fontSize: 12, fontWeight: 500 }}>
                      📞 Call
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No shops found</div>
              <div style={{ fontSize: 13 }}>Try a different search or category</div>
            </div>
          )}
        </div>
      </div>
      <BottomPillNav />
    </div>
  );
}