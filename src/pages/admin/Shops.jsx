// src/pages/admin/Shops.jsx
import API_BASE from '../../api/config';
import { useState, useEffect } from 'react';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';

const CATEGORIES = ['Food', 'Groceries', 'Printing', 'Pharmacy', 'Other'];
const CAT_EMOJI  = { Food: '🍔', Groceries: '🛒', Printing: '🖨️', Pharmacy: '💊', Other: '📦' };

const emptyForm = { name: '', category: 'Food', location_description: '', phone: '' };

export default function AdminShops() {
  const [shops, setShops]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState(emptyForm);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');

  useEffect(() => { fetchShops(); }, []); // eslint-disable-line

  const fetchShops = async () => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/shops/list.php', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setShops(data.shops || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const saveShop = async () => {
    if (!form.name || !form.location_description || !form.phone) {
      setMsg('All fields are required'); setTimeout(() => setMsg(''), 3000); return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/admin/shops.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Shop added successfully');
        setForm(emptyForm);
        setShowForm(false);
        fetchShops();
      } else {
        setMsg(data.error || 'Failed to save');
      }
    } catch { setMsg('Connection error'); }
    setTimeout(() => setMsg(''), 3000);
    setSaving(false);
  };

  const toggleShop = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const token = localStorage.getItem('runit_token');
      await fetch('${API_BASE}/api/admin/shops.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchShops();
    } catch { /* silent */ }
  };

  const deleteShop = async (id) => {
    if (!window.confirm('Delete this shop?')) return;
    try {
      const token = localStorage.getItem('runit_token');
      await fetch('${API_BASE}/api/admin/shops.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      fetchShops();
    } catch { /* silent */ }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 12, background: 'var(--runit-elevated)', color: 'var(--runit-text)', border: '1px solid var(--runit-border)', fontSize: 14, outline: 'none' };
  const labelStyle = { fontSize: 12, color: 'var(--runit-muted)', display: 'block', marginBottom: 6 };

  const plusIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', color: 'var(--runit-text)', paddingBottom: 100 }}>
      <PillNavbar title="Manage Shops" subtitle={shops.length + ' listings'} actions={[{ icon: plusIcon, onClick: () => setShowForm(true) }]} />

      <div className="page-content">

        {msg && (
          <div style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border-strong)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: 'var(--runit-accent)', fontSize: 13 }}>
            {msg}
          </div>
        )}

        {/* Add shop button */}
        <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '13px', borderRadius: 50, background: 'var(--runit-accent)', color: '#0a1f1c', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', marginBottom: 20 }}>
          + Add New Shop
        </button>

        {loading && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>Loading...</div>}

        {/* Shop list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shops.map(shop => (
            <div key={shop.id} style={{ background: 'var(--runit-surface)', border: '1px solid ' + (shop.status === 'inactive' ? 'rgba(255,80,80,0.2)' : 'var(--runit-border)'), borderRadius: 20, padding: 16, opacity: shop.status === 'inactive' ? 0.7 : 1 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--runit-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {CAT_EMOJI[shop.category] || '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{shop.name}</div>
                    <span style={{ background: shop.status === 'active' ? 'rgba(0,201,167,0.1)' : 'rgba(255,80,80,0.1)', color: shop.status === 'active' ? '#00c9a7' : '#ff6060', border: '1px solid ' + (shop.status === 'active' ? 'rgba(0,201,167,0.3)' : 'rgba(255,80,80,0.3)'), borderRadius: 50, padding: '2px 10px', fontSize: 10, fontWeight: 600 }}>
                      {shop.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--runit-muted)', marginBottom: 1 }}>📍 {shop.location_description}</div>
                  <div style={{ fontSize: 12, color: 'var(--runit-muted)', marginBottom: 12 }}>📞 {shop.phone} · {shop.category}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => toggleShop(shop.id, shop.status)} style={{ flex: 1, padding: '8px', borderRadius: 50, background: 'transparent', border: '1px solid var(--runit-border)', color: 'var(--runit-muted)', fontSize: 12, cursor: 'pointer' }}>
                      {shop.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => deleteShop(shop.id)} style={{ padding: '8px 14px', borderRadius: 50, background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff6060', fontSize: 12, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loading && shops.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No shops yet</div>
              <div style={{ fontSize: 13 }}>Add your first shop listing above</div>
            </div>
          )}
        </div>
      </div>

      {/* Add shop modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200, padding: '0' }}>
          <div style={{ background: 'var(--runit-elevated)', border: '1px solid var(--runit-border)', borderRadius: '24px 24px 0 0', padding: '28px 20px 40px', width: '100%', maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Add New Shop</div>
              <button onClick={() => setShowForm(false)} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'var(--runit-muted)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Shop name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Auntie Ama's Kitchen" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
              </div>

              <div>
                <label style={labelStyle}>Category *</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => setForm(f => ({ ...f, category: cat }))} style={{ padding: '7px 14px', borderRadius: 50, fontSize: 12, border: '1px solid', borderColor: form.category === cat ? 'var(--runit-accent)' : 'var(--runit-border)', background: form.category === cat ? 'rgba(0,201,167,0.12)' : 'transparent', color: form.category === cat ? 'var(--runit-accent)' : 'var(--runit-muted)', cursor: 'pointer' }}>
                      {CAT_EMOJI[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Location description *</label>
                <input value={form.location_description} onChange={e => setForm(f => ({ ...f, location_description: e.target.value }))} placeholder="e.g. Near Main Gate" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
              </div>

              <div>
                <label style={labelStyle}>Phone number *</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="024XXXXXXX" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
              </div>

              <button onClick={saveShop} disabled={saving} style={{ width: '100%', padding: '14px', borderRadius: 50, background: saving ? 'var(--runit-accent-dark)' : 'var(--runit-accent)', color: '#0a1f1c', fontWeight: 700, fontSize: 15, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                {saving ? 'Saving...' : 'Add Shop'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomPillNav />
    </div>
  );
}