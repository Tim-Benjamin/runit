// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('http://localhost/runit-backend/api/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        login(data.user, data.token);
        if (data.user.role === 'user')   navigate('/dashboard');
        if (data.user.role === 'runner') navigate('/runner');
        if (data.user.role === 'admin')  navigate('/admin');
      }
    } catch {
      setError('Cannot connect to server. Make sure XAMPP is running.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--runit-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(16px,5vw,40px)',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,201,167,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Back button */}
      <div style={{ position: 'fixed', top: 14, left: 14, zIndex: 50 }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(15,46,41,0.8)',
          border: '0.5px solid rgba(0,201,167,0.2)',
          backdropFilter: 'blur(10px)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--runit-text)" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', animation: 'slideUp 0.3s ease' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: 'var(--runit-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 22, color: '#0a1f1c',
              boxShadow: '0 4px 20px rgba(0,201,167,0.3)',
            }}>R</div>
            <span style={{ fontWeight: 800, fontSize: 24, color: 'var(--runit-text)' }}>RunIt</span>
          </Link>
          <p style={{ color: 'var(--runit-muted)', fontSize: 14, marginTop: 4 }}>
            Welcome back — sign in to continue
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--runit-surface)',
          border: '1px solid var(--runit-border)',
          borderRadius: 24, padding: 28,
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        }}>

          {error && (
            <div style={{
              background: 'rgba(255,80,80,0.08)',
              border: '1px solid rgba(255,80,80,0.25)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              color: '#ff8080', fontSize: 13,
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--runit-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Email address
              </label>
              <input
                type="email" name="email" required
                placeholder="you@ucc.edu.gh"
                value={form.email} onChange={handleChange}
                className="runit-input"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: 'var(--runit-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" required
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  className="runit-input"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--runit-muted)', cursor: 'pointer',
                  fontSize: 16, padding: 0,
                }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 50,
              background: loading ? 'var(--runit-accent-dark)' : 'var(--runit-accent)',
              color: '#0a1f1c', fontWeight: 700, fontSize: 15,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(0,201,167,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: '#0a1f1c',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--runit-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--runit-accent)', fontWeight: 700 }}>
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}