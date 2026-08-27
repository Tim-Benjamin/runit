// src/pages/admin/Dashboard.jsx
import API_BASE from '../../api/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonStatGrid, SkeletonCard } from '../../components/Skeleton';
import PushPrompt from '../../components/PushPrompt';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecent] = useState([]);
  const [pendingRunners, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('runit_token');
      const res = await fetch('${API_BASE}/api/admin/stats.php', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setRecent(data.recent_orders || []);
        setPending(data.pending_runners || []);
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const updateRunner = async (id, status) => {
    try {
      const token = localStorage.getItem('runit_token');
      const res = await fetch('${API_BASE}/api/admin/runners.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ runner_id: id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(status === 'active' ? 'âœ“ Runner approved!' : 'Runner rejected.');
        fetchAll();
      } else {
        setActionMsg(data.error || 'Failed');
      }
    } catch {
      setActionMsg('Connection error');
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  const bellIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
  const dotsIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  );

  return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', color: 'var(--runit-text)', paddingBottom: 100 }}>

      <PillNavbar
        title="Admin Panel"
        subtitle="RunIt platform overview"
        actions={[]}
      />

      <div className="page-content">

        {actionMsg && (
          <div style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border-strong)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: 'var(--runit-accent)', fontSize: 13, fontWeight: 500 }}>
            {actionMsg}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SkeletonStatGrid count={4} />
            <SkeletonStatGrid count={2} />
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div>

            {/* Welcome */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Overview</h1>
              <p style={{ color: 'var(--runit-muted)', fontSize: 14 }}>Platform stats at a glance</p>
            </div>

            {/* Main stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { icon: '📦', label: 'Total Orders', value: stats?.total_orders ?? 0 },
                { icon: '🏃', label: 'Active Runners', value: stats?.active_runners ?? 0 },
                { icon: '👤', label: 'Total Users', value: stats?.total_users ?? 0 },
                { icon: '💰', label: 'Revenue (20%)', value: 'GH₵ ' + (stats?.revenue ?? 0).toFixed(2) },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 18, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 30, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--runit-accent)', lineHeight: 1.1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginTop: 3 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order status breakdown */}
            <div style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 20, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Orders by Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'pending', label: 'Pending', color: '#ffb400' },
                  { key: 'accepted', label: 'Accepted', color: '#00c9a7' },
                  { key: 'on_the_way', label: 'On The Way', color: '#7090ff' },
                  { key: 'delivered', label: 'Delivered', color: '#00c9a7' },
                  { key: 'cancelled', label: 'Cancelled', color: '#ff6060' },
                ].map(item => {
                  const count = stats?.by_status?.[item.key] ?? 0;
                  const total = stats?.total_orders || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={item.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--runit-muted)' }}>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>{count}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--runit-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pct + '%', background: item.color, borderRadius: 3, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick nav */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { label: '🏃 Runners', path: '/admin/runners' },
                { label: '📦 Orders', path: '/admin/orders' },
                { label: '🏪 Shops', path: '/admin/shops' },
                { label: '💰 Fees', path: '/admin/fees' },
                { label: '📊 Settlements', path: '/admin/settlements' },
                { label: '%  Commission', path: '/admin/commission' },
                { label: '⭐ Feedback', path: '/admin/feedback' },
                { label: '📣 Announce', path: '/admin/announcements' },
              ].map(item => (
                <button key={item.path} onClick={() => navigate(item.path)} style={{ padding: '8px 16px', borderRadius: 50, whiteSpace: 'nowrap', background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', color: 'var(--runit-text)', fontSize: 13, cursor: 'pointer', transition: 'border-color 0.2s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--runit-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--runit-border)'}
                >{item.label}</button>
              ))}
            </div>

            {/* Pending runner approvals */}
            {pendingRunners.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600 }}>Pending Approvals</h2>
                    <span style={{ background: 'rgba(255,180,0,0.15)', color: '#ffb400', border: '1px solid rgba(255,180,0,0.3)', borderRadius: 50, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                      {pendingRunners.length}
                    </span>
                  </div>
                  <button onClick={() => navigate('/admin/runners')} style={{ background: 'none', border: 'none', color: 'var(--runit-accent)', fontSize: 13, cursor: 'pointer' }}>See all</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pendingRunners.map(runner => (
                    <div key={runner.id} style={{ background: 'var(--runit-surface)', border: '1px solid rgba(255,180,0,0.2)', borderRadius: 18, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--runit-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#0a1f1c', flexShrink: 0 }}>
                            {runner.name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{runner.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--runit-muted)' }}>{runner.email}</div>
                          </div>
                        </div>
                        <span style={{ background: 'rgba(255,180,0,0.1)', color: '#ffb400', border: '1px solid rgba(255,180,0,0.3)', borderRadius: 50, padding: '3px 10px', fontSize: 10, fontWeight: 600 }}>
                          Pending
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: 12 }}>
                        {[
                          { label: 'Phone', value: runner.phone },
                          { label: 'Method', value: runner.delivery_method },
                          { label: 'MoMo', value: runner.momo_number },
                          { label: 'Applied', value: new Date(runner.created_at).toLocaleDateString('en-GH') },
                        ].map(item => (
                          <div key={item.label} style={{ background: 'var(--runit-elevated)', borderRadius: 8, padding: '7px 10px' }}>
                            <div style={{ color: 'var(--runit-muted)', fontSize: 10, marginBottom: 1 }}>{item.label}</div>
                            <div style={{ fontWeight: 500 }}>{item.value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => updateRunner(runner.id, 'active')} style={{ flex: 1, padding: '10px', borderRadius: 50, background: 'rgba(0,201,167,0.12)', border: '1px solid rgba(0,201,167,0.3)', color: '#00c9a7', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                          âœ“ Approve
                        </button>
                        <button onClick={() => updateRunner(runner.id, 'suspended')} style={{ padding: '10px 18px', borderRadius: 50, background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff6060', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent orders */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600 }}>Recent Orders</h2>
                <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: 'var(--runit-accent)', fontSize: 13, cursor: 'pointer' }}>See all</button>
              </div>

              {recentOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--runit-muted)', fontSize: 14 }}>
                  No orders yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentOrders.map(order => (
                    <div key={order.id} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ flex: 1, marginRight: 10 }}>
                          <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginBottom: 3 }}>
                            #{order.id}· {order.category}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
                            {order.description.length > 60 ? order.description.slice(0, 60) + '...' : order.description}
                          </div>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--runit-muted)', borderTop: '1px solid var(--runit-border)', paddingTop: 8 }}>
                        <span>👤 {order.user_name || 'Unknown'}🏃 {order.runner_name || 'Unassigned'}</span>
                        <span style={{ color: 'var(--runit-accent)', fontWeight: 600 }}>
                          GHâ‚µ {parseFloat(order.final_fee || order.proposed_fee).toFixed(2)}
                        </span>
                      </div>
                    </div> 
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <PushPrompt />
      <BottomPillNav />
    </div>
  );
}