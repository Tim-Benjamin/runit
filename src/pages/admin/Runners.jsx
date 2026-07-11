// src/pages/admin/Runners.jsx
import { useState, useEffect } from 'react';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';

const STATUS_COLORS = {
  active:    { bg: 'rgba(0,201,167,0.1)',  color: '#00c9a7', border: 'rgba(0,201,167,0.3)' },
  pending:   { bg: 'rgba(255,180,0,0.1)',  color: '#ffb400', border: 'rgba(255,180,0,0.3)' },
  suspended: { bg: 'rgba(255,80,80,0.1)',  color: '#ff6060', border: 'rgba(255,80,80,0.3)' },
};

export default function AdminRunners() {
  const [runners, setRunners]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { fetchRunners(); }, []); // eslint-disable-line

  const fetchRunners = async () => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('http://localhost/runit-backend/api/admin/runners.php', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRunners(data.runners || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const updateRunner = async (id, status) => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('http://localhost/runit-backend/api/admin/runners.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ runner_id: id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message || 'Updated');
        fetchRunners();
      } else {
        setActionMsg(data.error || 'Failed');
      }
    } catch {
      setActionMsg('Connection error');
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  const filtered = runners.filter(r => filter === 'all' || r.status === filter);

  const bellIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );

  return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', color: 'var(--runit-text)', paddingBottom: 100 }}>
      <PillNavbar title="Manage Runners" subtitle={runners.length + ' total'} actions={[]} />

      <div className="page-content">

        {actionMsg && (
          <div style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border-strong)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: 'var(--runit-accent)', fontSize: 13 }}>
            {actionMsg}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Active', value: runners.filter(r => r.status === 'active').length, color: '#00c9a7' },
            { label: 'Pending', value: runners.filter(r => r.status === 'pending').length, color: '#ffb400' },
            { label: 'Suspended', value: runners.filter(r => r.status === 'suspended').length, color: '#ff6060' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'pending', 'active', 'suspended'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: 50, fontSize: 12, fontWeight: filter === f ? 600 : 400, border: '1px solid', borderColor: filter === f ? 'var(--runit-accent)' : 'var(--runit-border)', background: filter === f ? 'rgba(0,201,167,0.12)' : 'transparent', color: filter === f ? 'var(--runit-accent)' : 'var(--runit-muted)', cursor: 'pointer', textTransform: 'capitalize' }}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>Loading...</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(runner => {
            const sc = STATUS_COLORS[runner.status] || STATUS_COLORS.pending;
            return (
              <div key={runner.id} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 20, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--runit-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#0a1f1c', flexShrink: 0 }}>
                      {runner.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{runner.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--runit-muted)' }}>{runner.email}</div>
                    </div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.color, border: '1px solid ' + sc.border, borderRadius: 50, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>
                    {runner.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14, fontSize: 12 }}>
                  {[
                    { label: 'Phone', value: runner.phone },
                    { label: 'MoMo', value: runner.momo_number },
                    { label: 'Method', value: runner.delivery_method },
                    { label: 'Joined', value: new Date(runner.created_at).toLocaleDateString('en-GH') },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--runit-elevated)', borderRadius: 10, padding: '8px 10px' }}>
                      <div style={{ color: 'var(--runit-muted)', fontSize: 10, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontWeight: 500 }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {runner.status === 'pending' && (
                    <button onClick={() => updateRunner(runner.id, 'active')} style={{ flex: 1, padding: '9px', borderRadius: 50, background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.3)', color: '#00c9a7', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      âœ“ Approve
                    </button>
                  )}
                  {runner.status === 'active' && (
                    <button onClick={() => updateRunner(runner.id, 'suspended')} style={{ flex: 1, padding: '9px', borderRadius: 50, background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff6060', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                      Suspend
                    </button>
                  )}
                  {runner.status === 'suspended' && (
                    <button onClick={() => updateRunner(runner.id, 'active')} style={{ flex: 1, padding: '9px', borderRadius: 50, background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.3)', color: '#00c9a7', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                      Reinstate
                    </button>
                  )}
                  {runner.status === 'pending' && (
                    <button onClick={() => updateRunner(runner.id, 'suspended')} style={{ padding: '9px 16px', borderRadius: 50, background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff6060', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                      Reject
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>ðŸƒ</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>No runners here</div>
            </div>
          )}
        </div>
      </div>
      <BottomPillNav />
    </div>
  );
}