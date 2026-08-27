// src/components/RatingForm.jsx
import API_BASE from '../api/config';
import { useState, useEffect } from 'react';

export default function RatingForm({ orderId }) {
  const [stars, setStars]       = useState(0);
  const [hover, setHover]       = useState(0);
  const [comment, setComment]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    // Check localStorage to avoid showing form if already rated this session
    const rated = localStorage.getItem('runit_rated_' + orderId);
    if (rated) setAlreadyRated(true);
  }, [orderId]);

  const submit = async () => {
    if (stars === 0) { setMsg('Please select a star rating'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('runit_token');
      const res   = await fetch('${API_BASE}/api/feedback/rate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ order_id: orderId, stars, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        localStorage.setItem('runit_rated_' + orderId, '1');
      } else if (data.error && data.error.includes('already rated')) {
        setAlreadyRated(true);
      } else {
        setMsg(data.error || 'Failed to submit');
      }
    } catch { setMsg('Connection error'); }
    setLoading(false);
  };

  if (alreadyRated) return (
    <div style={{ background: 'rgba(0,201,167,0.06)', border: '1px solid var(--runit-border)', borderRadius: 20, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 20 }}>⭐</span>
      <div style={{ fontSize: 13, color: 'var(--runit-muted)' }}>You have already rated this delivery. Thank you!</div>
    </div>
  );

  if (submitted) return (
    <div style={{ background: 'rgba(0,201,167,0.08)', border: '1px solid rgba(0,201,167,0.25)', borderRadius: 20, padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Thank you for your feedback!</div>
      <div style={{ fontSize: 13, color: 'var(--runit-muted)' }}>Your rating helps improve the RunIt experience.</div>
    </div>
  );

  return (
    <div style={{ background: 'var(--runit-surface)', border: '1px solid var(--runit-border)', borderRadius: 20, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Rate this delivery</div>
      <div style={{ fontSize: 12, color: 'var(--runit-muted)', marginBottom: 16 }}>How was your experience?</div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
        {[1,2,3,4,5].map(i => (
          <button key={i}
            onClick={() => setStars(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', filter: (hover || stars) >= i ? 'none' : 'grayscale(1) opacity(0.35)', transition: 'filter 0.15s, transform 0.1s', transform: hover === i ? 'scale(1.2)' : 'scale(1)' }}
          >⭐</button>
        ))}
      </div>

      {stars > 0 && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--runit-accent)', fontWeight: 600 }}>
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][stars]}
          </span>
        </div>
      )}

      {/* Comment */}
      <textarea
        rows={2}
        placeholder="Leave a comment (optional)..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: 'var(--runit-elevated)', color: 'var(--runit-text)', border: '1px solid var(--runit-border)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: 8 }}
        onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--runit-border)'}
      />

      {msg && <div style={{ fontSize: 12, color: '#ff8080', marginBottom: 8 }}>{msg}</div>}

      <button onClick={submit} disabled={loading || stars === 0} style={{ width: '100%', padding: '11px', borderRadius: 50, background: loading || stars === 0 ? 'var(--runit-accent-dark)' : 'var(--runit-accent)', color: '#0a1f1c', fontWeight: 700, fontSize: 13, border: 'none', cursor: loading || stars === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
        {loading ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  );
}