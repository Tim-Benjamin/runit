// src/pages/admin/Orders.jsx
import API_BASE from '../../api/config';
import { useState, useEffect } from 'react';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';
import StatusBadge from '../../components/StatusBadge';

const FILTERS = ['All', 'Pending', 'Active', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('All');

  useEffect(() => { fetchOrders(); }, []); // eslint-disable-line

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/orders/list.php', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const filtered = orders.filter(o => {
    if (filter === 'All')       return true;
    if (filter === 'Pending')   return o.status === 'pending';
    if (filter === 'Active')    return ['accepted','on_the_way','arrived'].includes(o.status);
    if (filter === 'Delivered') return o.status === 'delivered';
    if (filter === 'Cancelled') return o.status === 'cancelled';
    return true;
  });

  const bellIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );

  return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', color: 'var(--runit-text)', paddingBottom: 100 }}>
      <PillNavbar title="All Orders" subtitle={orders.length + ' total'} actions={[{ icon: bellIcon, onClick: () => {} }]} />

      <div className="page-content">

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Total', value: orders.length },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending').length },
            { label: 'Active', value: orders.filter(o => ['accepted','on_the_way','arrived'].includes(o.status)).length },
            { label: 'Done', value: orders.filter(o => o.status === 'delivered').length },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 14, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--runit-accent)' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--runit-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: 50, fontSize: 12, fontWeight: filter === f ? 600 : 400, border: '1px solid', borderColor: filter === f ? 'var(--runit-accent)' : 'var(--runit-border)', background: filter === f ? 'rgba(0,201,167,0.12)' : 'transparent', color: filter === f ? 'var(--runit-accent)' : 'var(--runit-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {f}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>Loading...</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(order => (
            <div key={order.id} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 18, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ flex: 1, marginRight: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginBottom: 3 }}>Order #{order.id} · {order.category}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{order.description}</div>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8, fontSize: 12 }}>
                <div style={{ color: 'var(--runit-muted)' }}>👤 {order.user_name || 'Unknown'}</div>
                <div style={{ color: 'var(--runit-muted)' }}>🏃 {order.runner_name || 'Unassigned'}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--runit-border)', paddingTop: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--runit-accent)' }}>
                  GH₵ {parseFloat(order.final_fee || order.proposed_fee).toFixed(2)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--runit-muted)' }}>
                  {new Date(order.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 15 }}>No orders here</div>
            </div>
          )}
        </div>
      </div>
      <BottomPillNav />
    </div>
  );
}