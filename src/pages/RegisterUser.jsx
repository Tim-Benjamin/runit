// src/pages/RegisterUser.jsx
import API_BASE from '../api/config';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterUser() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // src/pages/RegisterUser.jsx — replace only handleSubmit
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);

    try {
      const res = await fetch('${API_BASE}/api/auth/register_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        navigate('/login');
      }
    } catch {
      setError('Cannot connect to server. Make sure XAMPP is running.');
    }

    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    background: 'var(--runit-elevated)', color: 'var(--runit-text)',
    border: '1px solid var(--runit-border)', fontSize: 14, outline: 'none',
  };

  const labelStyle = {
    fontSize: 13, color: 'var(--runit-muted)', display: 'block', marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--runit-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Mobile back to home */}
        <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 50 }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(15,46,41,0.8)',
            border: '0.5px solid rgba(0,201,167,0.18)',
            backdropFilter: 'blur(10px)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'var(--runit-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18, color: '#0a1f1c',
            }}>R</div>
            <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--runit-text)' }}>RunIt</span>
          </Link>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create your account</h2>
          <p style={{ color: 'var(--runit-muted)', fontSize: 13 }}>Place orders across UCC campus</p>
        </div>

        <div style={{
          background: 'var(--runit-surface)', border: '1px solid var(--runit-border)',
          borderRadius: 24, padding: 28,
        }}>
          {error && (
            <div style={{
              background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              color: '#ff8080', fontSize: 13,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Full name</label>
              <input name="name" required placeholder="Kofi Mensah"
                value={form.name} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email address</label>
              <input type="email" name="email" required placeholder="you@ucc.edu.gh"
                value={form.email} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Phone number</label>
              <input name="phone" required placeholder="024XXXXXXX"
                value={form.phone} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" name="password" required placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirm password</label>
              <input type="password" name="confirm" required placeholder="Repeat your password"
                value={form.confirm} onChange={handleChange} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--runit-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--runit-border)'} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 50,
              background: loading ? 'var(--runit-accent-dark)' : 'var(--runit-accent)',
              color: '#0a1f1c', fontWeight: 700, fontSize: 15,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--runit-muted)' }}>
          <Link to="/register" style={{ color: 'var(--runit-muted)' }}>← Back</Link>
          {' · '}
          <Link to="/login" style={{ color: 'var(--runit-accent)', fontWeight: 600 }}>Sign in instead</Link>
        </p>

      </div>
    </div>
  );
}