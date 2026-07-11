// src/pages/admin/Commission.jsx
import { useState, useEffect } from 'react';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';

export default function AdminCommission() {
  const [current, setCurrent] = useState('');
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');

  useEffect(() => { fetchCommission(); }, []); // eslint-disable-line

  const fetchCommission = async () => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('http://localhost/runit-backend/api/admin/commission.php', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCurrent(data.commission);
        setInput(data.commission);
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const save = async () => {
    const val = parseFloat(input);
    if (isNaN(val) || val < 0 || val > 100) {
      setMsg('Enter a valid percentage between 0 and 100');
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('http://localhost/runit-backend/api/admin/commission.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ commission: val }),
      });
      const data = await res.json();
      if (res.ok) { setMsg('Commission updated to ' + val + '%'); fetchCommission(); }
      else setMsg(data.error || 'Failed to update');
    } catch { setMsg('Connection error'); }
    setTimeout(() => setMsg(''), 3000);
    setSaving(false);
  };

  const dotsIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  );

  const runnerCut = 100 - parseFloat(input || current || 20);
  const platformCut = parseFloat(input || current || 20);

  return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', color: 'var(--runit-text)', paddingBottom: 100 }}>
      <PillNavbar title="Commission" subtitle="Platform revenue settings" actions={[{ icon: dotsIcon, onClick: () => {} }]} />

      <div className="page-content">

        {msg && (
          <div style={{ background: msg.includes('error') || msg.includes('valid') ? 'rgba(255,80,80,0.1)' : 'rgba(0,201,167,0.1)', border: '1px solid ' + (msg.includes('error') || msg.includes('valid') ? 'rgba(255,80,80,0.3)' : 'var(--runit-border-strong)'), borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: msg.includes('error') || msg.includes('valid') ? '#ff8080' : 'var(--runit-accent)', fontSize: 13 }}>
            {msg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>Loading...</div>
        ) : (
          <div>

            {/* Current commission display */}
            <div style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 20, padding: 24, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--runit-muted)', marginBottom: 8 }}>Current Commission Rate</div>
              <div style={{ fontSize: 64, fontWeight: 800, color: 'var(--runit-accent)', lineHeight: 1 }}>
                {current}%
              </div>
              <div style={{ fontSize: 13, color: 'var(--runit-muted)', marginTop: 8 }}>
                Applied to every delivered order
              </div>
            </div>

            {/* Split preview */}
            <div style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 20, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Revenue Split Preview</div>

              {/* Visual bar */}
              <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex', marginBottom: 12 }}>
                <div style={{ width: platformCut + '%', background: 'var(--runit-accent)', transition: 'width 0.3s' }} />
                <div style={{ flex: 1, background: 'var(--runit-elevated)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'rgba(0,201,167,0.08)', border: '1px solid var(--runit-border)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginBottom: 4 }}>Platform gets</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--runit-accent)' }}>{platformCut}%</div>
                </div>
                <div style={{ background: 'var(--runit-elevated)', border: '1px solid var(--runit-border)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginBottom: 4 }}>Runner keeps</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--runit-text)' }}>{runnerCut}%</div>
                </div>
              </div>

              {/* Example calculation */}
              <div style={{ marginTop: 14, background: 'var(--runit-elevated)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, color: 'var(--runit-muted)', marginBottom: 8 }}>Example: GH₵ 10 delivery fee</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: 'var(--runit-muted)' }}>Runner collects</span>
                  <span style={{ fontWeight: 600 }}>GH₵ 10.00 cash</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: 'var(--runit-muted)' }}>Runner keeps</span>
                  <span style={{ fontWeight: 600, color: 'var(--runit-text)' }}>GH₵ {(10 * runnerCut / 100).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid var(--runit-border)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ color: 'var(--runit-muted)' }}>Platform earns</span>
                  <span style={{ fontWeight: 700, color: 'var(--runit-accent)' }}>GH₵ {(10 * platformCut / 100).toFixed(2)}</span>
                </div> 
              </div>
            </div>

            {/* Update form */}
            <div style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Update Commission Rate</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="number" min="0" max="100" step="1"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    style={{ width: '100%', padding: '12px 40px 12px 16px', borderRadius: 12, background: 'var(--runit-elevated)', color: 'var(--runit-text)', border: '1px solid var(--runit-border)', fontSize: 18, fontWeight: 700, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--runit-border)'}
                  />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--runit-muted)', fontSize: 16, fontWeight: 700 }}>%</span>
                </div>
                <button onClick={save} disabled={saving} style={{ padding: '12px 24px', borderRadius: 50, background: saving ? 'var(--runit-accent-dark)' : 'var(--runit-accent)', color: '#0a1f1c', fontWeight: 700, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                  {saving ? 'Saving...' : 'Update'}
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginTop: 8 }}>
                Changes apply to all future completed orders immediately.
              </div>
            </div>

          </div>
        )}
      </div>
      <BottomPillNav />
    </div>
  );
}