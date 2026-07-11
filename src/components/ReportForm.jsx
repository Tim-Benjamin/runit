// src/components/ReportForm.jsx
import { useState } from 'react';

const USER_REASONS = [
  { value: 'wrong_item',    label: 'Wrong item delivered' },
  { value: 'runner_no_show', label: 'Runner never showed up' },
  { value: 'overcharge',    label: 'Overcharged' },
  { value: 'rude_behavior', label: 'Rude behavior' },
  { value: 'other',         label: 'Other' },
];

const RUNNER_REASONS = [
  { value: 'customer_unreachable', label: 'Customer unreachable' },
  { value: 'wrong_location',       label: 'Wrong location given' },
  { value: 'overcharge',           label: 'Dispute about fee' },
  { value: 'rude_behavior',        label: 'Rude customer' },
  { value: 'other',                label: 'Other' },
];

export default function ReportForm({ orderId, role = 'user' }) {
  const [open, setOpen]       = useState(false);
  const [reason, setReason]   = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [msg, setMsg]         = useState('');

  const reasons = role === 'runner' ? RUNNER_REASONS : USER_REASONS;

  const submit = async () => {
    if (!reason) { setMsg('Please select a reason'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('http://localhost/runit-backend/api/feedback/report.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ order_id: orderId, reason, details }),
      });
      const data = await res.json();
      if (res.ok) { setDone(true); setOpen(false); }
      else setMsg(data.error || 'Failed to submit');
    } catch { setMsg('Connection error'); }
    setLoading(false);
  };

  if (done) return (
    <div style={{ background: 'rgba(255,180,0,0.07)', border: '1px solid rgba(255,180,0,0.2)', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
      <span style={{ fontSize: 18 }}>✅</span>
      <div style={{ fontSize: 13, color: 'var(--runit-muted)' }}>Report submitted. Admin will review it shortly.</div>
    </div>
  );

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '11px', borderRadius: 50, background: 'transparent', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080', fontWeight: 500, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span>⚠</span> Report an issue
        </button>
      ) : (
        <div style={{ background: 'var(--runit-surface)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 20, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ff8080' }}>⚠ Report an Issue</div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--runit-muted)', cursor: 'pointer', fontSize: 18, fontFamily: 'inherit' }}>×</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {reasons.map(r => (
              <button key={r.value} onClick={() => setReason(r.value)} style={{ padding: '10px 14px', borderRadius: 12, textAlign: 'left', border: '1px solid', borderColor: reason === r.value ? 'rgba(255,80,80,0.5)' : 'var(--runit-border)', background: reason === r.value ? 'rgba(255,80,80,0.08)' : 'var(--runit-elevated)', color: reason === r.value ? '#ff8080' : 'var(--runit-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: reason === r.value ? 600 : 400 }}>
                {r.label}
              </button>
            ))}
          </div>

          <textarea
            rows={2}
            placeholder="Extra details (optional)..."
            value={details}
            onChange={e => setDetails(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: 'var(--runit-elevated)', color: 'var(--runit-text)', border: '1px solid var(--runit-border)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: 8 }}
          />

          {msg && <div style={{ fontSize: 12, color: '#ff8080', marginBottom: 8 }}>{msg}</div>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={submit} disabled={loading || !reason} style={{ flex: 1, padding: '11px', borderRadius: 50, background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080', fontWeight: 700, fontSize: 13, cursor: loading || !reason ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
            <button onClick={() => setOpen(false)} style={{ padding: '11px 18px', borderRadius: 50, background: 'transparent', border: '1px solid var(--runit-border)', color: 'var(--runit-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}