// src/pages/admin/Fees.jsx
import API_BASE from '../../api/config';
import { useState, useEffect } from 'react';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';

export default function AdminFees() {
  const [fees, setFees]   = useState([]);
  const [editing, setEditing] = useState({});
  const [msg, setMsg]     = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFees(); }, []); // eslint-disable-line

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/admin/fees.php', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFees(data.fees || []);
        const init = {};
        (data.fees || []).forEach(f => { init[f.category] = f.base_fee; });
        setEditing(init);
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const saveFee = async (category) => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/admin/fees.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category, base_fee: parseFloat(editing[category]) }),
      });
      const data = await res.json();
      if (res.ok) { setMsg('Fee updated for ' + category); fetchFees(); }
      else setMsg(data.error || 'Failed');
    } catch { setMsg('Connection error'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const catIcons = { 'Food & Drinks': '🍔', 'Errands': '🛵', 'Shopping': '🛍️', 'Custom': '✨' };

  const dotsIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  );

  return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', color: 'var(--runit-text)', paddingBottom: 100 }}>
      <PillNavbar title="Delivery Fees" subtitle="Set base fee per category" actions={[{ icon: dotsIcon, onClick: () => {} }]} />

      <div className="page-content">

        {msg && (
          <div style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border-strong)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: 'var(--runit-accent)', fontSize: 13 }}>
            {msg}
          </div>
        )}

        <div style={{ background: 'rgba(0,201,167,0.05)', border: '1px solid var(--runit-border)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: 'var(--runit-muted)', lineHeight: 1.5 }}>
          These are the default fees shown to users when they place orders. Users can increase the fee to attract runners faster.
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>Loading...</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fees.map(fee => (
            <div key={fee.category} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 20, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{catIcons[fee.category] || '📦'}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{fee.category}</div>
                  <div style={{ fontSize: 11, color: 'var(--runit-muted)' }}>
                    Last updated: {new Date(fee.updated_at).toLocaleDateString('en-GH')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--runit-muted)', fontSize: 13 }}>GH₵</span>
                  <input
                    type="number" min="0" step="0.50"
                    value={editing[fee.category] ?? fee.base_fee}
                    onChange={e => setEditing(p => ({ ...p, [fee.category]: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px 11px 48px', borderRadius: 12, background: 'var(--runit-elevated)', color: 'var(--runit-text)', border: '1px solid var(--runit-border)', fontSize: 15, fontWeight: 600, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--runit-border)'}
                  />
                </div>
                <button onClick={() => saveFee(fee.category)} style={{ padding: '11px 20px', borderRadius: 50, background: 'var(--runit-accent)', color: '#0a1f1c', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomPillNav />
    </div>
  );
}