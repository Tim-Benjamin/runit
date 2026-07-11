// src/pages/admin/Feedback.jsx
import API_BASE from '../../api/config';
import { useState, useEffect } from 'react';
import PillNavbar from '../../components/PillNavbar';
import BottomPillNav from '../../components/BottomPillNav';
import Spinner from '../../components/Spinner';

const REASON_LABELS = {
  wrong_item:           'Wrong item delivered',
  runner_no_show:       'Runner no-show',
  overcharge:           'Overcharge / fee dispute',
  wrong_location:       'Wrong location',
  customer_unreachable: 'Customer unreachable',
  rude_behavior:        'Rude behavior',
  other:                'Other',
};

export default function AdminFeedback() {
  const [tab, setTab]         = useState('reports');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState('');

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/admin/feedback.php', {
        headers: { Authorization: 'Bearer ' + token },
      });
      const json = await res.json();
      if (res.ok) setData(json);
    } catch { /* silent */ }
    setLoading(false);
  };

  const resolveReport = async (id) => {
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/admin/feedback.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ report_id: id }),
      });
      const json = await res.json();
      if (res.ok) { setMsg('Report resolved'); fetchData(); }
      else setMsg(json.error || 'Failed');
    } catch { setMsg('Connection error'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const openReports = data?.reports?.filter(r => r.status === 'open') || [];
  const avgRating   = data?.ratings?.length
    ? (data.ratings.reduce((s, r) => s + parseInt(r.stars), 0) / data.ratings.length).toFixed(1)
    : '—';

  return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', color: 'var(--runit-text)', paddingBottom: 100 }}>
      <PillNavbar title="Feedback & Reports" subtitle="Ratings and issues" />

      <div className="page-content">

        {msg && (
          <div style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid var(--runit-border-strong)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: 'var(--runit-accent)', fontSize: 13 }}>
            {'✓ ' + msg}
          </div>
        )}

        {/* Summary stats */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Avg Rating', value: avgRating + ' ⭐', color: 'var(--runit-accent)' },
              { label: 'Total Ratings', value: data.ratings?.length || 0, color: 'var(--runit-text)' },
              { label: 'Open Reports', value: openReports.length, color: openReports.length > 0 ? '#ff8080' : 'var(--runit-accent)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--runit-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'reports', label: 'Reports ' + (openReports.length > 0 ? '(' + openReports.length + ')' : '') },
            { key: 'ratings', label: 'Ratings' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '10px', borderRadius: 50, border: '1px solid', borderColor: tab === t.key ? 'var(--runit-accent)' : 'var(--runit-border)', background: tab === t.key ? 'rgba(0,201,167,0.12)' : 'transparent', color: tab === t.key ? 'var(--runit-accent)' : 'var(--runit-muted)', fontWeight: tab === t.key ? 700 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <Spinner />}

        {/* Reports tab */}
        {!loading && tab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data?.reports || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 15 }}>No reports yet</div>
              </div>
            ) : (data?.reports || []).map(report => (
              <div key={report.id} style={{ background: 'var(--runit-surface)', border: '1px solid ' + (report.status === 'open' ? 'rgba(255,80,80,0.25)' : 'var(--runit-border)'), borderRadius: 18, padding: 16, opacity: report.status === 'resolved' ? 0.7 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{REASON_LABELS[report.reason] || report.reason}</div>
                    <div style={{ fontSize: 11, color: 'var(--runit-muted)' }}>
                      {'Order #' + report.order_id + ' · Reported by ' + (report.reporter_name || 'Unknown') + ' (' + report.reporter_role + ')'}
                    </div>
                  </div>
                  <span style={{ background: report.status === 'open' ? 'rgba(255,80,80,0.1)' : 'rgba(0,201,167,0.1)', color: report.status === 'open' ? '#ff8080' : '#00c9a7', border: '1px solid ' + (report.status === 'open' ? 'rgba(255,80,80,0.3)' : 'rgba(0,201,167,0.3)'), borderRadius: 50, padding: '3px 10px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {report.status === 'open' ? 'Open' : 'Resolved'}
                  </span>
                </div>

                {report.details && (
                  <div style={{ fontSize: 12, color: 'var(--runit-muted)', fontStyle: 'italic', marginBottom: 10, padding: '8px 12px', background: 'var(--runit-elevated)', borderRadius: 8, lineHeight: 1.5 }}>
                    {'"' + report.details + '"'}
                  </div>
                )}

                <div style={{ fontSize: 12, color: 'var(--runit-muted)', marginBottom: report.status === 'open' ? 10 : 0 }}>
                  {report.order_description?.slice(0, 60) + (report.order_description?.length > 60 ? '...' : '')}
                </div>

                {report.status === 'open' && (
                  <button onClick={() => resolveReport(report.id)} style={{ width: '100%', padding: '9px', borderRadius: 50, background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.3)', color: 'var(--runit-accent)', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ✓ Mark as Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ratings tab */}
        {!loading && tab === 'ratings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data?.ratings || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--runit-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <div style={{ fontSize: 15 }}>No ratings yet</div>
              </div>
            ) : (data?.ratings || []).map(r => (
              <div key={r.id} style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{r.user_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--runit-muted)' }}>{'→ Runner: ' + r.runner_name + ' · Order #' + r.order_id}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 1 }}>
                    {[1,2,3,4,5].map(i => (
                      <span key={i} style={{ fontSize: 14, filter: r.stars >= i ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                    ))}
                  </div>
                </div>
                {r.comment && (
                  <div style={{ fontSize: 12, color: 'var(--runit-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {'"' + r.comment + '"'}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--runit-muted)', marginTop: 6 }}>
                  {new Date(r.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      <BottomPillNav />
    </div>
  );
}