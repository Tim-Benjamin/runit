// src/pages/admin/Settlements.jsx
import API_BASE from '../../api/config';
import { useState, useEffect } from 'react';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';

export default function AdminSettlements() {
  const [runners, setRunners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState('');

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/admin/runners.php', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRunners((data.runners || []).filter(r => r.status === 'active'));
    } catch { /* silent */ }
    setLoading(false);
  };

  const markSettled = async (runnerId, amount) => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/admin/settlements.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ runner_id: runnerId, amount }),
      });
      const data = await res.json();
      if (res.ok) { setMsg('Settlement recorded'); fetchData(); }
      else setMsg(data.error || 'Failed');
    } catch { setMsg('Connection error'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const bellIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );

  return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', color: 'var(--runit-text)', paddingBottom: 100 }}>
      <PillNavbar title="Settlements" subtitle="Runner commission tracker" actions={[{ icon: bellIcon, onClick: () => {} }]} />

      <div className="page-content">

        {msg && (
          <div style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border-strong)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: 'var(--runit-accent)', fontSize: 13 }}>
            {msg}
          </div>
        )}

        <div style={{ background: 'rgba(255,180,0,0.07)', border: '1px solid rgba(255,180,0,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ fontSize: 13, color: 'var(--runit-muted)', lineHeight: 1.5 }}>
            Runners pay their 20% platform commission via MoMo each week. Mark them settled once payment is received.
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>Loading...</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {runners.map(runner => {
            const owed = parseFloat(runner.total_owed || 0);
            const settled = parseFloat(runner.total_settled || 0);
            const outstanding = Math.max(0, owed - settled);
            const isClean = outstanding < 0.01;

            return (
              <div key={runner.id} style={{ background: 'var(--runit-surface)', border: '1px solid ' + (isClean ? 'var(--runit-border)' : 'rgba(255,180,0,0.25)'), borderRadius: 20, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--runit-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#0a1f1c' }}>
                      {runner.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{runner.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--runit-muted)' }}>{runner.momo_number}</div>
                    </div>
                  </div>
                  <span style={{ background: isClean ? 'rgba(0,201,167,0.1)' : 'rgba(255,180,0,0.1)', color: isClean ? '#00c9a7' : '#ffb400', border: '1px solid ' + (isClean ? 'rgba(0,201,167,0.3)' : 'rgba(255,180,0,0.3)'), borderRadius: 50, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>
                    {isClean ? 'Clear' : 'Owes'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: isClean ? 0 : 14 }}>
                  {[
                    { label: 'Total Owed', value: 'GH₵ ' + owed.toFixed(2), color: 'var(--runit-text)' },
                    { label: 'Settled', value: 'GH₵ ' + settled.toFixed(2), color: '#00c9a7' },
                    { label: 'Outstanding', value: 'GH₵ ' + outstanding.toFixed(2), color: outstanding > 0 ? '#ffb400' : '#00c9a7' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--runit-elevated)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--runit-muted)', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {!isClean && (
                  <button onClick={() => markSettled(runner.id, outstanding)} style={{ width: '100%', padding: '10px', borderRadius: 50, background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.3)', color: '#00c9a7', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Mark GH₵ {outstanding.toFixed(2)} as Settled
                  </button>
                )}
              </div>
            );
          })}

          {!loading && runners.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
              <div style={{ fontSize: 15 }}>No active runners yet</div>
            </div>
          )}
        </div>
      </div>
      <BottomPillNav />
    </div>
  );
}