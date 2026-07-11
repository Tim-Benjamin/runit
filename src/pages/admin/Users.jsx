// src/pages/admin/Users.jsx
import API_BASE from '../../api/config';
import { useState, useEffect } from 'react';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState('');

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/admin/users.php', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const toggleUser = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/admin/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) { setMsg('User ' + newStatus); fetchUsers(); }
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
      <PillNavbar title="Manage Users" subtitle={users.length + ' registered'} actions={[{ icon: bellIcon, onClick: () => {} }]} />

      <div className="page-content">

        {msg && (
          <div style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border-strong)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: 'var(--runit-accent)', fontSize: 13 }}>
            {msg}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Users', value: users.length, color: 'var(--runit-accent)' },
            { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, color: '#ff6060' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>Loading...</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(user => (
            <div key={user.id} style={{ background: 'var(--runit-surface)', border: '1px solid ' + (user.status === 'suspended' ? 'rgba(255,80,80,0.2)' : 'var(--runit-border)'), borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: user.status === 'suspended' ? 'rgba(255,80,80,0.2)' : 'var(--runit-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: user.status === 'suspended' ? '#ff6060' : '#0a1f1c', flexShrink: 0 }}>
                    {user.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--runit-muted)' }}>{user.email}</div>
                  </div>
                </div>
                <span style={{ background: user.status === 'active' ? 'rgba(0,201,167,0.1)' : 'rgba(255,80,80,0.1)', color: user.status === 'active' ? '#00c9a7' : '#ff6060', border: '1px solid ' + (user.status === 'active' ? 'rgba(0,201,167,0.3)' : 'rgba(255,80,80,0.3)'), borderRadius: 50, padding: '3px 10px', fontSize: 10, fontWeight: 600 }}>
                  {user.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: 12 }}>
                {[
                  { label: 'Phone', value: user.phone },
                  { label: 'Orders', value: user.total_orders || 0 },
                  { label: 'Joined', value: new Date(user.created_at).toLocaleDateString('en-GH') },
                  { label: 'Spent', value: 'GH₵ ' + parseFloat(user.total_spent || 0).toFixed(2) },
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--runit-elevated)', borderRadius: 8, padding: '7px 10px' }}>
                    <div style={{ color: 'var(--runit-muted)', fontSize: 10, marginBottom: 1 }}>{item.label}</div>
                    <div style={{ fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => toggleUser(user.id, user.status)} style={{ width: '100%', padding: '9px', borderRadius: 50, background: user.status === 'active' ? 'rgba(255,80,80,0.08)' : 'rgba(0,201,167,0.1)', border: '1px solid ' + (user.status === 'active' ? 'rgba(255,80,80,0.25)' : 'rgba(0,201,167,0.3)'), color: user.status === 'active' ? '#ff6060' : '#00c9a7', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                {user.status === 'active' ? 'Suspend User' : 'Reinstate User'}
              </button>
            </div>
          ))}

          {!loading && users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <div style={{ fontSize: 15 }}>No users yet</div>
            </div>
          )}
        </div>
      </div>
      <BottomPillNav />
    </div>
  );
}